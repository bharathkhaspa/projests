from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.utils.html import format_html
from unfold.admin import ModelAdmin, StackedInline
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import ShipperProfile, TransporterProfile, User

# Re-register the Group model with Unfold styling.
admin.site.unregister(Group)


@admin.register(Group)
class GroupAdmin(ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


class ShipperProfileInline(StackedInline):
    model = ShipperProfile
    extra = 0
    tab = True


class TransporterProfileInline(StackedInline):
    model = TransporterProfile
    extra = 0
    tab = True


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    list_display = ("avatar", "username", "display_name", "role", "verified_badge", "city", "date_joined")
    list_display_links = ("username", "display_name")
    list_filter = ("role", "is_verified", "is_staff", "is_active")
    search_fields = ("username", "email", "first_name", "last_name", "company", "phone")
    ordering = ("-date_joined",)
    actions = ("mark_verified", "mark_unverified")

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "email", "phone", "company", "city")}),
        ("Platform", {"fields": ("role", "is_verified", "rating")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )

    @admin.display(description="")
    def avatar(self, obj):
        return format_html(
            '<span style="display:inline-grid;place-items:center;width:32px;height:32px;border-radius:50%;'
            'background:{};color:#fff;font-weight:700;font-size:12px">{}</span>',
            obj.avatar_color,
            obj.initials,
        )

    @admin.display(description="Name")
    def display_name(self, obj):
        return obj.display_name

    @admin.display(description="KYC")
    def verified_badge(self, obj):
        color = "#28A745" if obj.is_verified else "#E0A106"
        text = "Verified" if obj.is_verified else "Pending"
        return format_html('<span style="color:{};font-weight:600">● {}</span>', color, text)

    def get_inlines(self, request, obj):
        if obj is None:
            return []
        if obj.role == User.Role.TRANSPORTER:
            return [TransporterProfileInline]
        if obj.role == User.Role.SHIPPER:
            return [ShipperProfileInline]
        return []

    @admin.action(description="Mark selected users as VERIFIED")
    def mark_verified(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f"{updated} user(s) marked verified.")

    @admin.action(description="Mark selected users as UNVERIFIED")
    def mark_unverified(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f"{updated} user(s) marked unverified.")
