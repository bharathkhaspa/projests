from decimal import Decimal

from rest_framework import serializers

from apps.catalog.models import PrintType, ProductVariant
from apps.catalog.serializers import ColorSerializer, PrintTypeSerializer, SizeSerializer

from .models import Address, Cart, CartItem, DesignUpload, Order, OrderItem


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id", "label", "full_name", "phone", "line1", "line2",
            "city", "state", "pincode", "country", "is_default", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class CartItemVariantSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_thumbnail = serializers.ImageField(source="product.thumbnail", read_only=True)
    glb_url = serializers.CharField(source="product.glb_url", read_only=True)

    class Meta:
        model = ProductVariant
        fields = (
            "id", "sku", "color", "size",
            "product_name", "product_slug", "product_thumbnail", "glb_url",
        )


class CartItemSerializer(serializers.ModelSerializer):
    variant = CartItemVariantSerializer(read_only=True)
    print_type = PrintTypeSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id", "variant", "print_type", "quantity",
            "design_text", "design_text_color", "design_image_url",
            "unit_price", "line_total", "created_at",
        )
        read_only_fields = ("id", "unit_price", "line_total", "created_at")

    def get_line_total(self, obj):
        return obj.line_total


class CartItemCreateSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    print_type_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    design_text = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    design_text_color = serializers.CharField(max_length=7, required=False, allow_blank=True, default="")
    design_image_url = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")

    def validate(self, attrs):
        try:
            attrs["_variant"] = ProductVariant.objects.select_related("product").get(
                pk=attrs["variant_id"], is_active=True, product__is_active=True
            )
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError({"variant_id": "Variant not found."})
        try:
            attrs["_print_type"] = PrintType.objects.get(pk=attrs["print_type_id"], is_active=True)
        except PrintType.DoesNotExist:
            raise serializers.ValidationError({"print_type_id": "Print type not found."})
        return attrs

    def create(self, validated_data):
        variant = validated_data.pop("_variant")
        print_type = validated_data.pop("_print_type")
        cart = self.context["cart"]
        unit_price = (
            Decimal(variant.product.base_price)
            + Decimal(variant.additional_price)
            + Decimal(print_type.surcharge)
        )
        return CartItem.objects.create(
            cart=cart,
            variant=variant,
            print_type=print_type,
            quantity=validated_data["quantity"],
            design_text=validated_data.get("design_text", ""),
            design_text_color=validated_data.get("design_text_color", ""),
            design_image_url=validated_data.get("design_image_url", ""),
            unit_price=unit_price,
        )


class CartItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ("quantity",)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "items", "subtotal", "item_count", "updated_at")

    def get_subtotal(self, obj):
        return str(obj.subtotal)

    def get_item_count(self, obj):
        return obj.item_count


class DesignUploadSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = DesignUpload
        fields = ("id", "url", "created_at")
        read_only_fields = ("id", "url", "created_at")

    def get_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


# ── Order serializers ──────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    variant_sku = serializers.CharField(source="variant.sku", read_only=True)
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    color_name = serializers.CharField(source="variant.color.name", read_only=True)
    size_code = serializers.CharField(source="variant.size.code", read_only=True)
    print_type_name = serializers.CharField(source="print_type.name", read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            "id", "variant_sku", "product_name", "color_name", "size_code",
            "print_type_name", "quantity", "unit_price", "line_total",
            "design_text", "design_text_color", "design_image_url",
        )

    def get_line_total(self, obj):
        return obj.line_total


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    customer_email = serializers.CharField(source="user.email", read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id", "order_number", "status", "payment_status",
            "shipping_address", "subtotal", "shipping_charge", "total",
            "notes", "tracking_number", "items",
            "customer_email", "customer_name", "created_at", "updated_at",
        )

    def get_customer_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_address_id(self, value):
        user = self.context["request"].user
        try:
            self._address = Address.objects.get(pk=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Address not found.")
        return value

    def create(self, validated_data):
        from django.db import transaction
        user = self.context["request"].user
        cart = Cart.objects.prefetch_related(
            "items__variant__product", "items__print_type"
        ).get(user=user)

        if not cart.items.exists():
            raise serializers.ValidationError("Cart is empty.")

        address = self._address
        subtotal = cart.subtotal
        shipping_charge = Decimal("0.00") if subtotal >= Decimal("499") else Decimal("49.00")
        total = subtotal + shipping_charge

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                shipping_address=address,
                subtotal=subtotal,
                shipping_charge=shipping_charge,
                total=total,
                notes=validated_data.get("notes", ""),
                payment_status=Order.PaymentStatus.COD,
            )
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    variant=item.variant,
                    print_type=item.print_type,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    design_text=item.design_text,
                    design_text_color=item.design_text_color,
                    design_image_url=item.design_image_url,
                )
            cart.items.all().delete()
        return order


class AdminOrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status", "payment_status", "tracking_number", "notes")
