"""Stats dashboard rendered on the Unfold admin landing page."""

from django.db.models import Sum
from django.utils import timezone


def dashboard_callback(request, context):
    """Inject platform KPIs + recent activity into the admin index page."""
    from accounts.models import User
    from trucks.models import Truck
    from bookings.models import Booking
    from content.models import ContactMessage

    active_statuses = ["pending", "confirmed", "in_transit"]
    revenue = Booking.objects.aggregate(total=Sum("fare_total"))["total"] or 0
    pending_kyc = User.objects.filter(is_verified=False, role__in=["shipper", "transporter"]).count()

    context.update(
        {
            "kpi": [
                {"title": "Total users", "value": User.objects.count(), "icon": "group"},
                {"title": "Trucks", "value": Truck.objects.count(), "icon": "local_shipping"},
                {"title": "Active bookings", "value": Booking.objects.filter(status__in=active_statuses).count(), "icon": "package_2"},
                {"title": "Total bookings", "value": Booking.objects.count(), "icon": "list_alt"},
                {"title": "Gross merchandise value", "value": f"₹{int(revenue):,}", "icon": "currency_rupee"},
                {"title": "Pending verifications", "value": pending_kyc, "icon": "verified_user"},
            ],
            "recent_bookings": Booking.objects.select_related("shipper").order_by("-created_at")[:8],
            "recent_signups": User.objects.order_by("-date_joined")[:6],
            "unread_messages": ContactMessage.objects.filter(is_read=False).count(),
            "generated_at": timezone.now(),
        }
    )
    return context
