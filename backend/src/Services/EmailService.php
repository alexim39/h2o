<?php
declare(strict_types=1);
namespace App\Services;

/**
 * H2Os — Modern Premium Luxury Email Service
 * Obsidian #050507 / Charcoal #0B0D12 / Neon #00FF88 / Gold #FFD60A
 * Sends: 1) User — Payment Confirmed + Order Confirmed 2) Admin — New Order alert
 * Works on cPanel via mail() + optional PHPMailer SMTP (recommended for inboxing).
 */
final class EmailService
{
    private string $fromEmail;
    private string $fromName;
    private string $replyTo;
    private string $adminSales;
    private string $adminBackup;

    public function __construct()
    {
        $this->fromEmail   = (string)\Config::get('MAIL_FROM_ADDRESS', 'sales@hydrogenwaterbottles.store');
        $this->fromName    = (string)\Config::get('MAIL_FROM_NAME', 'H2Os — Health | Quality | Luxury');
        $this->replyTo     = (string)\Config::get('MAIL_REPLY_TO', 'sales@hydrogenwaterbottles.store');
        $this->adminSales  = 'sales@hydrogenwaterbottles.store';
        $this->adminBackup = 'schooltraz@gmail.com';
        // Fallback to sales@ if noreply@ is configured but not created (common cPanel fail)
        if (str_contains(strtolower($this->fromEmail), 'noreply@')) {
            $this->fromEmail = $this->adminSales;
        }
    }

    public function sendUserConfirmation(array $order, string $toEmail): bool
    {
        $subject = 'Your H2Os Ritual is Confirmed — ' . ($order['reference'] ?? '') . ' • Health | Quality | Luxury';
        $html = $this->userTemplate($order, false);
        $text = $this->userText($order, false);
        $ok = $this->send($toEmail, $subject, $html, $text);
        error_log('[Email] User confirmation to ' . $toEmail . ' ref ' . ($order['reference'] ?? '') . ' — ' . ($ok ? 'queued' : 'FAILED'));
        return $ok;
    }

    public function sendUserPaidConfirmation(array $order, string $toEmail): bool
    {
        $subject = 'Payment Confirmed — Your H2Os Ultra H₂ is on its way • ' . ($order['reference'] ?? '');
        $html = $this->userTemplate($order, true);
        $text = $this->userText($order, true);
        $ok = $this->send($toEmail, $subject, $html, $text);
        error_log('[Email] User PAID to ' . $toEmail . ' ref ' . ($order['reference'] ?? '') . ' — ' . ($ok ? 'queued' : 'FAILED'));
        return $ok;
    }

    public function sendAdminAlert(array $order): void
    {
        $subject = '🔔 New H2Os Order — ' . ($order['reference'] ?? '') . ' — ' . ($order['currency'] ?? 'NGN') . ' ' . number_format((int)($order['total'] ?? 0));
        $html = $this->adminTemplate($order);
        $text = $this->adminText($order);
        foreach ([$this->adminSales, $this->adminBackup] as $to) {
            $ok = $this->send($to, $subject, $html, $text);
            error_log('[Email] Admin alert to ' . $to . ' ref ' . ($order['reference'] ?? '') . ' — ' . ($ok ? 'queued' : 'FAILED'));
        }
    }

    public function sendAdminPaidAlert(array $order): void
    {
        $subject = '✅ Paid — H2Os Order ' . ($order['reference'] ?? '') . ' — ' . number_format((int)($order['total'] ?? 0)) . ' NGN';
        $html = $this->adminPaidTemplate($order);
        $text = $this->adminText($order) . "\n[PAID CONFIRMED — Paystack verified]";
        foreach ([$this->adminSales, $this->adminBackup] as $to) {
            $ok = $this->send($to, $subject, $html, $text);
            error_log('[Email] Admin PAID to ' . $to . ' ref ' . ($order['reference'] ?? '') . ' — ' . ($ok ? 'queued' : 'FAILED'));
        }
    }

    private function send(string $to, string $subject, string $html, string $text): bool
    {
        $to = trim($to);
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            error_log("[Email] Invalid recipient: $to");
            return false;
        }

