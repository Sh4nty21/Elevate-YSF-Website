# Deployment Guide (Beginner-Friendly)

This project has two independent halves:

- **`frontend/`** — plain static files (HTML/CSS/JS). No build step, no Node.js required.
- **`backend/`** — PHP + MySQL. Needs a server that runs PHP and gives you a MySQL database.

You can host them **together on one traditional host** (simplest) or **split
across two free services** (frontend on a static host, backend on a PHP host).
Hosting provider names are intentionally left blank — pick whichever you like
and follow the generic steps below; they apply to virtually every host.

---

## Part 1 — Test it on your own computer first

1. Install a local PHP + MySQL stack — **XAMPP** or **Laragon** are the
   easiest for beginners (both free).
2. Start XAMPP/Laragon, turn on **Apache** and **MySQL**.
3. Copy the entire `YSF-Website` folder into your server's web root:
   - XAMPP: `C:\xampp\htdocs\YSF-Website`
   - Laragon: `C:\laragon\www\YSF-Website`
4. Open **phpMyAdmin** (usually `http://localhost/phpmyadmin`):
   - Click **Import** → choose `database/schema.sql` → **Go**.
   - This creates the `ysf_db` database, all tables, and sample data.
5. Open `backend/config.php` in a text editor. The defaults
   (`localhost` / `ysf_db` / `root` / empty password) already match
   XAMPP/Laragon, so you likely don't need to change anything locally.
6. Visit `http://localhost/YSF-Website/frontend/index.html` in your browser.
7. Try logging in with the sample account:
   - **Username:** `johndoe`
   - **Password:** `password123`
8. Try the **Pre-Check In** button on the dashboard — pick a sport and confirm.

If login/signup/pre-check-in all work locally, you're ready to go live.

---

## Part 2 — Choose a hosting approach

### Option A: One host for everything (recommended if you're new to this)

Look for a host that gives you: PHP support, a MySQL database, and a way to
upload files (FTP or a file manager). Many hosts offer a free tier for small
projects like this one. Whichever you pick, the steps are the same:

1. **Create the MySQL database** through the host's control panel (often
   called "MySQL Databases" or similar). Note down the database name,
   username, and password it gives you — hosts almost never let you keep
   `root`/empty password like local XAMPP does.
2. **Import the schema**: open **phpMyAdmin** (most hosts include it),
   select your new database, click **Import**, choose `database/schema.sql`.
3. **Upload the files**: upload the *entire* `YSF-Website` folder to your
   hosting account, usually into `public_html/` (via FTP client like
   FileZilla, or the host's file manager).
4. **Edit `backend/config.php`** with the real values your host gave you:
   ```php
   define('DB_HOST', getenv('YSF_DB_HOST') ?: 'localhost');   // often stays 'localhost'
   define('DB_NAME', getenv('YSF_DB_NAME') ?: 'yourcpaneluser_ysf_db');
   define('DB_USER', getenv('YSF_DB_USER') ?: 'yourcpaneluser_dbuser');
   define('DB_PASS', getenv('YSF_DB_PASS') ?: 'the-password-you-set');
   ```
   (If your host lets you set real environment variables instead of editing
   the file, that's more secure — the `getenv()` calls already support it.)
5. **Visit your domain**, e.g. `https://yourdomain.example/frontend/index.html`
   (or move everything inside `frontend/` up one level so it loads at your
   domain's root — either works).
6. Since frontend and backend now share the same domain, you do **not** need
   to touch `FRONTEND_ORIGIN` or `window.YSF_API_BASE` — same-origin requests
   just work.

### Option B: Frontend and backend on two different free services

Use this if your preferred static host (great for speed/CDN) doesn't run PHP.

1. Deploy `backend/` (+ `database/schema.sql` imported into that host's MySQL)
   to any host that supports PHP + MySQL, following steps 1–4 from Option A.
   You'll get a backend URL, e.g. `https://your-backend-host.example`.
2. In `backend/config.php`, set:
   ```php
   define('FRONTEND_ORIGIN', getenv('YSF_FRONTEND_ORIGIN') ?: 'https://your-frontend-host.example');
   ```
3. Deploy the `frontend/` folder to your static host of choice (drag-and-drop
   folder upload, or connect a Git repo — depends on the host).
4. In `frontend/index.html`, uncomment and fill in this line **before** the
   Vue scripts load:
   ```html
   <script>
     window.YSF_API_BASE = 'https://your-backend-host.example/backend';
   </script>
   ```
5. **Important**: cross-domain login cookies require **HTTPS on both sides**.
   Almost every free host provides free HTTPS automatically — just make sure
   both URLs start with `https://`, not `http://`.

---

## Part 3 — Set up the Saturday reminder (cron job)

`backend/send_reminders.php` emails everyone who pre-checked in for the
upcoming Saturday. To have it run automatically:

1. Open `backend/config.php` and change:
   ```php
   define('CRON_SECRET', getenv('YSF_CRON_SECRET') ?: 'change-me-to-a-random-string');
   ```
   to your own random string (this stops strangers from triggering it).
2. Your hosting control panel may have a **"Cron Jobs"** section — many PHP
   hosts include this for free. If yours doesn't, a free external
   scheduler that just visits a URL on a timer works too.
3. Schedule it to run every **Friday** (so members get reminded the day
   before), hitting this URL:
   ```
   https://yourdomain.example/backend/send_reminders.php?key=YOUR_CRON_SECRET
   ```
4. Note: many free hosts **disable PHP's built-in `mail()` function** to
   fight spam. If reminder emails don't arrive, open
   `backend/send_reminders.php` and swap the `mail()` call for a free-tier
   transactional email API (SendGrid, Mailgun, Brevo, and Resend all have
   free tiers) — the `MAIL_API_KEY` placeholder in `config.php` is ready
   for that key once you pick one.

Even without email working, the **in-app countdown banner** on the homepage
and dashboard (in `frontend/js/schedule.js`) always shows the correct
countdown to the next Saturday 1–5 PM session with zero setup — that's the
reminder members will see most often.

---

## Part 4 — Before you tell people to sign up

- [ ] Change `DB_USER`/`DB_PASS` in `backend/config.php` to your real host
      credentials (never leave `root`/blank in production).
- [ ] Change `CRON_SECRET` to a real random string.
- [ ] Confirm your domain loads over `https://` (not `http://`) — most hosts
      auto-provision a free SSL certificate; check your host's dashboard.
- [ ] Log in as `johndoe` / `password123` once on the live site, then either
      delete that sample account or change its password from phpMyAdmin.
- [ ] Adjust sport capacities any time in phpMyAdmin:
      `UPDATE sports SET capacity = 40 WHERE sport_name = 'Volleyball';`
      — no code changes needed.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Can't reach the server" toast on login | `window.YSF_API_BASE` (or same-origin path) doesn't point at your backend, or the backend host is down |
| "Database connection failed" | Wrong values in `backend/config.php` — double check with your host's control panel |
| Login works but immediately logs you out | Cross-domain setup without HTTPS on both sides — see Option B, step 5 |
| "Your session expired" on every submit | Browser is blocking third-party cookies for a cross-domain setup — prefer Option A (same domain) if this keeps happening |
| Reminder emails never arrive | Host disabled `mail()` — switch to an email API as described in Part 3 |
