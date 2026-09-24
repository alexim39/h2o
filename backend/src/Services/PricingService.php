<?php
declare(strict_types=1);
namespace App\Services;

use App\Core\Database;

/**
 * Central pricing — single source for variant prices, coupons, totals.
 * Replaces duplicated price-maps in OrderController + PaymentController.
 */
final class PricingService
{
    /** @return array<string, array{price:int, sku:string}> */
    public static function priceMap(): array
    {
        $rows = Database::fetchAll('SELECT variant_key, price, sku FROM product_variants WHERE is_active = 1');
        $map = [];
        foreach ($rows as $r) $map[$r['variant_key']] = ['price' => (int)$r['price'], 'sku' => $r['sku']];
        return $map;
    }

    /** Validate coupon, return row or null */
    public static function getCoupon(string $code): ?array
    {
        $code = strtoupper(trim($code));
        if ($code === '') return null;
        try {
            $row = Database::fetchOne('SELECT * FROM coupons WHERE code = :c LIMIT 1', ['c' => $code]);
        } catch (\Throwable) {
            return null; // table may not exist yet
        }
        if (!$row) return null;
        if ((int)($row['is_active'] ?? 0) !== 1) return null;
        if (!empty($row['expires_at']) && strtotime($row['expires_at']) < time()) return null;
        return $row;
    }

    /**
     * @param array<int, array{variantId:string, qty:int}> $items
     * @return array{subtotal:int, discount:int, total:int, lines:array, coupon:?array}
     */
    public static function totals(array $items, ?string $couponCode = null): array
    {
        $map = self::priceMap();
        if (empty($map)) throw new \RuntimeException('No products available — please add products via MGT', 500);
        $subtotal = 0;
        $lines = [];
        foreach ($items as $it) {
            $vid = $it['variantId'] ?? '';
            $qty = max(1, min(10, (int)($it['qty'] ?? 1)));
            if (!isset($map[$vid])) throw new \RuntimeException("Invalid variant: $vid — not in catalog.", 422);
            $price = $map[$vid]['price'];
            $subtotal += $price * $qty;
            $lines[] = ['variantId' => $vid, 'qty' => $qty, 'price' => $price, 'sku' => $map[$vid]['sku']];
        }
        $discount = 0;
        $coupon = null;
        if ($couponCode) {
            $coupon = self::getCoupon($couponCode);
            if (!$coupon) throw new \RuntimeException('Invalid or expired coupon.', 422);
            $minTotal = (int)($coupon['min_total'] ?? 0);
            if ($subtotal < $minTotal) throw new \RuntimeException('Coupon requires minimum ' . number_format($minTotal) . ' NGN.', 422);
            $percent = max(0, min(90, (int)($coupon['percent'] ?? 0)));
            $discount = (int)round($subtotal * $percent / 100);
        }
        // Free shipping always
        $total = $subtotal - $discount;
        return ['subtotal' => $subtotal, 'discount' => $discount, 'total' => $total, 'lines' => $lines, 'coupon' => $coupon];
    }

    /** Decrement stock for paid order items, returns low-stock variants */
    public static function decrementStock(array $lines): array
    {
        $low = [];
        foreach ($lines as $ln) {
            try {
                Database::execute(
                    'UPDATE product_variants SET stock = GREATEST(0, stock - :qty) WHERE variant_key = :vk',
                    ['qty' => (int)$ln['qty'], 'vk' => $ln['variantId']]
                );
                $row = Database::fetchOne('SELECT variant_key, stock FROM product_variants WHERE variant_key = :vk LIMIT 1', ['vk' => $ln['variantId']]);
                if ($row && (int)$row['stock'] <= 15) {
                    $low[] = $row;
                    error_log('[Stock] LOW: ' . $row['variant_key'] . ' = ' . $row['stock']);
                }
            } catch (\Throwable $e) {
                error_log('[Stock] decrement failed: ' . $e->getMessage());
            }
        }
        return $low;
    }
}
