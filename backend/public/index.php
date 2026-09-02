<?php
declare(strict_types=1);

/**
 * H2Os Ultra H₂ — Stateless REST API Front Controller
 * Brand: H2Os | Product: Ultra H₂ | Future: catalog of H2Os bottles
 * Security: sits behind public_html/api via symlink or .htaccess rewrite.
 * This file is the ONLY public entry point. Everything else is above docroot.
 *
 * cPanel deployment:
 *   /home/user/hydro-api/        ← backend (this repo's backend/ folder) — ABOVE public_html
 *   /home/user/public_html/      ← Angular dist (frontend)
 *   /home/user/public_html/api/  → symlink to /home/user/hydro-api/public
 *   OR copy backend/public/* into public_html/api/
 *
 * Local dev:
 *   php -S localhost:8000 -t backend/public
 */

// 1) Load config (searches for .env above public)
$backendRoot = dirname(__DIR__);
require_once $backendRoot . '/config/config.php';
Config::load($backendRoot);

// 2) Autoload — PSR-4 minimal (no Composer required on cPanel, but supports it)
if (is_file($backendRoot . '/vendor/autoload.php')) {
    require_once $backendRoot . '/vendor/autoload.php';
} else {
   spl_autoload_register(function (string $class): void {
        global $backendRoot;
        if (!str_starts_with($class, 'App\\')) return;
        $rel = substr($class, 4);
        $file = $backendRoot . '/src/' . str_replace('\\', '/', $rel) . '.php';
        if (is_file($file)) require_once $file;
    });
    // Also load Config class already required
}

use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Controllers\ProductController;
use App\Controllers\OrderController;
use App\Controllers\PaymentController;
use App\Controllers\ReviewController;
use App\Controllers\ChatController;

// 3) CORS — allow hydrogenwaterbottles.store + localhost, always send headers on OPTIONS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = Config::allowedOrigins();
$allowOrigin = null;
if ($origin !== '') {
    if (in_array($origin, $allowed, true)) {
        $allowOrigin = $origin;
    } elseif (str_contains($origin, 'hydrogenwaterbottles.store')) {
        $allowOrigin = $origin; // allow any subdomain of store even if .env stale
    } elseif (Config::isDebug() && (str_contains($origin, 'localhost') || str_contains($origin, '127.0.0.1'))) {
        $allowOrigin = $origin;
    }
}
if ($allowOrigin !== null) {
    header("Access-Control-Allow-Origin: $allowOrigin");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: false');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Paystack-Signature');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Expose-Headers: Content-Type');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 0');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Content-Security-Policy: default-src \'none\'; frame-ancestors \'none\'');

// Preflight — 204 no content
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 4) Input sanitization — global
// (individual controllers also sanitize; this is defense in depth)
if (!empty($_GET)) {
    foreach ($_GET as $k => $v) {
        if (is_string($v)) $_GET[$k] = trim(strip_tags($v));
    }
}

// 5) Route definitions — stateless REST
$req = new Request();
$router = new Router();

// Health
$router->get('/', function (Request $r) {
    Response::success([
        'service' => 'H2Os Ultra H₂ API',
        'version' => '1.1.0',
        'brand' => 'H2Os',
        'product' => 'Ultra H₂',
        'env' => Config::get('APP_ENV', 'production'),
        'time' => date('c'),
        'endpoints' => [
            'GET  /products',
            'GET  /products/{id}',
            'POST /products',
            'PUT  /products/{id}',
            'DELETE /products/{id}',
            'GET  /orders',
            'POST /orders',
            'GET  /orders/{reference}',
            'POST /payments/initialize',
            'GET  /payments/verify/{reference}',
            'POST /payments/webhook',
            'GET  /reviews',
            'POST /reviews',
            'POST /chat (DeepSeek H2Os Assistant Doctor)',
        ],
    ], 'H2Os Ultra H₂ API — Hydration, upgraded • 1600 ppb');
});

$router->get('/health', function (Request $r) {
    $dbMode = 'error';
    try {
        $pdo = \App\Core\Database::connection();
        $pdo->query('SELECT 1');
        $dbMode = 'connected';
    } catch (Throwable $e) {
        $dbMode = 'error: ' . $e->getMessage();
    }
    Response::success(['status'=>'ok','db'=>$dbMode,'paystack_mock'=> (new \App\Services\PaystackService())->isMock() ? 'mock' : 'live']);
});

// Products (H2Os multi-brand catalog)
$router->get('/products', [ProductController::class, 'index']);
$router->get('/products/{id}', [ProductController::class, 'show']);
$router->post('/products', [ProductController::class, 'store']);
$router->put('/products/{id}', [ProductController::class, 'update']);
$router->delete('/products/{id}', [ProductController::class, 'destroy']);

// AI Chat — H2Os Assistant Doctor (DeepSeek)
$router->post('/chat', [ChatController::class, 'chat']);

// Orders
$router->get('/orders', [OrderController::class, 'index']);
$router->post('/orders', [OrderController::class, 'store']);
$router->get('/orders/{reference}', [OrderController::class, 'show']);

// Payments (Paystack)
$router->post('/payments/initialize', [PaymentController::class, 'initialize']);
$router->get('/payments/verify/{reference}', [PaymentController::class, 'verify']);
$router->post('/payments/webhook', [PaymentController::class, 'webhook']);
// Alias: Paystack dashboard may POST to /webhook
$router->post('/webhook', [PaymentController::class, 'webhook']);

// Reviews (H2Os community)
$router->get('/reviews', [ReviewController::class, 'index']);
$router->post('/reviews', [ReviewController::class, 'store']);

// 6) Global exception → JSON (never leak stack in prod)
set_exception_handler(function (Throwable $e) {
    error_log('[HYDRO API] Uncaught: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    $msg = Config::isDebug() ? $e->getMessage() : 'Internal server error';
    $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
    Response::error($msg, $code);
});

try {
    $router->dispatch($req);
} catch (Throwable $e) {
    error_log('[HYDRO API] Dispatch error: ' . $e->getMessage());
    $msg = Config::isDebug() ? $e->getMessage() : 'Internal server error';
    Response::error($msg, 500);
}
