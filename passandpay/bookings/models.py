from django.conf import settings
from django.db import models

from locations.models import Location
from trucks.models import Truck, TruckType


class SharedBookingGroup(models.Model):
    """
    Groups several part-load bookings onto one truck along the same route /
    date window. The fare is split proportionally by weight across members.
    """

    truck_type = models.ForeignKey(TruckType, on_delete=models.PROTECT)
    origin_city = models.CharField(max_length=120)
    destination_city = models.CharField(max_length=120)
    pickup_date = models.DateField()
    capacity_tons = models.DecimalField(max_digits=5, decimal_places=1)
    used_tons = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Shared {self.origin_city}→{self.destination_city} ({self.used_tons}/{self.capacity_tons}t)"

    @property
    def remaining_tons(self):
        return float(self.capacity_tons) - float(self.used_tons)


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PICKED_UP = "picked_up", "Picked up"
        IN_TRANSIT = "in_transit", "In transit"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class Mode(models.TextChoices):
        FULL = "full", "Full truck load"
        SHARED = "shared", "Part load (shared)"

    class Payment(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"
        REFUNDED = "refunded", "Refunded"

    # Parties
    shipper = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings"
    )
    transporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="trips"
    )
    truck = models.ForeignKey(Truck, on_delete=models.SET_NULL, null=True, blank=True)

    # Route
    truck_type = models.ForeignKey(TruckType, on_delete=models.PROTECT)
    origin = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="pickup_bookings")
    destination = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="drop_bookings")
    distance_km = models.PositiveIntegerField(default=0)

    # Cargo
    goods_type = models.CharField(max_length=120)
    weight_tons = models.DecimalField(max_digits=5, decimal_places=2)
    pickup_date = models.DateField()

    # Sharing
    mode = models.CharField(max_length=10, choices=Mode.choices, default=Mode.FULL)
    share_group = models.ForeignKey(
        SharedBookingGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )
    share_pct = models.FloatField(default=1.0, help_text="Fraction of truck this load occupies")

    # Status & money
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=10, choices=Payment.choices, default=Payment.UNPAID)

    fare_base = models.PositiveIntegerField(default=0)
    fare_distance = models.PositiveIntegerField(default=0)
    fare_surcharge = models.PositiveIntegerField(default=0)
    fare_surcharge_label = models.CharField(max_length=80, blank=True)
    fare_gst = models.PositiveIntegerField(default=0)
    fare_total = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"#{self.reference} {self.origin.short_label}→{self.destination.short_label}"

    @property
    def reference(self):
        return f"{self.pk:06d}" if self.pk else "------"

    @property
    def per_km_rate(self):
        return self.truck_type.per_km_rate

    @property
    def is_trackable(self):
        return self.status in {"confirmed", "picked_up", "in_transit", "delivered"}

    @property
    def is_live(self):
        return self.status == "in_transit"

    @property
    def current_event(self):
        return self.tracking_events.order_by("-created_at").first()


class TrackingEvent(models.Model):
    """A point on a booking's live-tracking timeline."""

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="tracking_events")
    status = models.CharField(max_length=20, choices=Booking.Status.choices)
    label = models.CharField(max_length=120)
    note = models.CharField(max_length=200, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.booking.reference} · {self.label}"
