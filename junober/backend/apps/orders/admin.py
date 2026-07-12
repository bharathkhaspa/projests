from django.contrib import admin
from django.utils.html import format_html

from .models import Address, Cart, CartItem, DesignUpload, Order, OrderItem


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "city", "pincode", "is_default", "updated_at")
    list_filter = ("is_default", "country", "state")
    search_fields = ("full_name", "phone", "pincode", "user__email")
    autocomplete_fields = ("user",)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("unit_price", "line_total", "created_at")
    autocomplete_fields = ("variant",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "item_count", "subtotal", "updated_at")
    search_fields = ("user__email",)
    autocomplete_fields = ("user",)
    inlines = (CartItemInline,)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "variant", "quantity", "unit_price", "line_total", "created_at")
    search_fields = ("variant__sku", "cart__user__email")
    autocomplete_fields = ("variant",)


@admin.register(DesignUpload)
class DesignUploadAdmin(admin.ModelAdmin):
    list_display = ("user", "file", "created_at")
    search_fields = ("user__email", "file")
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at",)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("variant", "print_type", "quantity", "unit_price", "line_total")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number", "customer_email", "status", "payment_status",
        "total", "created_at",
    )
    list_editable = ("status", "payment_status")
    list_filter = ("status", "payment_status", "created_at")
    search_fields = ("order_number", "user__email", "tracking_number")
    readonly_fields = ("order_number", "subtotal", "total", "created_at", "updated_at")
    inlines = (OrderItemInline,)
    fieldsets = (
        ("Order Info", {"fields": ("order_number", "user", "created_at", "updated_at")}),
        ("Status", {"fields": ("status", "payment_status", "tracking_number")}),
        ("Shipping", {"fields": ("shipping_address",)}),
        ("Totals", {"fields": ("subtotal", "shipping_charge", "total")}),
        ("Notes", {"fields": ("notes",)}),
    )

    def customer_email(self, obj):
        return obj.user.email
    customer_email.short_description = "Customer"

    def get_status_color(self, status):
        colors = {
            "pending": "orange",
            "confirmed": "blue",
            "processing": "purple",
            "shipped": "teal",
            "delivered": "green",
            "cancelled": "red",
        }
        return colors.get(status, "gray")

    def colored_status(self, obj):
        color = self.get_status_color(obj.status)
        return format_html('<b style="color:{}">{}</b>', color, obj.get_status_display())
    colored_status.short_description = "Status"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "variant", "quantity", "unit_price", "line_total")
    search_fields = ("order__order_number", "variant__sku")
    readonly_fields = ("line_total",)
