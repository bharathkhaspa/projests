"""
Seed the platform with demo data so the site and admin look alive instantly.

    python manage.py seed_demo

Idempotent: safe to run multiple times. Creates truck types, demo users
(shipper/transporter/admin, password 'demo12345'), trucks, CMS content
(banners/ads/offers/site-content/testimonials/FAQs), and sample bookings with
tracking. Also loads the bundled India location seed if no locations exist.
"""

import datetime

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone

from bookings.models import Booking, TrackingEvent
from bookings.services import estimate_fare, road_distance_km
from content.models import (
    FAQ,
    Advertisement,
    Banner,
    OfferPoster,
    SiteContent,
    Testimonial,
)
from locations.models import Location
from trucks.models import Truck, TruckType

User = get_user_model()

TRUCK_TYPES = [
    ("mini", "Mini Truck (Tata Ace)", 1, "up to 1 ton", "Local small loads, e-commerce", 350, 18, "photo-1601584115197-04ecc0da31d7"),
    ("pickup", "Pickup (Bolero)", 1.5, "1–1.5 ton", "City deliveries, small shifting", 450, 22, "photo-1558618666-fcd25c85cd64"),
    ("eicher14", "Eicher 14 ft", 4, "4 ton", "Medium loads, retail distribution", 900, 34, "photo-1586191582151-f73872dfd183"),
    ("eicher17", "Eicher 17 ft", 5, "5 ton", "Furniture, appliances, shifting", 1100, 40, "photo-1612630741022-b29ec17d013a"),
    ("container", "Container 19/24/32 ft", 12, "7–15 ton", "Bulk cargo, long-haul, FMCG", 2200, 58, "photo-1578575437130-527eed3abbec"),
    ("open", "Open Body / Trailer", 20, "15+ ton", "Heavy machinery, construction", 3000, 72, "photo-1591768793355-74d04bb6608f"),
]

SITE_CONTENT = [
    ("hero_title", "Hero title", "Book a truck. Move anything. Pay simply.", "Home hero headline"),
    ("hero_subtitle", "Hero subtitle", "From a single carton to a full container — get a verified truck at a transparent price, with live tracking from pickup to delivery.", "Home hero sub-text"),
    ("about_text", "About text", "Pass & Pay connects shippers directly with verified transporters across India.", "About page intro"),
    ("footer_text", "Footer text", "India's modern truck booking platform. Full loads, part-load sharing, live tracking.", "Footer blurb"),
    ("contact_email", "Contact email", "hello@passandpay.in", "Shown in header/footer/contact"),
    ("contact_phone", "Contact phone", "1800-000-000", "Shown in header/footer/contact"),
]

BANNERS = [
    ("Book a truck. Move anything. Pay simply.", "Verified trucks, transparent pricing and live GPS tracking — across all of India.",
     "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=70", "Book now", "/accounts/signup/"),
    ("Share a truck, split the cost.", "Part-load? Pay only for the space you use with truck sharing.",
     "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=70", "Learn more", "/how-it-works/"),
]

OFFERS = [
    ("Flat 20% off your first booking", "New shippers save big on their first full-truck-load booking.", "FLAT 20% OFF",
     "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=70"),
    ("Refer & earn ₹500", "Invite a business and you both earn ride credits.", "₹500 CREDIT",
     "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=70"),
    ("Zero booking fees", "We never charge a booking fee. Pay only the transparent fare.", "₹0 FEE",
     "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=70"),
]

ADS = [
    ("Fuel cards for transporters — save up to ₹2/L", "home_top",
     "https://images.unsplash.com/photo-1545262810-77515befe149?auto=format&fit=crop&w=1600&q=70"),
]

TESTIMONIALS = [
    ("Ananya Sharma", "Sharma Textiles, Mumbai", "Booked a 5-ton Eicher in under two minutes. Live tracking meant I never had to call the driver once.", 5),
    ("Karan Mehta", "D2C founder, Delhi", "Part-load sharing cut my Delhi–Jaipur freight cost by nearly 40%. Game changer for small shipments.", 5),
    ("Rajinder Singh", "Transporter, 6 trucks", "I find return loads instead of driving back empty. My trucks earn on both legs now.", 5),
]

