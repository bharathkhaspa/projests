from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    AdminOrderViewSet,
    CartClearView,
    CartItemDetailView,
    CartItemListCreateView,
    CartView,
    CheckoutView,
    DesignUploadView,
    OrderDetailView,
    OrderListView,
)

router = DefaultRouter()
router.register("addresses", AddressViewSet, basename="address")

admin_router = DefaultRouter()
admin_router.register("orders", AdminOrderViewSet, basename="admin-order")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/clear/", CartClearView.as_view(), name="cart-clear"),
    path("cart/items/", CartItemListCreateView.as_view(), name="cart-items"),
    path("cart/items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item"),
    path("designs/upload/", DesignUploadView.as_view(), name="design-upload"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("orders/", OrderListView.as_view(), name="order-list"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("admin-api/", include(admin_router.urls)),
    path("", include(router.urls)),
]
