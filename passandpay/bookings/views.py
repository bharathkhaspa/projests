from functools import wraps

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from accounts.models import User
from locations.models import Location
from trucks.models import Truck, TruckType

from .models import Booking, SharedBookingGroup, TrackingEvent
from .services import estimate_fare, road_distance_km

# --- role gating ------------------------------------------------------------

def role_required(role):
    def decorator(view):
        @wraps(view)
        @login_required
        def wrapper(request, *args, **kwargs):
            if request.user.role != role and not request.user.is_superuser:
                messages.error(request, "You don't have access to that area.")
                return redirect("accounts:redirect_after_login")
            return view(request, *args, **kwargs)
        return wrapper
    return decorator


shipper_required = role_required(User.Role.SHIPPER)
transporter_required = role_required(User.Role.TRANSPORTER)

STATUS_FLOW = ["confirmed", "picked_up", "in_transit", "delivered"]
STATUS_LABELS = {
    "confirmed": "Booking confirmed",
    "picked_up": "Goods picked up",
    "in_transit": "In transit",
    "delivered": "Delivered",
}


def _lerp(a, b, t):
    return a + (b - a) * t


# ===========================================================================
# SHIPPER
# ===========================================================================

@shipper_required
def shipper_dashboard(request):
    bookings = Booking.objects.filter(shipper=request.user).select_related(
        "origin", "destination", "truck_type", "transporter"
    )
    active = bookings.filter(status__in=["pending", "confirmed", "picked_up", "in_transit"])
    delivered = bookings.filter(status="delivered")
    spend = bookings.filter(payment_status="paid").aggregate(t=Sum("fare_total"))["t"] or 0
    tracking = active.filter(status="in_transit").first() or active.exclude(status="pending").first()
    return render(request, "shipper/dashboard.html", {
        "bookings": bookings[:6],
        "active_count": active.count(),
        "delivered_count": delivered.count(),
        "total_count": bookings.count(),
        "spend": spend,
        "tracking": tracking,
    })


@shipper_required
def book(request):
    truck_types = TruckType.objects.filter(is_active=True)
    if request.method == "POST":
        try:
            origin = Location.objects.get(pk=request.POST.get("origin_id"))
            destination = Location.objects.get(pk=request.POST.get("destination_id"))
            truck_type = TruckType.objects.get(pk=request.POST.get("truck_type_id"))
        except (Location.DoesNotExist, TruckType.DoesNotExist, ValueError, TypeError):
            messages.error(request, "Please select valid pickup, drop and truck type.")
            return redirect("shipper:book")

        weight = float(request.POST.get("weight_tons") or 0)
        mode = request.POST.get("mode", "full")
        goods_type = request.POST.get("goods_type", "").strip()
        pickup_date = request.POST.get("pickup_date") or timezone.now().date().isoformat()

        if weight <= 0 or weight > float(truck_type.capacity_tons):
            messages.error(request, f"Weight must be between 0 and {truck_type.capacity_tons} tons.")
            return redirect("shipper:book")

        distance = road_distance_km(origin, destination)
        fare = estimate_fare(truck_type, distance, weight, mode)

        booking = Booking.objects.create(
            shipper=request.user,
            truck_type=truck_type,
            origin=origin,
            destination=destination,
            distance_km=distance,
            goods_type=goods_type or "General goods",
            weight_tons=weight,
            pickup_date=pickup_date,
            mode=mode,
            share_pct=fare.share_pct,
            fare_base=fare.base,
            fare_distance=fare.distance,
            fare_surcharge=fare.surcharge,
            fare_surcharge_label=fare.surcharge_label,
            fare_gst=fare.gst,
            fare_total=fare.total,
        )

        if mode == "shared":
            _attach_share_group(booking)

        messages.success(request, "Booking created! Searching for transporters…")
        return redirect("shipper:tracking_detail", pk=booking.pk)

    return render(request, "shipper/book.html", {
        "truck_types": truck_types,
        "today": timezone.now().date().isoformat(),
        "prefill": {
            "origin": request.GET.get("origin", ""),
            "destination": request.GET.get("destination", ""),
        },
    })


def _attach_share_group(booking):
    group = (
        SharedBookingGroup.objects.filter(
            truck_type=booking.truck_type,
            origin_city=booking.origin.short_label,
            destination_city=booking.destination.short_label,
            pickup_date=booking.pickup_date,
        )
        .annotate(rem=Sum("bookings__weight_tons"))
        .first()
    )
    if group and group.remaining_tons >= float(booking.weight_tons):
        group.used_tons = float(group.used_tons) + float(booking.weight_tons)
        group.save(update_fields=["used_tons"])
    else:
        group = SharedBookingGroup.objects.create(
            truck_type=booking.truck_type,
            origin_city=booking.origin.short_label,
            destination_city=booking.destination.short_label,
            pickup_date=booking.pickup_date,
            capacity_tons=booking.truck_type.capacity_tons,
            used_tons=booking.weight_tons,
        )
    booking.share_group = group
    booking.save(update_fields=["share_group"])


