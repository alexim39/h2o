# H2Os — WAMP Local Development Guide (Windows)

Stack: **Angular 19 (Signals, Standalone) + PHP 8.3 + MySQL 8 (WAMP) + Paystack (mock) + DeepSeek (mock)**

> WAMP: `C:\wamp64\` — Apache 2.4 + PHP 8.3 + MySQL 8 + phpMyAdmin. Frontend served via `ng serve` (4200) proxying to WAMP Apache API **or** as built `dist` inside WAMP `www`.

---

## 1. Prerequisites — WAMP

1. Install **WAMP 3.3+** from wampserver.aviatechno.net — choose **PHP 8.3** during install (add-on). Verify `C:\wamp64\bin\php\php8.3.x` exists.
2. Right-click WAMP tray → `PHP → Version → 8.3.x` → `Apache → Version → 2.4.x`.
3. Enable extensions: Left-click tray → `PHP → PHP extensions` → enable `pdo_mysql`, `curl`, `mbstring`, `openssl` (checked). Restart WAMP (green icon).
4. Install **Node 20+** (`node -v` ≥20) + `npm 10+` + **Git**.
5. Verify in `cmd` (not PowerShell `ExecutionPolicy`):
```
php -v          # PHP 8.3.x
mysql --version # MySQL 8.x (via WAMP's bin)
node -v && npm -v
```
If `php` not found, add `C:\wamp64\bin\php\php8.3.x` to `Path` env, reopen `cmd`.

---

## 2. Directory Layout — WAMP Dev

```
C:\Projects\h2o\                 ← repo (you are here)
  frontend/                      ← Angular SPA
  backend/                       ← PHP API (stateless)
  docs/

WAMP www (deployed for Apache):
C:\wamp64\www\h2os\               ← Apache DocumentRoot for h2os.local
  index.html                     ← Angular built (frontend/dist/frontend/browser)
  .htaccess                      ← SPA fallback (from frontend/public/.htaccess)
  api\  →  symlink → C:\Projects\h2o\backend\public
        (or copy backend\public\* into www\h2os\api\)
  images\  (copied from public\images)
  videos\  (copied from public\videos)

Backend source stays in C:\Projects\h2o\backend (above www — not web-exposed).
WAMP MySQL: phpMyAdmin http://localhost/phpmyadmin
```

**Why decoupled:** only `backend\public\index.php` is exposed via `www\h2os\api`. `.env`, `src/`, `vendor/` never under `www`.

---

## 3. Database — phpMyAdmin (WAMP)

1. Left-click WAMP tray → `phpMyAdmin` (or http://localhost/phpmyadmin) → root/no password by default.
2. `Databases` → Create `hydrogen_store` `utf8mb4_unicode_ci`.
3. Select `hydrogen_store` → `Import` → Choose `C:\Projects\h2o\backend\database\schema.sql` → Go.
4. Same → `seed.sql` → Go. You should see `products` (H2OS-ULTRA-H2, 6 brands), `product_variants`, `reviews`, `orders`.
5. (Optional) Create user for backend: `User accounts` → `Add user` → `hydrogen_user` / strong pass → `Grant all on hydrogen_store` → Go. Or keep `root` blank for local.

---

## 4. Backend — .env (WAMP)

```cmd
copy C:\Projects\h2o\backend\.env.example C:\Projects\h2o\backend\.env
notepad C:\Projects\h2o\backend\.env
```

Fill for WAMP:

```ini
APP_ENV=development
APP_DEBUG=true
APP_URL=http://h2os.local
APP_FRONTEND_URL=http://localhost:4200

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hydrogen_store
DB_USERNAME=root
DB_PASSWORD=
DB_CHARSET=utf8mb4

PAYSTACK_SECRET_KEY=sk_test_mock
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-deepseek-mock-REPLACE_WITH_REAL_KEY
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions

