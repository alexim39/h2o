<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;

final class QrController
{
    /** POST /qr/generate (admin) {count, product_sku, ppm_video_url} */
    public function generate(Request $req): void
    {
        Auth::requireAdmin($req);
        $b = $req->body ?? [];
        $count = max(1, min(500, (int)($b['count'] ?? 20)));
        $sku = trim((string)($b['product_sku'] ?? 'H2OS-ULTRA-H2'));
        $video = trim((string)($b['ppm_video_url'] ?? '/videos/hydrogen-h2o-test.mp4'));
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $code = 'H2O-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            try {
                Database::execute(
                    'INSERT INTO qr_codes (code, product_sku, ppm_video_url) VALUES (:c,:s,:v)',
                    ['c' => $code, 's' => $sku, 'v' => $video]
                );
                $codes[] = $code;
            } catch (\Throwable) { $i--; }
            if (count($codes) >= $count) break;
        }
        Response::success(['codes' => $codes, 'verify_base' => 'https://hydrogenwaterbottles.store/verify/'], 'QR batch generated', 201);
    }

    /** GET /qr (admin list) */
    public function index(Request $req): void
    {
        Auth::requireAdmin($req);
        $rows = Database::fetchAll('SELECT * FROM qr_codes ORDER BY created_at DESC LIMIT 500');
        Response::success($rows);
    }

    /** GET /verify/:code (public) + GET /qr/:code alias */
    public function verify(Request $req, string $code): void
    {
        $code = strtoupper(trim(preg_replace('/[^A-Za-z0-9\-]/', '', $code)));
        if ($code === '') Response::error('Code required', 422);
        $row = Database::fetchOne('SELECT * FROM qr_codes WHERE code = :c LIMIT 1', ['c' => $code]);
        if (!$row || (int)($row['is_active'] ?? 0) !== 1) {
            Response::error('Not genuine — code not found. Report via WhatsApp +2348080386208.', 404);
        }
        try {
            Database::execute('UPDATE qr_codes SET scans = scans + 1 WHERE code = :c', ['c' => $code]);
            $row['scans'] = (int)$row['scans'] + 1;
        } catch (\Throwable) {}
        $product = null;
        if (!empty($row['product_sku'])) {
            try {
                $product = Database::fetchOne('SELECT sku, name, brand FROM products WHERE sku = :s LIMIT 1', ['s' => $row['product_sku']]);
            } catch (\Throwable) {}
        }
        Response::success([
            'code' => $row['code'], 'genuine' => true,
            'product_sku' => $row['product_sku'], 'product' => $product,
            'ppm_video_url' => $row['ppm_video_url'] ?? '/videos/hydrogen-h2o-test.mp4',
            'scans' => (int)($row['scans'] ?? 0),
        ], 'Genuine H2Os ✓');
    }
}
