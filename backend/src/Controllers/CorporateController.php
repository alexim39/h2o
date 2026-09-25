<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;

final class CorporateController
{
    public function store(Request $req): void
    {
        $b = $req->body ?? [];
        $company = trim((string)($b['company'] ?? ''));
        $contact = trim((string)($b['contact'] ?? ''));
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $phone = trim((string)($b['phone'] ?? ''));
        $qty = max(1, min(500, (int)($b['qty'] ?? 20)));
        $message = trim((string)($b['message'] ?? ''));
        if ($company === '') Response::error('Company required', 422);
        if ($phone === '' && $email === '') Response::error('Phone or email required', 422);
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) Response::error('Invalid email', 422);
        Database::execute(
            'INSERT INTO corporate_leads (company, contact, email, phone, qty, message) VALUES (:c,:ct,:e,:p,:q,:m)',
            ['c' => $company, 'ct' => $contact ?: null, 'e' => $email ?: null, 'p' => $phone ?: null, 'q' => $qty, 'm' => $message ?: null]
        );
        Response::success(['qty' => $qty, 'estimate' => $qty * 350000], 'Quote requested — we will call you', 201);
    }

    public function index(Request $req): void
    {
        Auth::requireAdmin($req);
        $rows = Database::fetchAll('SELECT * FROM corporate_leads ORDER BY created_at DESC LIMIT 200');
        Response::success($rows);
    }

    public function update(Request $req, string $id): void
    {
        Auth::requireAdmin($req);
        $status = strtolower(trim((string)(($req->body ?? [])['status'] ?? '')));
        if (!in_array($status, ['new','pitched','won','lost'], true)) Response::error('Invalid status', 422);
        Database::execute('UPDATE corporate_leads SET status = :s WHERE id = :id', ['s' => $status, 'id' => $id]);
        Response::success(['id' => (int)$id, 'status' => $status], 'Pipeline updated');
    }
}