CORS_ALLOWED_ORIGINS=http://localhost:4200,http://h2os.local,http://localhost
WHATSAPP_NUMBER=2348080386208
MGT_USER=h2os
MGT_PASS=UltraH2@2025
DB_MOCK_FALLBACK=true
```

> `DB_MOCK_FALLBACK=true` lets API return mock Ultra H₂ even if MySQL down — set `false` to surface DB errors.

Test backend standalone (no Apache):

```cmd
cd /d C:\Projects\h2o\backend
php -S localhost:8000 -t public
# http://localhost:8000/api/health → {"status":"ok","db":"connected"}
# http://localhost:8000/api/products → Ultra H₂
```

---

## 5. Apache — WAMP Virtual Host (recommended)

Edit `C:\wamp64\bin\apache\apache2.4.x\conf\extra\httpd-vhosts.conf` (right-click tray → Apache → httpd-vhosts.conf):

```apache
<VirtualHost *:80>
  ServerName h2os.local
  DocumentRoot "C:/wamp64/www/h2os"
  <Directory "C:/wamp64/www/h2os">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>
  ErrorLog "logs/h2os.local-error.log"
  CustomLog "logs/h2os.local-access.log" common
</VirtualHost>
```

Add to `C:\Windows\System32\drivers\etc\hosts` (run Notepad as Admin):

```
127.0.0.1 h2os.local
```

Enable rewrite: tray → `Apache → Apache modules` → check `rewrite_module` → Restart WAMP.

**Deploy to WAMP www:**

```cmd
:: Build frontend (production) -> WAMP www
cd /d C:\Projects\h2o\frontend
npm install
npm run build
:: dist/frontend/browser contains index.html + chunks
rmdir /s /q C:\wamp64\www\h2os
mkdir C:\wamp64\www\h2os
xcopy /E /I /Y dist\frontend\browser C:\wamp64\www\h2os\
copy /Y public\.htaccess C:\wamp64\www\h2os\.htaccess
xcopy /E /I /Y public\images C:\wamp64\www\h2os\images\
xcopy /E /I /Y public\videos C:\wamp64\www\h2os\videos\

:: Expose API as www/h2os/api
mklink /D C:\wamp64\www\h2os\api C:\Projects\h2o\backend\public
:: If mklink needs Admin, instead: xcopy /E /I /Y C:\Projects\h2o\backend\public C:\wamp64\www\h2os\api\
```

Verify `C:\wamp64\www\h2os\.htaccess` exists (SPA fallback). Restart WAMP → http://h2os.local → H2Os.

**Alternative — Dev with `ng serve` (faster):**

```cmd
:: Terminal 1 — PHP API (if not using Apache)
php -S localhost:8000 -t C:\Projects\h2o\backend\public

:: Terminal 2 — Angular (proxy API to 8000)
cd /d C:\Projects\h2o\frontend
:: ensure src/environments/environment.ts apiUrl = http://localhost:8000/api
npm start
# http://localhost:4200 → calls http://localhost:8000/api/products
```

`ng serve` auto-serves `public/` at root (`/images`, `/videos`).

---

## 6. .htaccess — WAMP

**`www\h2os\.htaccess` (from `frontend/public/.htaccess`):**
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

**`www\h2os\api\.htaccess` (from `backend/public/.htaccess`):**
```apache
RewriteEngine On
RewriteBase /api/
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.php [L,QSA]
```

---

## 7. Test

```cmd
curl http://h2os.local/api/health
curl http://h2os.local/api/products
curl http://localhost:8000/api/products   :: if using php -S
```

Frontend: http://h2os.local or http://localhost:4200 → add Ultra H₂ to cart → checkout Paystack (mock) → confirmation → video modal → MGT at `/mgt` (h2os / UltraH2@2025).

---

## 8. Troubleshooting — WAMP

- **404 on refresh** (`/store`, `/videos`) → `www\h2os\.htaccess` missing or `rewrite_module` off.
- **500 API** → check `C:\wamp64\logs\php_error.log` + `C:\wamp64\logs\apache_error.log`; verify `backend\.env` DB creds; `php -m` shows `pdo_mysql`.
- **CORS** → `CORS_ALLOWED_ORIGINS` must contain `http://localhost:4200` and `http://h2os.local` (exact, no slash).
- **Images/videos 404** → verify `C:\wamp64\www\h2os\images\ultraH2.jpeg` exists; if using `ng serve`, ensure `frontend/public` not empty.
- **Port 80 in use** → Skype/IIS; change WAMP Apache port via tray → `Apache → httpd.conf` `Listen 8080`.
- **.env not loaded** → `backend\.env` must be in `C:\Projects\h2o\backend\.env` (not `public`), `APP_DEBUG=true` to see errors.
```

