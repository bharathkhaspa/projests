"""
Import India-wide locations (towns/cities + PIN codes) from a CSV file.

Usage:
    python manage.py load_locations data/india_locations_seed.csv
    python manage.py load_locations data/india_pincodes.csv --truncate

The loader is header-flexible: it accepts the columns of the bundled seed file
as well as the public India Post / data.gov.in PIN-code dataset
(OfficeName, Pincode, District, StateName, Latitude, Longitude). Drop the full
~155k-row dataset in and run the same command — the autocomplete scales.

Full dataset (free, Govt. of India):
    https://www.data.gov.in/resource/all-india-pincode-directory
"""

import csv

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from locations.models import District, Location, State

# Map many possible CSV header names → our canonical fields.
HEADER_ALIASES = {
    "name": {"name", "officename", "office_name", "place", "village", "locality"},
    "city": {"city", "taluk", "block", "town"},
    "district": {"district", "districtname"},
    "state": {"state", "statename", "state_name", "circlename"},
    "pincode": {"pincode", "pin", "pin_code", "postal_code"},
    "latitude": {"latitude", "lat"},
    "longitude": {"longitude", "lng", "long", "lon"},
}


def build_header_map(fieldnames):
    lookup = {}
    lowered = {fn.lower().strip(): fn for fn in fieldnames}
    for canonical, aliases in HEADER_ALIASES.items():
        for alias in aliases:
            if alias in lowered:
                lookup[canonical] = lowered[alias]
                break
    return lookup


class Command(BaseCommand):
    help = "Load India-wide location/PIN-code data from a CSV file."

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str, help="Path to the locations CSV")
        parser.add_argument("--truncate", action="store_true", help="Delete existing locations first")

    def handle(self, *args, **options):
        path = options["csv_path"]
        try:
            fh = open(path, newline="", encoding="utf-8-sig")
        except OSError as exc:
            raise CommandError(f"Cannot open {path}: {exc}")

        with fh:
            reader = csv.DictReader(fh)
            if not reader.fieldnames:
                raise CommandError("CSV has no header row.")
            hmap = build_header_map(reader.fieldnames)
            missing = {"name", "state", "latitude", "longitude"} - set(hmap)
            if missing:
                raise CommandError(
                    f"CSV missing required column(s): {', '.join(sorted(missing))}. "
                    f"Found headers: {reader.fieldnames}"
                )

            if options["truncate"]:
                Location.objects.all().delete()
                self.stdout.write(self.style.WARNING("Existing locations cleared."))

            state_cache: dict[str, State] = {}
            district_cache: dict[tuple[str, str], District] = {}
            created = 0
            skipped = 0
            batch = []

            def get(row, key):
                col = hmap.get(key)
                return (row.get(col) or "").strip() if col else ""

            with transaction.atomic():
                for row in reader:
                    name = get(row, "name")
                    state_name = get(row, "state")
                    lat_raw = get(row, "latitude")
                    lng_raw = get(row, "longitude")
                    if not (name and state_name and lat_raw and lng_raw):
                        skipped += 1
                        continue
                    try:
                        lat = float(lat_raw)
                        lng = float(lng_raw)
                    except ValueError:
                        skipped += 1
                        continue

                    state = state_cache.get(state_name)
                    if state is None:
                        state, _ = State.objects.get_or_create(name=state_name.title())
                        state_cache[state_name] = state

                    district = None
                    district_name = get(row, "district")
                    if district_name:
                        ckey = (state_name, district_name)
                        district = district_cache.get(ckey)
                        if district is None:
                            district, _ = District.objects.get_or_create(
                                state=state, name=district_name.title()
                            )
                            district_cache[ckey] = district

                    city = get(row, "city")
                    pincode = get(row, "pincode")[:6]
                    loc = Location(
                        name=name.title(),
                        city=city.title(),
                        district=district,
                        state=state,
                        pincode=pincode,
                        latitude=lat,
                        longitude=lng,
                    )
                    loc.search_text = " ".join(
                        b for b in [name, city, pincode, district_name, state_name] if b
                    ).lower()
                    batch.append(loc)
                    created += 1
                    if len(batch) >= 2000:
                        Location.objects.bulk_create(batch, ignore_conflicts=True)
                        batch = []

                if batch:
                    Location.objects.bulk_create(batch, ignore_conflicts=True)

        self.stdout.write(
            self.style.SUCCESS(
                f"Loaded {created} locations across {State.objects.count()} states "
                f"({skipped} rows skipped)."
            )
        )
