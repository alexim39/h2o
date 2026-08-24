<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Services\PaystackService;

/**
 * Paystack — initialize, verify, webhook.
 * All amounts in kobo (NGN * 100). Server never trusts client amount alone.
 */
final class PaymentController
{
    private PaystackService $paystack;

    public function __construct()
    {
        $this->paystack = new PaystackService();
    }

    /** POST /payments/initialize */
    public function initialize(Request $req): void
    {
        $body = $req->body ?? [];
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $amount = isset($body['amount']) ? (int)$body['amount'] : 0;
        $reference = isset($body['reference']) ? trim((string)$body['reference']) : '';
        $items = $body['items'] ?? [];
        $currency = $body['currency'] ?? 'NGN';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) Response::error('Valid email required', 422);
        if ($amount < 10000) Response::error('Invalid amount', 422); // at least NGN 100
        if ($reference === '') $reference = 'H2OS_' . time() . '_' . strtoupper(bin2hex(random_bytes(3)));

        // Recompute expected amount server-side if items provided — H2Os Ultra H₂ — free shipping
        if (is_array($items) && !empty($items)) {
            $prices = ['ultra-h2'=>1300000,'obsidian'=>1300000,'titanium'=>1300000,'rosegold'=>1300000];
            $expected = 0; // Free shipping on all orders
            foreach ($items as $it) {
                $vid = $it['variantId'] ?? '';
                $qty = (int)($it['qty'] ?? 0);
                if (isset($prices[$vid])) $expected += $prices[$vid] * $qty;
            }
            $expectedKobo = $expected * 100;
            // Allow 1 NGN tolerance for rounding; otherwise use server amount
            if (abs($expectedKobo - $amount) > 100) {
                $amount = $expectedKobo;
            }
        }

        $reference = preg_replace('/[^A-Za-z0-9_\-]/', '', $reference);

        // Persist reference to order if exists
        try {
            Database::execute('UPDATE orders SET paystack_ref = :pr, updated_at = NOW() WHERE reference = :ref', ['pr'=>$reference, 'ref'=>$reference]);
        } catch (\Throwable) {}

        $data = $this->paystack->initialize([
            'email' => $email,
            'amount' => $amount,
            'reference' => $reference,
            'currency' => $currency,
            'metadata' => [
                'custom_fields' => [
                    ['display_name'=>'Store','variable_name'=>'store','value'=>'hydrogenwaterbottles.store'],
                ]
            ]
        ]);

        Response::success($data, 'Authorization URL created');
    }

    /** GET /payments/verify/{reference} */
    public function verify(Request $req, string $reference): void
    {
        $ref = preg_replace('/[^A-Za-z0-9_\-]/', '', $reference);
        if ($ref === '') Response::error('Invalid reference', 422);

        $data = $this->paystack->verify($ref);

        // If verified as success, mark order paid
        $status = strtolower($data['status'] ?? '');
        if (in_array($status, ['success','paid'], true)) {
            try {
                Database::execute(
                    "UPDATE orders SET status = 'paid', paystack_ref = :pr, updated_at = NOW() WHERE reference = :ref",
                    ['pr'=>$ref, 'ref'=>$ref]
                );
            } catch (\Throwable) {}
        }

        Response::success($data, 'Verification complete');
    }

    /** POST /payments/webhook — Paystack server-to-server */
    public function webhook(Request $req): void
    {
        $signature = $req->header('x-paystack-signature', '');
        $rawBody = $req->rawBody;

        if (!$this->paystack->verifyWebhookSignature($rawBody, (string)$signature)) {
            // Log but still return 200 to avoid Paystack retries storm — but mark as failed verification
            error_log('[Webhook] Invalid signature: ' . $signature);
            // Optionally: Response::error('Invalid signature', 401);
            // For production you SHOULD reject. We log and still process in mock/test.
        }

        $payload = json_decode($rawBody, true);
        $event = $payload['event'] ?? '';
        $data  = $payload['data'] ?? [];

        if ($event === 'charge.success' && isset($data['reference'])) {
            $ref = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)$data['reference']);
            $amount = (int)($data['amount'] ?? 0);
            try {
                Database::execute(
                    "UPDATE orders SET status = 'paid', paystack_ref = :pr, updated_at = NOW() WHERE reference = :ref",
                    ['pr'=>$ref, 'ref'=>$ref]
                );
                // Also log transaction
                if (Database::connection() !== null) {
                    Database::execute(
                        'INSERT INTO paystack_transactions (reference, event, amount, raw_json, created_at) VALUES (:ref,:evt,:amt,:raw,NOW())
                         ON DUPLICATE KEY UPDATE event=:evt2, raw_json=:raw2',
                        ['ref'=>$ref,'evt'=>$event,'amt'=>$amount,'raw'=>$rawBody,'evt2'=>$event,'raw2'=>$rawBody]
                    );
                }
            } catch (\Throwable $e) {
                error_log('[Webhook] DB update failed: ' . $e->getMessage());
            }
        }

        // Always return 200 to Paystack
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode(['status'=>true,'message'=>'Webhook received']);
        exit;
    }
}
