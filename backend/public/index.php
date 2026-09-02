<?php
declare(strict_types=1);

/**
 * H2Os Ultra H₂ — Stateless REST API Front Controller
 * Supports both layouts:
 *  1) cPanel classic: ~/api.hydrogenwaterbottles.store/public/index.php + ~/api.hydrogenwaterbottles.store/backend/*
 *     (your current: public_html/.htaccess+index.php + backend/*)
 *  2) Repo dev: backend/public/index.php → backend is dirname(__DIR__)
 */

// 1) Resolve backend root — handles public_html + backend siblings
$publicDir = __DIR__;
$candidates = [
    dirname($publicDir) . '/backend',          // api.hydrogenwaterbottles.store/backend  ← your layout
    dirname($publicDir),                       // api.hydrogenwaterbottles.store           ← if backend is api root
    dirname($publicDir, 2) . '/backend',
    dirname(__DIR__),                          // repo: backend
];
$backendRoot = null;
foreach ($candidates as $p) {
    if (is_file($p . '/config/config.php')) { $backendRoot = $p; break; }
}
if ($backendRoot === null) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status'=>false,'message'=>'Backend not found — expected backend/config/config.php at ' . implode(' or ', $candidates)]);
    exit;
}

require_once $backendRoot . '/config/config.php';
Config::load($backendRoot);

// 2) Autoload — PSR-4 minimal (no Composer required on cPanel, but supports it)
if (is_file($backendRoot . '/vendor/autoload.php')) {
    require_once $backendRoot . '/vendor/autoload.php';
} else {
   spl_autoload_register(function (string $class) use ($backendRoot): void {
        if (!str_starts_with($class, 'App\\')) return;
        $rel = substr($class, 4);
        $file = $backendRoot . '/src/' . str_replace('\\', '/', $rel) . '.php';
        if (is_file($file)) require_once $file;
    });
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
        $allowOrigin = $origin;
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

// 4) Input sanitization
if (!empty($_GET)) {
    foreach ($_GET as $k => $v) {
        if (is_string($v)) $_GET[$k] = trim(strip_tags($v));
    }
}

// 5) Routes
$req = new Request();
$router = new Router();

$router->get('/', function (Request $r) {
    Response::success([
        'service' => 'H2Os Ultra H₂ API',
        'version' => '1.1.0',
        'brand' => 'H2Os',
        'product' => 'Ultra H₂',
        'env' => Config::get('APP_ENV', 'production'),
        'time' => date('c'),
        'backendRoot' => $GLOBALS['backendRoot'] ?? 'unknown',
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
            'POST /chat',
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

$router->get('/products', [ProductController::class, 'index']);
$router->get('/products/{id}', [ProductController::class, 'show']);
$router->post('/products', [ProductController::class, 'store']);
$router->put('/products/{id}', [ProductController::class, 'update']);
$router->delete('/products/{id}', [ProductController::class, 'destroy']);

$router->post('/chat', [ChatController::class, 'chat']);

$router->get('/orders', [OrderController::class, 'index']);
$router->post('/orders', [OrderController::class, 'store']);
$router->get('/orders/{reference}', [OrderController::class, 'show']);

$router->post('/payments/initialize', [PaymentController::class, 'initialize']);
$router->get('/payments/verify/{reference}', [PaymentController::class, 'verify']);
$router->post('/payments/webhook', [PaymentController::class, 'webhook']);
$router->post('/webhook', [PaymentController::class, 'webhook']);

$router->get('/reviews', [ReviewController::class, 'index']);
$router->post('/reviews', [ReviewController::class, 'store']);
$router->delete('/reviews/{id}', [ReviewController::class, 'destroy']);

set_exception_handler(function (Throwable $e) {
    error_log('[HYDRO API] Uncaught: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    $msg = Config::isDebug() ? $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine() : 'Internal server error';
    $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
    Response::error($msg, $code);
});

try {
    $GLOBALS['backendRoot'] = $backendRoot;
    $router->dispatch($req);
} catch (Throwable $e) {
    error_log('[HYDRO API] Dispatch error: ' . $e->getMessage());
    $msg = Config::isDebug() ? $e->getMessage() : 'Internal server error';
    Response::error($msg, 500);
}
