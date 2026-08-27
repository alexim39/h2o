import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-science',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-science">
      <div class="container">
        <span class="eyebrow">H2Os • Science • Health • Longevity</span>
        <h1>Why your body <em>needs</em> hydrogen water</h1>
        <p class="lead">Stay Healthy <strong>& Add Years</strong> to Your Life — by drinking the purest hydrogen water daily. Peer-reviewed, lab-verified, ritual-grade.</p>
        <div class="hero-stats">
          <div><strong>1,600</strong><span>ppb H₂</span><em>Ultra H₂</em></div>
          <div><strong>3 min</strong><span>Infusion</span><em>One press</em></div>
          <div><strong>30+</strong><span>Studies</span><em>Peer-reviewed</em></div>
          <div><strong>Free</strong><span>Shipping</span><em>All orders</em></div>
        </div>
        <div class="hero-ctas">
          <a routerLink="/store" class="btn-neon">Buy Hydrogen Bottle — From ₦40,000 →</a>
          <a href="#benefits" class="btn-ghost">Explore benefits ↓</a>
        </div>
      </div>
    </section>

    <section class="section" id="benefits">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">The science of H₂</span>
          <h2>Molecular hydrogen — <em>the smallest, smartest antioxidant</em></h2>
          <p>Hydrogen (H₂) is the lightest molecule in the universe. It slips through cell membranes, crosses the blood-brain barrier, and selectively neutralizes the most harmful radical (•OH) — without disturbing useful ROS. That’s why it’s called <em>selective</em>.</p>
        </div>

        <div class="benefits-grid">
          <article class="benefit glass">
            <div class="icon">◈</div>
            <h3>Selective antioxidant</h3>
            <p>Targets hydroxyl radicals, spares beneficial oxidative signals — unlike high-dose vitamin C/E.</p>
            <p class="health"><span>→ Health benefit:</span> Less daily fatigue, better resilience to stress and pollution — you feel lighter throughout the day.</p>
          </article>
          <article class="benefit glass">
            <div class="icon">⬢</div>
            <h3>Anti-inflammatory</h3>
            <p>Lowers NF-kB, IL-6, TNF-α — supports recovery from training, joint stiffness, and chronic low-grade inflammation.</p>
            <p class="health"><span>→ Health benefit:</span> Faster bounce-back after workouts, less joint stiffness, calmer body.</p>
          </article>
          <article class="benefit glass">
            <div class="icon">⬣</div>
            <h3>Brain clarity</h3>
            <p>Crosses BBB, supports focus, reduces brain fog, and protects neurons from oxidative stress.</p>
            <p class="health"><span>→ Health benefit:</span> Clearer focus, less brain fog, calmer mornings and better concentration.</p>
          </article>
          <article class="benefit glass">
            <div class="icon">⬔</div>
            <h3>Gut & metabolic</h3>
            <p>Supports microbiome balance, healthy glucose, and liver markers in emerging studies.</p>
            <p class="health"><span>→ Health benefit:</span> Lighter stomach, steadier energy after meals, supports healthy metabolism.</p>
          </article>
          <article class="benefit glass">
            <div class="icon">⬕</div>
            <h3>Skin & recovery</h3>
            <p>Supports collagen, wound recovery, and post-exercise lactate clearance.</p>
            <p class="health"><span>→ Health benefit:</span> More youthful glow, quicker skin recovery, less post-exercise soreness.</p>
          </article>
          <article class="benefit glass">
            <div class="icon">⬓</div>
            <h3>Cellular energy</h3>
            <p>Supports mitochondrial function — the engine of every cell, every heartbeat.</p>
            <p class="health"><span>→ Health benefit:</span> More steady daily energy — less afternoon crash, better stamina.</p>
          </article>
        </div>

        <div class="callout glass">
          <span class="eyebrow">Why 1,600 ppb matters</span>
          <h3>Therapeutic window — not just bubbles</h3>
          <p>Most bottles plateau at ~400 ppb. Ultra H₂ sustains 1,200–1,600 ppb for 20+ minutes — verified SPE/PEM with platinum titanium + DuPont Nafion®.</p>
          <div class="bars">
            <div class="bar"><span>Generic</span><div class="track"><span style="width:25%"></span></div><b>400 ppb</b></div>
            <div class="bar"><span>Premium</span><div class="track"><span style="width:46%"></span></div><b>740 ppb</b></div>
            <div class="bar elite"><span>Ultra H₂</span><div class="track"><span style="width:100%"></span></div><b>1,600 ppb</b></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">What it may help — evidence, not promises</span>
          <h2>Where people feel it <em>most</em></h2>
          <p class="muted">Hydrogen water is not a drug. It does not “cure” disease. Research (Japan, Korea, China, US) shows supportive effects alongside medical care. Always consult your clinician.</p>
        </div>

        <div class="disease-grid">
          <article class="disease glass">
            <h3>Metabolic & blood sugar</h3>
            <p>Type 2 / pre-diabetes studies show improved fasting glucose, HbA1c, and oxidative markers when combined with diet/meds.</p>
            <span class="tag">172 users • testimonial video</span>
          </article>
          <article class="disease glass">
            <h3>Blood pressure & heart</h3>
            <p>Early trials report improved endothelial function and lower oxidative LDL — supports, not replaces, antihypertensives.</p>
            <span class="tag">Lab verified • 3 min ritual</span>
          </article>
          <article class="disease glass">
            <h3>Gut, liver & inflammation</h3>
            <p>Supports gut barrier, liver enzymes, and systemic inflammation markers (CRP).</p>
            <span class="tag">Reducing inflammation video</span>
          </article>
          <article class="disease glass">
            <h3>Brain, mood & sleep</h3>
            <p>Users report clearer focus, calmer mood, deeper sleep — linked to lower neuro-oxidative stress.</p>
            <span class="tag">Brain-effect testimonial</span>
          </article>
          <article class="disease glass">
            <h3>Skin, eyes & recovery</h3>
            <p>Supports skin recovery, eye comfort (tear oxidative stress), and post-exercise soreness. Not a replacement for care.</p>
            <span class="tag">Blister / Eye videos</span>
          </article>
          <article class="disease glass">
            <h3>Energy, vitality & sports</h3>
            <p>Athletes report lower lactate, faster HRV recovery. For daily vitality, not doping.</p>
            <span class="tag">Vitality testimonial</span>
          </article>
        </div>

        <div class="disclaimer glass">
          <strong>Medical disclaimer:</strong> Hydrogen water is a wellness ritual, not a medicine. It may support your regimen but does not diagnose, treat, or cure disease. Continue prescribed care and speak to your doctor — or chat with <a routerLink="/videos" style="color:var(--neon)">H2Os Assistant Doctor</a> for general info.
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container specs-grid">
        <div>
          <span class="eyebrow">Why H2Os Ultra H₂</span>
          <h2>Not all hydrogen bottles are equal</h2>
          <ul class="bullets">
            <li><strong>Real SPE/PEM</strong> — DuPont Nafion®, platinum titanium, not cheap electrolysis.</li>
            <li><strong>Borosilicate glass</strong> — no plastic leaching, pure taste, lab clarity.</li>
            <li><strong>Loop cap + 0:02 timer</strong> — ritual you’ll actually do, daily.</li>
            <li><strong>USB-C • 2800 mAh • 18 cycles</strong> — travel-ready.</li>
            <li><strong>Lab-verified 1,600 ppb</strong> — watch the hydrogen test video.</li>
            <li><strong>Free shipping on all orders</strong> — Nigeria 1–3 days, Paystack secure.</li>
          </ul>
          <div class="actions">
            <a routerLink="/store" class="btn-neon">Shop from ₦40,000 →</a>
            <a routerLink="/videos" class="btn-ghost">Watch hydrogen test</a>
          </div>
        </div>
        <div class="visual glass">
          <img src="/images/ultraH2.jpeg" alt="H2Os Ultra H₂" class="spec-img" />
          <div class="float">
            <span class="eyebrow">Lab verified</span>
            <strong>1,600 ppb • 3 min</strong>
            <span>Free shipping</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta">
      <div class="container cta-box glass">
        <div>
          <span class="eyebrow">Ready to feel it?</span>
          <h2>Stay healthy. Add years. <em>Drink better water.</em></h2>
          <p>Join 2,847 rituals. Free shipping, 30-day guarantee, Paystack secure. Chat H2 Doctor for any question.</p>
        </div>
        <div class="cta-actions">
          <a routerLink="/store" class="btn-neon large">Buy Hydrogen Water Bottle →</a>
          <a routerLink="/videos" class="btn-ghost">See how it works</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-science{ padding: 36px 0 28px; border-bottom:1px solid var(--border); background: radial-gradient(560px 280px at 18% 8%, rgba(0,255,136,0.12), transparent 62%), linear-gradient(180deg, #050507 0%, #0A0D12 100%); text-align:center; }
    .hero-science h1{ font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4.8vw,44px); letter-spacing:-0.03em; line-height:0.95; max-width: 820px; margin: 12px auto 10px; }
    .hero-science h1 em{ font-style:normal; color:var(--neon); text-shadow: 0 0 18px rgba(0,255,136,0.32); }
    .lead{ color:var(--text-secondary); font-size:15px; max-width:680px; margin:0 auto 16px; line-height:1.6; }
    .lead strong{ color:var(--text-primary); }
    .hero-stats{ display:grid; grid-template-columns: repeat(4,1fr); gap:12px; max-width:640px; margin:18px auto 16px; }
    .hero-stats div{ background: rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:16px; padding:12px; }
    .hero-stats strong{ display:block; font-size:18px; }
    .hero-stats span{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .hero-stats em{ font-style:normal; font-size:11px; color:var(--neon); font-family:'JetBrains Mono', monospace; }
    .hero-ctas{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
    .section-head{ max-width:720px; margin:0 auto 24px; text-align:center; }
    .section-head h2{ font-family:'Space Grotesk',sans-serif; font-size: clamp(24px,3.8vw,36px); letter-spacing:-0.02em; }
    .section-head h2 em{ font-style:normal; color:var(--neon); }
    .section-head p{ color:var(--text-secondary); font-size:14px; margin-top:8px; line-height:1.6; }
    .benefits-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
    .benefit{ border-radius:18px; padding:18px; }
    .benefit .icon{ width:36px;height:36px;border-radius:10px;background:rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); display:grid; place-items:center; color:var(--neon); margin-bottom:10px; }
    .benefit h3{ font-size:14px; margin-bottom:6px; }
    .benefit p{ font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .benefit .health{ margin-top:10px; padding:9px 10px; border-radius:10px; background: linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.03)); border:1px solid rgba(0,255,136,0.12); font-size:12px; color:var(--text-primary); line-height:1.5; }
    .benefit .health span{ font-weight:800; color:var(--neon); font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; }
    .callout{ margin-top:18px; border-radius:18px; padding:18px; text-align:center; }
    .callout h3{ font-size:16px; }
    .bars{ display:flex; flex-direction:column; gap:10px; max-width:520px; margin:14px auto 0; text-align:left; }
    .bar{ display:grid; grid-template-columns: 110px 1fr 70px; gap:10px; align-items:center; font-size:12px; }
    .track{ height:8px; background: rgba(255,255,255,0.06); border-radius:999px; overflow:hidden; }
    .track span{ display:block; height:100%; background: var(--text-muted); }
    .bar.elite .track span{ background: var(--neon); box-shadow:0 0 10px var(--neon); }
    .bar b{ font-family:'JetBrains Mono', monospace; font-size:11px; text-align:right; }
    .alt{ background: linear-gradient(180deg, transparent, rgba(0,255,136,0.03)); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
    .disease-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
    .disease{ border-radius:16px; padding:16px; }
    .disease h3{ font-size:13px; margin-bottom:6px; }
    .disease p{ font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .tag{ display:inline-block; margin-top:8px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(255,255,255,0.04); border:1px solid var(--border); padding:4px 8px; border-radius:999px; color:var(--text-muted); }
    .disclaimer{ margin-top:14px; border-radius:12px; padding:12px; font-size:12px; color:var(--text-muted); line-height:1.6; text-align:center; }
    .disclaimer a{ color:var(--neon); text-decoration:underline; }
    .specs-grid{ display:grid; grid-template-columns:1fr 0.9fr; gap:28px; align-items:center; }
    .specs-grid h2{ font-family:'Space Grotesk',sans-serif; font-size:28px; }
    .bullets{ list-style:none; margin:12px 0 14px; display:flex; flex-direction:column; gap:8px; }
    .bullets li{ font-size:13px; color:var(--text-secondary); padding-left:22px; position:relative; }
    .bullets li::before{ content:"◆"; position:absolute; left:0; color:var(--neon); font-size:8px; top:3px; }
    .bullets li strong{ color:var(--text-primary); }
    .actions{ display:flex; gap:10px; flex-wrap:wrap; }
    .visual{ border-radius:20px; padding:16px; display:grid; place-items:center; position:relative; min-height:360px; }
    .spec-img{ max-height:320px; width:100%; object-fit:contain; border-radius:12px; }
    .float{ position:absolute; right:14px; bottom:14px; background: rgba(11,13,16,0.92); border:1px solid var(--border); border-radius:12px; padding:10px 12px; text-align:center; }
    .float strong{ display:block; font-size:12px; }
    .cta{ padding: 32px 0; }
    .cta-box{ border-radius:20px; padding:22px; display:flex; justify-content:space-between; gap:18px; align-items:center; flex-wrap:wrap; }
    .cta-box h2{ font-family:'Space Grotesk',sans-serif; font-size:22px; }
    .cta-box h2 em{ font-style:normal; color:var(--neon); }
    .cta-box p{ font-size:13px; color:var(--text-secondary); max-width:520px; margin-top:6px; }
    .cta-actions{ display:flex; gap:10px; flex-wrap:wrap; }
    .btn-neon.large{ padding:14px 20px; }
    @media(max-width: 960px){ .benefits-grid, .disease-grid{ grid-template-columns:1fr 1fr; } .specs-grid{ grid-template-columns:1fr; } .hero-stats{ grid-template-columns:1fr 1fr; } }
    @media(max-width: 640px){ .benefits-grid, .disease-grid{ grid-template-columns:1fr; } .bar{ grid-template-columns: 90px 1fr 60px; } .hero-stats{ grid-template-columns:1fr 1fr; } }
  `]
})
export class ScienceComponent {}
