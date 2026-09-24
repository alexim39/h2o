<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;
use App\Services\PricingService;

final class CouponController
{
    public function validate(Request $req): void
    {
        $code = trim((string)(($req->body ?? [])['code'] ?? $req->query['code'] ?? ''));
        $subtotal = (int)(($req->body ?? [])['subtotal'] ?? 0);
        if ($code === '') Response::error('Coupon code required', 422);
        $c = PricingService::getCoupon($code);
        if (!$c) Response::error('Invalid or expired coupon.', 422);
        if ($subtotal > 0 && $subtotal < (int)($c['min_total'] ?? 0)) {
            Response::error('Coupon requires minimum ' . number_format((int)$c['min_total']) . ' NGN.', 422);
        }
        Response::success([
            'code' => $c['code'], 'percent' => (int)$c['percent'],
            'min_total' => (int)($c['min_total'] ?? 0),
            'discount' => $subtotal > 0 ? (int)round($subtotal * (int)$c['percent'] / 100) : null,
        ], 'Coupon valid');
    }

    public function index(Request $req): void
    {
        Auth::requireAdmin($req);
        $rows = Database::fetchAll('SELECT * FROM coupons ORDER BY created_at DESC');
        Response::success($rows);
    }

    public function store(Request $req): void
    {
        Auth::requireAdmin($req);
        $b = $req->body ?? [];
        $code = strtoupper(trim((string)($b['code'] ?? '')));
        $percent = max(1, min(90, (int)($b['percent'] ?? 10)));
        if ($code === '') Response::error('Code required', 422);
        Database::execute(
            'INSERT INTO coupons (code, percent, min_total, is_active, expires_at) VALUES (:c,:p,:m,:a,:e) ON DUPLICATE KEY UPDATE percent=:p2, min_total=:m2, is_active=:a2, expires_at=:e2',
            [
                'c' => $code, 'p' => $percent, 'm' => (int)($b['min_total'] ?? 0),
                'a' => isset($b['is_active']) ? ((int)$b['is_active'] ? 1 : 0) : 1,
                'e' => $b['expires_at'] ?? null,
                'p2' => $percent, 'm2' => (int)($b['min_total'] ?? 0),
                'a2' => isset($b['is_active']) ? ((int)$b['is_active'] ? 1 : 0) : 1,
                'e2' => $b['expires_at'] ?? null,
            ]
        );
        Response::success(['code' => $code], 'Coupon saved', 201);
    }
}