@login_required
def fare_estimate(request):
    """JSON fare estimate for the booking page (called via fetch/HTMX)."""
    try:
        origin = Location.objects.get(pk=request.GET.get("origin_id"))
        destination = Location.objects.get(pk=request.GET.get("destination_id"))
        truck_type = TruckType.objects.get(pk=request.GET.get("truck_type_id"))
    except (Location.DoesNotExist, TruckType.DoesNotExist, ValueError, TypeError):
        return JsonResponse({"ok": False}, status=400)

    weight = float(request.GET.get("weight_tons") or truck_type.capacity_tons * 0.3 or 1)
    mode = request.GET.get("mode", "full")
    distance = road_distance_km(origin, destination)
    fare = estimate_fare(truck_type, distance, weight, mode)
    data = fare.as_dict()
    data.update({"ok": True, "mode": mode})
    return JsonResponse(data)


@shipper_required
def my_bookings(request):
    status = request.GET.get("status", "all")
    qs = Booking.objects.filter(shipper=request.user).select_related("origin", "destination", "truck_type")
    if status != "all":
        qs = qs.filter(status=status)
    return render(request, "shipper/bookings.html", {
        "bookings": qs,
        "status": status,
        "statuses": Booking.Status.choices,
    })


@shipper_required
@require_POST
def cancel_booking(request, pk):
    booking = get_object_or_404(Booking, pk=pk, shipper=request.user)
    if booking.status == "pending":
        booking.status = "cancelled"
        booking.save(update_fields=["status"])
        messages.success(request, "Booking cancelled.")
    return redirect("shipper:bookings")


@shipper_required
def tracking(request):
    qs = Booking.objects.filter(shipper=request.user).exclude(status="cancelled").select_related(
        "origin", "destination", "truck_type", "transporter"
    )
    trackable = qs.exclude(status="pending")
    selected = trackable.first()
    if selected:
        return redirect("shipper:tracking_detail", pk=selected.pk)
    return render(request, "shipper/tracking.html", {"booking": None, "others": qs})


@shipper_required
def tracking_detail(request, pk):
    booking = get_object_or_404(
        Booking.objects.select_related("origin", "destination", "truck_type", "transporter"),
        pk=pk, shipper=request.user,
    )
    others = Booking.objects.filter(shipper=request.user).exclude(pk=pk).exclude(status="cancelled")
    return render(request, "shipper/tracking.html", {
        "booking": booking,
        "timeline": _timeline(booking),
        "others": others,
    })


def _timeline(booking):
    """Build the 4-step status timeline with timestamps from tracking events."""
    events = {e.status: e for e in booking.tracking_events.all()}
    steps = []
    for status in STATUS_FLOW:
        ev = events.get(status)
        steps.append({
            "status": status,
            "label": STATUS_LABELS[status],
            "at": ev.created_at if ev else None,
            "reached": ev is not None,
        })
    return steps


# ===========================================================================
# TRANSPORTER
# ===========================================================================

@transporter_required
def transporter_dashboard(request):
    trips = Booking.objects.filter(transporter=request.user).select_related("origin", "destination", "truck_type", "shipper")
    active = trips.filter(status__in=["confirmed", "picked_up", "in_transit"])
    delivered = trips.filter(status="delivered")
    earnings = delivered.aggregate(t=Sum("fare_total"))["t"] or 0
    open_loads = Booking.objects.filter(status="pending").exclude(shipper=request.user).count()
    return render(request, "transporter/dashboard.html", {
        "trucks": Truck.objects.filter(owner=request.user),
        "active": active[:4],
        "active_count": active.count(),
        "delivered_count": delivered.count(),
        "earnings": earnings,
        "open_loads": open_loads,
    })


@transporter_required
def available_loads(request):
    qs = Booking.objects.filter(status="pending").exclude(shipper=request.user).select_related(
        "origin", "destination", "truck_type", "shipper"
    )
    origin_q = request.GET.get("origin", "").strip()
    type_q = request.GET.get("truck_type", "")
    if origin_q:
        qs = qs.filter(Q(origin__city__icontains=origin_q) | Q(origin__name__icontains=origin_q))
    if type_q:
        qs = qs.filter(truck_type_id=type_q)

    my_trucks = Truck.objects.filter(owner=request.user)
    return render(request, "transporter/loads.html", {
        "loads": qs,
        "truck_types": TruckType.objects.filter(is_active=True),
        "my_trucks": my_trucks,
        "origin_q": origin_q,
        "type_q": type_q,
    })


