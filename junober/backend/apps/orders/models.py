from decimal import Decimal

from django.conf import settings
from django.db import models, transaction

from apps.catalog.models import PrintType, ProductVariant


class Address(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    label = models.CharField(max_length=40, blank=True)
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=20)
    line1 = models.CharField(max_length=200)
    line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    country = models.CharField(max_length=80, default="India")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-updated_at"]

    def __str__(self):
        return f"{self.full_name} — {self.city}, {self.pincode}"

    @transaction.atomic
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(
                is_default=False
            )
        super().save(*args, **kwargs)


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.email}"

    @property
    def subtotal(self):
        return sum((item.line_total for item in self.items.all()), Decimal("0.00"))

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    print_type = models.ForeignKey(PrintType, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    design_text = models.CharField(max_length=200, blank=True)
    design_text_color = models.CharField(max_length=7, blank=True)
    design_image_url = models.CharField(max_length=500, blank=True)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.variant.sku} × {self.quantity}"

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"
        COD = "cod", "Cash on Delivery"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders"
    )
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    shipping_address = models.ForeignKey(
        Address, on_delete=models.PROTECT, related_name="orders"
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_charge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.order_number} — {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random, string
            self.order_number = "FF" + "".join(random.choices(string.digits, k=8))
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    print_type = models.ForeignKey(PrintType, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    design_text = models.CharField(max_length=200, blank=True)
    design_text_color = models.CharField(max_length=7, blank=True)
    design_image_url = models.CharField(max_length=500, blank=True)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.variant.sku} × {self.quantity} (Order #{self.order.order_number})"

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class DesignUpload(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="design_uploads",
    )
    file = models.ImageField(upload_to="design_uploads/%Y/%m/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.file.name
