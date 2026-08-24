# HYDRO+ ELITE — cPanel Deployment Guide

Domain: **https://hydrogenwaterbottles.store**  
Frontend: Angular 19 SPA → `public_html/`  
Backend: PHP 8.3 Stateless API → `/home/user/hydro-api` (ABOVE `public_html`)  
DB: MySQL 8.0

---

## Preflight (cPanel)

1. Ensure **PHP 8.3** selected (cPanel → Select PHP Version).
2. Enable extensions: `pdo_mysql`, `curl`, `json`, `mbstring`.
3. Create MySQL Database + User (cPanel → MySQL Databases):
   - DB: `user_hydrogen_store`
   - User: `user_hydro_user` + strong password → Add to DB (ALL PRIVILEGES).
4. Enable **AutoSSL** for `hydrogenwaterbottles.store` and `www`.

---

## Step 1 — Build Frontend Locally

```bash
cd frontend
npm install
npm run build   # production (output: dist/frontend/browser)
```

Upload contents of `dist/frontend/browser/` to `public_html/` via File Manager or FTP.

> **Include** `public/.htaccess` as `public_html/.htaccess`. Without it, refreshing `/product` or `/checkout` will 404.

Verify `public_html/` contains:
```
index.html
.htaccess
main-*.js
styles-*.css
...
```

---

## Step 2 — Deploy Backend ABOVE public_html

Upload the entire `backend/` folder to **`/home/user/hydro-api`** (one level above `public_html`). Via SSH:

```bash
# From local machine, rsync (or use File Manager upload + Extract)
scp -r backend user@hydrogenwaterbottles.store:~/hydro-api
```

Structure on server:

```
/home/user/hydro-api/
  .env.example
  .htaccess          # DENY all (safety if leaked)
  config/
  database/
  public/
    index.php
    .htaccess
  src/
```

Set permissions:

```bash
chmod 750 ~/hydro-api
chmod 600 ~/hydro-api/.env        # after creation
chmod 640 ~/hydro-api/config/*
```

---

## Step 3 — Configure Environment

```bash
cp ~/hydro-api/.env.example ~/hydro-api/.env
nano ~/hydro-api/.env
```

Fill:

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://hydrogenwaterbottles.store
APP_FRONTEND_URL=https://hydrogenwaterbottles.store

DB_HOST=localhost
DB_DATABASE=user_hydrogen_store
DB_USERNAME=user_hydro_user
DB_PASSWORD=YOUR_STRONG_PASSWORD

PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CORS_ALLOWED_ORIGINS=https://hydrogenwaterbottles.store,https://www.hydrogenwaterbottles.store
```

Also update frontend prod key:

```ts
// frontend/src/environments/environment.prod.ts
paystackPublicKey: 'pk_live_xxxxxxxxxxxxxxxxxxxxx'
```
Then rebuild and re-upload frontend.

---

## Step 4 — Import Database

cPanel → phpMyAdmin → select `user_hydrogen_store` → Import:

1. `backend/database/schema.sql`
2. `backend/database/seed.sql`

Or via SSH:

```bash
mysql -u user_hydro_user -p user_hydrogen_store < ~/hydro-api/database/schema.sql
mysql -u user_hydro_user -p user_hydrogen_store < ~/hydro-api/database/seed.sql
```

Test:

```bash
curl https://hydrogenwaterbottles.store/api/health
# → {"status":true,"data":{"status":"ok","db":"connected","paystack_mock":"live"}}
```

---

## Step 5 — Expose API via /api

### Recommended: Symlink

```bash
ln -s ~/hydro-api/public ~/public_html/api
ls -l ~/public_html/api   # should point to hydro-api/public
```

### Alternative: Copy

```bash
mkdir -p ~/public_html/api
cp -r ~/hydro-api/public/* ~/public_html/api/
# Ensure ~/public_html/api/.htaccess exists (Rewrite to index.php)
```

Test:

```bash
curl https://hydrogenwaterbottles.store/api/
curl https://hydrogenwaterbottles.store/api/products
```

---

## Step 6 — Paystack Webhook

Dashboard → Settings → API Keys & Webhooks → Webhook URL:

```
https://hydrogenwaterbottles.store/api/payments/webhook
```

Enable events: `charge.success`.

The API verifies `X-Paystack-Signature` = `HMAC_SHA512(rawBody, PAYSTACK_SECRET_KEY)`.

---

## Troubleshooting

- **404 on refresh** → Ensure `public_html/.htaccess` exists and `mod_rewrite` enabled.
- **CORS error** → Check `CORS_ALLOWED_ORIGINS` matches actual origin (no trailing slash, https).
- **Paystack init fails** → Verify `PAYSTACK_SECRET_KEY` (sk_live vs sk_test) and that server can curl `api.paystack.co` (port 443 outbound not blocked).
- **DB connection failed, API still works** → Intentional. `DB_MOCK_FALLBACK=true` lets the store function with mock data. Set `false` in production to surface DB errors.
- **Logs** → `~/logs/hydro-api-error.log` (configure in `backend/public/.htaccess` or PHP error_log).

---

## Rollback

Keep previous `public_html` as `public_html.bak` before upload. Symlink switch is atomic.

```bash
mv ~/public_html ~/public_html.bak
mkdir ~/public_html && cp -r ~/public_html.bak/* ~/public_html/  # or re-upload
```

Backend is stateless — rollback is just `git checkout` + re-link.
