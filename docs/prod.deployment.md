# H2Os — Production cPanel Deployment (hydrogenwaterbottles.store + api.hydrogenwaterbottles.store)

Stack: **Angular 19 SPA → `public_html/` (hydrogenwaterbottles.store) + PHP 8.3 API → `api.hydrogenwaterbottles.store` (subdomain) + MySQL 8 + Paystack + DeepSeek**

Domains:
- **Frontend:** `https://hydrogenwaterbottles.store` (+ `www`) → `public_html/`
- **Backend API:** `https://api.hydrogenwaterbottles.store` → subdomain document root `~/api.hydrogenwaterbottles.store` (points to `backend/public`)
- **Free shipping** on all orders. Premium luxury.

---

## 1. Preflight — cPanel

1. **PHP 8.3**: cPanel → `Select PHP Version` → `8.3` → enable `pdo_mysql`, `curl`, `mbstring`, `openssl`, `json` → Save. (Do for both main domain and subdomain — cPanel → `MultiPHP Manager` → select `api.hydrogenwaterbottles.store` → 8.3).

2. **MySQL**: cPanel → `MySQL Databases` → Create DB `user_hydrogen_store` + User `user_hydro_user` (strong pass) → Add to DB `ALL PRIVILEGES`.

3. **Subdomain — Create `api`:** cPanel → `Subdomains` → `api` → Domain `hydrogenwaterbottles.store` → Document Root: **Recommended secure:** `~/h2o-api/public` (see step 4) or default `~/api.hydrogenwaterbottles.store` → Create. If cPanel forces `public_html/api`, change Document Root afterwards via `Domains → Manage` or ask host to set custom docroot to `~/h2o-api/public`.

4. **SSL**: `SSL/TLS Status` → `Run AutoSSL` → select `hydrogenwaterbottles.store`, `www`, **and** `api.hydrogenwaterbottles.store` → green.

5. **Node** (local only): `node -v` ≥20. Build locally, not on cPanel.

---

## 2. Build Frontend (local) — point to subdomain

Update `frontend/src/environments/environment.prod.ts` **before build**:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.hydrogenwaterbottles.store', // or https://api.hydrogenwaterbottles.store/api if you keep /api prefix (see 7)
  paystackPublicKey: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
  deepseekApiKey: 'sk-live-xxx', // can stay mock — backend proxy uses server key
  whatsappNumber: '2348080386208',
};
```

Then build:

```bash
cd frontend
npm install
npm run build   # → dist/frontend/browser  (angular.json budgets 22kB, fonts:false)
```

`dist/frontend/browser` contains `index.html`, `main-*.js`, `styles.css`.

---

## 3. Upload Frontend → `public_html/` (hydrogenwaterbottles.store)

Via File Manager `Upload` + `Extract` or FTP (Binary mode for videos):

```bash
# dist/frontend/browser/*  →  public_html/
# public/.htaccess         →  public_html/.htaccess  (critical)
# public/images/logo.png + ultraH2.jpeg → public_html/images/
# public/videos/*.mp4 (80MB) → public_html/videos/  (or CDN — see below)
```

Verify `public_html/`:

```
public_html/
  index.html
  .htaccess         ← from frontend/public/.htaccess (SPA fallback)
  main-*.js
  styles-*.css
  images/logo.png, ultraH2.jpeg
  videos/ (8 mp4) — or https://cdn.hydrogenwaterbottles.store
```

**`public_html/.htaccess` (Angular SPA):**

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{HTTPS} off
RewriteCond %{HTTP_HOST} !^localhost
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]

Header always set X-Content-Type-Options "nosniff"
```

Without it, refresh on `/store`, `/videos`, `/science` → 404.

> **CDN tip:** 80MB videos exceed GitHub 100MB/file. For prod, upload `public/videos` to Cloudflare R2 / Bunny (`cdn.hydrogenwaterbottles.store`) and change `src="/videos/..."` to `https://cdn.../videos/...` + add `public/videos/*` to `.gitignore`.

---

## 4. Upload Backend → Subdomain `api.hydrogenwaterbottles.store` (secure, decoupled)

**Recommended secure layout (custom DocumentRoot):**

```
~/
  h2o-api/                     ← backend project (NOT web-exposed)
    .env                       ← 600 perms (real secrets)
    .htaccess                  ← Require all denied (if leaked)
    config/
    database/schema.sql, seed.sql
    public/                    ← ONLY this is web-exposed
      index.php                ← front controller
      .htaccess                ← RewriteBase /
    src/Core, Controllers, Services
  public_html/                 ← Angular (frontend)
  api.hydrogenwaterbottles.store/  →  (if cPanel forces this folder, make it symlink)
```