        $smtpHost = (string)\Config::get('SMTP_HOST', '');
        $smtpUser = (string)\Config::get('SMTP_USERNAME', '');
        if ($smtpHost !== '' && $smtpUser !== '' && is_file(dirname(__DIR__, 2) . '/vendor/autoload.php')) {
            try {
                require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
                $mail->isSMTP();
                $mail->Host = $smtpHost;
                $mail->SMTPAuth = true;
                $mail->Username = $smtpUser;
                $mail->Password = (string)\Config::get('SMTP_PASSWORD', '');
                $mail->SMTPSecure = (string)\Config::get('SMTP_ENCRYPTION', 'ssl');
                $mail->Port = (int)\Config::get('SMTP_PORT', 465);
                $mail->CharSet = 'UTF-8';
                $mail->setFrom($this->fromEmail, $this->fromName);
                $mail->addAddress($to);
                $mail->addReplyTo($this->replyTo);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = $html;
                $mail->AltBody = $text;
                $mail->addCustomHeader('X-Mailer', 'H2Os Luxury Mailer');
                $mail->addCustomHeader('List-Unsubscribe', '<mailto:' . $this->replyTo . '>');
                return $mail->send();
            } catch (\Throwable $e) {
                error_log('[Email PHPMailer] ' . $e->getMessage() . ' — falling back to mail()');
            }
        }

        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: quoted-printable';
        $headers[] = 'From: ' . $this->fromName . ' <' . $this->fromEmail . '>';
        $headers[] = 'Reply-To: ' . $this->replyTo;
        $headers[] = 'Return-Path: ' . $this->fromEmail;
        $headers[] = 'X-Mailer: H2Os Mailer (PHP/' . phpversion() . ')';
        $headers[] = 'X-Priority: 1';
        $headers[] = 'List-Unsubscribe: <mailto:' . $this->replyTo . '>';
        // cPanel envelope
        $params = '-f ' . $this->fromEmail . ' -r ' . $this->fromEmail;

