import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section">
      <div class="container narrow">
        <div class="success-card glass">
          <div class="icon-wrap"><span class="check">✓</span><span class="pulse"></span></div>
          <span class="eyebrow">Order confirmed • Paystack verified</span>
          <h1>Ritual secured.</h1>
          <p class="lead">Your H2Os Ultra H₂ is being prepared in ritual. A receipt has been sent to your email.</p>

          <div class="ref-box">
            <span>Reference</span>
            <strong>{{ ref() }}</strong>
            <button class="copy" (click)="copy()">Copy</button>
          </div>

          @if (order(); as o) {
            <div class="order-meta">
              <div><span>Status</span><b class="paid">{{ (o.status || 'paid').toUpperCase() }}</b></div>
              <div><span>Total</span><b>{{ o.currency || 'NGN' }} {{ o.total }}</b></div>
              <div><span>Tracking</span><b class="mono">{{ o.trackingNumber || 'Assigning…' }}</b></div>
            </div>
          } @else {
            <div class="order-meta"><div><span>Status</span><b class="paid">PAID</b></div><div><span>Tracking</span><b class="mono">HY-{{ shortRef() }}</b></div></div>
          }

          <div class="next-steps">
            <h3>What happens next</h3>
            <ol>
              <li><strong>Preparation</strong> — Your bottle undergoes final purity QC (4–6 hours).</li>
              <li><strong>Express dispatch</strong> — Tracked delivery in 1–3 days. You’ll receive a tracking number via WhatsApp & email.</li>
              <li><strong>Ritual begins</strong> — One touch, 3 minutes, 1600 ppb. Hydration that feels alive.</li>
            </ol>
          </div>

          <div class="actions">
            <a routerLink="/" class="btn-neon">Return to Atelier</a>
            <a [href]="waLink()" target="_blank" rel="noopener" class="btn-ghost">Chat Concierge on WhatsApp</a>
          </div>

          <p class="support">Questions? concierge&#64;hydrogenwaterbottles.store • WhatsApp: +2348080386208 • H2Os</p>
        </div>

        <div class="guarantee glass">
          <h4>30-Day Ritual Guarantee</h4>
          <p>Not in love within 30 days? Return for a full refund — no ritual, no risk.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .narrow{ max-width: 720px; }
    .success-card{ border-radius:24px; padding:32px; text-align:center; position:relative; overflow:hidden; }
    .success-card::before{ content:""; position:absolute; inset:0; background: radial-gradient(400px 200px at 50% 0%, rgba(0,255,136,0.12), transparent 70%); pointer-events:none; }
    .icon-wrap{ position:relative; width:72px;height:72px; margin:0 auto 16px; display:grid; place-items:center; }
    .check{ width:56px;height:56px;border-radius:50%; background:var(--neon); color:#050507; display:grid; place-items:center; font-size:28px; font-weight:800; position:relative; z-index:2; box-shadow: var(--neon-glow); }
    .pulse{ position:absolute; inset:0; border-radius:50%; border:1px solid rgba(0,255,136,0.5); animation: breathe 2.6s infinite; }
    @keyframes breathe{ 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(1.35);opacity:0} }
    h1{ font-family:'Space Grotesk',sans-serif; font-size:30px; letter-spacing:-0.02em; }
    .lead{ color:var(--text-secondary); font-size:14px; margin:8px auto 18px; max-width:480px; line-height:1.6; }
    .ref-box{ display:inline-flex; align-items:center; gap:10px; background: rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:999px; padding:8px 8px 8px 14px; font-family:'JetBrains Mono', monospace; }
    .ref-box span{ font-size:10px; letter-spacing:0.10em; text-transform:uppercase; color:var(--text-muted); }
    .ref-box strong{ font-size:12px; }
    .copy{ margin-left:6px; background:var(--neon); color:#050507; border:none; border-radius:999px; padding:6px 12px; font-weight:700; font-size:11px; }
    .order-meta{ display:grid; grid-template-columns: repeat(3,1fr); gap:12px; margin:18px 0; text-align:left; }
    .order-meta div{ background: var(--bg-card); border:1px solid var(--border); border-radius:14px; padding:12px; }
    .order-meta span{ display:block; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .order-meta b{ font-size:13px; }
    .order-meta b.paid{ color:var(--neon); }
    .mono{ font-family:'JetBrains Mono', monospace; font-size:11px; }
    .next-steps{ text-align:left; background: var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:18px; margin:18px 0; }
    .next-steps h3{ font-size:13px; margin-bottom:10px; }
    .next-steps ol{ padding-left:18px; display:flex; flex-direction:column; gap:10px; }
    .next-steps li{ font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .next-steps li strong{ color:var(--text-primary); }
    .actions{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:18px; }
    .support{ margin-top:16px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-muted); }
    .guarantee{ margin-top:16px; border-radius:18px; padding:16px; text-align:center; background: linear-gradient(135deg, rgba(0,255,136,0.06), transparent); }
    .guarantee h4{ font-size:13px; }
    .guarantee p{ font-size:12px; color:var(--text-secondary); margin-top:6px; }
    @media(max-width:560px){ .order-meta{ grid-template-columns:1fr; } }
  `]
})
export class ConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cart = inject(CartService);

  ref = signal<string>('');
  order = signal<any | null>(null);

  shortRef = () => this.ref().slice(-8).toUpperCase() || 'H2Os';

  ngOnInit() {
    const r = this.route.snapshot.paramMap.get('ref') || 'H2OS_UNKNOWN';
    this.ref.set(r);
    this.api.getOrder(r).subscribe({
      next: (res) => {
        if (res?.data) this.order.set(res.data);
      }
    });
  }

  waLink() {
    const msg = `Hello H2Os — my order ${this.ref()} is confirmed. I’d like to track my Ultra H₂ delivery.`;
    return `https://wa.me/2348080386208?text=${encodeURIComponent(msg)}`;
  }

  copy() {
    navigator.clipboard.writeText(this.ref());
  }
}
