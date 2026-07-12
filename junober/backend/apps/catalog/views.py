from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Banner, Category, Color, PrintArea, PrintType, Product, ProductVariant, Review
from .serializers import (
    BannerSerializer,
    BannerWriteSerializer,
    CategorySerializer,
    ColorSerializer,
    PrintAreaSerializer,
    PrintTypeSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductVariantWriteSerializer,
    ProductWriteSerializer,
    ReviewSerializer,
    SizeSerializer,
)
from apps.catalog.models import Size


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or getattr(request.user, "role", "") in ("super_admin", "admin")
        )


class PublicReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.AllowAny,)
    pagination_class = None


class CategoryViewSet(PublicReadOnlyViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"


class BannerViewSet(PublicReadOnlyViewSet):
    queryset = Banner.objects.filter(is_active=True)
    serializer_class = BannerSerializer


class ColorViewSet(PublicReadOnlyViewSet):
    queryset = Color.objects.filter(is_active=True)
    serializer_class = ColorSerializer
    lookup_field = "slug"


class SizeViewSet(PublicReadOnlyViewSet):
    queryset = Size.objects.filter(is_active=True)
    serializer_class = SizeSerializer
    lookup_field = "code"


class PrintTypeViewSet(PublicReadOnlyViewSet):
    queryset = PrintType.objects.filter(is_active=True)
    serializer_class = PrintTypeSerializer
    lookup_field = "slug"


class PrintAreaViewSet(PublicReadOnlyViewSet):
    queryset = PrintArea.objects.filter(is_active=True)
    serializer_class = PrintAreaSerializer
    lookup_field = "code"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.AllowAny,)
    pagination_class = None
    lookup_field = "slug"
    filterset_fields = ("garment_type", "category__slug", "is_featured")

    def get_queryset(self):
        base = Product.objects.filter(is_active=True).select_related("category")
        if self.action in ("list", "by_garment", "featured"):
            # Lean queryset for list: only prefetch reviews (for avg_rating)
            return base.prefetch_related("reviews")
        # Full queryset for detail
        return base.prefetch_related(
            "available_colors",
            "available_sizes",
            "available_print_types",
            "variants__color",
            "variants__size",
            "images",
            "reviews",
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        return ProductDetailSerializer

    @action(detail=False, methods=["get"], url_path="by-garment/(?P<garment_type>[^/.]+)")
    def by_garment(self, request, garment_type=None):
        qs = self.filter_queryset(self.get_queryset()).filter(garment_type=garment_type)
        page = self.paginate_queryset(qs)
        serializer = ProductListSerializer(page if page is not None else qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="featured")
    def featured(self, request):
        qs = self.get_queryset().filter(is_featured=True)
        return Response(ProductListSerializer(qs, many=True).data)

    @action(detail=True, methods=["get", "post"], url_path="reviews",
            permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def reviews(self, request, slug=None):
        product = self.get_object()
        if request.method == "GET":
            reviews = product.reviews.select_related("user").all()
            return Response(ReviewSerializer(reviews, many=True).data)
        # POST — create or update review
        existing = Review.objects.filter(product=product, user=request.user).first()
        serializer = ReviewSerializer(existing, data=request.data, partial=bool(existing))
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ── Admin-only endpoints ───────────────────────────────────────────────────────

class AdminProductViewSet(viewsets.ModelViewSet):
    """Full CRUD on products — admin only."""

    permission_classes = (permissions.IsAdminUser,)
    queryset = Product.objects.all().select_related("category").prefetch_related(
        "available_colors", "available_sizes", "available_print_types", "variants", "images"
    )
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action in ("list",):
            return ProductListSerializer
        if self.request.method in ("POST", "PUT", "PATCH"):
            return ProductWriteSerializer
        return ProductDetailSerializer

    def get_parsers(self):
        return [MultiPartParser(), FormParser(), JSONParser()]


class AdminVariantViewSet(viewsets.ModelViewSet):
    """Stock management — admin only."""

    permission_classes = (permissions.IsAdminUser,)
    serializer_class = ProductVariantWriteSerializer
    queryset = ProductVariant.objects.select_related("product", "color", "size").all()

    @action(detail=False, methods=["get"], url_path="by-product/(?P<product_slug>[^/.]+)")
    def by_product(self, request, product_slug=None):
        qs = self.get_queryset().filter(product__slug=product_slug)
        return Response(self.get_serializer(qs, many=True).data)


class AdminBannerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAdminUser,)
    queryset = Banner.objects.all()

    def get_serializer_class(self):
        if self.request.method in ("POST", "PUT", "PATCH"):
            return BannerWriteSerializer
        return BannerSerializer

    def get_parsers(self):
        return [MultiPartParser(), FormParser(), JSONParser()]


class AdminDashboardView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        from apps.orders.models import Order
        from django.contrib.auth import get_user_model
        User = get_user_model()

        total_products = Product.objects.filter(is_active=True).count()
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status="pending").count()
        total_customers = User.objects.filter(is_staff=False).count()
        low_stock_variants = ProductVariant.objects.filter(stock_count__lte=5, is_active=True).count()

        recent_orders = Order.objects.select_related("user", "shipping_address").order_by("-created_at")[:5]
        from apps.orders.serializers import OrderSerializer
        return Response({
            "total_products": total_products,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "total_customers": total_customers,
            "low_stock_variants": low_stock_variants,
            "recent_orders": OrderSerializer(recent_orders, many=True).data,
        })
