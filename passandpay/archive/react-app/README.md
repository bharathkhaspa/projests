# Pass & Pay 🚛

> **Book a truck. Move anything. Pay simply.**

A production-quality, fully responsive web app for an online truck-booking &
goods-transport platform (inspired by the WheelsEye model). It connects
**shippers** with **truck owners/drivers**, supports **full-truck-load** and
**part-load (truck sharing)** bookings, live GPS-style tracking, transparent
fare estimates, payments, and an admin console.

The app runs **entirely on seeded mock data** — no API keys or backend
required — so it's fully demonstrable the moment you start it, and deploys to
Vercel/Netlify with zero configuration.

---

## ✨ Features

- **Marketing site** — landing page with an instant-quote widget, How It Works,
  Services & pricing, About, Contact.
- **Role-based auth** — sign up as a **Shipper** or **Transporter**; Admin via a
  protected route. One-click demo accounts on the login screen.
- **Shipper app** — dashboard, multi-step booking flow (full or shared load),
  my bookings, live tracking with status timeline, payments + downloadable GST
  invoices, profile & KYC.
- **Transporter app** — dashboard, browse & accept available loads, manage
  trucks, update active-trip status, earnings with charts.
- **Admin** — KPI dashboard with revenue/booking charts, KYC verification queue
  (approve/reject users & trucks), all bookings, all users.
- **Part-load sharing** — shareable loads on the same route/date are grouped
  into one truck; fare is **split proportionally by weight** with a sharing
  discount. (See [`src/lib/fare.ts`](src/lib/fare.ts).)
- **Fully responsive** — mobile-first, hamburger nav + bottom tab bar on mobile,
  sidebar on desktop. Tested 360px → 1440px+.
- **Polished UX** — branded SVG logo, status badges, loading-friendly empty
  states, toasts, accessible focus states, smooth animations.

---

## 🧱 Tech Stack

| Concern    | Choice |
|------------|--------|
| Framework  | React 18 + Vite + TypeScript |
| Styling    | Tailwind CSS (custom brand theme) |
| Routing    | React Router v6 |
| State      | Zustand (persisted to `localStorage`) |
| Data       | React Query (client cache) over a mock store |
| Charts     | Recharts |
| Icons      | Lucide |
| Toasts     | react-hot-toast |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev          # → http://localhost:5173

# 3. Type-check + production build
npm run build

# 4. Preview the production build
npm run preview
```

### Demo accounts

Use the one-click buttons on the **Login** page, or these emails (no password
needed in demo mode):

| Role         | Email                         |
|--------------|-------------------------------|
| Shipper      | `shipper@passandpay.in`       |
| Transporter  | `transporter@passandpay.in`   |
| Admin        | `admin@passandpay.in`         |

You can also **sign up** as a new shipper or transporter.

> All data is seeded and stored in your browser's `localStorage`. To reset to
> the original demo data, clear site data or call `useStore.getState().resetData()`
> from the console.

---

## 🔑 Environment Variables

The app needs **no environment variables to run**. The optional integrations
below degrade gracefully (static map, mock checkout) when keys are absent.
Copy [`.env.example`](.env.example) to `.env` to configure them:

| Variable | Purpose |
|----------|---------|
| `VITE_MAPBOX_TOKEN` / `VITE_GOOGLE_MAPS_API_KEY` | Swap the static route map for an interactive one |
| `VITE_RAZORPAY_KEY_ID` / `VITE_STRIPE_PUBLISHABLE_KEY` | Real (test-mode) payment checkout |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Replace the mock store with a real backend |

---

## ☁️ Deployment

The output is a static SPA — deploy the `dist/` folder anywhere.

### Vercel
- Import the repo → framework preset **Vite** → deploy.
- SPA routing is handled by [`vercel.json`](vercel.json).

### Netlify
- Build command `npm run build`, publish directory `dist`.
- SPA routing is handled by [`public/_redirects`](public/_redirects).

---

## 📁 Project Structure

```
src/
├── components/
│   ├── app/            # Authenticated-app layout, nav, cards, timeline
│   ├── public/         # Navbar, footer, quote widget, public layout
│   └── ui/             # Reusable primitives (Button styles, badges, modal…)
├── lib/                # Types, mock seed data, fare engine, cities/geo, utils
├── pages/
│   ├── public/         # Home, How It Works, Services, About, Contact, 404
│   ├── auth/           # Login, Signup
│   ├── shipper/        # Dashboard, booking, bookings, tracking, payments, profile
│   ├── transporter/    # Dashboard, loads, trips, trucks, earnings, profile
│   └── admin/          # Dashboard, verification, bookings, users
├── store/              # Zustand store = the mock backend (auth + all mutations)
├── App.tsx             # Routes
└── main.tsx            # Entry
```

## 🔄 Swapping in a Real Backend

The entire data layer lives behind [`src/store/useStore.ts`](src/store/useStore.ts).
Every screen reads/writes through its actions (`login`, `createBooking`,
`acceptLoad`, `advanceStatus`, `setUserKyc`, …). To go live, re-implement those
actions against Supabase/your REST API — no UI changes required.

---

## 🖼️ Imagery & Licensing

All photography is sourced from **Unsplash** (free for commercial use) via
hotlinked, optimised URLs with descriptive `alt` text. The logo and route map
are inline SVG. No third-party brand assets are used.

---

© Pass & Pay. Built as a demonstration project.
