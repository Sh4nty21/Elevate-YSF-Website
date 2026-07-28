# Elevate YSF — Website

A youth sports ministry website: public landing page, secure sign up / login,
and a member dashboard with **pre-check-in** (with per-sport Saturday capacity
limits) and a schedule reminder for the weekly session.

**➡️ New to launching a website? Start with [`DEPLOYMENT.md`](./DEPLOYMENT.md)
— it walks through local testing and going live, step by step.**

## What changed from the old version

- **Design**: fully rebuilt around the new "Elevate YSF" logo — black, white,
  and the logo's marker-stroke red, condensed sporty display type, and a
  dashed "court line" motif used as a signature divider. All original
  wording/content was kept; only visuals, structure, and code were rebuilt.
- **Frontend**: rebuilt in **Vue 3** (single-page app, hash-based routing) —
  no build step required, so it can be dropped onto any static host as-is.
  Fully responsive down to small phones.
- **Backend**: **PHP + MySQL**, rebuilt with CSRF protection, brute-force
  login lockouts, session-fixation prevention, prepared statements
  everywhere, and security headers.
- **Pre-check-in capacity limits** (as requested):
  - Basketball: **50** max per Saturday
  - Volleyball: **36** max per Saturday (change any time)
  - Badminton: **36** max per Saturday (change any time)
  - Capacity is enforced with a database row lock, so two people
    grabbing the "last spot" at the same instant can't both get in —
    whoever loses gets a clear "this sport is full" alert.
- **Saturday 1–5 PM reminder** is the centerpiece of both the homepage and
  the dashboard: a live countdown banner, plus an optional cron-triggered
  email reminder script (`backend/send_reminders.php`).

## Project structure

```
YSF-Website/
├── frontend/                 Vue 3 single-page app (static files only)
│   ├── index.html             Entry point — loads Vue + Vue Router from CDN
│   ├── css/                   theme.css (design tokens) + layout.css
│   ├── js/
│   │   ├── app.js              Router + app shell
│   │   ├── api.js               fetch() wrapper, one place to set backend URL
│   │   ├── store.js             tiny shared auth/toast state
│   │   ├── schedule.js          Saturday 1-5PM math (countdown, session date)
│   │   └── components/          Home, Login, Signup, Dashboard, etc.
│   └── img/                    logo, gallery photos, default avatars
├── backend/                  PHP API (deploy on any PHP+MySQL host)
│   ├── config.php              ⚠️ EDIT THIS: DB credentials, mail, CORS
│   ├── register.php / login.php / logout.php / session_check.php
│   ├── dashboard_data.php / sports_status.php / pre_checkin.php
│   └── send_reminders.php      cron-triggered Saturday email reminders
└── database/
    └── schema.sql              MySQL schema + sample data (capacities included)
```

## Placeholders left for you

| Where | What to add |
|---|---|
| `frontend/img/` | More gallery photos, event banners — drop files in and reference them in `Home.js` |
| `Home.js` → Events section | More `<div class="event-card">` blocks, or wire it to a future `backend/events.php` |
| `Dashboard.js` → Announcements card | Wire to a future `backend/announcements.php` instead of the hardcoded list |
| `backend/config.php` | `MAIL_API_KEY` — plug in SendGrid/Mailgun/Brevo/etc. if you want nicer email than PHP's `mail()` |
| `backend/config.php` | `PRE_CHECKIN_URL` — an external form/link, if you ever want to redirect after check-in |
| `index.html` `<head>` | Real favicon, social share image (Open Graph tags) |
| Login/Signup | A CAPTCHA (hCaptcha/reCAPTCHA) can slot into the honeypot spot in `register.php` for extra bot protection if spam becomes an issue |

See `DEPLOYMENT.md` for hosting steps (hosting provider left for you to choose).
