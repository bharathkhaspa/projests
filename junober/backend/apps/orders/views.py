from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, Cart, CartItem, DesignUpload, Order
from .serializers import (
    AddressSerializer,
    AdminOrderUpdateSerializer,
    CartItemCreateSerializer,
    CartItemSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
    CheckoutSerializer,
    DesignUploadSerializer,
    OrderSerializer,
)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="set-default")
    def set_default(self, request, pk=None):
        address = self.get_object()
        address.is_default = True
        address.save()
        return Response(self.get_serializer(address).data)


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return get_or_create_cart(self.request.user)


class CartClearView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)


class CartItemListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        cart = get_or_create_cart(self.request.user)
        return cart.items.select_related(
            "variant__product", "variant__color", "variant__size", "print_type"
        ).all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CartItemCreateSerializer
        return CartItemSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["cart"] = get_or_create_cart(self.request.user)
        return ctx

    def create(self, request, *args, **kwargs):
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        item = write.save()
        item = CartItem.objects.select_related(
            "variant__product", "variant__color", "variant__size", "print_type"
        ).get(pk=item.pk)
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ("get", "patch", "delete", "head", "options")

    def get_queryset(self):
        cart = get_or_create_cart(self.request.user)
        return cart.items.select_related(
            "variant__product", "variant__color", "variant__size", "print_type"
        ).all()

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return CartItemUpdateSerializer
        return CartItemSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        write = CartItemUpdateSerializer(instance, data=request.data, partial=True)
        write.is_valid(raise_exception=True)
        write.save()
        return Response(CartItemSerializer(instance).data)


class DesignUploadView(generics.CreateAPIView):
    serializer_class = DesignUploadSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        upload = request.FILES.get("file")
        if not upload:
            return Response({"file": "A file is required."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > 8 * 1024 * 1024:
            return Response({"file": "Max upload size is 8 MB."}, status=status.HTTP_400_BAD_REQUEST)
        obj = DesignUpload.objects.create(user=request.user, file=upload)
        return Response(
            DesignUploadSerializer(obj, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CheckoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "items__variant__product", "items__variant__color",
            "items__variant__size", "items__print_type",
        ).select_related("shipping_address")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "items__variant__product", "items__variant__color",
            "items__variant__size", "items__print_type",
        ).select_related("shipping_address")


# ── Admin views ────────────────────────────────────────────────────────────────

class AdminOrderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAdminUser,)
    queryset = Order.objects.all().prefetch_related(
        "items__variant__product", "items__variant__color",
        "items__variant__size", "items__print_type",
    ).select_related("user", "shipping_address")

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return AdminOrderUpdateSerializer
        return OrderSerializer

    @action(detail=True, methods=["patch"], url_path="update-status")
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = AdminOrderUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data)
