# The Cottage by Tribhog: website

Website and booking system for The Cottage Restaurant & Tribhog Sweets, Sultanpur Road, Lucknow.

```
The Cottage Restaurant/
├── frontend/        React website (Vite): every page, style, photo and font
│   ├── public/images/   restaurant photos (from the Google Maps listing)
│   └── src/
│       ├── components/  page sections: Hero, Story, Counters, Menu, Spaces, Reviews, Booking, Visit, Footer
│       ├── pages/       Home.jsx (website) and Admin.jsx (staff panel at /admin)
│       ├── data/site.js phone, address, hours, reviews, photos: edit facts here
│       └── styles/      global.css (colours and fonts), home.css, admin.css
├── backend/         Node.js + Express API with a SQLite database
│   ├── src/routes/      public.js (menu, bookings, messages), admin.js (staff panel)
│   ├── .env             your private settings (not shared; see .env.example)
│   └── data/            the database file (created on first run)
└── _old-version/    the earlier single-page site, kept for reference
```

## What the backend does

| Feature | How it works |
|---|---|
| Table bookings | Guests pick date, time and party size. Saved as **New** until you call them and mark **Confirmed**. |
| Messages | Cake orders, sweets and hamper enquiries, party bookings and feedback. |
| Menu | Shown on the website. Edit dishes, prices and "house favourite" in the admin panel. |
| Admin panel | `/admin` on the website, protected by the password in `backend/.env`. |
| Email alerts | Optional: an email for every new booking or message (fill the SMTP lines in `backend/.env`). |
| Protection | Input checking, spam honeypot, rate limits, secure headers. |

## Run it on your computer

You need **Node.js 22.5 or newer** (`node -v` to check).

**First time only:**

```powershell
cd backend
npm install
copy .env.example .env
```

Then open `backend/.env` and set `ADMIN_PASSWORD` and `JWT_SECRET` (instructions are inside the file).

```powershell
cd ..\frontend
npm install
```

**Every time:** open two terminals.

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Open http://localhost:5173 for the website and http://localhost:5173/admin for the staff panel.

## Put it online

1. Build the website: `cd frontend` then `npm run build` (creates `frontend/dist`).
2. On the server, run `cd backend`, `npm install`, then `npm start`. The backend serves the built website **and** the API together on one port (5050 by default).
3. Set `NODE_ENV=production`, your real `FRONTEND_ORIGIN` (your domain), and a strong `ADMIN_PASSWORD` and `JWT_SECRET` in the server's `.env`.
4. Hosts that run Node apps (Render, Railway, a VPS, Hostinger VPS) work. The database is a single file in `backend/data/`: back it up.

## Before launch: things only you can fill in

- **Menu:** the 15 starter dishes are examples with no prices. Edit or delete them in `/admin → Menu`.
- **Email alerts:** add SMTP details in `backend/.env` if you want an email for each booking.
- **Facts:** check phone, hours and address in `frontend/src/data/site.js`.
