from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import District, Location, State


@admin.register(State)
class StateAdmin(ModelAdmin):
    list_display = ("name", "district_count", "location_count")
    search_fields = ("name",)

    @admin.display(description="Districts")
    def district_count(self, obj):
        return obj.districts.count()

    @admin.display(description="Locations")
    def location_count(self, obj):
        return obj.locations.count()


@admin.register(District)
class DistrictAdmin(ModelAdmin):
    list_display = ("name", "state")
    list_filter = ("state",)
    search_fields = ("name", "state__name")
    autocomplete_fields = ("state",)


@admin.register(Location)
class LocationAdmin(ModelAdmin):
    list_display = ("name", "city", "district", "state", "pincode")
    list_filter = ("state",)
    search_fields = ("name", "city", "pincode", "search_text")
    autocomplete_fields = ("state", "district")
    list_select_related = ("state", "district")
