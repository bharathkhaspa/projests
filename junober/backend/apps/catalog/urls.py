from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminBannerViewSet,
    AdminDashboardView,
    AdminProductViewSet,
    AdminVariantViewSet,
    BannerViewSet,
    CategoryViewSet,
    ColorViewSet,
    PrintAreaViewSet,
    PrintTypeViewSet,
    ProductViewSet,
    SizeViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("banners", BannerViewSet, basename="banner")
router.register("colors", ColorViewSet, basename="color")
router.register("sizes", SizeViewSet, basename="size")
router.register("print-types", PrintTypeViewSet, basename="print-type")
router.register("print-areas", PrintAreaViewSet, basename="print-area")
router.register("products", ProductViewSet, basename="product")

# Admin-only routers
admin_router = DefaultRouter()
admin_router.register("products", AdminProductViewSet, basename="admin-product")
admin_router.register("variants", AdminVariantViewSet, basename="admin-variant")
admin_router.register("banners", AdminBannerViewSet, basename="admin-banner")

from django.urls import include

urlpatterns = [
    path("admin-api/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin-api/", include(admin_router.urls)),
    *router.urls,
]
