import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="section"><div class="container narrow">
      <div class="verify-card glass">
        <span class="eyebrow">H2Os Authenticity</span>
        <h1>Is my bottle genuine?</h1>
        <p class="muted">Scan the QR on your box or enter the 8-digit code. We show PPM proof video.</p>
        <form class="form" (ngSubmit)="lookup()">
          <div class="group"><label>Code (e.g. H2O-AB12CD34)</label><input [(ngModel)]="codeInput" name="code" placeholder="H2O-..." style="text-transform:uppercase" /></div>
          <button class="btn-neon full" type="submit">Verify →</button>
        </form>
        @if (loading()) { <p class="muted">Checking…</p> }
        @if (error()) { <div class="error">{{ error() }} <a href="https://wa.me/2348080386208" target="_blank" rel="noopener">Report on WhatsApp →</a></div> }
        @if (result()) {
          <div class="genuine">
            <div class="badge-ok">✓ Genuine H2Os</div>
            <p><strong>{{ result().product?.brand }} {{ result().product?.name }}</strong> • {{ result().product_sku }}</p>
            <p class="muted small">Code {{ result().code }} • {{ result().scans }} scans</p>
            <video [src]="result().ppm_video_url" controls playsinline preload="metadata" class="proof"></video>
            <div class="actions"><a routerLink="/store" class="btn-neon sm">Shop genuine →</a><a routerLink="/protocol" class="btn-ghost sm">Start protocol</a></div>
          </div>
        }
      </div>
    </div></section>
  `,
  styles: [`
    .narrow{ max-width:560px; margin:0 auto; }
    .verify-card{ border-radius:20px; padding:24px; text-align:center; }
    .verify-card h1{ font-family:'Space Grotesk',sans-serif; font-size:26px; margin:8px 0; }
    .muted{ color:var(--text-secondary); font-size:13px; }
    .small{ font-size:11px; }
    .form{ display:flex; flex-direction:column; gap:12px; margin-top:14px; text-align:left; }
    .group{ display:flex; flex-direction:column; gap:6px; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:12px 14px; color:var(--text-primary); font-size:14px; outline:none; font-family:'JetBrains Mono',monospace; }
    .full{ width:100%; justify-content:center; }
    .error{ background: rgba(255,77,106,0.10); border:1px solid rgba(255,77,106,0.22); color:#FF8A9E; padding:10px 12px; border-radius:12px; font-size:13px; margin-top:12px; }
    .error a{ color:#FF8A9E; text-decoration:underline; }
    .genuine{ margin-top:16px; display:flex; flex-direction:column; gap:10px; }
    .badge-ok{ display:inline-block; background: rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.22); color:var(--neon); padding:8px 14px; border-radius:999px; font-weight:800; }
    .proof{ width:100%; border-radius:14px; background:#000; max-height:320px; }
    .actions{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
  `]
})
export class VerifyComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  codeInput = '';
  result = signal<any | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  constructor() {
    const c = this.route.snapshot.paramMap.get('code');
    if (c) { this.codeInput = c; this.lookup(); }
  }

  lookup() {
    this.error.set(null); this.result.set(null);
    const code = this.codeInput.trim().toUpperCase();
    if (!code) { this.error.set('Enter code.'); return; }
    this.loading.set(true);
    this.http.get(`${environment.apiUrl}/verify/${encodeURIComponent(code)}`).subscribe({
      next: (res: any) => { this.loading.set(false); this.result.set(res?.data ?? res); },
      error: (e) => { this.loading.set(false); this.error.set(e?.error?.message || 'Not genuine — code not found.'); }
    });
  }
}
