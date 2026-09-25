<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;

final class LeadController
{
    public function store(Request $req): void
    {
        $b = $req->body ?? [];
        $name = trim((string)($b['name'] ?? ''));
        $phone = trim((string)($b['phone'] ?? $b['whatsapp'] ?? ''));
        $goal = trim((string)($b['goal'] ?? ''));
        $activity = trim((string)($b['activity'] ?? ''));
        $sku = trim((string)($b['recommended_sku'] ?? $b['sku'] ?? ''));
        $source = trim((string)($b['source'] ?? 'protocol'));
        if ($phone === '' && $name === '') Response::error('Name or WhatsApp required', 422);
        if ($phone !== '' && !preg_match('/^[\+0-9\s\-\(\)]{7,20}$/', $phone)) Response::error('Invalid phone', 422);
        Database::execute(
            'INSERT INTO leads (name, phone, goal, activity, recommended_sku, source) VALUES (:n,:p,:g,:a,:s,:src)',
            ['n' => $name ?: null, 'p' => $phone ?: null, 'g' => $goal ?: null, 'a' => $activity ?: null, 's' => $sku ?: null, 'src' => $source ?: 'protocol']
        );
        Response::success(['recommended_sku' => $sku], 'Lead saved — we will WhatsApp you', 201);
    }

    public function index(Request $req): void
    {
        Auth::requireAdmin($req);
        $rows = Database::fetchAll('SELECT * FROM leads ORDER BY created_at DESC LIMIT 200');
        Response::success($rows);
    }
}
