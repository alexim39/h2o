<?php
declare(strict_types=1);
namespace App\Services;

/**
 * H2Os — Premium Luxury Email Service
 * Sends branded HTML emails for order confirmation (user) + new order alert (admin).
 * Uses PHP mail() with HTML + text fallback. On cPanel, ensure SPF + domain has mail enabled.
 * For SMTP (recommended), set SMTP_HOST/USER/PASS in .env and install PHPMailer (composer require phpmailer/phpmailer).
 */
final class EmailService
{
    private string $fromEmail;
    private string $fromName;
    private string $replyTo;

    public function __construct()
    {
        $this->fromEmail = (string)\Config::get('MAIL_FROM_ADDRESS', 'noreply@hydrogenwaterbottles.store');
        $this->fromName  = (string)\Config::get('MAIL_FROM_NAME', 'H2Os — Health | Quality | Luxury');
        $this->replyTo   = (string)\Config::get('MAIL_REPLY_TO', 'sales@hydrogenwaterbottles.store');
    }

    /**
     * Send user order confirmation — premium luxury template.
     * @param array $order ['reference','total','currency','trackingNumber','createdAt','items'=>[...],'shipping'=>[...]]
     * @param string $toEmail user email
     */
    public function sendUserConfirmation(array $order, string $toEmail): bool
    {
        $subject = 'Your H2Os Ritual is Confirmed — ' . $order['reference'] . ' • Health | Quality | Luxury';
        $html = $this->userTemplate($order);
        $text = $this->userText($order);
        return $this->send($toEmail, $subject, $html, $text);
    }

    /**
     * Send admin new order alert to sales@ + schooltraz@gmail.com
     */
    public function sendAdminAlert(array $order): void
    {
        $admins = [
            'sales@hydrogenwaterbottles.store',
            'schooltraz@gmail.com',
        ];
        $subject = '🔔 New H2Os Order — ' . $order['reference'] . ' — NGN ' . number_format((int)$order['total']);
        $html = $this->adminTemplate($order);
        $text = $this->adminText($order);
        foreach ($admins as $to) {
            $this->send($to, $subject, $html, $text);
        }
    }

    private function send(string $to, string $subject, string $html, string $text): bool
    {
        $to = trim($to);
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            error_log("[Email] Invalid recipient: $to");
            return false;
        }

        // Try PHPMailer SMTP if configured
        $smtpHost = (string)\Config::get('SMTP_HOST', '');
        if ($smtpHost !== '' && is_file(dirname(__DIR__, 2) . '/vendor/autoload.php')) {
            try {
                require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
                $mail->isSMTP();
                $mail->Host = $smtpHost;
                $mail->SMTPAuth = true;
                $mail->Username = (string)\Config::get('SMTP_USERNAME', '');
                $mail->Password = (string)\Config::get('SMTP_PASSWORD', '');
                $mail->SMTPSecure = (string)\Config::get('SMTP_ENCRYPTION', 'ssl');
                $mail->Port = (int)\Config::get('SMTP_PORT', 465);
                $mail->setFrom($this->fromEmail, $this->fromName);
                $mail->addAddress($to);
                $mail->addReplyTo($this->replyTo);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = $html;
                $mail->AltBody = $text;
                return $mail->send();
            } catch (\Throwable $e) {
                error_log('[Email PHPMailer] ' . $e->getMessage());
                // fall through to mail()
            }
        }

        // Fallback: native mail() with HTML headers — works on cPanel if SPF set
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        $headers[] = 'From: ' . $this->fromName . ' <' . $this->fromEmail . '>';
        $headers[] = 'Reply-To: ' . $this->replyTo;
        $headers[] = 'X-Mailer: H2Os Mailer';
        // cPanel often needs -f envelope
        $params = '-f ' . $this->fromEmail;

