import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="section">
      <div class="container narrow">
        <div class="track-card glass">
          <span class="eyebrow">Track your ritual</span>
          <h1>Order tracking</h1>
          <p class="muted">Enter reference (e.g. HYDRO_...) — free express 1–3 days.</p>
          <form class="form" (ngSubmit)="lookup()">
            <div class="group"><label>Reference</label><input [(ngModel)]="refInput" name="ref" placeholder="HYDRO_..." /></div>
            <button class="btn-neon full" type="submit">Track →</button>
          </form>
          @if (error()) { <div class="error">{{ error() }}</div> }
          @if (order()) {
            <div class="order-meta">
              <div><span>Reference</span><b class="mono">{{ order().reference }}</b></div>
              <div><span>Status</span><b class="paid">{{ order().status.toUpperCase() }}</b></div>
              <div><span>Total</span><b>{{ cart.formatNGN(order().total) }}</b></div>
              <div><span>Tracking</span><b class="mono">{{ order().trackingNumber }}</b></div>
            </div>
            <ol class="steps">
              @for (s of ['pending','processing','shipped','delivered']; track s) {
                <li [class.done]="stepIndex(order().status) >= ['pending','processing','shipped','delivered'].indexOf(s)" [class.now]="order().status===s">{{ s }}</li>
              }
            </ol>
          }
          <a routerLink="/store" class="back">← Back to Store</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .narrow{ max-width:560px; margin:0 auto; }
    .track-card{ border-radius:20px; padding:24px; }
    .track-card h1{ font-family:'Space Grotesk',sans-serif; font-size:24px; margin:8px 0 6px; }
    .muted{ color:var(--text-secondary); font-size:13px; }
    .form{ display:flex; flex-direction:column; gap:12px; margin-top:14px; }
    .group{ display:flex; flex-direction:column; gap:6px; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:12px 14px; color:var(--text-primary); font-size:13px; outline:none; }
    .full{ width:100%; justify-content:center; }
    .error{ background: rgba(255,77,106,0.10); border:1px solid rgba(255,77,106,0.22); color:#FF8A9E; padding:10px 12px; border-radius:12px; font-size:13px; margin-top:12px; }
    .order-meta{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; }
    .order-meta div{ background: var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:10px 12px; }
    .order-meta span{ display:block; font-family:'JetBrains Mono',monospace; font-size:10px; text-transform:uppercase; color:var(--text-muted); }
    .paid{ color:var(--neon); }
    .mono{ font-family:'JetBrains Mono',monospace; font-size:12px; }
    .steps{ display:flex; gap:8px; margin-top:14px; padding-left:0; list-style:none; flex-wrap:wrap; }
    .steps li{ padding:6px 10px; border-radius:999px; border:1px solid var(--border); font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); }
    .steps li.done{ background: rgba(0,255,136,0.12); border-color: rgba(0,255,136,0.22); color:var(--neon); }
    .steps li.now{ outline:2px solid var(--neon); }
    .back{ display:block; text-align:center; margin-top:14px; font-size:12px; color:var(--text-secondary); }
  `]
})
export class TrackComponent {
  private api = inject(ApiService);
  cart = inject(CartService);
  private route = inject(ActivatedRoute);
  refInput = '';
  order = signal<any | null>(null);
  error = signal<string | null>(null);

  constructor() {
    const r = this.route.snapshot.paramMap.get('ref');
    if (r) { this.refInput = r; this.lookup(); }
  }

  stepIndex(s: string): number {
    return ['pending','paid','processing','shipped','delivered'].indexOf(s);
  }

  lookup() {
    this.error.set(null); this.order.set(null);
    const ref = this.refInput.trim();
    if (!ref) { this.error.set('Enter reference.'); return; }
    this.api.getOrder(ref).subscribe({
      next: (res: any) => {
        if (res?.data) this.order.set(res.data);
        else this.error.set('Order not found.');
      },
      error: () => this.error.set('Order not found — check reference.')
    });
  }
}
