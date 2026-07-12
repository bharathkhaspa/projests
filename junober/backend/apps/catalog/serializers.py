from rest_framework import serializers

from .models import (
    Banner,
    Category,
    Color,
    PrintArea,
    PrintType,
    Product,
    ProductImage,
    ProductVariant,
    Review,
    Size,
)


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "icon", "image", "product_count", "sort_order")

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ("id", "title", "subtitle", "image", "link_url", "link_label", "sort_order")


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ("id", "name", "slug", "hex_code", "sort_order")


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ("id", "code", "label", "chest_inches", "length_inches", "sort_order")


class PrintTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrintType
        fields = ("id", "name", "slug", "description", "surcharge", "sort_order")


class PrintAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrintArea
        fields = ("id", "name", "code", "print_size", "surcharge", "sort_order")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order")


class ProductVariantSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    final_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = (
            "id", "sku", "color", "size", "additional_price", "final_price", "stock_count",
        )


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ("id", "rating", "title", "body", "user_name", "created_at")
        read_only_fields = ("id", "user_name", "created_at")

    def get_user_name(self, obj):
        return obj.user.first_name or obj.user.email.split("@")[0]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    thumbnail = serializers.ImageField(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "garment_type", "category", "base_price",
            "thumbnail", "glb_url", "is_featured", "avg_rating", "review_count", "sort_order",
        )

    def get_avg_rating(self, obj):
        reviews = list(obj.reviews.all())  # uses prefetch cache
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return len(obj.reviews.all())  # uses prefetch cache, not a new COUNT query


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    available_colors = ColorSerializer(many=True, read_only=True)
    available_sizes = SizeSerializer(many=True, read_only=True)
    available_print_types = PrintTypeSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "garment_type", "category", "description",
            "base_price", "thumbnail", "glb_url", "is_featured",
            "available_colors", "available_sizes", "available_print_types",
            "variants", "images", "reviews", "avg_rating", "review_count",
        )

    def get_avg_rating(self, obj):
        reviews = list(obj.reviews.all())  # uses prefetch cache
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return len(obj.reviews.all())  # uses prefetch cache, no extra COUNT query


# Admin write serializers
class ProductVariantWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "color", "size", "sku", "additional_price", "stock_count", "is_active")


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "garment_type", "category", "description",
            "base_price", "thumbnail", "glb_url", "is_active", "is_featured", "sort_order",
            "available_colors", "available_sizes", "available_print_types",
        )


class BannerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ("id", "title", "subtitle", "image", "link_url", "link_label", "is_active", "sort_order")