@transporter_required
@require_POST
def accept_load(request, pk):
    booking = get_object_or_404(Booking, pk=pk, status="pending")
    truck = get_object_or_404(Truck, pk=request.POST.get("truck_id"), owner=request.user)
    if truck.kyc_status != Truck.Kyc.VERIFIED or truck.status != Truck.Status.AVAILABLE:
        messages.error(request, "That truck isn't available/verified for this load.")
        return redirect("transporter:loads")
    if float(truck.capacity_tons) < float(booking.weight_tons):
        messages.error(request, "Truck capacity is too small for this load.")
        return redirect("transporter:loads")

    booking.transporter = request.user
    booking.truck = truck
    booking.status = "confirmed"
    booking.save(update_fields=["transporter", "truck", "status"])
    truck.status = Truck.Status.ON_TRIP
    truck.save(update_fields=["status"])
    TrackingEvent.objects.create(
        booking=booking, status="confirmed", label=STATUS_LABELS["confirmed"],
        latitude=booking.origin.latitude, longitude=booking.origin.longitude,
    )
    messages.success(request, f"Load #{booking.reference} accepted — trip confirmed!")
    return redirect("transporter:trips")


@transporter_required
def active_trips(request):
    trips = Booking.objects.filter(
        transporter=request.user, status__in=["confirmed", "picked_up", "in_transit"]
    ).select_related("origin", "destination", "truck_type", "shipper")
    return render(request, "transporter/trips.html", {
        "trips": [(b, _timeline(b)) for b in trips],
    })


@transporter_required
@require_POST
def advance_status(request, pk):
    booking = get_object_or_404(Booking, pk=pk, transporter=request.user)
    if booking.status in STATUS_FLOW:
        idx = STATUS_FLOW.index(booking.status)
        if idx < len(STATUS_FLOW) - 1:
            new_status = STATUS_FLOW[idx + 1]
            booking.status = new_status
            booking.save(update_fields=["status"])
            t = {"picked_up": 0.1, "in_transit": 0.5, "delivered": 1.0}.get(new_status, 0)
            TrackingEvent.objects.create(
                booking=booking, status=new_status, label=STATUS_LABELS[new_status],
                latitude=_lerp(booking.origin.latitude, booking.destination.latitude, t),
                longitude=_lerp(booking.origin.longitude, booking.destination.longitude, t),
            )
            if new_status == "delivered" and booking.truck:
                booking.truck.status = Truck.Status.AVAILABLE
                booking.truck.save(update_fields=["status"])
            messages.success(request, f"Status updated → {STATUS_LABELS[new_status]}")
    return redirect("transporter:trips")


@transporter_required
def my_trucks(request):
    if request.method == "POST":
        try:
            truck_type = TruckType.objects.get(pk=request.POST.get("truck_type_id"))
        except (TruckType.DoesNotExist, ValueError, TypeError):
            messages.error(request, "Choose a valid truck type.")
            return redirect("transporter:trucks")
        reg = request.POST.get("registration_no", "").strip().upper()
        if not reg:
            messages.error(request, "Registration number is required.")
            return redirect("transporter:trucks")
        if Truck.objects.filter(registration_no=reg).exists():
            messages.error(request, "A truck with that registration already exists.")
            return redirect("transporter:trucks")
        Truck.objects.create(
            owner=request.user,
            truck_type=truck_type,
            registration_no=reg,
            model_name=request.POST.get("model_name", "").strip(),
            city=request.POST.get("city", "").strip() or request.user.city,
        )
        messages.success(request, "Truck added — upload documents to get it verified.")
        return redirect("transporter:trucks")

    return render(request, "transporter/trucks.html", {
        "trucks": Truck.objects.filter(owner=request.user).select_related("truck_type"),
        "truck_types": TruckType.objects.filter(is_active=True),
    })


@transporter_required
def earnings(request):
    trips = Booking.objects.filter(transporter=request.user)
    delivered = trips.filter(status="delivered").select_related("origin", "destination")
    total = delivered.aggregate(t=Sum("fare_total"))["t"] or 0
    pending = trips.filter(status__in=["confirmed", "picked_up", "in_transit"]).aggregate(t=Sum("fare_total"))["t"] or 0
    return render(request, "transporter/earnings.html", {
        "delivered": delivered,
        "total": total,
        "pending": pending,
        "completed_count": delivered.count(),
    })
