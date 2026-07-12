from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from .models import Booking, SharedBookingGroup, TrackingEvent


class TrackingEventInline(TabularInline):
    model = TrackingEvent
    extra = 0
    readonly_fields = ("created_at",)
    fields = ("status", "label", "note", "latitude", "longitude", "created_at")


@admin.register(Booking)
class BookingAdmin(ModelAdmin):
    list_display = ("ref", "shipper", "route", "truck_type", "mode", "weight_tons", "status_badge", "payment_status", "fare_total", "created_at")
    list_display_links = ("ref",)
    list_filter = ("status", "payment_status", "mode", "truck_type")
    search_fields = ("id", "shipper__username", "shipper__first_name", "origin__name", "destination__name", "goods_type")
    autocomplete_fields = ("shipper", "transporter", "truck", "origin", "destination", "truck_type")
    inlines = [TrackingEventInline]
    readonly_fields = ("created_at",)

    @admin.display(description="Ref")
    def ref(self, obj):
        return f"#{obj.reference}"

    @admin.display(description="Route")
    def route(self, obj):
        return f"{obj.origin.short_label} → {obj.destination.short_label}"

    @admin.display(description="Status")
    def status_badge(self, obj):
        colors = {
            "pending": "#E0A106", "confirmed": "#2f59a6", "picked_up": "#6366f1",
            "in_transit": "#7A3FF2", "delivered": "#28A745", "cancelled": "#E63946",
        }
        return format_html('<span style="color:{};font-weight:600">● {}</span>', colors.get(obj.status, "#888"), obj.get_status_display())


@admin.register(SharedBookingGroup)
class SharedBookingGroupAdmin(ModelAdmin):
    list_display = ("__str__", "truck_type", "pickup_date", "used_tons", "capacity_tons", "member_count")
    list_filter = ("truck_type", "pickup_date")
    search_fields = ("origin_city", "destination_city")

    @admin.display(description="Members")
    def member_count(self, obj):
        return obj.bookings.count()


@admin.register(TrackingEvent)
class TrackingEventAdmin(ModelAdmin):
    list_display = ("booking", "status", "label", "created_at")
    list_filter = ("status",)
    search_fields = ("booking__id", "label")
