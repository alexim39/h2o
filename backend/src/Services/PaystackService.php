<?php
declare(strict_types=1);
namespace App\Services;

/**
 * Paystack — Real only (no mock).
 */
final class PaystackService
{
    private string $secretKey;
    private string $publicKey;

    public function __construct()
    {
        $this->secretKey = (string)\Config::get('PAYSTACK_SECRET_KEY', '');
        $this->publicKey = (string)\Config::get('PAYSTACK_PUBLIC_KEY', '');
    }

    public function isMock(): bool
    {
        $k = strtolower(trim($this->secretKey));
        return $k === '' || str_contains($k, 'mock') || str_contains($k, 'replace') || $k === 'sk_test_mock_key';
    }

    public function initialize(array $payload): array
    {
        if ($this->isMock()) {
            throw new \RuntimeException('Paystack not configured — set PAYSTACK_SECRET_KEY in .env');
        }

        $body = json_encode([
            'email'      => $payload['email'],
            'amount'     => $payload['amount'],
            'reference'  => $payload['reference'],
            'currency'   => $payload['currency'] ?? 'NGN',
            'callback_url' => (\Config::get('APP_FRONTEND_URL', 'https://hydrogenwaterbottles.store')) . '/confirmation/' . $payload['reference'],
            'metadata'   => $payload['metadata'] ?? ['custom_fields' => []],
        ], JSON_UNESCAPED_SLASHES);

        $res = $this->curl('https://api.paystack.co/transaction/initialize', 'POST', $body);

        if (($res['status'] ?? false) === true && isset($res['data']['authorization_url'])) {
            return $res['data'];
        }

        error_log('[Paystack] Initialize failed: ' . json_encode($res));
        throw new \RuntimeException($res['message'] ?? 'Paystack initialize failed', 502);
    }

    public function verify(string $reference): array
    {
        if ($this->isMock()) {
            throw new \RuntimeException('Paystack not configured', 502);
        }

        $res = $this->curl('https://api.paystack.co/transaction/verify/' . urlencode($reference), 'GET', null);

        if (($res['status'] ?? false) === true) {
            return $res['data'];
        }

        error_log('[Paystack] Verify failed: ' . json_encode($res));
        throw new \RuntimeException($res['message'] ?? 'Paystack verify failed', 502);
    }

    public function verifyWebhookSignature(string $rawBody, string $signature): bool
    {
        if ($this->isMock()) return false;
        $expected = hash_hmac('sha512', $rawBody, $this->secretKey);
        return hash_equals($expected, $signature);
    }

    private function curl(string $url, string $method, ?string $body): array
    {
        $ch = curl_init($url);
        $headers = [
            'Authorization: Bearer ' . $this->secretKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ];
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 12,
            CURLOPT_CONNECTTIMEOUT => 6,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

        $resp = curl_exec($ch);
        $err  = curl_error($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($resp === false || $err !== '') {
            error_log("[Paystack CURL] $method $url — $err (HTTP $code)");
            return ['status' => false, 'message' => $err ?: 'cURL failed', 'http_code' => $code];
        }

        $decoded = json_decode((string)$resp, true);
        return is_array($decoded) ? $decoded : ['status' => false, 'message' => 'Invalid JSON', 'raw' => $resp];
    }
}
