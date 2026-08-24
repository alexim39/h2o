<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;

/**
 * Chat proxy for DeepSeek AI — H2Os Assistant Doctor
 * Keeps API key server-side. Frontend POSTs {model, messages} here.
 * If DEEPSEEK_API_KEY is mock, returns canned response directly.
 */
final class ChatController
{
    public function chat(Request $req): void
    {
        $body = $req->body ?? [];
        $messages = $body['messages'] ?? null;
        $model = $body['model'] ?? 'deepseek-chat';

        if (!is_array($messages) || empty($messages)) {
            Response::error('Messages required', 422);
        }

        $apiKey = (string)\Config::get('DEEPSEEK_API_KEY', (string)\Config::get('deepseekApiKey', 'sk-deepseek-mock'));
        $apiUrl = (string)\Config::get('DEEPSEEK_API_URL', 'https://api.deepseek.com/chat/completions');

        // Mock mode — return canned premium response without external call
        if (str_contains($apiKey, 'mock') || $apiKey === '' || str_contains($apiKey, 'REPLACE')) {
            $lastUser = '';
            foreach (array_reverse($messages) as $m) {
                if (($m['role'] ?? '') === 'user') { $lastUser = (string)$m['content']; break; }
            }
            $canned = $this->canned($lastUser);
            Response::success([
                'id' => 'chatcmpl-mock-' . bin2hex(random_bytes(4)),
                'object' => 'chat.completion',
                'created' => time(),
                'model' => $model,
                'choices' => [
                    ['index'=>0, 'message'=>['role'=>'assistant','content'=>$canned], 'finish_reason'=>'stop']
                ],
                'usage' => ['prompt_tokens'=> 120, 'completion_tokens'=> 180, 'total_tokens'=>300]
            ], 'Mock DeepSeek response (replace key for live)');
            return;
        }

        // Real proxy — forward to DeepSeek
        $payload = json_encode([
            'model' => $model,
            'messages' => $messages,
            'temperature' => $body['temperature'] ?? 0.7,
            'max_tokens' => $body['max_tokens'] ?? 700,
        ], JSON_UNESCAPED_SLASHES);

        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT => 18,
            CURLOPT_CONNECTTIMEOUT => 6,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($resp === false || $err !== '') {
            error_log('[Chat] DeepSeek error: ' . $err);
            Response::error('AI temporarily unavailable — try again or WhatsApp +2348080386208', 502);
        }

        $decoded = json_decode($resp, true);
        if (!is_array($decoded)) {
            Response::error('Invalid AI response', 502);
        }

        // Pass through DeepSeek response
        http_response_code($code && $code >= 200 && $code < 300 ? 200 : $code);
        header('Content-Type: application/json');
        echo json_encode($decoded);
        exit;
    }

    private function canned(string $userText): string
    {
        $t = strtolower($userText);
        if (str_contains($t, 'price') || str_contains($t, 'how much') || str_contains($t, 'cost')) {
            return "Ultra H₂ is **₦1,300,000** (was ₦1,541,000 — save ₦241,000). Free express 1–3 days Nigeria, Paystack secure, 30-day guarantee. We also have other H2Os & curated brands from ₦890k–₦1.78M in Products. Shall I add Ultra H₂ to cart or connect you to a human at +2348080386208?";
        }
        if (str_contains($t, 'how to use') || str_contains($t, 'how do i use')) {
            return "Ultra H₂ ritual: 1) Fill to max line. 2) Press once → 3 min, twice → 6 min. 3) Watch bubbles — hydrogen active. 4) Sip within 30 mins. See Videos → How to Use (90-sec). Want the link?";
        }
        if (str_contains($t, 'benefit') || str_contains($t, 'health') || str_contains($t, 'work')) {
            return "Peer-reviewed: H₂ selectively neutralizes •OH, supports mitochondrial recovery, crosses blood-brain barrier (clarity), eases oxidative aging & gut health. Ultra H₂ = 1600 ppb via SPE/PEM platinum titanium. Not medical advice, but ritual is well-documented. Shall I share science or connect you to Dr. H2Os human?";
        }
        if (str_contains($t, 'whatsapp') || str_contains($t, 'human') || str_contains($t, 'real person')) {
            return "I can connect you to a real human now on WhatsApp **+2348080386208**. Would you like me to open WhatsApp?";
        }
        return "I’m Dr. H2Os — your H2Os Assistant. I know Ultra H₂ (and our 6 hydrogen brands), benefits, usage, pricing, shipping. Ask me anything — or say “speak to human” and I’ll open WhatsApp +2348080386208.";
    }
}
