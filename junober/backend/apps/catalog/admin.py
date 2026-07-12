from django.contrib import admin
from django.utils.html import format_html

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


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "preview_image", "is_active", "sort_order", "created_at")
    list_editable = ("is_active", "sort_order")

    def preview_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="40" />', obj.image.url)
        return "-"
    preview_image.short_description = "Preview"


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("name", "color_swatch", "hex_code", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("name", "hex_code")
    prepopulated_fields = {"slug": ("name",)}

    def color_swatch(self, obj):
        return format_html(
            '<span style="display:inline-block;width:20px;height:20px;'
            'background:{};border:1px solid #ccc;border-radius:3px;"></span>',
            obj.hex_code,
        )
    color_swatch.short_description = "Swatch"


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ("code", "label", "chest_inches", "length_inches", "is_active", "sort_order")
    list_editable = ("is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("code", "label")


@admin.register(PrintType)
class PrintTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "surcharge", "is_active", "sort_order")
    list_editable = ("surcharge", "is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(PrintArea)
class PrintAreaAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "print_size", "surcharge", "is_active", "sort_order")
    list_editable = ("surcharge", "is_active", "sort_order")
    list_filter = ("print_size", "is_active")
    search_fields = ("name", "code")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "sort_order")


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ("sku", "color", "size", "additional_price", "stock_count", "is_active")
    autocomplete_fields = ("color", "size")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "garment_type", "category", "base_price",
        "is_active", "is_featured", "total_stock", "sort_order", "updated_at",
    )
    list_editable = ("base_price", "is_active", "is_featured", "sort_order")
    list_filter = ("garment_type", "category", "is_active", "is_featured")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("available_colors", "available_sizes", "available_print_types")
    inlines = (ProductImageInline, ProductVariantInline)
    fieldsets = (
        (None, {"fields": ("name", "slug", "category", "garment_type")}),
        ("Pricing & Media", {"fields": ("base_price", "thumbnail", "glb_url")}),
        ("Description", {"fields": ("description",)}),
        ("Options", {"fields": ("available_colors", "available_sizes", "available_print_types")}),
        ("Visibility", {"fields": ("is_active", "is_featured", "sort_order")}),
    )

    def total_stock(self, obj):
        total = sum(v.stock_count for v in obj.variants.all())
        color = "red" if total <= 10 else "green"
        return format_html('<b style="color:{}">{}</b>', color, total)
    total_stock.short_description = "Stock"


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("sku", "product", "color", "size", "additional_price", "stock_count", "is_active")
    list_editable = ("stock_count", "is_active")
    list_filter = ("product", "color", "size", "is_active")
    search_fields = ("sku", "product__name")
    autocomplete_fields = ("product", "color", "size")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "title", "created_at")
    list_filter = ("rating", "product")
    search_fields = ("product__name", "user__email", "title")
    readonly_fields = ("created_at",)
