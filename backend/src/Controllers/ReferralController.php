<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;

final class ReferralController
{
    /** POST /referrals/create {email} → code (public) */
    public function create(Request $req): void
    {
        $email = strtolower(trim((string)(($req->body ?? [])['email'] ?? '')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) Response::error('Valid email required', 422);
        $existing = Database::fetchOne('SELECT code FROM referrals WHERE referrer_email = :e AND referred_email IS NULL LIMIT 1', ['e' => $email]);
        if ($existing) {
            Response::success(['code' => $existing['code'], 'link' => 'https://hydrogenwaterbottles.store/r/' . $existing['code']]);
            return;
        }
        for ($i = 0; $i < 5; $i++) {
            $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            try {
                Database::execute('INSERT INTO referrals (code, referrer_email) VALUES (:c,:e)', ['c' => $code, 'e' => $email]);
                Response::success(['code' => $code, 'link' => 'https://hydrogenwaterbottles.store/r/' . $code], 'Referral link created', 201);
                return;
            } catch (\Throwable) {}
        }
        Response::error('Could not create code', 500);
    }

    /** GET /referrals/code/:code → validate (public) */
    public function resolve(Request $req, string $code): void
    {
        $code = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $code)));
        $row = Database::fetchOne('SELECT code, referrer_email FROM referrals WHERE code = :c LIMIT 1', ['c' => $code]);
        if (!$row) Response::error('Invalid referral code', 404);
        Response::success(['code' => $row['code'], 'reward' => 10000]);
    }

    /** POST /referrals/attach {reference, code, email} — called at order create */
    public function attach(Request $req): void
    {
        $b = $req->body ?? [];
        $code = strtoupper(trim((string)($b['code'] ?? '')));
        $ref = trim((string)($b['reference'] ?? ''));
        $email = strtolower(trim((string)($b['email'] ?? '')));
        if ($code === '' || $ref === '') Response::error('code + reference required', 422);
        $referrer = Database::fetchOne('SELECT code, referrer_email FROM referrals WHERE code = :c LIMIT 1', ['c' => $code]);
        if (!$referrer) Response::error('Invalid referral code', 422);
        if ($email !== '' && $email === strtolower($referrer['referrer_email'])) Response::error('Self-referral not allowed', 422);
        try {
            Database::execute(
                'INSERT INTO referrals (code, referrer_email, referred_email, referred_reference) VALUES (:c,:r,:e,:ref)',
                ['c' => $code . '-' . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4)), 'r' => $referrer['referrer_email'], 'e' => $email ?: null, 'ref' => $ref]
            );
        } catch (\Throwable $e) {
            error_log('[Referral] attach failed: ' . $e->getMessage());
        }
        // Best-effort store on order (column may not exist yet)
        try { Database::execute('UPDATE orders SET referral_code = :c WHERE reference = :ref', ['c' => $code, 'ref' => $ref]); } catch (\Throwable) {}
        Response::success(['code' => $code], 'Referral attached');
    }

    /** Called on paid — approve referrals for this reference */
    public static function approveForReference(string $ref): void
    {
        try {
            Database::execute("UPDATE referrals SET status = 'approved' WHERE referred_reference = :ref AND status = 'pending'", ['ref' => $ref]);
        } catch (\Throwable $e) {
            error_log('[Referral] approve failed: ' . $e->getMessage());
        }
    }

    /** GET /referrals (admin) */
    public function index(Request $req): void
    {
        Auth::requireAdmin($req);
        $rows = Database::fetchAll('SELECT * FROM referrals ORDER BY created_at DESC LIMIT 500');
        Response::success($rows);
    }

    /** PUT /referrals/:id (admin paid/approved) */
    public function update(Request $req, string $id): void
    {
        Auth::requireAdmin($req);
        $status = strtolower(trim((string)(($req->body ?? [])['status'] ?? '')));
        if (!in_array($status, ['approved','paid'], true)) Response::error('Invalid status', 422);
        Database::execute('UPDATE referrals SET status = :s WHERE id = :id', ['s' => $status, 'id' => $id]);
        Response::success(['id' => (int)$id, 'status' => $status], 'Referral updated');
    }
}
