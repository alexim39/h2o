# HYDRO+ ELITE — Hydrogen Water Bottle Store

Ultra-premium luxury single-product e-commerce for **hydrogenwaterbottles.store**  
Stack: **Angular 19 (Signals, Standalone) + PHP 8.3 Stateless REST API + MySQL 8.0 + Paystack**

> Deep obsidian black · dark slate charcoal · bio-luminescent neon green (#00FF88) · glassmorphism · Space Grotesk + Instrument Sans

---

## 1. Full Directory Layout

### Local Development

```
h2o/
├── frontend/                         # Angular 19 SPA
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── public/
│   │   └── .htaccess                 # SPA fallback (Apache) — copied to dist
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.scss               # Global luxury design system
│       ├── .htaccess                 # (mirror for build)
│       ├── environments/
│       │   ├── environment.ts        # dev (localhost:8000/api, test Paystack)
│       │   └── environment.prod.ts   # prod (hydrogenwaterbottles.store/api)
│       └── app/
│           ├── app.component.ts      # Root + ambient glow + outlets
│           ├── app.config.ts         # provideRouter, provideHttpClient(interceptors)
│           ├── app.routes.ts         # lazy-loaded routes
│           ├── core/
│           │   ├── models/
│           │   │   ├── product.model.ts  # HYDRO_PRODUCT constant + Variant types
│           │   │   ├── cart.model.ts
│           │   │   └── order.model.ts
│           │   ├── services/
│           │   │   ├── product.service.ts  # signal(selectedId) + computed(selectedVariant)
│           │   │   ├── cart.service.ts     # signal(items) + computed(total/shipping) + localStorage effect
│           │   │   ├── paystack.service.ts # initialize() + payWithInline() + verify() + mock fallback
│           │   │   ├── api.service.ts
│           │   │   └── toast.service.ts
│           │   └── interceptors/
│           │       ├── api.interceptor.ts
│           │       └── error.interceptor.ts
│           ├── shared/
│           │   └── components/
│           │       ├── header/         # Sticky, backdrop-blur, cart badge (Signals)
│           │       ├── footer/
│           │       ├── whatsapp/       # Breathing animation + pre-filled wa.me link
│           │       └── toast/
│           └── features/
│               ├── landing/            # Hero, benefits, 360 gallery, specs, reviews, CTA
│               ├── product/            # Variant picker, qty, add-to-cart
│               ├── cart/               # Slide-out drawer (signal-driven)
│               ├── checkout/           # Shipping form + Paystack
│               └── confirmation/       # Order tracking + WhatsApp follow-up
│
├── backend/                          # Stateless PHP 8.3 REST API
│   ├── .env.example                  # Copy to .env (above public_html on cPanel)
│   ├── .htaccess                     # DENY all if backend leaked into docroot
│   ├── composer.json
│   ├── config/
│   │   └── config.php                # Env loader + typed access
│   ├── database/
│   │   ├── schema.sql                # MySQL 8.0 — products, variants, orders, items, paystack_tx
│   │   └── seed.sql
│   ├── public/
│   │   ├── index.php                 # ONLY public entry point (front controller)
│   │   └── .htaccess                 # Rewrite all to index.php + security headers
│   └── src/
│       ├── Core/
│       │   ├── Router.php            # Stateless regex router
│       │   ├── Request.php           # Normalized apiPath(), body parsing
│       │   ├── Response.php          # json()/success()/error()
│       │   ├── Database.php          # PDO + prepared statements + mock fallback
│       │   └── Env.php
│       ├── Controllers/
│       │   ├── ProductController.php
│       │   ├── OrderController.php   # server-side price recomputation
│       │   └── PaymentController.php # Paystack init/verify/webhook + HMAC check
│       └── Services/
│           └── PaystackService.php   # cURL, no SDK, mock fallback
│
└── docs/
    └── DEPLOYMENT.md
```

### cPanel Production (Security — Decoupled)

```
 /home/user/
 ├── hydro-api/                        # ← backend/ deployed HERE (ABOVE public_html) — NOT web-accessible
 │   ├── .env                          # REAL secrets (DB, Paystack live keys) — 600 perms
 │   ├── config/
 │   ├── database/
 │   ├── src/
 │   ├── vendor/                       # (optional if you use Composer)
 │   └── public/
 │       ├── index.php
 │       └── .htaccess
 │
 ├── logs/
 │   └── hydro-api-error.log
 │
 └── public_html/                      # ← frontend dist ONLY
     ├── index.html                    # ng build output
     ├── .htaccess                     # SPA fallback (from frontend/public/.htaccess)
     ├── main-XXXX.js                  # hashed chunks (immutable cache)
     ├── styles-XXXX.css
     └── api/  →  symlink → /home/user/hydro-api/public
         # OR: copy hydro-api/public/* into public_html/api/
         # Must preserve public/.htaccess inside api/
```

**Why this is secure:** PHP source, `.env`, and `vendor/` are *never* under `public_html`. Only `backend/public/index.php` is exposed via `public_html/api`. Direct access to `/.env`, `/config`, `/src` is impossible.

---

## 2. Quick Start (Local)

### Frontend

```bash
cd frontend
npm install
npm start          # http://localhost:4200
npm run build      # → dist/frontend/browser  (copy to public_html)
```

> If `npm` is blocked by PowerShell ExecutionPolicy, run:
> `powershell -ExecutionPolicy Bypass -Command "npm install"`

Environment is configured in `src/environments/environment.ts`:
- `apiUrl: http://localhost:8000/api`
- `paystackPublicKey: pk_test_...` (swap in .env for prod)

### Backend (no Composer required)

```bash
# Option A — vanilla PHP (zero install, mock DB works)
php -S localhost:8000 -t backend/public

# Option B — with Composer (if available)
composer install
php -S localhost:8000 -t backend/public
```

The API auto-falls back to **mock data** if `DB_HOST` is unreachable or `.env` is missing (`DB_MOCK_FALLBACK=true`), so you can develop the Angular UI without MySQL.

Create DB when ready:

```bash
mysql -u root -p -e "CREATE DATABASE hydrogen_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p hydrogen_store < backend/database/schema.sql
mysql -u root -p hydrogen_store < backend/database/seed.sql
cp backend/.env.example backend/.env  # then edit DB_* and PAYSTACK_*
```

Test API:

```bash
curl http://localhost:8000/api/
curl http://localhost:8000/api/products
curl -X POST http://localhost:8000/api/orders -H "Content-Type: application/json" -d '{"items":[{"variantId":"obsidian","qty":1}],"shipping":{"fullName":"Test","email":"test@test.com","phone":"+2348000000000","address":"12 Obsidian Way","city":"Lagos","state":"Lagos","country":"Nigeria"}}'
```

---

## 3. Paystack Integration

- **Frontend:** `PaystackService` loads `https://js.paystack.co/v1/inline.js` on demand, calls `POST /api/payments/initialize` for `authorization_url`, then opens `PaystackPop.setup({...}).openIframe()`. Falls back to mock if backend unreachable.
- **Backend:** `PaystackService.php` uses cURL to `https://api.paystack.co`. If `PAYSTACK_SECRET_KEY` contains `mock` (default), it returns mock URLs and mock verification (so checkout works without real keys).
- **Webhook:** `POST /api/payments/webhook` verifies `X-Paystack-Signature` via `hash_hmac('sha512', rawBody, secret)` and marks order `paid`. Configure URL in Paystack Dashboard → Settings → Webhooks: `https://hydrogenwaterbottles.store/api/payments/webhook`.

Swap keys in `backend/.env` (and `frontend/src/environments/environment.prod.ts` `paystackPublicKey`) when going live.

---

## 4. cPanel Deployment Steps

See `docs/DEPLOYMENT.md` for full checklist (symlink vs copy, AutoSSL, permissions 600 for `.env`, Paystack webhook).

TL;DR:

1. Build frontend: `npm run build` → upload `dist/frontend/browser/*` → `public_html/` (keep `public/.htaccess`).
2. Upload `backend/` → `/home/user/hydro-api/` (above `public_html`).
3. SSH: `ln -s /home/user/hydro-api/public /home/user/public_html/api`  (or copy).
4. Create MySQL DB/user in cPanel → import `schema.sql` + `seed.sql`.
5. `cp hydro-api/.env.example hydro-api/.env` → fill real credentials → `chmod 600 hydro-api/.env`.
6. Paystack Dashboard → add webhook `https://hydrogenwaterbottles.store/api/payments/webhook`.

---

## 5. Security Checklist

- Backend **above** `public_html`, only `public/index.php` exposed.
- All DB access via **PDO prepared statements** — no string interpolation.
- Global CORS allowlist (`CORS_ALLOWED_ORIGINS`), `nosniff`, `DENY` framing, stateless (no sessions).
- Angular `HttpInterceptor`s for `Content-Type` + global error handling; Signals everywhere (no `BehaviorSubject`).
- `.htaccess` denies `/.env`, `/.git`, `composer.*`, hidden files.

---

## 6. Design Tokens

See `frontend/src/styles.scss` for the single source of truth: obsidian/charcoal/slate, neon #00FF88, glassmorphism, glow borders.

---

© HYDRO+ ELITE — Obsidian luxury. Bioluminescent hydration.
