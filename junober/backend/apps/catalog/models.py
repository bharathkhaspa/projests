from django.db import models


class GarmentType(models.TextChoices):
    TSHIRT = "tshirt", "T-Shirt"
    POLO = "polo", "Polo"
    HOODIE = "hoodie", "Hoodie"
    TANK = "tank", "Tank"


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, blank=True, help_text="Emoji icon e.g. 👕")
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Banner(models.Model):
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to="banners/")
    link_url = models.CharField(max_length=300, blank=True)
    link_label = models.CharField(max_length=60, blank=True, default="Shop Now")
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.title


class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)
    hex_code = models.CharField(max_length=7, help_text="e.g. #FFFFFF")
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return f"{self.name} ({self.hex_code})"


class Size(models.Model):
    code = models.CharField(max_length=10, unique=True, help_text="e.g. S, M, L, XL, XXL")
    label = models.CharField(max_length=30, help_text="e.g. Small, Medium")
    chest_inches = models.IntegerField(null=True, blank=True)
    length_inches = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.label


class PrintType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)
    description = models.TextField(blank=True)
    surcharge = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Added to product base price, in INR",
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


class PrintArea(models.Model):
    class Size(models.TextChoices):
        SMALL = "small", "Small (chest logo ~10cm)"
        MEDIUM = "medium", "Medium (full chest ~25cm)"
        LARGE = "large", "Large (full back ~30cm)"

    name = models.CharField(max_length=50, help_text="e.g. Front Chest, Back, Left Sleeve")
    code = models.SlugField(max_length=60, unique=True)
    print_size = models.CharField(max_length=10, choices=Size.choices, default=Size.MEDIUM)
    surcharge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    garment_type = models.CharField(max_length=20, choices=GarmentType.choices)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(
        max_digits=8, decimal_places=2, help_text="Base price in INR (no print)"
    )
    thumbnail = models.ImageField(upload_to="products/thumbnails/", blank=True, null=True)
    glb_url = models.CharField(
        max_length=255,
        blank=True,
        help_text="Path served from /public, e.g. /models/tshirt.glb",
    )
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    available_colors = models.ManyToManyField(Color, related_name="products", blank=True)
    available_sizes = models.ManyToManyField(Size, related_name="products", blank=True)
    available_print_types = models.ManyToManyField(
        PrintType, related_name="products", blank=True
    )

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/images/")
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variants"
    )
    color = models.ForeignKey(Color, on_delete=models.PROTECT)
    size = models.ForeignKey(Size, on_delete=models.PROTECT)
    sku = models.CharField(max_length=64, unique=True)
    additional_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Extra over product base price (e.g. XXL surcharge)",
    )
    stock_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [("product", "color", "size")]
        ordering = ["product", "color", "size"]

    def __str__(self):
        return f"{self.product.name} / {self.color.name} / {self.size.code}"

    @property
    def final_price(self):
        return self.product.base_price + self.additional_price


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=120, blank=True)
    body = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("product", "user")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} — {self.rating}★ by {self.user.email}"
