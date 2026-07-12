from django.conf import settings

from .models import SiteContent


def site_globals(request):
    """
    Expose editable site content + integration flags to every template.

    `site` is a dict of SiteContent key→value with sensible defaults, so
    templates can do {{ site.hero_title }} and the admin team controls the copy.
    """
    defaults = {
        "brand_name": "Pass & Pay",
        "tagline": "Book a truck. Move anything. Pay simply.",
        "hero_title": "Book a truck. Move anything. Pay simply.",
        "hero_subtitle": "From a single carton to a full container — get a verified truck at a transparent price, with live tracking from pickup to delivery.",
        "about_text": "Pass & Pay connects shippers directly with verified transporters across India.",
        "how_it_works": "Post your load, get matched with a verified transporter, track live and pay on delivery.",
        "footer_text": "India's modern truck booking platform.",
        "contact_email": "hello@passandpay.in",
        "contact_phone": "1800-000-000",
        "social_facebook": "#",
        "social_twitter": "#",
        "social_instagram": "#",
        "social_linkedin": "#",
    }
    try:
        overrides = dict(SiteContent.objects.values_list("key", "value"))
        defaults.update({k: v for k, v in overrides.items() if v})
    except Exception:
        # During initial migrate the table may not exist yet.
        pass

    return {
        "site": defaults,
        "MAPBOX_TOKEN": settings.MAPBOX_TOKEN,
        "GOOGLE_MAPS_API_KEY": settings.GOOGLE_MAPS_API_KEY,
        "RAZORPAY_KEY_ID": settings.RAZORPAY_KEY_ID,
    }
