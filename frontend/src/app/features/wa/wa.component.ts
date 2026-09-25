import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wa',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-science"><div class="container">
      <span class="eyebrow">From WhatsApp Status • 30-sec read</span>
      <h1>Tired by 2pm? <em>Fix your water.</em></h1>
      <p class="lead">H2Os 30-day hydrogen ritual for energy, sleep, recovery. Tap below — we send your plan on WhatsApp.</p>
      <div class="hero-ctas">
        <a href="https://wa.me/2348080386208?text=Hello%20H2Os%20—%20send%20my%2030-day%20plan" target="_blank" rel="noopener" class="btn-neon">Get plan on WhatsApp →</a>
        <a routerLink="/protocol" class="btn-ghost">See protocol</a>
      </div>
      <div class="bullets">
        <span>✓ 1600ppb lab-verified</span><span>✓ Free shipping</span><span>✓ 30-day guarantee</span>
      </div>
    </div></section>
  `,
  styles: [`
    .hero-science{ padding: 40px 0 32px; border-bottom:1px solid var(--border); background: radial-gradient(560px 280px at 18% 8%, rgba(0,255,136,0.12), transparent 62%), linear-gradient(180deg, #050507 0%, #0A0D12 100%); text-align:center; }
    .hero-science h1{ font-family:'Space Grotesk',sans-serif; font-size: clamp(30px,5vw,46px); max-width: 720px; margin: 12px auto 10px; }
    .hero-science h1 em{ font-style:normal; color:var(--neon); }
    .lead{ color:var(--text-secondary); font-size:15px; max-width:640px; margin:0 auto 16px; }
    .hero-ctas{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
    .bullets{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:14px; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text-secondary); }
  `]
})
export class WaComponent {}
