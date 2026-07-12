from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.catalog.models import (
    Color,
    GarmentType,
    PrintArea,
    PrintType,
    Product,
    ProductVariant,
    Size,
)


COLORS = [
    ("White", "white", "#FFFFFF", 0),
    ("Black", "black", "#000000", 1),
    ("Navy", "navy", "#0B1F4D", 2),
    ("Charcoal", "charcoal", "#36454F", 3),
    ("Heather Grey", "heather-grey", "#9CA3AF", 4),
    ("Cream", "cream", "#F3E9D2", 5),
    ("Olive", "olive", "#556B2F", 6),
    ("Bottle Green", "bottle-green", "#0B6E4F", 7),
    ("Maroon", "maroon", "#800000", 8),
    ("Royal Blue", "royal-blue", "#1D4ED8", 9),
    ("Sky Blue", "sky-blue", "#7DD3FC", 10),
    ("Mustard", "mustard", "#D4A017", 11),
    ("Coral", "coral", "#FF7F50", 12),
    ("Hot Pink", "hot-pink", "#FF1493", 13),
    ("Lavender", "lavender", "#B57EDC", 14),
]

SIZES = [
    ("XS", "Extra Small", 34, 26, 0),
    ("S", "Small", 36, 27, 1),
    ("M", "Medium", 38, 28, 2),
    ("L", "Large", 40, 29, 3),
    ("XL", "Extra Large", 42, 30, 4),
    ("XXL", "2X Large", 44, 31, 5),
    ("XXXL", "3X Large", 46, 32, 6),
]

PRINT_TYPES = [
    (
        "DTF Print",
        "dtf",
        "Direct-to-film. Vivid full-color prints with a soft finish. Good for photos and gradients.",
        Decimal("199.00"),
        0,
    ),
    (
        "PUF Print",
        "puf",
        "Raised 3D texture. Premium feel, best for bold single-color designs.",
        Decimal("249.00"),
        1,
    ),
    (
        "Embroidery",
        "embroidery",
        "Stitched thread. Long-lasting and classic — best for chest/sleeve logos.",
        Decimal("349.00"),
        2,
    ),
    (
        "Paint Print",
        "paint-print",
        "Hand-painted finish for one-of-a-kind looks.",
        Decimal("449.00"),
        3,
    ),
]

PRINT_AREAS = [
    ("Front Chest (Logo)", "front-chest-logo", PrintArea.Size.SMALL, Decimal("0.00"), 0),
    ("Front Chest (Full)", "front-chest-full", PrintArea.Size.MEDIUM, Decimal("99.00"), 1),
    ("Full Back", "full-back", PrintArea.Size.LARGE, Decimal("149.00"), 2),
    ("Left Sleeve", "left-sleeve", PrintArea.Size.SMALL, Decimal("79.00"), 3),
    ("Right Sleeve", "right-sleeve", PrintArea.Size.SMALL, Decimal("79.00"), 4),
    ("Both Sleeves", "both-sleeves", PrintArea.Size.SMALL, Decimal("129.00"), 5),
    ("Front + Back", "front-back", PrintArea.Size.LARGE, Decimal("199.00"), 6),
]

PRODUCTS = [
    {
        "name": "Oversized Cotton T-Shirt",
        "slug": "oversized-cotton-tshirt",
        "garment_type": GarmentType.TSHIRT,
        "description": "240 GSM premium cotton, drop-shoulder oversized fit. Pre-shrunk.",
        "base_price": Decimal("449.00"),
        "glb_url": "/models/tshirt.glb",
        "sort_order": 0,
    },
    {
        "name": "Classic Polo",
        "slug": "classic-polo",
        "garment_type": GarmentType.POLO,
        "description": "Pique-knit cotton polo with 2-button placket and ribbed collar.",
        "base_price": Decimal("599.00"),
        "glb_url": "/models/polo.glb",
        "sort_order": 1,
    },
    {
        "name": "Heavyweight Hoodie",
        "slug": "heavyweight-hoodie",
        "garment_type": GarmentType.HOODIE,
        "description": "320 GSM brushed fleece, kangaroo pocket, drawstring hood.",
        "base_price": Decimal("799.00"),
        "glb_url": "/models/hoodie.glb",
        "sort_order": 2,
    },
    {
        "name": "Cotton Tank Top",
        "slug": "cotton-tank",
        "garment_type": GarmentType.TANK,
        "description": "180 GSM ribbed cotton tank, classic athletic fit.",
        "base_price": Decimal("349.00"),
        "glb_url": "/models/tank.glb",
        "sort_order": 3,
    },
]


