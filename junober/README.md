# Junober — E-Commerce Store with Real-Time 3D Product Customizer

A custom apparel storefront where shoppers can customize garments on a **real-time 3D model** (colors, prints, text) before ordering. Full product catalog with filters, cart, orders, and a production/shipping pipeline on the backend.

## Stack

- **Frontend**: React 19 + TypeScript + Vite, Three.js via `@react-three/fiber` + `drei` for the 3D customizer, Zustand for state, TanStack Query + Axios for data, React Router.
- **Backend**: Django 5 + Django REST Framework, JWT auth (simplejwt), drf-spectacular (OpenAPI schema in `backend/schema.yml`), PostgreSQL (psycopg2) with SQLite for local dev.
- **Backend apps**: `accounts`, `catalog`, `customizer`, `orders`, `pricing`, `production`, `shipping`, `marketing`.

## Run locally

### Backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env                            # fill in your values
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env                            # point it at the backend URL
npm run dev
```

## Repo notes

- `frontend/public/models/` holds the 3D garment models (GLB). The raw `test_tshirt.glb` (~124 MB) is excluded from the repo due to GitHub's file-size limit — the optimized version `test_tshirt_optimized.glb` is included and is what the app uses.
- `branding/` contains the Junober logos and sample product imagery; `designs/` holds the original design references.
- Secrets are not committed — use the `.env.example` files.
