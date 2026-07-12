# Pass & Pay 🚛 (Django)

> **Book a truck. Move anything. Pay simply.**

A production-quality, fully responsive **Django** truck-booking & goods-transport
platform (inspired by the WheelsEye model). It connects **shippers** with
**truck owners/drivers**, supports **full-load** and **part-load (truck sharing)**
bookings, dynamic **India-wide pickup/drop autocomplete**, live GPS-style
tracking, payments, and a powerful **content-managed admin panel**.

Runs out of the box on **SQLite + seeded demo data** (no API keys needed) and
deploys to PostgreSQL with one env var.

---

## ✨ Highlights

- **Dynamic India-wide locations** — pickup & drop are type-ahead autocomplete
  over a `Location` dataset (city / town / district / **PIN code**), served by
  `GET /api/locations/search`. Ships with a representative seed covering every
  state & UT; drop in the full ~155k-row India Post dataset and it scales (see
  [Loading the full PIN dataset](#loading-the-full-india-pin-dataset)).
- **Content-managed admin (django-unfold)** — a clean, grouped, searchable admin
  where a **non-technical team** manages **banners, ads, offer posters, editable
  site-content blocks, testimonials, FAQs**, plus all operations (users, KYC,
  trucks, bookings, payments). Everything marketing on the public site is
  rendered **dynamically from the database**. Includes a **stats dashboard**.
- **Role-based accounts** — custom user model with `shipper` / `transporter` /
  `admin` roles, role-aware redirects and access control.
- **Booking flow** — multi-step booking with autocomplete, live fare estimate
  (base + distance × per-km + GST, long-haul surcharge), and **full vs shared**.
- **Part-load sharing** — shareable loads on the same route/date join one
  `SharedBookingGroup`; fare is **split proportionally by weight**.
- **Live tracking** — route map + status timeline (`TrackingEvent`s) from
  pickup → delivery, advanced by the transporter.
- **Payments & invoices** — mock Razorpay-style checkout, printable GST invoice.
- **Fully responsive** — Bootstrap 5, mobile bottom-tab bar, desktop sidebar.

---

## 🧱 Tech stack

Django 5 · PostgreSQL (SQLite fallback) · django-unfold admin · Bootstrap 5 ·
HTMX · WhiteNoise · Gunicorn. Apps: `accounts`, `locations`, `trucks`,
`content`, `bookings`, `payments`.

---

## 🚀 Quick start

```bash
# 1. Create & activate a virtualenv, then install deps
python -m venv .venv
.venv\Scripts\activate            # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt

# 2. (Optional) configure environment
copy .env.example .env            # cp on macOS/Linux — not required for SQLite

# 3. Migrate + seed demo data (locations, users, trucks, CMS content, bookings)
python manage.py migrate
python manage.py seed_demo

# 4. Run
python manage.py runserver
```

Open <http://localhost:8000>. Admin panel at <http://localhost:8000/admin>.

### Demo accounts (password `demo12345`)

| Role         | Email                       |
|--------------|-----------------------------|
| Shipper      | `shipper@passandpay.in`     |
| Transporter  | `transporter@passandpay.in` |
| Admin        | `admin@passandpay.in`       |

The login page also has one-click demo buttons. `seed_demo` makes the admin a
superuser, so it opens the full Unfold admin.

---

## 🗺️ Loading the full India PIN dataset

The bundled `data/india_locations_seed.csv` covers every state/UT with major
cities & PINs so autocomplete works immediately. To load the **complete**
directory, download the free Govt. of India dataset and run the loader:

```bash
# Source: https://www.data.gov.in/resource/all-india-pincode-directory
python manage.py load_locations data/india_pincodes.csv --truncate
```

The loader is **header-flexible** — it understands both the seed file's columns
and the India Post columns (`OfficeName, Pincode, District, StateName,
Latitude, Longitude`). The indexed `search_text` column keeps autocomplete fast
at full scale.

---

## 🛠️ Admin panel (content management)

Log in as admin and use the grouped sidebar:

- **Site content** — Hero banners (carousel), Advertisements (by placement
  slot + active dates), Offer posters, **Site content blocks** (key→value text
  like `hero_title`, `about_text`, `contact_email` — edited here, live on the
  site), Testimonials, FAQs, Contact messages.
- **Operations** — Bookings, Shared truck groups, Payments, Invoices, Ratings.
- **Fleet & locations** — Truck types, Trucks, Locations, States.
- **People & access** — Users (with KYC verify/reject actions) and
  **Groups** (a `Content Team` and an `Operations` group are seeded with scoped
  permissions for easy role-based access).

> Rule honoured: every ad/poster/banner/text/image on the public site is
> editable from the admin and rendered dynamically from the database.

---

## ☁️ Deployment (Render / Railway / Heroku / Docker)

1. Set env vars from `.env.example` (`SECRET_KEY`, `DEBUG=False`,
   `ALLOWED_HOSTS`, `DATABASE_URL` for PostgreSQL).
2. Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
3. Release: `python manage.py migrate` (and `seed_demo` once, optionally).
4. Start: `gunicorn passandpay.wsgi` (see `Procfile`). Static files are served
   by WhiteNoise; uploaded media should use S3/Cloudinary in production.

---

## 📁 Structure

```
passandpay/        project settings, urls, unfold config, admin dashboard
accounts/          custom User, profiles, auth (login/signup/role redirect)
locations/         State/District/Location, search API, load_locations command
trucks/            TruckType, Truck
content/           Banner/Advertisement/OfferPoster/SiteContent/Testimonial/FAQ/
                   ContactMessage + public site views + template tags
bookings/          Booking/SharedBookingGroup/TrackingEvent, fare engine, flows
payments/          Payment/Invoice/Rating, mock checkout
templates/         Bootstrap 5 templates (public, accounts, shipper, transporter)
data/              india_locations_seed.csv
archive/react-app/ the previous React prototype (kept for reference)
```

All imagery is license-free (Unsplash, hotlinked & optimised); the logo and
route map are inline SVG. No third-party brand assets are used.
