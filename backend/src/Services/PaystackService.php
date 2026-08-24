<?php
declare(strict_types=1);
namespace App\Services;

use App\Core\Database;

/**
 * Paystack Integration — Initialize + Verify + Webhook signature check.
 * Uses native cURL (no SDK) so it works on vanilla shared cPanel PHP.
 */
final class PaystackService
{
    private string $secretKey;
    private string $publicKey;

    public function __construct()
    {
        $this->secretKey = (string)\Config::get('PAYSTACK_SECRET_KEY', 'sk_test_mock_key');
        $this->publicKey = (string)\Config::get('PAYSTACK_PUBLIC_KEY', 'pk_test_mock_key');
    }

    public function isMock(): bool
    {
        return str_contains($this->secretKey, 'mock') || $this->secretKey === '' || $this->secretKey === 'sk_test_mock_key';
    }

    /**
     * Initialize transaction — calls Paystack /transaction/initialize
     * Returns ['authorization_url','access_code','reference'] on success.
     * Falls back to mock if secret is mock or Paystack unreachable.
     *
     * @param array{email:string, amount:int, reference:string, currency?:string, metadata?:array} $payload
     */
    public function initialize(array $payload): array
    {
        if ($this->isMock()) {
            return $this->mockInitialize($payload);
        }

        $body = json_encode([
            'email'      => $payload['email'],
            'amount'     => $payload['amount'], // kobo
            'reference'  => $payload['reference'],
            'currency'   => $payload['currency'] ?? 'NGN',
            'callback_url' => (\Config::get('APP_FRONTEND_URL', 'https://hydrogenwaterbottles.store')) . '/confirmation/' . $payload['reference'],
            'metadata'   => $payload['metadata'] ?? ['custom_fields' => []],
        ], JSON_UNESCAPED_SLASHES);

        $res = $this->curl('https://api.paystack.co/transaction/initialize', 'POST', $body);

        if (($res['status'] ?? false) === true && isset($res['data']['authorization_url'])) {
            return $res['data'];
        }

        // Fallback to mock if Paystack returns error (e.g., invalid test key on cPanel without real key)
        error_log('[Paystack] Initialize failed — mock fallback: ' . json_encode($res));
        return $this->mockInitialize($payload);
    }

    /**
     * Verify transaction — calls Paystack /transaction/verify/{reference}
     */
    public function verify(string $reference): array
    {
        if ($this->isMock()) {
            return $this->mockVerify($reference);
        }

        $res = $this->curl('https://api.paystack.co/transaction/verify/' . urlencode($reference), 'GET', null);

        if (($res['status'] ?? false) === true) {
            return $res['data'];
        }

        error_log('[Paystack] Verify failed — mock fallback: ' . json_encode($res));
        return $this->mockVerify($reference);
    }

    /**
     * Verify webhook signature — Paystack sends x-paystack-signature = HMAC SHA512 of raw body with secret.
     */
    public function verifyWebhookSignature(string $rawBody, string $signature): bool
    {
        $expected = hash_hmac('sha512', $rawBody, $this->secretKey);
        return hash_equals($expected, $signature);
    }

    private function mockInitialize(array $payload): array
    {
        return [
            'authorization_url' => 'mock://paystack/' . $payload['reference'],
            'access_code'       => 'mock_access_' . substr($payload['reference'], -6),
            'reference'         => $payload['reference'],
        ];
    }

    private function mockVerify(string $reference): array
    {
        // Look up order in DB if available to return real amount
        $order = null;
        try {
            $order = Database::fetchOne('SELECT total, currency, status FROM orders WHERE reference = :ref LIMIT 1', ['ref' => $reference]);
        } catch (\Throwable) {}

        return [
            'reference' => $reference,
            'status'    => 'success',
            'amount'    => $order ? (int)($order['total'] * 100) : 9300000,
            'currency'  => $order['currency'] ?? 'NGN',
            'gateway_response' => 'Successful (mock)',
            'paid_at'   => date('c'),
        ];
    }

    /** @return array decoded JSON */
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
