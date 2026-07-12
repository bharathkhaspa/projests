from django.conf import settings
from django.db import models


class TruckType(models.Model):
    """A category of truck with capacity and pricing — editable from the admin."""

    name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=80, unique=True)
    capacity_tons = models.DecimalField(max_digits=5, decimal_places=1)
    capacity_label = models.CharField(max_length=60, help_text="e.g. 'up to 1 ton'")
    example_use = models.CharField(max_length=160, blank=True)
    base_fare = models.PositiveIntegerField(help_text="Flat ₹ base fare")
    per_km_rate = models.PositiveIntegerField(help_text="₹ per km")
    image = models.ImageField(upload_to="truck_types/", blank=True, null=True)
    image_url = models.URLField(blank=True, help_text="Fallback image URL if no file uploaded")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "capacity_tons"]

    def __str__(self):
        return f"{self.name} ({self.capacity_label})"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url


class Truck(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        ON_TRIP = "on_trip", "On trip"
        MAINTENANCE = "maintenance", "Maintenance"

    class Kyc(models.TextChoices):
        PENDING = "pending", "Pending review"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trucks")
    truck_type = models.ForeignKey(TruckType, on_delete=models.PROTECT, related_name="trucks")
    registration_no = models.CharField(max_length=20, unique=True)
    model_name = models.CharField(max_length=80, blank=True)
    city = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    kyc_status = models.CharField(max_length=20, choices=Kyc.choices, default=Kyc.PENDING)
    rc_document = models.FileField(upload_to="truck_docs/", blank=True, null=True)
    insurance_document = models.FileField(upload_to="truck_docs/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.registration_no} · {self.truck_type.name}"

    @property
    def capacity_tons(self):
        return self.truck_type.capacity_tons
