<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Services\EmailService;

/**
 * Orders — stateless CRUD. Uses prepared statements, input sanitization,
 * and mock fallback if DB unavailable.
 */
final class OrderController
{
    private const VALID_VARIANTS = ['ultra-h2','obsidian','titanium','rosegold'];

    /** POST /orders — create order (called before/alongside Paystack init) */
    public function store(Request $req): void
    {
        $body = $req->body ?? [];
        $items = $body['items'] ?? null;
        $shipping = $body['shipping'] ?? null;
        $reference = isset($body['reference']) ? $this->sanitize((string)$body['reference']) : null;

        // Validate
        $errors = [];
        if (!is_array($items) || empty($items)) $errors['items'] = 'Cart items required.';
        if (!is_array($shipping)) $errors['shipping'] = 'Shipping details required.';
        else {
            foreach (['fullName','email','phone','address','city','state','country'] as $f) {
                if (empty($shipping[$f])) $errors["shipping.$f"] = "$f is required.";
            }
            if (!empty($shipping['email']) && !filter_var($shipping['email'], FILTER_VALIDATE_EMAIL)) {
                $errors['shipping.email'] = 'Invalid email.';
            }
        }
        if ($items) {
            foreach ($items as $i => $it) {
                if (!in_array($it['variantId'] ?? '', self::VALID_VARIANTS, true)) $errors["items.$i.variantId"] = 'Invalid variant.';
                if (!isset($it['qty']) || (int)$it['qty'] < 1 || (int)$it['qty'] > 10) $errors["items.$i.qty"] = 'Qty must be 1–10.';
            }
        }
        if ($errors) Response::error('Validation failed', 422, $errors);

        // Sanitize shipping
        $cleanShipping = [];
        foreach (['fullName','email','phone','address','city','state','country','notes'] as $k) {
            $cleanShipping[$k] = isset($shipping[$k]) ? $this->sanitize((string)$shipping[$k]) : '';
        }
        $cleanShipping['email'] = strtolower(trim($cleanShipping['email']));

        // Calculate total using server-side prices (never trust client total) — H2Os Ultra H₂
        $prices = ['ultra-h2'=>1300000,'obsidian'=>1300000,'titanium'=>1300000,'rosegold'=>1300000];
        $skus   = ['ultra-h2'=>'H2OS-ULTRA-H2-500','obsidian'=>'H2OS-ULTRA-H2-500','titanium'=>'H2OS-ULTRA-H2-500','rosegold'=>'H2OS-ULTRA-H2-500'];
        $subtotal = 0;
        $cleanItems = [];
        foreach ($items as $it) {
            $vid = $it['variantId'];
            // Future-proof: fallback to ultra-h2 price if unknown
            $price = $prices[$vid] ?? 1300000;
            $qty = (int)$it['qty'];
            $subtotal += $price * $qty;
            $cleanItems[] = ['variantId'=>$vid, 'qty'=>$qty, 'price'=>$price, 'sku'=> $skus[$vid] ?? 'H2OS-ULTRA-H2-500'];
        }
        $shippingFee = 0; // Free shipping on all orders
        $total = $subtotal + $shippingFee;

        $ref = $reference ?: ('H2OS_' . time() . '_' . strtoupper(substr(bin2hex(random_bytes(3)),0,5)));
        $tracking = 'HY-' . strtoupper(substr(md5($ref), 0, 8));

        // Persist to DB if available
        $orderId = null;
        try {
            $pdo = Database::connection();
            if ($pdo !== null) {
                Database::begin();
                Database::execute(
                    'INSERT INTO orders (reference, email, total, currency, status, shipping_json, tracking_number, created_at, updated_at)
                     VALUES (:ref, :email, :total, :cur, :status, :ship, :track, NOW(), NOW())',
                    [
                        'ref' => $ref,
                        'email' => $cleanShipping['email'],
                        'total' => $total,
                        'cur' => 'NGN',
                        'status' => 'pending',
                        'ship' => json_encode($cleanShipping, JSON_UNESCAPED_UNICODE),
                        'track' => $tracking,
                    ]
                );
                $orderId = (int)Database::lastInsertId();
                foreach ($cleanItems as $ci) {
                    Database::execute(
                        'INSERT INTO order_items (order_id, variant_id, qty, price, sku) VALUES (:oid, :vid, :qty, :price, :sku)',
                        ['oid'=>$orderId, 'vid'=>$ci['variantId'], 'qty'=>$ci['qty'], 'price'=>$ci['price'], 'sku'=>$ci['sku']]
                    );
                }
                Database::commit();
            }
        } catch (\Throwable $e) {
            try { Database::rollBack(); } catch (\Throwable) {}
            error_log('[OrderController::store] DB error: ' . $e->getMessage());
            Response::error('Order failed — please try again. ' . (Config::get('APP_DEBUG') ? $e->getMessage() : ''), 500);
            return;
        }
        if ($orderId === null) {
            Response::error('Order failed — database unavailable', 500);
            return;
        }

        // ─── Premium email — user confirmation + admin alert (non-blocking) ───
        $orderPayload = [
            'reference' => $ref,
            'total' => $total,
            'currency' => 'NGN',
            'trackingNumber' => $tracking,
            'createdAt' => date('c'),
            'items' => $cleanItems,
            'shipping' => $cleanShipping,
        ];
        try {
            $mailer = new EmailService();
            // User — only if real email and DB persisted (not mock random)
            if ($orderId !== null && filter_var($cleanShipping['email'], FILTER_VALIDATE_EMAIL)) {
                $mailer->sendUserConfirmation($orderPayload, $cleanShipping['email']);
            }
            // Admin — always when orderId exists (real DB)
            if ($orderId !== null) {
                $mailer->sendAdminAlert($orderPayload);
            }
        } catch (\Throwable $e) {
            error_log('[Order email] ' . $e->getMessage());
        }

        Response::success([
            'id' => $orderId,
            'reference' => $ref,
            'trackingNumber' => $tracking,
            'total' => $total,
            'currency' => 'NGN',
            'status' => 'pending',
            'items' => $cleanItems,
            'shipping' => $cleanShipping,
        ], 'Order created', 201);
    }

