from django.http import JsonResponse
from django.db.models import Q

from .models import Location


def search(request):
    """
    Type-ahead location search across all of India.

    GET /api/locations/search?q=<text>  → up to 10 matches by name, city,
    district, state or PIN code. Backed by the indexed `search_text` column so
    it stays fast on the full ~155k-row PIN dataset.
    """
    q = (request.GET.get("q") or "").strip().lower()
    results = []
    if len(q) >= 2:
        qs = Location.objects.select_related("state", "district")
        if q.isdigit():
            qs = qs.filter(pincode__startswith=q)
        else:
            cond = Q()
            for term in q.split():
                cond &= Q(search_text__contains=term)
            qs = qs.filter(cond)
        for loc in qs[:10]:
            results.append(
                {
                    "id": loc.id,
                    "label": loc.label,
                    "short": loc.short_label,
                    "lat": loc.latitude,
                    "lng": loc.longitude,
                }
            )
    return JsonResponse({"results": results})
