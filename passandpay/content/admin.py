from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from .models import (
    Advertisement,
    Banner,
    ContactMessage,
    FAQ,
    OfferPoster,
    SiteContent,
    Testimonial,
)


def thumb(image_url, h=40, w=64):
    if image_url:
        return format_html(
            '<img src="{}" style="height:{}px;width:{}px;object-fit:cover;border-radius:6px">',
            image_url, h, w,
        )
    return "—"


@admin.register(Banner)
class BannerAdmin(ModelAdmin):
    list_display = ("preview", "heading", "button_text", "order", "is_active")
    list_display_links = ("heading",)
    list_editable = ("order", "is_active")
    search_fields = ("heading", "subheading")

    @admin.display(description="Image")
    def preview(self, obj):
        return thumb(obj.display_image)


@admin.register(Advertisement)
class AdvertisementAdmin(ModelAdmin):
    list_display = ("preview", "title", "slot", "is_active", "start_at", "end_at", "order")
    list_display_links = ("title",)
    list_editable = ("is_active", "order")
    list_filter = ("slot", "is_active")
    search_fields = ("title",)

    @admin.display(description="Image")
    def preview(self, obj):
        return thumb(obj.display_image)


@admin.register(OfferPoster)
class OfferPosterAdmin(ModelAdmin):
    list_display = ("preview", "title", "offer_text", "is_active", "start_at", "end_at", "order")
    list_display_links = ("title",)
    list_editable = ("is_active", "order")
    list_filter = ("is_active",)
    search_fields = ("title", "description")

    @admin.display(description="Poster")
    def preview(self, obj):
        return thumb(obj.display_image)


@admin.register(SiteContent)
class SiteContentAdmin(ModelAdmin):
    list_display = ("label", "key", "short_value", "notes")
    list_display_links = ("label",)
    search_fields = ("key", "label", "value")
    readonly_fields = ()

    @admin.display(description="Value")
    def short_value(self, obj):
        return (obj.value[:80] + "…") if len(obj.value) > 80 else obj.value


@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ("name", "role", "rating", "order", "is_active")
    list_editable = ("order", "is_active")
    list_filter = ("is_active", "rating")
    search_fields = ("name", "quote")


@admin.register(FAQ)
class FAQAdmin(ModelAdmin):
    list_display = ("question", "order", "is_active")
    list_editable = ("order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("question", "answer")


@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    list_display = ("name", "email", "subject", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "subject", "message", "created_at")
    actions = ("mark_read",)

    @admin.action(description="Mark selected messages as read")
    def mark_read(self, request, queryset):
        n = queryset.update(is_read=True)
        self.message_user(request, f"{n} message(s) marked read.")
