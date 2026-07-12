from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from .models import Truck, TruckType


@admin.register(TruckType)
class TruckTypeAdmin(ModelAdmin):
    list_display = ("thumb", "name", "capacity_label", "base_fare", "per_km_rate", "order", "is_active")
    list_display_links = ("name",)
    list_editable = ("order", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)

    @admin.display(description="")
    def thumb(self, obj):
        if obj.display_image:
            return format_html('<img src="{}" style="height:36px;width:54px;object-fit:cover;border-radius:6px">', obj.display_image)
        return "—"


@admin.register(Truck)
class TruckAdmin(ModelAdmin):
    list_display = ("registration_no", "truck_type", "owner", "city", "status", "kyc_badge", "created_at")
    list_filter = ("status", "kyc_status", "truck_type")
    search_fields = ("registration_no", "model_name", "owner__username", "owner__first_name")
    autocomplete_fields = ("owner", "truck_type")
    actions = ("approve_kyc", "reject_kyc")

    @admin.display(description="KYC")
    def kyc_badge(self, obj):
        colors = {"verified": "#28A745", "pending": "#E0A106", "rejected": "#E63946"}
        return format_html(
            '<span style="color:{};font-weight:600">● {}</span>',
            colors.get(obj.kyc_status, "#888"),
            obj.get_kyc_status_display(),
        )

    @admin.action(description="Approve KYC for selected trucks")
    def approve_kyc(self, request, queryset):
        n = queryset.update(kyc_status=Truck.Kyc.VERIFIED)
        self.message_user(request, f"{n} truck(s) approved.")

    @admin.action(description="Reject KYC for selected trucks")
    def reject_kyc(self, request, queryset):
        n = queryset.update(kyc_status=Truck.Kyc.REJECTED)
        self.message_user(request, f"{n} truck(s) rejected.")
