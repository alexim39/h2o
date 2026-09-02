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

        Response::success(['username' => $row['username']], 'Login successful');
    }

    public function me(Request $req): void
    {
        // Simple check — frontend calls to verify session; for stateless we just require username
        $username = trim((string)($req->query['username'] ?? ''));
        if ($username === '') Response::error('Username required', 422);
        $row = Database::fetchOne('SELECT id, username FROM admins WHERE username = :u LIMIT 1', ['u' => $username]);
        if (!$row) Response::error('Not found', 404);
        Response::success($row);
    }
}