class Command(BaseCommand):
    help = "Seed the catalog with default colors, sizes, print types, areas, and products."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing catalog data before seeding (DESTRUCTIVE).",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts.get("reset"):
            self.stdout.write(self.style.WARNING("Resetting catalog…"))
            ProductVariant.objects.all().delete()
            Product.objects.all().delete()
            Color.objects.all().delete()
            Size.objects.all().delete()
            PrintType.objects.all().delete()
            PrintArea.objects.all().delete()

        # Colors
        colors = {}
        for name, slug, hex_code, order in COLORS:
            obj, _ = Color.objects.update_or_create(
                slug=slug,
                defaults={"name": name, "hex_code": hex_code, "sort_order": order, "is_active": True},
            )
            colors[slug] = obj
        self.stdout.write(self.style.SUCCESS(f"  · {len(colors)} colors"))

        # Sizes
        sizes = {}
        for code, label, chest, length, order in SIZES:
            obj, _ = Size.objects.update_or_create(
                code=code,
                defaults={
                    "label": label,
                    "chest_inches": chest,
                    "length_inches": length,
                    "sort_order": order,
                    "is_active": True,
                },
            )
            sizes[code] = obj
        self.stdout.write(self.style.SUCCESS(f"  · {len(sizes)} sizes"))

        # Print types
        print_types = {}
        for name, slug, desc, surcharge, order in PRINT_TYPES:
            obj, _ = PrintType.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "description": desc,
                    "surcharge": surcharge,
                    "sort_order": order,
                    "is_active": True,
                },
            )
            print_types[slug] = obj
        self.stdout.write(self.style.SUCCESS(f"  · {len(print_types)} print types"))

        # Print areas
        print_areas = {}
        for name, code, print_size, surcharge, order in PRINT_AREAS:
            obj, _ = PrintArea.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "print_size": print_size,
                    "surcharge": surcharge,
                    "sort_order": order,
                    "is_active": True,
                },
            )
            print_areas[code] = obj
        self.stdout.write(self.style.SUCCESS(f"  · {len(print_areas)} print areas"))

        # Products
        all_colors = list(colors.values())
        # Tank doesn't have hoodie-only large sizes; we'll associate selectively
        standard_sizes = [sizes[c] for c in ("S", "M", "L", "XL", "XXL")]
        all_print_types = list(print_types.values())

        for spec in PRODUCTS:
            product, _ = Product.objects.update_or_create(
                slug=spec["slug"],
                defaults={
                    "name": spec["name"],
                    "garment_type": spec["garment_type"],
                    "description": spec["description"],
                    "base_price": spec["base_price"],
                    "glb_url": spec["glb_url"],
                    "sort_order": spec["sort_order"],
                    "is_active": True,
                },
            )
            product.available_colors.set(all_colors)
            product.available_sizes.set(standard_sizes)
            product.available_print_types.set(all_print_types)

            # Build variants: every color × standard size combination
            for color in all_colors:
                for size in standard_sizes:
                    additional = Decimal("0.00")
                    if size.code in ("XL", "XXL"):
                        additional = Decimal("49.00")
                    sku = f"{spec['slug']}-{color.slug}-{size.code}".upper()
                    ProductVariant.objects.update_or_create(
                        product=product,
                        color=color,
                        size=size,
                        defaults={
                            "sku": sku,
                            "additional_price": additional,
                            "stock_count": 50,
                            "is_active": True,
                        },
                    )

        product_count = Product.objects.count()
        variant_count = ProductVariant.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"  · {product_count} products with {variant_count} variants"
            )
        )
        self.stdout.write(self.style.SUCCESS("Catalog seeded."))
