import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-corporate',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="hero-science"><div class="container">
      <span class="eyebrow">H2Os Corporate Wellness</span>
      <h1>20 bottles. One deal. <em>₦7M.</em></h1>
      <p class="lead">Supply 20× Ultra H₂ at ₦350k each + maintenance. Staff energy, fewer sick days, premium perk oil & gas already buys.</p>
      <div class="hero-stats">
        <div><strong>20×</strong><span> Bottles</span><em>₦350k each</em></div>
        <div><strong>₦7M</strong><span>Per deal</span><em>One client</em></div>
        <div><strong>Yearly</strong><span>Reorder</span><em>+ maintenance</em></div>
        <div><strong>Free</strong><span>Pitch deck</span><em>WhatsApp us</em></div>
      </div>
      <div class="hero-ctas">
        <a href="#quote" class="btn-neon">Get corporate quote →</a>
        <a href="https://wa.me/2348080386208?text=Hello%20H2Os%20—%20corporate%20wellness%20pitch" target="_blank" rel="noopener" class="btn-ghost">WhatsApp pitch →</a>
      </div>
    </div></section>

    <section class="section" id="quote"><div class="container narrow">
      <div class="quote-card glass">
        <span class="eyebrow">Quote builder</span>
        <h2>How many desks?</h2>
        <label class="slider">Quantity: <strong>{{ qty() }}</strong>
          <input type="range" min="5" max="100" [(ngModel)]="qty" name="qty" />
        </label>
        <div class="estimate"><span>Estimate</span><strong>{{ cart.formatNGN(qty() * 350000) }}</strong><em>₦350k each + maintenance included</em></div>
        <form class="form" (ngSubmit)="submit()">
          <div class="row">
            <div class="group"><label>Company *</label><input [(ngModel)]="company" name="company" placeholder="Shell PH" /></div>
            <div class="group"><label>Contact</label><input [(ngModel)]="contact" name="contact" placeholder="HR Manager" /></div>
          </div>
          <div class="row">
            <div class="group"><label>Email</label><input [(ngModel)]="email" name="email" placeholder="hr@company.com" /></div>
            <div class="group"><label>Phone *</label><input [(ngModel)]="phone" name="phone" placeholder="+234 ..." /></div>
          </div>
          <div class="group"><label>Message</label><textarea [(ngModel)]="message" name="message" rows="2" placeholder="20 for HQ + maintenance..."></textarea></div>
          <button class="btn-neon full" type="submit" [disabled]="saving()">Request quote →</button>
          @if (done()) { <p class="ok">Received — we will call you with pitch deck + invoice link.</p> }
        </form>
        <p class="muted small">One corporate client ordering 50 units yearly beats 1,000 online sales.</p>
      </div>
    </div></section>
  `,
  styles: [`
    .hero-science{ padding: 36px 0 28px; border-bottom:1px solid var(--border); background: radial-gradient(560px 280px at 18% 8%, rgba(0,255,136,0.12), transparent 62%), linear-gradient(180deg, #050507 0%, #0A0D12 100%); text-align:center; }
    .hero-science h1{ font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4.8vw,44px); max-width: 820px; margin: 12px auto 10px; }
    .hero-science h1 em{ font-style:normal; color:var(--neon); }
    .lead{ color:var(--text-secondary); font-size:15px; max-width:680px; margin:0 auto 16px; }
    .hero-stats{ display:grid; grid-template-columns: repeat(4,1fr); gap:12px; max-width:640px; margin:18px auto 16px; }
    .hero-stats div{ background: rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:16px; padding:12px; }
    .hero-stats strong{ display:block; font-size:18px; }
    .hero-stats span{ font-family:'JetBrains Mono', monospace; font-size:10px; text-transform:uppercase; color:var(--text-muted); }
    .hero-stats em{ font-style:normal; font-size:11px; color:var(--neon); font-family:'JetBrains Mono', monospace; }
    .hero-ctas{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
    .narrow{ max-width:560px; margin:0 auto; }
    .quote-card{ border-radius:20px; padding:22px; display:flex; flex-direction:column; gap:12px; }
    .quote-card h2{ font-family:'Space Grotesk',sans-serif; font-size:22px; }
    .slider{ display:flex; flex-direction:column; gap:8px; font-size:13px; }
    .slider input{ width:100%; accent-color: var(--neon); }
    .estimate{ display:flex; align-items:baseline; gap:10px; background: rgba(0,255,136,0.06); border:1px solid rgba(0,255,136,0.16); border-radius:14px; padding:12px; }
    .estimate strong{ font-size:20px; color:var(--neon); }
    .estimate em{ font-size:11px; color:var(--text-muted); }
    .form{ display:flex; flex-direction:column; gap:12px; }
    .row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .group{ display:flex; flex-direction:column; gap:6px; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input, .group textarea{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:10px 12px; color:var(--text-primary); font-size:13px; outline:none; }
    .full{ width:100%; justify-content:center; }
    .ok{ color:var(--neon); font-size:13px; }
    .muted{ color:var(--text-secondary); font-size:13px; }
    .small{ font-size:11px; }
    @media(max-width: 960px){ .hero-stats{ grid-template-columns:1fr 1fr; } .row{ grid-template-columns:1fr; } }
  `]
})
export class CorporateComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  cart = inject(CartService);
  qty = signal(20);
  company = ''; contact = ''; email = ''; phone = ''; message = '';
  saving = signal(false);
  done = signal(false);
  estimate = computed(() => this.qty() * 350000);

  submit() {
    if (!this.company.trim()) { this.toast.show('Company required', 'error'); return; }
    if (!this.phone.trim() && !this.email.trim()) { this.toast.show('Phone or email required', 'error'); return; }
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/corporate-leads`, {
      company: this.company.trim(), contact: this.contact.trim(), email: this.email.trim(),
      phone: this.phone.trim(), qty: this.qty(), message: this.message.trim(),
    }).subscribe({
      next: () => { this.saving.set(false); this.done.set(true); this.toast.show('Quote requested', 'success'); },
      error: (e) => { this.saving.set(false); this.toast.show(e?.error?.message || 'Failed', 'error'); }
    });
  }
}
