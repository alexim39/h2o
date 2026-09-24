<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;
use App\Services\EmailService;
use App\Services\PricingService;

/**
 * Orders — real DB, server-side pricing via PricingService.
 */
final class OrderController
{
    /** POST /orders — create order */
    public function store(Request $req): void
    {
        $body = $req->body ?? [];
        $items = $body['items'] ?? null;
        $shipping = $body['shipping'] ?? null;
        $reference = isset($body['reference']) ? $this->sanitize((string)$body['reference']) : null;
        $couponCode = isset($body['coupon']) ? trim((string)$body['coupon']) : null;

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
        if ($errors) Response::error('Validation failed', 422, $errors);

        foreach ($items as $it) {
            if (!isset($it['qty']) || (int)$it['qty'] < 1 || (int)$it['qty'] > 10) Response::error('Qty must be 1–10.', 422);
            if (empty($it['variantId'])) Response::error('variantId required.', 422);
        }

        try {
            $calc = PricingService::totals($items, $couponCode ?: null);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), $e->getCode() >= 400 ? $e->getCode() : 422);
            return;
        }

        $cleanShipping = [];
        foreach (['fullName','email','phone','address','city','state','country','notes'] as $k) {
            $cleanShipping[$k] = isset($shipping[$k]) ? $this->sanitize((string)$shipping[$k]) : '';
        }
        $cleanShipping['email'] = strtolower(trim($cleanShipping['email']));
        $cleanItems = $calc['lines'];
        $total = $calc['total'];

        $ref = $reference ?: ('H2OS_' . time() . '_' . strtoupper(substr(bin2hex(random_bytes(3)),0,5)));
        $tracking = 'HY-' . strtoupper(substr(md5($ref), 0, 8));

        $orderId = null;
        try {
            Database::begin();
            Database::execute(
                'INSERT INTO orders (reference, email, total, currency, status, shipping_json, tracking_number, created_at, updated_at)
                 VALUES (:ref, :email, :total, :cur, :status, :ship, :track, NOW(), NOW())',
                ['ref' => $ref, 'email' => $cleanShipping['email'], 'total' => $total, 'cur' => 'NGN', 'status' => 'pending', 'ship' => json_encode($cleanShipping, JSON_UNESCAPED_UNICODE), 'track' => $tracking]
            );
            $orderId = (int)Database::lastInsertId();
            foreach ($cleanItems as $ci) {
                Database::execute(
                    'INSERT INTO order_items (order_id, variant_id, qty, price, sku) VALUES (:oid, :vid, :qty, :price, :sku)',
                    ['oid'=>$orderId, 'vid'=>$ci['variantId'], 'qty'=>$ci['qty'], 'price'=>$ci['price'], 'sku'=>$ci['sku']]
                );
            }
            Database::commit();
        } catch (\Throwable $e) {
            try { Database::rollBack(); } catch (\Throwable) {}
            error_log('[OrderController::store] DB error: ' . $e->getMessage());
            Response::error('Order failed — please try again.', 500);
            return;
        }

        $orderPayload = [
            'reference' => $ref, 'total' => $total, 'currency' => 'NGN',
            'trackingNumber' => $tracking, 'createdAt' => date('c'),
            'items' => $cleanItems, 'shipping' => $cleanShipping,
            'subtotal' => $calc['subtotal'], 'discount' => $calc['discount'],
        ];
        try {
            $mailer = new EmailService();
            if (filter_var($cleanShipping['email'], FILTER_VALIDATE_EMAIL)) {
                $mailer->sendUserConfirmation($orderPayload, $cleanShipping['email']);
            }
            $mailer->sendAdminAlert($orderPayload);
        } catch (\Throwable $e) {
            error_log('[Order email] ' . $e->getMessage());
        }

        Response::success([
            'id' => $orderId, 'reference' => $ref, 'trackingNumber' => $tracking,
            'total' => $total, 'subtotal' => $calc['subtotal'], 'discount' => $calc['discount'],
            'currency' => 'NGN', 'status' => 'pending', 'items' => $cleanItems, 'shipping' => $cleanShipping,
        ], 'Order created', 201);
    }

    /** GET /orders/{reference} — public track */
    public function show(Request $req, string $reference): void
    {
        $ref = $this->sanitize($reference);
        $order = Database::fetchOne('SELECT * FROM orders WHERE reference = :ref LIMIT 1', ['ref'=>$ref]);
        if (!$order) Response::error('Order not found', 404);
        $items = Database::fetchAll('SELECT variant_id, qty, price, sku FROM order_items WHERE order_id = :oid', ['oid'=>$order['id']]);
        Response::success([
            'id' => (int)$order['id'], 'reference' => $order['reference'], 'email' => $order['email'],
            'total' => (int)$order['total'], 'currency' => $order['currency'], 'status' => $order['status'],
            'trackingNumber' => $order['tracking_number'],
            'shipping' => json_decode($order['shipping_json'] ?? '{}', true),
            'items' => array_map(fn($r)=>['variantId'=>$r['variant_id'],'qty'=>(int)$r['qty'],'price'=>(int)$r['price'],'sku'=>$r['sku']], $items),
            'createdAt' => $order['created_at'], 'paystackRef' => $order['paystack_ref'],
        ]);
    }

    /** GET /orders — admin only, paginated, ?email= filter */
    public function index(Request $req): void
    {
        Auth::requireAdmin($req);
        $page = max(1, (int)($req->query['page'] ?? 1));
        $perPage = min(50, max(1, (int)($req->query['perPage'] ?? 20)));
        $offset = ($page - 1) * $perPage;
        $email = trim((string)($req->query['email'] ?? ''));

        $pdo = Database::connection();
        if ($email !== '') {
            $totalRow = Database::fetchOne('SELECT COUNT(*) as c FROM orders WHERE email = :e', ['e' => $email]);
            $total = (int)($totalRow['c'] ?? 0);
            $stmt = $pdo->prepare('SELECT * FROM orders WHERE email = :e ORDER BY created_at DESC LIMIT :lim OFFSET :off');
            $stmt->bindValue(':e', $email);
        } else {
            $totalRow = Database::fetchOne('SELECT COUNT(*) as c FROM orders');
            $total = (int)($totalRow['c'] ?? 0);
            $stmt = $pdo->prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT :lim OFFSET :off');
        }
        $stmt->bindValue(':lim', $perPage, \PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $data = array_map(fn($r)=>[
            'id'=>(int)$r['id'],'reference'=>$r['reference'],'email'=>$r['email'],'total'=>(int)$r['total'],
            'currency'=>$r['currency'],'status'=>$r['status'],'trackingNumber'=>$r['tracking_number'],'createdAt'=>$r['created_at']
        ], $rows);
        Response::paginated($data, $total, $page, $perPage);
    }

    /** PUT /orders/{reference}/status — admin fulfilment */
    public function updateStatus(Request $req, string $reference): void
    {
        Auth::requireAdmin($req);
        $ref = $this->sanitize($reference);
        $status = strtolower(trim((string)(($req->body ?? [])['status'] ?? '')));
        $allowed = ['pending','processing','shipped','delivered','cancelled','paid','failed'];
        if (!in_array($status, $allowed, true)) Response::error('Invalid status. Use: ' . implode(',', $allowed), 422);
        $order = Database::fetchOne('SELECT id, status FROM orders WHERE reference = :ref LIMIT 1', ['ref' => $ref]);
        if (!$order) Response::error('Order not found', 404);
        Database::execute("UPDATE orders SET status = :st, updated_at = NOW() WHERE reference = :ref", ['st' => $status, 'ref' => $ref]);
        error_log("[Order] $ref status {$order['status']} → $status");
        Response::success(['reference' => $ref, 'status' => $status], 'Order status updated');
    }

    private function sanitize(string $v): string
    {
        return trim(htmlspecialchars(strip_tags($v), ENT_QUOTES, 'UTF-8'));
    }
}
