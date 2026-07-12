# Bharath K — Portfolio

A fast, single-page portfolio site. Plain HTML/CSS/JS — no build step, no dependencies.

## Preview locally

Just open `index.html` in a browser, or run a tiny server:

```powershell
cd C:\Users\BHARATH\Projects\portfolio
python -m http.server 8080
# open http://localhost:8080
```

## Before you publish — checklist

1. **Replace placeholder links** — search `index.html` for `data-placeholder` and set real URLs
   (GitHub repos, live demos, LinkedIn, Upwork profile).
2. ~~Add screenshots~~ — done: real screenshots of both apps live in `assets/`.
3. **Deploy your two projects** so the "Live Demo" buttons work:
   - Pass & Pay (Django): free tier on [Render](https://render.com) or [Railway](https://railway.app) — it already has a `Procfile` and WhiteNoise configured.
   - Junober: frontend on [Vercel](https://vercel.com)/[Netlify](https://netlify.com), backend on Render/Railway.
4. **Push both project repos to GitHub** (public) so clients can see your code.

## Deploy this portfolio (free)

### Option A — GitHub Pages (recommended)

```powershell
cd C:\Users\BHARATH\Projects\portfolio
git init
git add .
git commit -m "Portfolio site"
# Create a repo named <your-username>.github.io on GitHub, then:
git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
git push -u origin main
```

Your site goes live at `https://<your-username>.github.io` within a minute.

### Option B — Netlify

Drag the whole folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Done.

### Custom domain (optional, recommended once earning)

Buy `bharathk.dev` or similar (~₹800/yr) and point it at GitHub Pages/Netlify —
it looks far more professional on proposals.

## Freelancing

See [FREELANCING-GUIDE.md](FREELANCING-GUIDE.md) for the step-by-step plan to get your first clients.