        // mail() returns bool, but on many shared hosts it queues even if SPF not set
        $ok = @mail($to, $subject, $html, implode("\r\n", $headers), $params);
        if (!$ok) error_log("[Email mail()] failed to $to subject $subject");
        return $ok;
    }

    // ─── Premium Luxury User Template — obsidian + neon + gold ───
    private function userTemplate(array $order): string
    {
        $ref = htmlspecialchars($order['reference'] ?? '');
        $total = number_format((int)($order['total'] ?? 0));
        $currency = htmlspecialchars($order['currency'] ?? 'NGN');
        $track = htmlspecialchars($order['trackingNumber'] ?? 'Assigning…');
        $date = htmlspecialchars($order['createdAt'] ?? date('Y-m-d H:i'));
        $ship = $order['shipping'] ?? [];
        $name = htmlspecialchars($ship['fullName'] ?? 'Valued Ritualist');
        $addr = htmlspecialchars(trim(($ship['address'] ?? '') . ', ' . ($ship['city'] ?? '') . ', ' . ($ship['state'] ?? '')));
        $phone = htmlspecialchars($ship['phone'] ?? '');
        $email = htmlspecialchars($ship['email'] ?? '');

        $itemsRows = '';
        foreach (($order['items'] ?? []) as $it) {
            $qty = (int)($it['qty'] ?? 1);
            $price = number_format((int)($it['price'] ?? 0));
            $sku = htmlspecialchars($it['sku'] ?? '');
            $vid = htmlspecialchars($it['variantId'] ?? 'ultra-h2');
            $itemsRows .= "
              <tr>
                <td style=\"padding:10px 12px; border-bottom:1px solid #1E232E; color:#F2F4F7; font-size:13px;\">H2Os {$vid}</td>
                <td style=\"padding:10px 12px; border-bottom:1px solid #1E232E; color:#9AA0B0; font-size:12px; text-align:center;\">× {$qty}</td>
                <td style=\"padding:10px 12px; border-bottom:1px solid #1E232E; color:#F2F4F7; font-size:13px; text-align:right; font-weight:700;\">{$currency} {$price}</td>
                <td style=\"padding:10px 12px; border-bottom:1px solid #1E232E; color:#6B7280; font-size:10px; text-align:right; font-family:monospace;\">{$sku}</td>
              </tr>";
        }
        if ($itemsRows === '') {
            $itemsRows = "<tr><td colspan=\"4\" style=\"padding:16px; text-align:center; color:#9AA0B0; font-size:13px;\">Ultra H₂ — Your ritual is being prepared.</td></tr>";
        }

        $site = 'https://hydrogenwaterbottles.store';
        $logo = 'https://hydrogenwaterbottles.store/images/logo.png';
        $bottle = 'https://hydrogenwaterbottles.store/images/ultraH2.jpeg';

        return <<<HTML
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; padding:0; background:#050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Your H2Os order {$ref} is confirmed — Free shipping, 30-day guarantee. Health | Quality | Luxury.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050507; padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#0B0D12; border:1px solid #1E232E; border-radius:18px; overflow:hidden;">
        <!-- Header — obsidian + neon -->
        <tr>
          <td style="background: linear-gradient(135deg, #050507 0%, #0B0D12 100%); padding:22px 24px; border-bottom:1px solid #1E232E; text-align:center;">
            <div style="font-size:22px; line-height:1; color:#FFD60A; text-shadow:0 0 12px rgba(255,214,10,0.22);">♔</div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size:22px; font-weight:800; letter-spacing:-0.02em; background: linear-gradient(135deg, #00FF88 0%, #FFD60A 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:6px 0 4px;">H2Os</div>
            <div style="font-family: monospace; font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.62);">Health &nbsp;|&nbsp; Quality &nbsp;|&nbsp; Luxury</div>
            <div style="margin:12px auto 0; width:64px; height:2px; background: linear-gradient(90deg, #00FF88, #FFD60A); border-radius:2px;"></div>
          </td>
        </tr>
        <!-- Hero -->
        <tr>
          <td style="padding:28px 24px 18px; text-align:center; background: radial-gradient(420px 180px at 50% 0%, rgba(0,255,136,0.08), transparent 68%), #0B0D12;">
            <div style="font-family: monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#00FF88;">Order Confirmed • Free Shipping • Paystack Verified</div>
            <h1 style="margin:10px 0 8px; font-size:22px; font-weight:800; color:#F2F4F7; line-height:1.1;">Your Ritual is Confirmed</h1>
            <p style="margin:0; color:#9AA0B0; font-size:13px; line-height:1.6;">Hello {$name}, your <strong style="color:#F2F4F7;">H2Os Ultra H₂</strong> is being prepared. Sip pure hydrogen in 3 minutes — health, elevated.</p>
          </td>
        </tr>
        <!-- Order card -->
        <tr>
          <td style="padding:18px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111318; border:1px solid #1E232E; border-radius:14px; overflow:hidden;">
              <tr>
                <td style="padding:14px 16px; border-bottom:1px solid #1E232E;">
                  <div style="font-family: monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Reference</div>
                  <div style="font-family: monospace; font-size:13px; font-weight:800; color:#00FF88; letter-spacing:0.04em;">{$ref}</div>
                </td>
                <td style="padding:14px 16px; border-bottom:1px solid #1E232E; text-align:right;">
                  <div style="font-family: monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Tracking</div>
                  <div style="font-family: monospace; font-size:12px; font-weight:700; color:#F2F4F7;">{$track}</div>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:12px 16px; border-bottom:1px solid #1E232E; color:#9AA0B0; font-size:11px;">
                  <span style="display:inline-block; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:#00FF88; padding:4px 8px; border-radius:999px; font-family:monospace; font-size:10px;">✓ Free shipping on all orders</span>
                  <span style="margin-left:8px; font-family:monospace; font-size:10px; color:#6B7280;">{$date}</span>
                </td>
              </tr>
              <tr><td colspan="2" style="padding:0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr style="background:rgba(255,255,255,0.02);">
                    <th style="padding:8px 12px; text-align:left; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Item</th>
                    <th style="padding:8px 12px; text-align:center; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Qty</th>
                    <th style="padding:8px 12px; text-align:right; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Price</th>
                    <th style="padding:8px 12px; text-align:right; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">SKU</th>
                  </tr>
                  {$itemsRows}
                  <tr>
                    <td colspan="3" style="padding:12px 12px 4px; text-align:right; font-family:monospace; font-size:11px; color:#9AA0B0;">Total</td>
                    <td style="padding:12px 12px 4px; text-align:right; font-size:15px; font-weight:800; color:#00FF88;">{$currency} {$total}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- Shipping -->
        <tr>
          <td style="padding:0 24px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111318; border:1px solid #1E232E; border-radius:14px; padding:12px;">
              <tr>
                <td style="padding:12px;">
                  <div style="font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280; margin-bottom:6px;">Ship to</div>
                  <div style="color:#F2F4F7; font-size:13px; font-weight:700;">{$name}</div>
                  <div style="color:#9AA0B0; font-size:13px; margin-top:4px;">{$addr}<br>{$phone} • {$email}</div>
                </td>
                <td style="padding:12px; text-align:center; width:96px;">
                  <img src="{$bottle}" alt="Ultra H₂" width="72" style="width:72px; border-radius:10px; border:1px solid #1E232E; display:block; margin:0 auto;">
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 24px 22px; text-align:center;">
            <a href="{$site}/store" style="display:inline-block; background:#00FF88; color:#050507; text-decoration:none; font-weight:800; font-size:13px; padding:12px 18px; border-radius:999px; box-shadow: 0 0 24px rgba(0,255,136,0.35);">Continue Shopping →</a>
            <div style="margin-top:10px; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Questions? <a href="https://wa.me/2348080386208" style="color:#00FF88; text-decoration:none;">WhatsApp +2348080386208</a> • sales@hydrogenwaterbottles.store</div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#07080A; border-top:1px solid #1E232E; padding:16px 24px; text-align:center;">
            <div style="font-family:monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#6B7280;">H2Os — Health | Quality | Luxury • hydrogenwaterbottles.store</div>
            <div style="margin-top:6px; font-size:11px; color:#6B7280;">3RD FLOOR, BANK OF AGRICULTURE BUILDING, Opposite Eco Bank, Olu-Obasanjo Road, Port Harcourt.</div>
            <div style="margin-top:8px; font-size:10px; color:#3A404E;">You received this because you ordered at H2Os. Free shipping on all orders • 30-day guarantee.</div>
          </td>
        </tr>
      </table>
      <div style="text-align:center; margin-top:12px; font-family:monospace; font-size:10px; color:#3A404E;">© H2Os Ultra H₂ — Obsidian luxury. Bioluminescent hydration.</div>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private function userText(array $order): string
    {
        $ref = $order['reference'] ?? '';
        $total = $order['currency'] ?? 'NGN' . ' ' . number_format((int)($order['total'] ?? 0));
        $track = $order['trackingNumber'] ?? '';
        return "H2Os — Your ritual is confirmed\nReference: $ref\nTracking: $track\nTotal: $total\nFree shipping • 30-day guarantee\nhttps://hydrogenwaterbottles.store";
    }

    private function adminTemplate(array $order): string
    {
        $ref = htmlspecialchars($order['reference'] ?? '');
        $total = number_format((int)($order['total'] ?? 0));
        $curr = htmlspecialchars($order['currency'] ?? 'NGN');
        $ship = $order['shipping'] ?? [];
        $name = htmlspecialchars($ship['fullName'] ?? '');
        $email = htmlspecialchars($ship['email'] ?? '');
        $phone = htmlspecialchars($ship['phone'] ?? '');
        $addr = htmlspecialchars(trim(($ship['address'] ?? '') . ', ' . ($ship['city'] ?? '') . ', ' . ($ship['state'] ?? '')));
        $items = '';
        foreach (($order['items'] ?? []) as $it) {
            $items .= htmlspecialchars($it['variantId'] ?? '') . ' ×' . (int)($it['qty'] ?? 1) . ' @ ' . number_format((int)($it['price'] ?? 0)) . ' | ';
        }
        $items = rtrim($items, ' | ');
        return <<<HTML
<div style="font-family:monospace; background:#0B0D12; color:#F2F4F7; padding:18px; border:1px solid #1E232E; border-radius:12px;">
  <div style="color:#00FF88; font-weight:800;">🔔 New H2Os Order — {$ref}</div>
  <div style="margin-top:8px; font-size:13px;">Customer: <b>{$name}</b> — {$email} — {$phone}<br>Address: {$addr}<br>Items: {$items}<br>Total: <b style="color:#00FF88;">{$curr} {$total}</b> • Free shipping<br>Ref: {$ref}</div>
  <div style="margin-top:10px;"><a href="https://hydrogenwaterbottles.store/mgt" style="background:#00FF88; color:#050507; padding:8px 12px; border-radius:999px; text-decoration:none; font-weight:800; font-size:12px;">Open MGT →</a></div>
</div>
HTML;
    }

    private function adminText(array $order): string
    {
        $ref = $order['reference'] ?? '';
        $ship = $order['shipping'] ?? [];
        $name = $ship['fullName'] ?? '';
        $email = $ship['email'] ?? '';
        $total = $order['currency'] ?? 'NGN' . ' ' . number_format((int)($order['total'] ?? 0));
        return "New H2Os Order $ref — $name ($email) — $total — https://hydrogenwaterbottles.store/mgt";
    }
}
