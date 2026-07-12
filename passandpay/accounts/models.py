from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a platform role. Email is used as the login handle."""

    class Role(models.TextChoices):
        SHIPPER = "shipper", "Shipper"
        TRANSPORTER = "transporter", "Transporter"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SHIPPER)
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=80, blank=True)
    is_verified = models.BooleanField(
        default=False,
        help_text="KYC verified by the operations team.",
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    REQUIRED_FIELDS = ["email"]

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def display_name(self):
        return self.get_full_name() or self.username

    @property
    def initials(self):
        name = self.get_full_name() or self.username
        parts = [p for p in name.split() if p]
        return "".join(p[0].upper() for p in parts[:2]) or "U"

    @property
    def avatar_color(self):
        palette = ["#1A3D7C", "#F5821F", "#28A745", "#7A3FF2", "#0EA5A4", "#E63946"]
        return palette[sum(ord(c) for c in (self.username or "u")) % len(palette)]


class ShipperProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="shipper_profile")
    gst_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    pan_document = models.FileField(upload_to="kyc/shipper/", blank=True, null=True)
    gst_document = models.FileField(upload_to="kyc/shipper/", blank=True, null=True)

    def __str__(self):
        return f"Shipper profile · {self.user.display_name}"


class TransporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="transporter_profile")
    fleet_name = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    license_document = models.FileField(upload_to="kyc/transporter/", blank=True, null=True)
    aadhaar_document = models.FileField(upload_to="kyc/transporter/", blank=True, null=True)

    def __str__(self):
        return f"Transporter profile · {self.user.display_name}"