        $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, implode("\r\n", $headers), $params);
        if (!$ok) {
            // retry without envelope (some hosts reject -f)
            $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, implode("\r\n", $headers));
        }
        if (!$ok) error_log("[Email mail()] failed to $to subject $subject");
        return $ok;
    }

    // ─── Premium Luxury User Template — obsidian + neon + gold, fully responsive ───
    private function userTemplate(array $order, bool $isPaid): string
    {
        $ref = htmlspecialchars($order['reference'] ?? '');
        $total = number_format((int)($order['total'] ?? 0));
        $currency = htmlspecialchars($order['currency'] ?? 'NGN');
        $track = htmlspecialchars($order['trackingNumber'] ?? 'HY-' . substr(md5($ref),0,8));
        $date = htmlspecialchars($order['createdAt'] ?? date('Y-m-d H:i'));
        $ship = $order['shipping'] ?? [];
        $name = htmlspecialchars($ship['fullName'] ?? 'Valued Ritualist');
        $firstName = htmlspecialchars(explode(' ', $name)[0] ?? $name);
        $addr = htmlspecialchars(trim(($ship['address'] ?? '') . ', ' . ($ship['city'] ?? '') . ', ' . ($ship['state'] ?? '')));
        $phone = htmlspecialchars($ship['phone'] ?? '');
        $email = htmlspecialchars($ship['email'] ?? '');
        $statusLabel = $isPaid ? 'Payment Confirmed • Paystack Verified' : 'Order Confirmed • Awaiting Payment';
        $statusColor = $isPaid ? '#00FF88' : '#FFD60A';
        $heroTitle = $isPaid ? 'Payment Confirmed — Your Ritual Ships Today' : 'Your Ritual is Confirmed';
        $heroSub = $isPaid ? "Hello {$firstName}, your payment for <strong style=\"color:#F2F4F7;\">H2Os Ultra H₂</strong> is verified. We're preparing your bottle for express delivery." : "Hello {$firstName}, your <strong style=\"color:#F2F4F7;\">H2Os Ultra H₂</strong> is being prepared. Complete payment to begin your hydrogen ritual.";

        $itemsRows = '';
        foreach (($order['items'] ?? []) as $it) {
            $qty = (int)($it['qty'] ?? 1);
            $price = number_format((int)($it['price'] ?? 0));
            $sku = htmlspecialchars($it['sku'] ?? '');
            $vid = htmlspecialchars($it['variantId'] ?? 'ultra-h2');
            $itemsRows .= "
              <tr>
                <td style=\"padding:12px; border-bottom:1px solid #1E232E;\">
                  <div style=\"color:#F2F4F7; font-size:13px; font-weight:700;\">H2Os " . ucfirst($vid) . "</div>
                  <div style=\"color:#6B7280; font-size:11px; font-family:monospace;\">{$sku} • 500ml • 1600 ppb</div>
                </td>
                <td style=\"padding:12px; border-bottom:1px solid #1E232E; color:#9AA0B0; font-size:12px; text-align:center;\">× {$qty}</td>
                <td style=\"padding:12px; border-bottom:1px solid #1E232E; color:#F2F4F7; font-size:13px; text-align:right; font-weight:700; white-space:nowrap;\">{$currency} {$price}</td>
              </tr>";
        }
        if ($itemsRows === '') {
            $itemsRows = "<tr><td colspan=\"3\" style=\"padding:18px; text-align:center; color:#9AA0B0; font-size:13px;\">Ultra H₂ — Your ritual is being prepared.</td></tr>";
        }

        $site = 'https://hydrogenwaterbottles.store';
        $bottle = 'https://hydrogenwaterbottles.store/images/ultraH2.jpeg';
        $year = date('Y');

        return <<<HTML
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0; padding:0; background:#050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">{$heroTitle} — Ref {$ref} • Free shipping • 30-day guarantee • H2Os</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050507; padding:28px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#0B0D12; border:1px solid #1C212E; border-radius:20px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.55);">
        <!-- Header — obsidian + neon line -->
        <tr>
          <td style="background: linear-gradient(135deg, #050507 0%, #0F1115 60%, #0B0D12 100%); padding:26px 28px 20px; border-bottom:1px solid #1E232E; text-align:center;">
            <div style="width:44px; height:44px; margin:0 auto; background: radial-gradient(circle at 30% 30%, #1A1D24, #050507); border:1px solid rgba(0,255,136,0.18); border-radius:12px; display:inline-block; line-height:44px; color:#00FF88; font-weight:800; font-size:16px; box-shadow: 0 0 0 1px rgba(0,255,136,0.08), 0 8px 20px rgba(0,255,136,0.12);">♔</div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size:24px; font-weight:800; letter-spacing:-0.02em; background: linear-gradient(135deg, #00FF88 0%, #FFD60A 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:10px 0 2px;">H2Os</div>
            <div style="font-family: monospace; font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.58);">Health &nbsp;|&nbsp; Quality &nbsp;|&nbsp; Luxury</div>
            <div style="margin:14px auto 0; width:72px; height:2px; background: linear-gradient(90deg, #00FF88, #FFD60A); border-radius:2px; box-shadow: 0 0 12px rgba(0,255,136,0.35);"></div>
          </td>
        </tr>
        <!-- Status pill -->
        <tr>
          <td style="padding:18px 28px 0; text-align:center;">
            <span style="display:inline-block; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:{$statusColor}; padding:6px 12px; border-radius:999px; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700;">{$statusLabel}</span>
          </td>
        </tr>
        <!-- Hero -->
        <tr>
          <td style="padding:20px 28px 10px; text-align:center; background: radial-gradient(520px 200px at 50% 0%, rgba(0,255,136,0.07), transparent 68%), #0B0D12;">
            <h1 style="margin:0; font-size:24px; font-weight:800; color:#F2F4F7; line-height:1.15; letter-spacing:-0.01em;">{$heroTitle}</h1>
            <p style="margin:10px 0 0; color:#9AA0B0; font-size:13px; line-height:1.7; max-width:520px; margin-left:auto; margin-right:auto;">{$heroSub} Sip pure hydrogen in 3 minutes — cellular renewal, bottled.</p>
          </td>
        </tr>
        <!-- Order card -->
        <tr>
          <td style="padding:20px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111318; border:1px solid #1E232E; border-radius:16px; overflow:hidden;">
              <tr>
                <td style="padding:16px; border-bottom:1px solid #1E232E; width:50%;">
                  <div style="font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280; margin-bottom:4px;">Reference</div>
                  <div style="font-family:monospace; font-size:13px; font-weight:800; color:#00FF88; letter-spacing:0.04em; word-break:break-all;">{$ref}</div>
                </td>
                <td style="padding:16px; border-bottom:1px solid #1E232E; text-align:right; width:50%;">
                  <div style="font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280; margin-bottom:4px;">Tracking</div>
                  <div style="font-family:monospace; font-size:12px; font-weight:700; color:#F2F4F7;">{$track}</div>
                  <div style="font-family:monospace; font-size:10px; color:#6B7280; margin-top:2px;">{$date}</div>
                </td>
              </tr>
              <tr><td colspan="2" style="padding:0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr style="background:rgba(255,255,255,0.02);">
                    <th style="padding:10px 12px; text-align:left; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Item</th>
                    <th style="padding:10px 12px; text-align:center; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Qty</th>
                    <th style="padding:10px 12px; text-align:right; font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Price</th>
                  </tr>
                  {$itemsRows}
                  <tr style="background: rgba(0,255,136,0.04);">
                    <td colspan="2" style="padding:14px 12px; text-align:right; font-family:monospace; font-size:11px; color:#9AA0B0; border-top:1px solid #1E232E;">Total • Free shipping</td>
                    <td style="padding:14px 12px; text-align:right; font-size:16px; font-weight:800; color:#00FF88; border-top:1px solid #1E232E;">{$currency} {$total}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- Shipping -->
        <tr>
          <td style="padding:0 28px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111318; border:1px solid #1E232E; border-radius:16px; overflow:hidden;">
              <tr>
                <td style="padding:16px; vertical-align:top;">
                  <div style="font-family:monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280; margin-bottom:8px;">Ship to • Free express 1–3 days</div>
                  <div style="color:#F2F4F7; font-size:14px; font-weight:700;">{$name}</div>
                  <div style="color:#9AA0B0; font-size:13px; margin-top:6px; line-height:1.5;">{$addr}<br><span style="font-family:monospace; font-size:12px;">{$phone} • {$email}</span></div>
                </td>
                <td style="padding:16px; text-align:center; width:88px; vertical-align:middle;">
                  <img src="{$bottle}" alt="Ultra H₂" width="76" style="width:76px; border-radius:12px; border:1px solid #1E232E; display:block; margin:0 auto; background:#050507;">
                  <div style="margin-top:6px; font-family:monospace; font-size:9px; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280;">Ultra H₂ • 500ml</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 28px 26px; text-align:center;">
            <a href="{$site}/store" style="display:inline-block; background: linear-gradient(135deg, #00FF88 0%, #0FD8B8 100%); color:#050507; text-decoration:none; font-weight:800; font-size:13px; padding:14px 22px; border-radius:999px; box-shadow: 0 0 28px rgba(0,255,136,0.35), 0 4px 16px rgba(0,0,0,0.32);">Track Order →</a>
            <div style="margin-top:12px; font-family:monospace; font-size:11px; color:#9AA0B0;">Questions? <a href="https://wa.me/2348080386208" style="color:#00FF88; text-decoration:none; font-weight:700;">WhatsApp +2348080386208</a> • <a href="mailto:sales@hydrogenwaterbottles.store" style="color:#9AA0B0; text-decoration:none;">sales@hydrogenwaterbottles.store</a></div>
            <div style="margin-top:8px; font-size:11px; color:#6B7280;">30-day ritual guarantee • Paystack secure • 1600 ppb lab-verified</div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#07080A; border-top:1px solid #1E232E; padding:18px 28px; text-align:center;">
            <div style="font-family:monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#6B7280;">H2Os — Health | Quality | Luxury • hydrogenwaterbottles.store</div>
            <div style="margin-top:8px; font-size:11px; color:#6B7280; line-height:1.5;">3RD FLOOR, BANK OF AGRICULTURE BUILDING, Opposite Eco Bank, Olu-Obasanjo Road, Port Harcourt.</div>
            <div style="margin-top:10px; font-size:10px; color:#3A404E; line-height:1.6;">You received this because you ordered at H2Os. Free shipping on all orders • 30-day guarantee.<br><a href="{$site}" style="color:#3A404E; text-decoration:underline;">Visit store</a> • <a href="https://wa.me/2348080386208" style="color:#3A404E; text-decoration:underline;">Support</a></div>
          </td>
        </tr>
      </table>
      <div style="text-align:center; margin-top:14px; font-family:monospace; font-size:10px; color:#3A404E; letter-spacing:0.06em;">© {$year} H2Os Ultra H₂ — Obsidian luxury. Bioluminescent hydration.</div>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private function userText(array $order, bool $isPaid): string
    {
        $ref = $order['reference'] ?? '';
        $total = ($order['currency'] ?? 'NGN') . ' ' . number_format((int)($order['total'] ?? 0));
        $track = $order['trackingNumber'] ?? '';
        $status = $isPaid ? 'PAYMENT CONFIRMED — Paystack verified' : 'ORDER CONFIRMED';
        return "H2Os — $status\nReference: $ref\nTracking: $track\nTotal: $total • Free shipping\n{$this->adminText($order)}\nhttps://hydrogenwaterbottles.store";
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
<div style="font-family:monospace; background:#0B0D12; color:#F2F4F7; padding:18px; border:1px solid #1E232E; border-radius:14px;">
  <div style="color:#FFD60A; font-weight:800; font-size:13px; letter-spacing:0.04em;">🔔 New Order — {$ref} • {$curr} {$total}</div>
  <div style="margin-top:8px; font-size:13px; line-height:1.6;">Customer: <b>{$name}</b> — {$email} — {$phone}<br>Address: {$addr}<br>Items: {$items}<br>Total: <b style="color:#00FF88;">{$curr} {$total}</b> • Free shipping<br>Ref: {$ref}</div>
  <div style="margin-top:12px;"><a href="https://hydrogenwaterbottles.store/mgt" style="background:#00FF88; color:#050507; padding:10px 14px; border-radius:999px; text-decoration:none; font-weight:800; font-size:12px;">Open MGT →</a></div>
</div>
HTML;
    }

    private function adminPaidTemplate(array $order): string
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
<div style="font-family:monospace; background:#0B0D12; color:#F2F4F7; padding:18px; border:1px solid #1E232E; border-radius:14px; border-left:4px solid #00FF88;">
  <div style="color:#00FF88; font-weight:800; font-size:13px;">✅ Paid — H2Os Order {$ref} • {$curr} {$total}</div>
  <div style="margin-top:8px; font-size:13px; line-height:1.6;">Customer: <b>{$name}</b> — {$email} — {$phone}<br>Address: {$addr}<br>Items: {$items}<br><b style="color:#00FF88;">Paystack verified • Ship today before 4pm WAT</b><br>Ref: {$ref}</div>
  <div style="margin-top:12px; display:flex; gap:8px;"><a href="https://hydrogenwaterbottles.store/mgt" style="background:#00FF88; color:#050507; padding:10px 14px; border-radius:999px; text-decoration:none; font-weight:800; font-size:12px;">Open MGT →</a><a href="https://wa.me/2348080386208?text=Order%20{$ref}%20confirmed" style="background:#111318; color:#F2F4F7; border:1px solid #1E232E; padding:10px 14px; border-radius:999px; text-decoration:none; font-size:12px;">WhatsApp Customer →</a></div>
</div>
HTML;
    }

    private function adminText(array $order): string
    {
        $ref = $order['reference'] ?? '';
        $ship = $order['shipping'] ?? [];
        $name = $ship['fullName'] ?? '';
        $email = $ship['email'] ?? '';
        $total = ($order['currency'] ?? 'NGN') . ' ' . number_format((int)($order['total'] ?? 0));
        return "New H2Os Order $ref — $name ($email) — $total — https://hydrogenwaterbottles.store/mgt";
    }
}
