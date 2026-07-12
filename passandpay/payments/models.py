from django.conf import settings
from django.db import models

from bookings.models import Booking


class Payment(models.Model):
    class Method(models.TextChoices):
        UPI = "upi", "UPI"
        CARD = "card", "Card"
        NETBANKING = "netbanking", "Net banking"

    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="payments")
    amount = models.PositiveIntegerField()
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.UPI)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS)
    gateway_ref = models.CharField(max_length=60, blank=True, help_text="Razorpay/Stripe reference (mock)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"₹{self.amount} · {self.booking.reference} · {self.get_status_display()}"


class Invoice(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="invoice")
    number = models.CharField(max_length=30, unique=True)
    amount = models.PositiveIntegerField()
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return self.number


class Rating(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="ratings")
    rater = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ratings_given")
    ratee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ratings_received")
    stars = models.PositiveSmallIntegerField()
    comment = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("booking", "rater")

    def __str__(self):
        return f"{self.stars}★ → {self.ratee.display_name}"
