from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Invoice, Payment, Rating


@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = ("booking", "amount", "method", "status", "gateway_ref", "created_at")
    list_filter = ("status", "method")
    search_fields = ("booking__id", "gateway_ref")
    autocomplete_fields = ("booking",)


@admin.register(Invoice)
class InvoiceAdmin(ModelAdmin):
    list_display = ("number", "booking", "amount", "issued_at")
    search_fields = ("number", "booking__id")
    autocomplete_fields = ("booking",)


@admin.register(Rating)
class RatingAdmin(ModelAdmin):
    list_display = ("booking", "rater", "ratee", "stars", "created_at")
    list_filter = ("stars",)
    search_fields = ("rater__username", "ratee__username")
    autocomplete_fields = ("booking", "rater", "ratee")
