<?php
declare(strict_types=1);
namespace App\Core;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;

/**
 * Simple token auth for MGT admin.
 * Token = random 64-char, stored in admin_sessions, 12h expiry.
 */
final class Auth
{
    public static function issue(int $adminId, string $username): string
    {
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + 12 * 3600);
        try {
            Database::execute(
                'INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES (:aid, :tok, :exp)',
                ['aid' => $adminId, 'tok' => hash('sha256', $token), 'exp' => $expiry]
            );
        } catch (\Throwable $e) {
            error_log('[Auth] issue failed: ' . $e->getMessage());
        }
        return $token;
    }

    public static function adminFromRequest(Request $req): ?array
    {
        $auth = $req->header('authorization', '');
        if ($auth === '' || !str_starts_with(strtolower($auth), 'bearer ')) return null;
        $token = trim(substr($auth, 7));
        if ($token === '') return null;
        try {
            $row = Database::fetchOne(
                'SELECT s.admin_id, s.expires_at, a.username FROM admin_sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token = :t LIMIT 1',
                ['t' => hash('sha256', $token)]
            );
            if (!$row) return null;
            if (strtotime($row['expires_at']) < time()) return null;
            return $row;
        } catch (\Throwable) {
            return null;
        }
    }

    public static function requireAdmin(Request $req): array
    {
        $admin = self::adminFromRequest($req);
        if (!$admin) Response::error('Unauthorized — admin login required', 401);
        return $admin; // @phpstan-ignore-line (Response::error exits)
    }

    public static function revoke(string $token): void
    {
        try {
            Database::execute('DELETE FROM admin_sessions WHERE token = :t', ['t' => hash('sha256', $token)]);
        } catch (\Throwable) {}
    }
}
