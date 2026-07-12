"""Root URL configuration for the Pass & Pay platform."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("api/locations/", include("locations.urls")),
    path("app/", include("bookings.urls_shipper")),
    path("transporter/", include("bookings.urls_transporter")),
    path("payments/", include("payments.urls")),
    path("", include("content.public_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / "static")
