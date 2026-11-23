# The Cottage by Tribhog: website

Website and booking system for The Cottage Restaurant & Tribhog Sweets, Sultanpur Road, Lucknow.
It runs entirely on **Cloudflare Workers**: the React site as static files, the API as a Worker, and the data in a **D1** database.

```
The Cottage Restaurant/
├── wrangler.jsonc   Cloudflare config: Worker name, website folder, database, rate limits
├── package.json     root scripts: build, dev, deploy
├── frontend/        React website (Vite): every page, style, photo and font
│   ├── public/images/   restaurant photos (from the Google Maps listing)
│   ├── public/_headers  security and caching headers for the website
│   └── src/
│       ├── components/  page sections: Hero, Story, Counters, Menu, Spaces, Reviews, Booking, Visit, Footer
│       ├── pages/       Home.jsx (website) and Admin.jsx (staff panel at /admin)
│       ├── data/site.js phone, address, hours, reviews, photos: edit facts here
│       └── styles/      global.css (colours and fonts), home.css, admin.css
└── backend/         Cloudflare Worker API
    └── src/
        ├── index.js       sends /api/* to the API, everything else to the website
        ├── routes/        public.js (menu, bookings, messages), admin.js (staff panel)
        ├── db.js          database tables (created automatically) and starter menu
        ├── validation.js  form checks
        └── auth.js        staff login and session tokens
```

## What the backend does

| Feature | How it works |
|---|---|
| Table bookings | Guests pick date, time and party size. Saved as **New** until you call them and mark **Confirmed**. |
| Messages | Cake orders, sweets and hamper enquiries, party bookings and feedback. |
| Menu | Shown on the website. Edit dishes, prices and "house favourite" in the staff panel. |
| Staff panel | `/admin` on the website, protected by the `ADMIN_PASSWORD` secret. |
| Protection | Form checks, spam honeypot, Cloudflare rate limits, signed login tokens, security headers. |

## Cloudflare settings (one time)

In the Cloudflare dashboard → **Workers & Pages → the-cottage-restaurant → Settings**:

**Build** (connected to this GitHub repo):

| Setting | Value |
|---|---|
| Root directory | `/` (leave empty) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

**Variables and Secrets** → add two **Secrets**:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | your staff panel password (10+ characters) |
| `JWT_SECRET` | any long random string (24+ characters) |

The D1 database `the-cottage-db` is created automatically on the first deploy, and its tables are created on the first visit. No manual setup is needed.

Every push to `main` on GitHub then rebuilds and redeploys the site.

## Run it on your computer

You need **Node.js 22 or newer** (`node -v` to check).

**First time only:**

```powershell
npm install
npm --prefix frontend install
copy .dev.vars.example .dev.vars
```

Then open `.dev.vars` and set `ADMIN_PASSWORD` and `JWT_SECRET`.

**Run everything like Cloudflare does** (site + API on one address):

```powershell
npm run dev:api
```

Open http://localhost:8787. This uses a local copy of the database, so test bookings never reach the live site.

**While editing the design** (instant reload): keep `npm run dev:api` running and, in a second terminal:

```powershell
npm run dev:web
```

Open http://localhost:5173. API calls are forwarded to port 8787.

## Before launch: things only you can fill in

- **Menu:** the 15 starter dishes are examples with no prices. Edit or delete them in `/admin → Menu`.
- **Facts:** check phone, hours and address in `frontend/src/data/site.js`.
- **Email alerts** for new bookings are not set up yet (Cloudflare Email Service can add them later).
