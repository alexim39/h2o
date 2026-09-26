import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-protocol',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="hero-science">
      <div class="container">
        <span class="eyebrow">H2Os • 30-Day Cellular Detox Protocol</span>
        <h1>Energy. Sleep. Recovery. <em>In 30 days.</em></h1>
        <p class="lead">For Executives, Athletes & High Performers — powered by H2Os molecular hydrogen. Not a gadget. A ritual.</p>
        <div class="hero-stats">
          <div><strong>Wk 1</strong><span>Hydrate</span><em>Lightness</em></div>
          <div><strong>Wk 2</strong><span>Recover</span><em>Less soreness</em></div>
          <div><strong>Wk 3</strong><span>Focus</span><em>Clear fog</em></div>
          <div><strong>Wk 4</strong><span>Glow</span><em>Steady energy</em></div>
        </div>
        <div class="hero-ctas">
          <a href="#quiz" class="btn-neon">Find my protocol →</a>
          <a routerLink="/store" class="btn-ghost">Shop bottles</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">How it works</span>
          <h2>Fill. Activate. <em>Elevate.</em></h2>
          <p>2–3 bottles daily, fresh within 30 min, 30 days. Morning + afternoon + evening. Pair with sleep + walk.</p>
        </div>
        <div class="ritual-grid">
          <div class="ritual glass"><strong>Morning — Clarity</strong><p>1 bottle on waking. Brain fog lifts, focus steadies. No caffeine spike.</p></div>
          <div class="ritual glass"><strong>Afternoon — Recovery</strong><p>1 bottle post-work/lunch. Flush metabolic waste, kill the 2pm crash.</p></div>
          <div class="ritual glass"><strong>Evening — Calm</strong><p>1 bottle before 8pm. Wind down, support sleep quality.</p></div>
        </div>
      </div>
    </section>

    <section class="section alt" id="quiz">
      <div class="container narrow">
        <div class="quiz-card glass">
          <span class="eyebrow">60-sec quiz</span>
          <h2>Which bottle fits your goal?</h2>
          <div class="group"><label>Main goal</label>
            <select [(ngModel)]="goal" name="goal">
              <option value="energy">Energy / fatigue</option>
              <option value="sleep">Sleep / stress</option>
              <option value="recovery">Training recovery</option>
              <option value="aging">Anti-aging / skin</option>
              <option value="gut">Gut / metabolic</option>
              <option value="focus">Focus / brain fog</option>
            </select>
          </div>
          <div class="group"><label>Daily life</label>
            <select [(ngModel)]="activity" name="activity">
              <option value="executive">Executive / desk</option>
              <option value="athlete">Athlete / gym</option>
              <option value="travel">Travel often</option>
              <option value="home">Home / steady</option>
            </select>
          </div>
          @if (recommendation()) {
            <div class="reco">
              <strong>{{ recommendation().name }}</strong>
              <p class="muted">{{ recommendation().why }}</p>
              <a [routerLink]="['/store']" class="btn-neon sm">Shop {{ recommendation().name }} →</a>
            </div>
          }
          <div class="row">
            <div class="group"><label>Name</label><input [(ngModel)]="name" name="name" placeholder="Amara" /></div>
            <div class="group"><label>WhatsApp</label><input [(ngModel)]="phone" name="phone" placeholder="+234 800..." /></div>
          </div>
          <button class="btn-neon full" (click)="submit()" [disabled]="saving()">Send my protocol on WhatsApp →</button>
          @if (done()) { <p class="ok">Saved — <a [href]="waLink()" target="_blank" rel="noopener">open WhatsApp →</a></p> }
          <p class="muted small">We WhatsApp your 30-day plan + bottle link. No spam.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head"><span class="eyebrow">Personas</span><h2>Built for <em>your life.</em></h2></div>
        <div class="benefits-grid">
          <article class="benefit glass"><h3>Executive</h3><p>Calm focus, no crash. Boardroom ritual: morning + desk bottle.</p></article>
          <article class="benefit glass"><h3>Athlete</h3><p>Post-session 6-min mode, sip in 30 min. HRV-friendly recovery.</p></article>
          <article class="benefit glass"><h3>40+ Vitality</h3><p>Skin, sleep, steady BP support alongside clinician care.</p></article>
        </div>
        <div class="center"><a routerLink="/specs" class="btn-ghost">Full specs →</a></div>
      </div>
    </section>
  `,
  styles: [`
    .hero-science{ padding: 36px 0 28px; border-bottom:1px solid var(--border); background: radial-gradient(560px 280px at 18% 8%, rgba(0,255,136,0.12), transparent 62%), linear-gradient(180deg, #050507 0%, #0A0D12 100%); text-align:center; }
    .hero-science h1{ font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4.8vw,44px); letter-spacing:-0.03em; max-width: 820px; margin: 12px auto 10px; }
    .hero-science h1 em{ font-style:normal; color:var(--neon); }
    .lead{ color:var(--text-secondary); font-size:15px; max-width:680px; margin:0 auto 16px; }
    .hero-stats{ display:grid; grid-template-columns: repeat(4,1fr); gap:12px; max-width:640px; margin:18px auto 16px; }
    .hero-stats div{ background: rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:16px; padding:12px; }
    .hero-stats strong{ display:block; font-size:18px; }
    .hero-stats span{ font-family:'JetBrains Mono', monospace; font-size:10px; text-transform:uppercase; color:var(--text-muted); }
    .hero-stats em{ font-style:normal; font-size:11px; color:var(--neon); font-family:'JetBrains Mono', monospace; }
    .hero-ctas{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
    .section-head{ max-width:720px; margin:0 auto 24px; text-align:center; }
    .section-head h2{ font-family:'Space Grotesk',sans-serif; font-size: clamp(24px,3.8vw,36px); }
    .section-head h2 em{ font-style:normal; color:var(--neon); }
    .section-head p{ color:var(--text-secondary); font-size:14px; margin-top:8px; }
    .ritual-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
    .ritual{ border-radius:16px; padding:16px; }
    .alt{ background: linear-gradient(180deg, transparent, rgba(0,255,136,0.03)); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
    .narrow{ max-width:560px; margin:0 auto; }
    .quiz-card{ border-radius:20px; padding:22px; display:flex; flex-direction:column; gap:12px; }
    .quiz-card h2{ font-family:'Space Grotesk',sans-serif; font-size:22px; }
    .group{ display:flex; flex-direction:column; gap:6px; flex:1; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input, .group select{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:10px 12px; color:var(--text-primary); font-size:13px; outline:none; color-scheme: dark; }
    .group select option{ color:#050507; background:#FFFFFF; }
    .row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .full{ width:100%; justify-content:center; }
    .reco{ background: rgba(0,255,136,0.06); border:1px solid rgba(0,255,136,0.16); border-radius:14px; padding:12px; }
    .muted{ color:var(--text-secondary); font-size:13px; }
    .small{ font-size:11px; }
    .ok{ color:var(--neon); font-size:13px; }
    .benefits-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
    .benefit{ border-radius:18px; padding:18px; }
    .center{ text-align:center; margin-top:16px; }
    @media(max-width: 960px){ .ritual-grid, .benefits-grid{ grid-template-columns:1fr; } .hero-stats{ grid-template-columns:1fr 1fr; } .row{ grid-template-columns:1fr; } }
  `]
})
export class ProtocolComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  goal = 'energy';
  activity = 'executive';
  name = '';
  phone = '';
  saving = signal(false);
  done = signal(false);

  recommendation() {
    if (this.activity === 'travel') return { name: 'Ultra H₂ Go — ₦180,000', why: 'Compact + 6000-10000ppb for life on the move.' };
    if (this.goal === 'aging' || this.goal === 'gut') return { name: 'Ultra H₂ Pure — ₦98,000', why: 'Borosilicate purity + daily balance ritual.' };
    if (this.goal === 'energy' && this.activity === 'executive') return { name: 'Ultra H₂ Luxe — ₦450,000', why: 'Touch-screen flagship for desk + nightstand ritual.' };
    return { name: 'Ultra H₂ Luxe — ₦450,000', why: 'Touch-screen flagship standard for max outcome.' };
  }

  waLink() {
    const msg = `Hello H2Os — my goal is ${this.goal} (${this.activity}). Recommend: ${this.recommendation().name}. Send my 30-day protocol.`;
    return `https://wa.me/2348080386208?text=${encodeURIComponent(msg)}`;
  }

  submit() {
    if (!this.name.trim() && !this.phone.trim()) { this.toast.show('Add name or WhatsApp', 'error'); return; }
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/leads`, {
      name: this.name.trim(), phone: this.phone.trim(),
      goal: this.goal, activity: this.activity,
      recommended_sku: this.recommendation().name, source: 'protocol',
    }).subscribe({
      next: () => { this.saving.set(false); this.done.set(true); this.toast.show('Protocol saved — check WhatsApp', 'success'); },
      error: (e) => { this.saving.set(false); this.toast.show(e?.error?.message || 'Save failed', 'error'); }
    });
  }
}
