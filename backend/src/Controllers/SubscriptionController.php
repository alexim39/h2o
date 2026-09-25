<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;

final class SubscriptionController
{
    /** POST /subscriptions (public — after paid order or standalone) */
    public function store(Request $req): void
    {
        $b = $req->body ?? [];
        // Support single or bulk: {email, variant_key, qty} or {email, items:[{variantId,qty}]}
        $email = strtolower(trim((string)($b['email'] ?? '')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) Response::error('Valid email required', 422);
        $items = [];
        if (isset($b['items']) && is_array($b['items'])) {
            foreach ($b['items'] as $it) {
                $vk = trim((string)($it['variantId'] ?? $it['variant_key'] ?? ''));
                if ($vk === '') continue;
                $items[] = ['variant_key' => $vk, 'qty' => max(1, min(10, (int)($it['qty'] ?? 1)))];
            }
        } elseif (!empty($b['variant_key'])) {
            $items[] = ['variant_key' => trim((string)$b['variant_key']), 'qty' => max(1, min(10, (int)($b['qty'] ?? 1)))];
        }
        if (empty($items)) Response::error('variant_key or items required', 422);
        // Validate variant exists
        $map = \App\Services\PricingService::priceMap();
        $ids = [];
        foreach ($items as $it) {
            if (!isset($map[$it['variant_key']])) Response::error('Invalid variant: ' . $it['variant_key'], 422);
            Database::execute(
                'INSERT INTO subscriptions (email, variant_key, qty, status, next_charge_at) VALUES (:e,:v,:q,"active", DATE_ADD(CURDATE(), INTERVAL 30 DAY))',
                ['e' => $email, 'v' => $it['variant_key'], 'q' => $it['qty']]
            );
            $ids[] = (int)Database::lastInsertId();
        }
        Response::success(['ids' => $ids, 'email' => $email, 'next_charge' => date('Y-m-d', strtotime('+30 days'))], 'Subscription active — monthly delivery', 201);
    }

    /** GET /subscriptions (admin) */
    public function index(Request $req): void
    {
        Auth::requireAdmin($req);
        $status = trim((string)($req->query['status'] ?? ''));
        if ($status !== '' && in_array($status, ['active','paused','cancelled'], true)) {
            $rows = Database::fetchAll('SELECT * FROM subscriptions WHERE status = :s ORDER BY created_at DESC LIMIT 500', ['s' => $status]);
        } else {
            $rows = Database::fetchAll('SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 500');
        }
        Response::success($rows);
    }

    /** PUT /subscriptions/{id} (admin — pause/cancel/reactivate) */
    public function update(Request $req, string $id): void
    {
        Auth::requireAdmin($req);
        $status = strtolower(trim((string)(($req->body ?? [])['status'] ?? '')));
        if (!in_array($status, ['active','paused','cancelled'], true)) Response::error('Invalid status', 422);
        Database::execute('UPDATE subscriptions SET status = :s WHERE id = :id', ['s' => $status, 'id' => $id]);
        Response::success(['id' => (int)$id, 'status' => $status], 'Subscription updated');
    }
}