    /** GET /orders/{reference} */
    public function show(Request $req, string $reference): void
    {
        $ref = $this->sanitize($reference);

        try {
            $pdo = Database::connection();
            if ($pdo !== null) {
                $order = Database::fetchOne('SELECT * FROM orders WHERE reference = :ref LIMIT 1', ['ref'=>$ref]);
                if ($order) {
                    $items = Database::fetchAll('SELECT variant_id, qty, price, sku FROM order_items WHERE order_id = :oid', ['oid'=>$order['id']]);
                    Response::success([
                        'id' => (int)$order['id'],
                        'reference' => $order['reference'],
                        'email' => $order['email'],
                        'total' => (int)$order['total'],
                        'currency' => $order['currency'],
                        'status' => $order['status'],
                        'trackingNumber' => $order['tracking_number'],
                        'shipping' => json_decode($order['shipping_json'] ?? '{}', true),
                        'items' => array_map(fn($r)=>['variantId'=>$r['variant_id'],'qty'=>(int)$r['qty'],'price'=>(int)$r['price'],'sku'=>$r['sku']], $items),
                        'createdAt' => $order['created_at'],
                        'paystackRef' => $order['paystack_ref'],
                    ]);
                    return;
                }
            }
        } catch (\Throwable $e) {
            error_log('[OrderController::show] DB error: ' . $e->getMessage());
        }

        Response::error('Order not found', 404);
    }

    /** GET /orders — admin/listing (paginated, optional email filter) */
    public function index(Request $req): void
    {
        $page = max(1, (int)($req->query['page'] ?? 1));
        $perPage = min(50, max(1, (int)($req->query['perPage'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        try {
            $pdo = Database::connection();
            if ($pdo !== null) {
                $totalRow = Database::fetchOne('SELECT COUNT(*) as c FROM orders');
                $total = (int)($totalRow['c'] ?? 0);
                $rows = Database::fetchAll('SELECT * FROM orders ORDER BY created_at DESC LIMIT :lim OFFSET :off', []);
                // PDO doesn't bind LIMIT as int easily with named params — use manual query
                $stmt = $pdo->prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT :lim OFFSET :off');
                $stmt->bindValue(':lim', $perPage, \PDO::PARAM_INT);
                $stmt->bindValue(':off', $offset, \PDO::PARAM_INT);
                $stmt->execute();
                $rows = $stmt->fetchAll();

                $data = array_map(fn($r)=>[
                    'id'=>(int)$r['id'],'reference'=>$r['reference'],'email'=>$r['email'],'total'=>(int)$r['total'],
                    'currency'=>$r['currency'],'status'=>$r['status'],'trackingNumber'=>$r['tracking_number'],'createdAt'=>$r['created_at']
                ], $rows);
                Response::paginated($data, $total, $page, $perPage);
                return;
            }
        } catch (\Throwable $e) {
            error_log('[OrderController::index] DB error: ' . $e->getMessage());
        }

        Response::paginated([], 0, $page, $perPage);
    }

    private function sanitize(string $v): string
    {
        return trim(htmlspecialchars(strip_tags($v), ENT_QUOTES, 'UTF-8'));
    }
}
