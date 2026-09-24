<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

/**
 * Admin auth — DB-managed (h2os / alexim39)
 */
final class AdminController
{
    public function login(Request $req): void
    {
        $body = $req->body ?? [];
        $username = trim((string)($body['username'] ?? $body['user'] ?? ''));
        $password = (string)($body['password'] ?? $body['pass'] ?? '');

        if ($username === '' || $password === '') {
            Response::error('Username and password required', 422);
        }

        // Rate limit: basic delay to slow brute force
        usleep(120000);

        $row = Database::fetchOne('SELECT id, username, password_hash FROM admins WHERE username = :u LIMIT 1', ['u' => $username]);
        if (!$row || !isset($row['password_hash']) || !password_verify($password, $row['password_hash'])) {
            // Also support legacy env fallback for first deploy before admins table seeded
            $envUser = (string)\Config::get('MGT_USER', 'h2os');
            $envPass = (string)\Config::get('MGT_PASS', '');
            if ($envUser !== '' && $envPass !== '' && $username === $envUser && hash_equals($envPass, $password)) {
                Response::success(['username' => $username, 'source' => 'env'], 'Login successful');
                return;
            }
            Response::error('Invalid username or password.', 401);
        }

        // Rehash if needed (cost upgrade)
        if (password_needs_rehash($row['password_hash'], PASSWORD_BCRYPT)) {
            $newHash = password_hash($password, PASSWORD_BCRYPT);
            try { Database::execute('UPDATE admins SET password_hash = :h WHERE id = :id', ['h' => $newHash, 'id' => $row['id']]); } catch (\Throwable) {}
        }

        $token = \App\Core\Auth::issue((int)$row['id'], $row['username']);
        Response::success(['username' => $row['username'], 'token' => $token, 'expiresIn' => 12 * 3600], 'Login successful');
    }

    public function me(Request $req): void
    {
        $admin = \App\Core\Auth::requireAdmin($req);
        Response::success(['username' => $admin['username']]);
    }

    public function logout(Request $req): void
    {
        $auth = $req->header('authorization', '');
        if (str_starts_with(strtolower($auth), 'bearer ')) {
            \App\Core\Auth::revoke(trim(substr($auth, 7)));
        }
        Response::success(null, 'Logged out');
    }

    public function lowStock(Request $req): void
    {
        \App\Core\Auth::requireAdmin($req);
        $threshold = max(1, min(100, (int)($req->query['threshold'] ?? 15)));
        $rows = Database::fetchAll(
            'SELECT v.variant_key, v.name, v.sku, v.stock, v.price, p.sku as product_sku, p.name as product_name FROM product_variants v JOIN products p ON p.id = v.product_id WHERE v.is_active = 1 AND v.stock <= :t ORDER BY v.stock ASC',
            ['t' => $threshold]
        );
        Response::success(['threshold' => $threshold, 'items' => $rows, 'count' => count($rows)]);
    }

    public function analytics(Request $req): void
    {
        \App\Core\Auth::requireAdmin($req);
        $orders = Database::fetchOne('SELECT COUNT(*) c, COALESCE(SUM(CASE WHEN status = "paid" THEN total ELSE 0 END),0) revenue, COALESCE(SUM(total),0) gmv FROM orders');
        $products = Database::fetchOne('SELECT COUNT(*) c FROM products WHERE is_active = 1');
        $reviews = Database::fetchOne('SELECT COUNT(*) c FROM reviews WHERE is_approved = 1');
        $low = Database::fetchOne('SELECT COUNT(*) c FROM product_variants WHERE is_active = 1 AND stock <= 15');
        Response::success([
            'orders' => (int)($orders['c'] ?? 0),
            'revenue_paid' => (int)($orders['revenue'] ?? 0),
            'gmv' => (int)($orders['gmv'] ?? 0),
            'products' => (int)($products['c'] ?? 0),
            'reviews' => (int)($reviews['c'] ?? 0),
            'low_stock' => (int)($low['c'] ?? 0),
        ]);
    }
}
