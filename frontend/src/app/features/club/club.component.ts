import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-science"><div class="container">
      <span class="eyebrow">H2Os Club • Private community</span>
      <h1>Loyalty. Referrals. <em>Ritual together.</em></h1>
      <p class="lead">Monthly Zoom with a nutritionist, protocol tips, members wins. Owners get the WhatsApp link post-purchase.</p>
      <div class="hero-ctas">
        <a href="https://wa.me/2348080386208?text=Hello%20H2Os%20—%20I%20want%20to%20join%20the%20Club" target="_blank" rel="noopener" class="btn-neon">Join on WhatsApp →</a>
        <a routerLink="/store" class="btn-ghost">Become owner</a>
      </div>
    </div></section>
    <section class="section"><div class="container">
      <div class="benefits-grid">
        <article class="benefit glass"><h3>Monthly Zoom</h3><p>Nutritionist Q&A, protocol tune-ups, sleep/recovery coaching.</p></article>
        <article class="benefit glass"><h3>Refill reminders</h3><p>Filters/tablets on schedule — pause anytime, never run dry.</p></article>
        <article class="benefit glass"><h3>Members wins</h3><p>Share HRV, skin, energy wins. Refer friends, earn ₦10k credit.</p></article>
      </div>
      <div class="center"><a routerLink="/protocol" class="btn-ghost">See the 30-day protocol →</a></div>
    </div></section>
  `,
  styles: [`
    .hero-science{ padding: 36px 0 28px; border-bottom:1px solid var(--border); background: radial-gradient(560px 280px at 18% 8%, rgba(0,255,136,0.12), transparent 62%), linear-gradient(180deg, #050507 0%, #0A0D12 100%); text-align:center; }
    .hero-science h1{ font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4.8vw,44px); max-width: 820px; margin: 12px auto 10px; }
    .hero-science h1 em{ font-style:normal; color:var(--neon); }
    .lead{ color:var(--text-secondary); font-size:15px; max-width:680px; margin:0 auto 16px; }
    .hero-ctas{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
    .benefits-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
    .benefit{ border-radius:18px; padding:18px; }
    .center{ text-align:center; margin-top:16px; }
    @media(max-width: 960px){ .benefits-grid{ grid-template-columns:1fr; } }
  `]
})
export class ClubComponent {}
