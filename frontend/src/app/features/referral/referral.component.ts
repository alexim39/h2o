import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-referral',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-science"><div class="container">
      <span class="eyebrow">Friend invite • ₦10,000 reward</span>
      <h1>Your friend drinks <em>H2Os.</em></h1>
      <p class="lead">Shop via this link — your friend earns ₦10,000 when your order is paid. You get the ritual.</p>
      @if (code()) { <p class="code">Code: <strong>{{ code() }}</strong> {{ valid() === true ? '✓ valid' : valid() === false ? '— continuing anyway' : '…' }}</p> }
      <div class="hero-ctas">
        <a routerLink="/store" class="btn-neon">Shop bottles →</a>
        <a routerLink="/protocol" class="btn-ghost">See protocol</a>
      </div>
    </div></section>
  `,
  styles: [`
    .hero-science{ padding: 36px 0 28px; border-bottom:1px solid var(--border); background: radial-gradient(560px 280px at 18% 8%, rgba(0,255,136,0.12), transparent 62%), linear-gradient(180deg, #050507 0%, #0A0D12 100%); text-align:center; }
    .hero-science h1{ font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4.8vw,44px); max-width: 720px; margin: 12px auto 10px; }
    .hero-science h1 em{ font-style:normal; color:var(--neon); }
    .lead{ color:var(--text-secondary); font-size:15px; max-width:640px; margin:0 auto 16px; }
    .code{ font-family:'JetBrains Mono',monospace; font-size:13px; }
    .hero-ctas{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
  `]
})
export class ReferralComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  code = signal<string>('');
  valid = signal<boolean | null>(null);

  constructor() {
    const c = (this.route.snapshot.paramMap.get('code') || '').toUpperCase();
    if (c) {
      this.code.set(c);
      try { localStorage.setItem('h2os_referral', c); } catch {}
      this.http.get(`${environment.apiUrl}/referrals/code/${encodeURIComponent(c)}`).subscribe({
        next: () => this.valid.set(true),
        error: () => this.valid.set(false),
      });
    }
  }
}
