from django import template

from content.models import Advertisement

register = template.Library()


@register.simple_tag
def ads_for(slot):
    """Return live advertisements for a placement slot (e.g. 'home_top')."""
    return Advertisement.objects.live().filter(slot=slot)


@register.filter
def inr(value):
    """Format a number as Indian Rupees: 125000 → ₹1,25,000."""
    try:
        value = int(round(float(value)))
    except (TypeError, ValueError):
        return value
    s = str(abs(value))
    if len(s) > 3:
        last3 = s[-3:]
        rest = s[:-3]
        parts = []
        while len(rest) > 2:
            parts.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            parts.insert(0, rest)
        s = ",".join(parts) + "," + last3
    sign = "-" if value < 0 else ""
    return f"₹{sign}{s}"


@register.filter
def stars(value):
    """Render a 0–5 rating as filled/empty star characters."""
    try:
        n = int(round(float(value)))
    except (TypeError, ValueError):
        n = 0
    n = max(0, min(5, n))
    return "★" * n + "☆" * (5 - n)