**Steps (SSH or File Manager):**

```bash
# 1. Upload backend folder to ~/h2o-api (above public_html, not inside)
scp -r backend user@hydrogenwaterbottles.store:~/h2o-api
# or via File Manager: Upload backend.zip to ~/, Extract to h2o-api

# 2. Point subdomain DocumentRoot to h2o-api/public
# cPanel → Domains → Manage api.hydrogenwaterbottles.store → Document Root → ~/h2o-api/public
# If host disallows custom path outside public_html, use fallback:

# Fallback — subdomain folder is public_html/api or api.hydrogenwaterbottles.store:
mkdir -p ~/api.hydrogenwaterbottles.store
cp -r ~/h2o-api/public/* ~/api.hydrogenwaterbottles.store/
# Keep h2o-api/src, config, .env ABOVE docroot — only public/* is copied
```

Permissions:

```bash
chmod 750 ~/h2o-api
chmod 640 ~/h2o-api/.htaccess ~/h2o-api/config/*
# after .env creation:
chmod 600 ~/h2o-api/.env
```

---

## 5. Configure `~/h2o-api/.env` (subdomain API)

```bash
cp ~/h2o-api/.env.example ~/h2o-api/.env
nano ~/h2o-api/.env
```

```ini
APP_ENV=production
APP_DEBUG=false
# Subdomain API URL
APP_URL=https://api.hydrogenwaterbottles.store
APP_FRONTEND_URL=https://hydrogenwaterbottles.store

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=user_hydrogen_store
DB_USERNAME=user_hydro_user
DB_PASSWORD=YOUR_STRONG_PASSWORD

PAYSTACK_SECRET_KEY=sk_live_REPLACE_WITH_REAL_KEY_VIA_ENV
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-live-xxxxxxxx  # or keep mock
CORS_ALLOWED_ORIGINS=https://hydrogenwaterbottles.store,https://www.hydrogenwaterbottles.store
WHATSAPP_NUMBER=2348080386208
MGT_USER=h2os
MGT_PASS=UltraH2@2025
DB_MOCK_FALLBACK=false
```

> **CORS is critical** for split domains: `CORS_ALLOWED_ORIGINS` must exactly list `https://hydrogenwaterbottles.store` (and `www` if used), no trailing slash, `https`.

---

## 6. Import Database — phpMyAdmin

cPanel → `phpMyAdmin` → select `user_hydrogen_store` → `Import`:

1. `~/h2o-api/database/schema.sql` (creates `products`, `product_variants`, `orders`, `reviews`, `paystack_transactions`)
2. `~/h2o-api/database/seed.sql` (Ultra H₂ + 5 brands, 3 reviews)

Or SSH:

```bash
mysql -u user_hydro_user -p user_hydrogen_store < ~/h2o-api/database/schema.sql
mysql -u user_hydro_user -p user_hydrogen_store < ~/h2o-api/database/seed.sql
```

Test API (subdomain):

```bash
curl https://api.hydrogenwaterbottles.store/health
# {"status":true,"data":{"status":"ok","db":"connected","paystack_mock":"live"}}
curl https://api.hydrogenwaterbottles.store/products | head
curl https://api.hydrogenwaterbottles.store/api/health  # if you kept /api prefix, both work
```

---

## 7. Apache — Subdomain `.htaccess`

**`~/h2o-api/public/.htaccess` (DocumentRoot of api.hydrogenwaterbottles.store):**

If subdomain points directly to `h2o-api/public` (recommended, API at root `/`):

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.php [L,QSA]

Header always set Access-Control-Allow-Origin "https://hydrogenwaterbottles.store"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-Paystack-Signature"
Header always set X-Content-Type-Options "nosniff"
```

If you need to keep `/api` prefix (frontend `apiUrl` = `https://api.hydrogenwaterbottles.store/api`), keep `RewriteBase /api/` and create `public_html/api` symlink fallback. For clean subdomain, use root (`/`) and set frontend `apiUrl` to `https://api.hydrogenwaterbottles.store` (no `/api`).

**`~/h2o-api/.htaccess` (project root, above docroot — deny all):**

```apache
Require all denied
```