FAQS = [
    ("How is the fare calculated?", "Fare = base fare + (distance × per-km rate for your truck type) + 5% GST. A long-haul surcharge may apply beyond 800 km. You always see the full breakdown before booking."),
    ("What is part-load / truck sharing?", "If your goods don't fill a whole truck, mark the load shareable. We group it with other shipments on the same route and date, and split the fare proportionally by weight."),
    ("Are the trucks and drivers verified?", "Yes. Every transporter completes KYC and each truck's RC and insurance are verified by our team before they can accept loads."),
    ("How do I track my shipment?", "Open Live Tracking in your dashboard to see the truck's location and a status timeline from pickup to delivery."),
]


class Command(BaseCommand):
    help = "Seed demo data for Pass & Pay."

    def handle(self, *args, **options):
        if Location.objects.count() == 0:
            self.stdout.write("Loading India location seed…")
            call_command("load_locations", "data/india_locations_seed.csv")

        self._truck_types()
        users = self._users()
        self._content()
        self._trucks(users["transporter"])
        self._bookings(users)
        self._groups()
        self.stdout.write(self.style.SUCCESS("Demo data ready. Log in with shipper@passandpay.in / demo12345"))

    # -- truck types --
    def _truck_types(self):
        for i, (slug, name, cap, label, use, base, perkm, img) in enumerate(TRUCK_TYPES):
            TruckType.objects.update_or_create(
                slug=slug,
                defaults=dict(
                    name=name, capacity_tons=cap, capacity_label=label, example_use=use,
                    base_fare=base, per_km_rate=perkm, order=i,
                    image_url=f"https://images.unsplash.com/{img}?auto=format&fit=crop&w=900&q=70",
                ),
            )

    # -- users + groups --
    def _users(self):
        def mk(username, role, name, **extra):
            first, _, last = name.partition(" ")
            extra.setdefault("is_verified", True)
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(email=username, first_name=first, last_name=last, role=role, **extra),
            )
            if created:
                user.set_password("demo12345")
                user.save()
            return user

        shipper = mk("shipper@passandpay.in", "shipper", "Ananya Sharma", phone="+91 98200 11223", company="Sharma Textiles", city="Mumbai", rating=4.7)
        shipper2 = mk("vikram@example.in", "shipper", "Vikram Patel", phone="+91 97600 33445", company="Patel Electronics", city="Ahmedabad", is_verified=False)
        transporter = mk("transporter@passandpay.in", "transporter", "Rajinder Singh", phone="+91 99100 44556", company="Singh Roadlines", city="Delhi", rating=4.8)
        admin = mk("admin@passandpay.in", "admin", "Pass Pay-Ops", phone="+91 90000 00000", city="Bengaluru")
        if not admin.is_staff:
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()

        # Scoped admin-team groups
        content_group, _ = Group.objects.get_or_create(name="Content Team")
        ops_group, _ = Group.objects.get_or_create(name="Operations")
        content_models = ["banner", "advertisement", "offerposter", "sitecontent", "testimonial", "faq", "contactmessage"]
        ops_models = ["booking", "sharedbookinggroup", "trackingevent", "truck", "payment", "invoice", "user"]
        content_group.permissions.set(Permission.objects.filter(content_type__model__in=content_models))
        ops_group.permissions.set(Permission.objects.filter(content_type__model__in=ops_models))

        return {"shipper": shipper, "shipper2": shipper2, "transporter": transporter, "admin": admin}

    # -- CMS content --
    def _content(self):
        for key, label, value, notes in SITE_CONTENT:
            SiteContent.objects.get_or_create(key=key, defaults=dict(label=label, value=value, notes=notes))
        for i, (h, s, img, bt, bl) in enumerate(BANNERS):
            Banner.objects.get_or_create(heading=h, defaults=dict(subheading=s, image_url=img, button_text=bt, button_link=bl, order=i))
        for i, (t, d, ot, img) in enumerate(OFFERS):
            OfferPoster.objects.get_or_create(title=t, defaults=dict(description=d, offer_text=ot, image_url=img, order=i))
        for i, (t, slot, img) in enumerate(ADS):
            Advertisement.objects.get_or_create(title=t, defaults=dict(slot=slot, image_url=img, order=i))
        for i, (n, r, q, stars) in enumerate(TESTIMONIALS):
            Testimonial.objects.get_or_create(name=n, defaults=dict(role=r, quote=q, rating=stars, order=i))
        for i, (q, a) in enumerate(FAQS):
            FAQ.objects.get_or_create(question=q, defaults=dict(answer=a, order=i))

    # -- trucks --
    def _trucks(self, transporter):
        specs = [
            ("DL 01 GA 4521", "eicher17", "Eicher Pro 1110", "verified", "available"),
            ("DL 01 GB 7788", "container", "Ashok Leyland 2820", "verified", "available"),
            ("DL 01 GC 1290", "eicher14", "Eicher Pro 2049", "pending", "available"),
        ]
        for reg, slug, model, kyc, status in specs:
            tt = TruckType.objects.filter(slug=slug).first()
            if tt:
                Truck.objects.get_or_create(
                    registration_no=reg,
                    defaults=dict(owner=transporter, truck_type=tt, model_name=model, city="Delhi", kyc_status=kyc, status=status),
                )

    # -- bookings --
    def _bookings(self, users):
        if Booking.objects.exists():
            return
        loc = {l.name: l for l in Location.objects.all()}

        def make(shipper, o, d, slug, goods, weight, day_offset, mode, status, paid, transporter=None):
            origin, dest = loc.get(o), loc.get(d)
            tt = TruckType.objects.filter(slug=slug).first()
            if not (origin and dest and tt):
                return None
            distance = road_distance_km(origin, dest)
            fare = estimate_fare(tt, distance, weight, mode)
            pickup = timezone.now().date() + datetime.timedelta(days=day_offset)
            b = Booking.objects.create(
                shipper=shipper, transporter=transporter, truck_type=tt, origin=origin, destination=dest,
                distance_km=distance, goods_type=goods, weight_tons=weight, pickup_date=pickup, mode=mode,
                share_pct=fare.share_pct, status=status, payment_status="paid" if paid else "unpaid",
                fare_base=fare.base, fare_distance=fare.distance, fare_surcharge=fare.surcharge,
                fare_surcharge_label=fare.surcharge_label, fare_gst=fare.gst, fare_total=fare.total,
            )
            if transporter:
                b.truck = Truck.objects.filter(owner=transporter, kyc_status="verified").first()
                b.save(update_fields=["truck"])
            self._timeline(b, status)
            return b

        S, T = users["shipper"], users["transporter"]
        S2 = users["shipper2"]
        make(S, "Delhi", "Jaipur", "eicher17", "Cotton fabric rolls", 4.2, 0, "full", "in_transit", False, T)
        make(S, "Mumbai", "Bengaluru", "container", "Packaged garments", 9, -8, "full", "delivered", True, T)
        make(S, "Mumbai", "Pune", "eicher14", "Retail stock cartons", 1.5, 2, "shared", "pending", False)
        make(S2, "Ahmedabad", "Delhi", "container", "LED televisions (boxed)", 8, 1, "full", "pending", False)
        make(S2, "Mumbai", "Pune", "eicher14", "Home appliances", 2, 2, "shared", "pending", False)
        make(S2, "Pune", "Mumbai", "mini", "Spare parts", 0.8, 3, "full", "pending", False)

    def _timeline(self, booking, status):
        flow = ["confirmed", "picked_up", "in_transit", "delivered"]
        labels = {"confirmed": "Booking confirmed", "picked_up": "Goods picked up", "in_transit": "In transit", "delivered": "Delivered"}
        if status not in flow:
            return
        upto = flow.index(status)
        for i, s in enumerate(flow[: upto + 1]):
            t = {"picked_up": 0.1, "in_transit": 0.5, "delivered": 1.0}.get(s, 0)
            TrackingEvent.objects.create(
                booking=booking, status=s, label=labels[s],
                latitude=booking.origin.latitude + (booking.destination.latitude - booking.origin.latitude) * t,
                longitude=booking.origin.longitude + (booking.destination.longitude - booking.origin.longitude) * t,
            )

    def _groups(self):
        pass
