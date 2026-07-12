from django.contrib import messages
from django.db.models import Avg, Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from bookings.models import Booking

from .models import Invoice, Payment, Rating


def _shipper_only(request):
    return request.user.is_authenticated and request.user.role == "shipper"


def payments_list(request):
    if not _shipper_only(request):
        return redirect("accounts:redirect_after_login")
    bookings = Booking.objects.filter(shipper=request.user).exclude(status="cancelled").select_related(
        "origin", "destination"
    )
    paid = bookings.filter(payment_status="paid")
    total_paid = paid.aggregate(t=Sum("fare_total"))["t"] or 0
    total_due = bookings.filter(payment_status="unpaid").aggregate(t=Sum("fare_total"))["t"] or 0
    return render(request, "shipper/payments.html", {
        "bookings": bookings,
        "total_paid": total_paid,
        "total_due": total_due,
    })


@require_POST
def pay(request, pk):
    if not _shipper_only(request):
        return redirect("accounts:redirect_after_login")
    booking = get_object_or_404(Booking, pk=pk, shipper=request.user)
    if booking.payment_status != "paid":
        booking.payment_status = "paid"
        booking.save(update_fields=["payment_status"])
        Payment.objects.create(
            booking=booking,
            amount=booking.fare_total,
            method=request.POST.get("method", "upi"),
            status=Payment.Status.SUCCESS,
            gateway_ref=f"PAY{booking.pk:06d}{int(timezone.now().timestamp())}",
        )
        Invoice.objects.get_or_create(
            booking=booking,
            defaults={"number": f"INV-{booking.pk:06d}", "amount": booking.fare_total},
        )
        messages.success(request, "Payment successful! Your invoice is ready.")
    return redirect("payments:list")


def invoice(request, pk):
    if not request.user.is_authenticated:
        return redirect("accounts:login")
    booking = get_object_or_404(Booking, pk=pk)
    if booking.shipper_id != request.user.id and not request.user.is_staff:
        return redirect("accounts:redirect_after_login")
    inv, _ = Invoice.objects.get_or_create(
        booking=booking,
        defaults={"number": f"INV-{booking.pk:06d}", "amount": booking.fare_total},
    )
    return render(request, "shipper/invoice.html", {"booking": booking, "invoice": inv})


@require_POST
def rate(request, pk):
    if not _shipper_only(request):
        return redirect("accounts:redirect_after_login")
    booking = get_object_or_404(Booking, pk=pk, shipper=request.user, status="delivered")
    if not booking.transporter:
        return redirect("shipper:tracking_detail", pk=pk)
    stars = max(1, min(5, int(request.POST.get("stars", 5))))
    Rating.objects.update_or_create(
        booking=booking, rater=request.user,
        defaults={"ratee": booking.transporter, "stars": stars, "comment": request.POST.get("comment", "")},
    )
    avg = Rating.objects.filter(ratee=booking.transporter).aggregate(a=Avg("stars"))["a"]
    if avg:
        booking.transporter.rating = round(avg, 2)
        booking.transporter.save(update_fields=["rating"])
    messages.success(request, "Thanks for rating your transporter!")
    return redirect("shipper:tracking_detail", pk=pk)