Test CORS (browser console on https://hydrogenwaterbottles.store):

```js
fetch('https://api.hydrogenwaterbottles.store/health').then(r=>r.json()).then(console.log)
```

---

## 8. Paystack + DeepSeek + SEO

- **Paystack Webhook:** Dashboard → `Settings → API Keys & Webhooks` → `Webhook URL` → `https://api.hydrogenwaterbottles.store/payments/webhook` (or `/api/payments/webhook` if using `/api` prefix) → events `charge.success`. API verifies `X-Paystack-Signature` = `HMAC_SHA512(rawBody, PAYSTACK_SECRET_KEY)`.

- **DeepSeek:** `DEEPSEEK_API_KEY` in `~/h2o-api/.env` is proxied via `POST https://api.hydrogenwaterbottles.store/chat` so frontend never exposes it. `frontend/src/environments/environment.prod.ts` `deepseekApiKey` can stay mock.

- **SEO:** `frontend/src/index.html` already has `title` `Buy Hydrogen Water Bottle`, `description` `from ₦40,000`, OG `og:image /images/logo.png`, JSON-LD `Store` + `Product` (price 1.3M, free shipping), `frontend/public/robots.txt` allow `/store` disallow `/mgt /api`, `sitemap.xml` 6 URLs. After deploy, submit `https://hydrogenwaterbottles.store/sitemap.xml` in Google Search Console + Bing.

---

## 9. Local WAMP → cPanel Checklist

- [ ] Local WAMP `h2os.local` (see `docs/dev.deployment.md`) works with same `backend/.env` (just `DB_HOST` diff).
- [ ] `npm run build` with `optimization.fonts:false` (no GFonts hang).
- [ ] `public_html` has `.htaccess` + `images` + `videos` + `index.html`; `api.hydrogenwaterbottles.store` `DocumentRoot` → `h2o-api/public`.
- [ ] `~/h2o-api/.env` `600`, `APP_DEBUG=false`, `DB_MOCK_FALLBACK=false`, `CORS_ALLOWED_ORIGINS` includes `https://hydrogenwaterbottles.store`.
- [ ] `curl https://api.hydrogenwaterbottles.store/health` → `connected` and `curl https://hydrogenwaterbottles.store/` → `200`.
- [ ] SSL green for both `hydrogenwaterbottles.store` and `api.hydrogenwaterbottles.store`, `http` → `https` redirect works.
- [ ] MGT at `https://hydrogenwaterbottles.store/mgt` login `h2os / UltraH2@2025` → can add bottle with images/videos → appears in `/store`.
- [ ] Videos play from `public_html/videos` or CDN; if 404, check Binary upload mode.

---

## 10. Troubleshooting — Split Domains

- **404 on refresh** (`/store`, `/videos`) → `public_html/.htaccess` missing or `mod_rewrite` off (cPanel → `Apache Handlers`).
- **CORS `No 'Access-Control-Allow-Origin'`** → `CORS_ALLOWED_ORIGINS` must exactly `https://hydrogenwaterbottles.store` (no slash, `https`). Check `api.hydrogenwaterbottles.store/.htaccess` `Header` not overriding PHP `Access-Control-Allow-Origin`.
- **Paystack 401** → `sk_live` vs `sk_test` mismatch or `PAYSTACK_PUBLIC_KEY` not `pk_live` in `environment.prod.ts`.
- **DB 500** → `tail ~/logs/error_log` or `~/h2o-api/logs`; verify `DB_DATABASE` + `DB_USERNAME` prefix `user_` as cPanel creates; check `DB_HOST=localhost` (not `127.0.0.1` on some cPanel).
- **Videos 404 on subdomain** → ensure subdomain `DocumentRoot` actually points to `h2o-api/public`; if it points to `api.hydrogenwaterbottles.store`, move `index.php` there.
- **Mixed content** → Ensure frontend `apiUrl` is `https://api.hydrogenwaterbottles.store` (https, not http).

---

## 11. Rollback (atomic, split domains)

Frontend (main domain):

```bash
mv ~/public_html ~/public_html.bak
mkdir ~/public_html && cp -r ~/public_html.bak/* ~/public_html/
# or re-upload previous dist
```

Backend (subdomain):

```bash
mv ~/h2o-api ~/h2o-api.bak
# restore previous h2o-api
# No symlink needed — DocumentRoot already points to h2o-api/public
```

Backend stateless → `git checkout <prev> -- h2o-api` and re-point Document Root if needed.

---

## 12. Alternative — Single Domain with `/api` (old)

If you prefer not to use subdomain, keep previous `public_html/api` symlink method (see git history). Subdomain is recommended for clean separation, independent PHP version, and no SPA `.htaccess` conflict.

