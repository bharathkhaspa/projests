"""Fare estimation, distance and part-load fare-splitting logic."""

import math
from dataclasses import dataclass, asdict

GST_RATE = 0.05  # 5% GST on transport of goods
SHARING_DISCOUNT = 0.85  # shared loads are 15% cheaper than the pro-rata full fare


def haversine_km(lat1, lng1, lat2, lng2) -> float:
    """Great-circle distance in km between two lat/lng points."""
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(a))


def road_distance_km(origin, destination) -> int:
    """Road distance estimate — great-circle scaled by a 1.25 detour factor."""
    km = haversine_km(origin.latitude, origin.longitude, destination.latitude, destination.longitude)
    return max(1, round(km * 1.25))


@dataclass
class Fare:
    base: int
    distance: int
    distance_km: int
    per_km_rate: int
    surcharge: int
    surcharge_label: str
    gst: int
    total: int
    share_pct: float = 1.0

    def as_dict(self):
        return asdict(self)


def compute_full_fare(truck_type, distance_km: int) -> Fare:
    base = int(truck_type.base_fare)
    per_km = int(truck_type.per_km_rate)
    distance_cost = round(distance_km * per_km)

    surcharge_pct = 0.0
    surcharge_label = ""
    if distance_km > 800:
        surcharge_pct = 0.08
        surcharge_label = "Long-haul surcharge (8%)"

    pre = base + distance_cost
    surcharge = round(pre * surcharge_pct)
    subtotal = pre + surcharge
    gst = round(subtotal * GST_RATE)
    return Fare(
        base=base,
        distance=distance_cost,
        distance_km=distance_km,
        per_km_rate=per_km,
        surcharge=surcharge,
        surcharge_label=surcharge_label if surcharge else "",
        gst=gst,
        total=subtotal + gst,
        share_pct=1.0,
    )


def compute_shared_fare(truck_type, distance_km: int, weight_tons: float) -> Fare:
    """
    Part-load fare: take the full-truck fare for the route and bill this shipper
    for the proportion of the truck their weight occupies, with a sharing
    discount. A 1-ton load on a 4-ton truck pays ~1/4 of the full fare (× 0.85).
    """
    full = compute_full_fare(truck_type, distance_km)
    capacity = float(truck_type.capacity_tons) or 1.0
    share_pct = min(max(weight_tons / capacity, 0.1), 1.0)

    base = round(full.base * share_pct * SHARING_DISCOUNT)
    distance_cost = round(full.distance * share_pct * SHARING_DISCOUNT)
    surcharge = round(full.surcharge * share_pct * SHARING_DISCOUNT)
    subtotal = base + distance_cost + surcharge
    gst = round(subtotal * GST_RATE)
    return Fare(
        base=base,
        distance=distance_cost,
        distance_km=distance_km,
        per_km_rate=full.per_km_rate,
        surcharge=surcharge,
        surcharge_label="Shared route surcharge" if surcharge else "",
        gst=gst,
        total=subtotal + gst,
        share_pct=round(share_pct, 3),
    )


def estimate_fare(truck_type, distance_km: int, weight_tons: float, mode: str) -> Fare:
    if mode == "shared":
        return compute_shared_fare(truck_type, distance_km, weight_tons)
    return compute_full_fare(truck_type, distance_km)
