"""django-unfold admin theme configuration for Pass & Pay."""

from django.templatetags.static import static
from django.urls import reverse_lazy

UNFOLD = {
    "SITE_TITLE": "Pass & Pay Admin",
    "SITE_HEADER": "Pass & Pay",
    "SITE_SUBHEADER": "Logistics control panel",
    "SITE_SYMBOL": "local_shipping",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "DASHBOARD_CALLBACK": "passandpay.admin_dashboard.dashboard_callback",
    "THEME": "light",
    "BORDER_RADIUS": "8px",
    "COLORS": {
        "primary": {
            "50": "238 243 251",
            "100": "214 226 244",
            "200": "174 197 233",
            "300": "127 161 216",
            "400": "79 121 194",
            "500": "47 89 166",
            "600": "26 61 124",
            "700": "23 52 104",
            "800": "20 43 84",
            "900": "15 32 64",
            "950": "10 22 45",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Overview",
                "separator": False,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                    {
                        "title": "View website",
                        "icon": "public",
                        "link": "/",
                    },
                ],
            },
            {
                "title": "Site content",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Hero banners", "icon": "view_carousel", "link": reverse_lazy("admin:content_banner_changelist")},
                    {"title": "Advertisements", "icon": "ad", "link": reverse_lazy("admin:content_advertisement_changelist")},
                    {"title": "Offer posters", "icon": "local_offer", "link": reverse_lazy("admin:content_offerposter_changelist")},
                    {"title": "Site content blocks", "icon": "edit_note", "link": reverse_lazy("admin:content_sitecontent_changelist")},
                    {"title": "Testimonials", "icon": "reviews", "link": reverse_lazy("admin:content_testimonial_changelist")},
                    {"title": "FAQs", "icon": "quiz", "link": reverse_lazy("admin:content_faq_changelist")},
                    {"title": "Contact messages", "icon": "mail", "link": reverse_lazy("admin:content_contactmessage_changelist")},
                ],
            },
            {
                "title": "Operations",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Bookings", "icon": "package_2", "link": reverse_lazy("admin:bookings_booking_changelist")},
                    {"title": "Shared truck groups", "icon": "groups", "link": reverse_lazy("admin:bookings_sharedbookinggroup_changelist")},
                    {"title": "Payments", "icon": "payments", "link": reverse_lazy("admin:payments_payment_changelist")},
                    {"title": "Invoices", "icon": "receipt_long", "link": reverse_lazy("admin:payments_invoice_changelist")},
                    {"title": "Ratings", "icon": "star", "link": reverse_lazy("admin:payments_rating_changelist")},
                ],
            },
            {
                "title": "Fleet & locations",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Truck types", "icon": "category", "link": reverse_lazy("admin:trucks_trucktype_changelist")},
                    {"title": "Trucks", "icon": "local_shipping", "link": reverse_lazy("admin:trucks_truck_changelist")},
                    {"title": "Locations", "icon": "location_on", "link": reverse_lazy("admin:locations_location_changelist")},
                    {"title": "States", "icon": "map", "link": reverse_lazy("admin:locations_state_changelist")},
                ],
            },
            {
                "title": "People & access",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Users", "icon": "person", "link": reverse_lazy("admin:accounts_user_changelist")},
                    {"title": "Groups & roles", "icon": "admin_panel_settings", "link": reverse_lazy("admin:auth_group_changelist")},
                ],
            },
        ],
    },
}


def _logo(request):  # pragma: no cover - cosmetic
    return static("img/logo.svg")
