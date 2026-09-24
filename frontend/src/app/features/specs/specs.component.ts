import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SpecRow { k: string; v: string; }
interface SpecProduct {
  id: string; name: string; price: string; tag: string; desc: string;
  attrs: SpecRow[]; attrs2?: SpecRow[];
}

@Component({
  selector: 'app-specs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-science">
      <div class="container">
        <span class="eyebrow">H2Os • Health | Quality | Luxury</span>
        <h1>Specifications — <em>total product truth.</em></h1>
        <p class="lead">Stay Healthy <strong>& Add Years</strong> to Your Life — by drinking the purest hydrogen water. Every ppb, every material, every mode.</p>
        <div class="hero-stats">
          <div><strong>8,000</strong><span>ppb peak</span><em>Luxe systems</em></div>
          <div><strong>5/10</strong><span>min modes</span><em>Smart touch</em></div>
          <div><strong>SPE/PEM</strong><span>DuPont + Pt-Ti</span><em>Medical-grade</em></div>
          <div><strong>Free</strong><span>Shipping</span><em>Nigeria</em></div>
        </div>
        <div class="hero-ctas">
          <a routerLink="/store" class="btn-neon">Shop Collection — From ₦98,000 →</a>
          <a href="#collection" class="btn-ghost">Compare models ↓</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Molecular miracle</span>
          <h2>Hydration, <em>upgraded.</em> Health, elevated.</h2>
          <p>Ordinary water feeds cells but cannot fix cellular rusting. H2Os infuses the smallest antioxidant across the blood-brain barrier, turning toxic hydroxyl radicals back into safe water.</p>
        </div>
        <div class="ritual-grid">
          <div class="ritual glass"><strong>1. Fill</strong><p>Pour pure, filtered or distilled water into the medical-grade vessel.</p></div>
          <div class="ritual glass"><strong>2. Activate</strong><p>Tap capacitive touch to engage Solid Polymer Electrolysis.</p></div>
          <div class="ritual glass"><strong>3. Elevate</strong><p>Drink immediately after cycle for maximum molecular gas.</p></div>
        </div>
        <div class="callout glass">
          <span class="eyebrow">Molecular gas yield benchmarks</span>
          <div class="spec-table-wrap"><table class="spec-table">
            <tr><th>System type</th><th>Hydrogen yield (PPB)</th></tr>
            <tr><td>Standard generic bottles</td><td>400 ppb</td></tr>
            <tr><td>Average premium brands</td><td>740 ppb</td></tr>
            <tr class="hl"><td>H2Os Ultra H₂ luxury systems</td><td>Up to 8,000 ppb (Supreme Peak)</td></tr>
          </table></div>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">6 core medical benefits</span>
          <h2>Backed by <em>verified human clinical science</em></h2>
          <p class="muted">Wellness ritual, not a drug. Supports care — does not cure disease. Consult your clinician.</p>
        </div>
        <div class="benefits-grid">
          <article class="benefit glass"><div class="icon">◈</div><h3>Antioxidant Boost — Inflammation & Pain</h3><p><em>Mechanism:</em> Floods body with free-radical hunters targeting chronic inflammation.</p><p class="health"><span>→ Clinical:</span> Soothing relief for joint pain, arthritis, aches; eases exhaustion.</p></article>
          <article class="benefit glass"><div class="icon">⬢</div><h3>Cellular Recovery — Fatigue & Diabetes</h3><p><em>Mechanism:</em> Flushes metabolic waste, restores clean cellular energy.</p><p class="health"><span>→ Clinical:</span> Erases stiffness/soreness; studies verify increased insulin sensitivity for Type 2 support.</p></article>
          <article class="benefit glass"><div class="icon">⬣</div><h3>Cognitive Clarity — Fog & Stress</h3><p><em>Mechanism:</em> Crosses blood-brain barrier, neutralizes neuro oxidative stress.</p><p class="health"><span>→ Clinical:</span> Clears fog, sharpens focus, protects memory, calms nerves.</p></article>
          <article class="benefit glass"><div class="icon">⬔</div><h3>Anti-Aging — Skin & Cellular Youth</h3><p><em>Mechanism:</em> Protects DNA + collagen from toxins/UV.</p><p class="health"><span>→ Clinical:</span> Fights spots, dullness, premature aging; radiant tissue vitality.</p></article>
          <article class="benefit glass"><div class="icon">⬕</div><h3>Metabolic — Gut & Indigestion</h3><p><em>Mechanism:</em> Calms tract, balances microbiome.</p><p class="health"><span>→ Clinical:</span> Reduces reflux, bloating, indigestion; steady energy, no crash.</p></article>
          <article class="benefit glass"><div class="icon">⬓</div><h3>Ultra-Pure Hydration — Heart & BP</h3><p><em>Mechanism:</em> Micro-clustered fluidity thins cellular congestion.</p><p class="health"><span>→ Clinical:</span> Improves flow, supports heart, hypertension + cholesterol management.</p></article>
        </div>
        <div class="quotes">
          <blockquote class="glass">“Chronic inflammation is the silent driver of fatigue and high BP. H2Os Ultra H₂ has been a game-changer — medical-grade PEM/SPE ensures pure delivery.”<cite>— Woko Ogechi, Registered Nurse</cite></blockquote>
          <blockquote class="glass">“Morning brain fog is gone, recovery doubled.”<cite>— Roseline Woko, Executive, PH</cite></blockquote>
        </div>
      </div>
    </section>

    <section class="section" id="collection">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Custom collection</span>
          <h2>Curated hardware, <em>engineered for ritual.</em></h2>
          <p>Each attribute table below is from the official brochure. Prices NGN, free nationwide shipping.</p>
        </div>

        @for (p of products; track p.id) {
          <article class="model glass">
            <div class="model-head">
              <div><span class="eyebrow">{{ p.tag }}</span><h3>{{ p.name }} — {{ p.price }}</h3><p class="muted">{{ p.desc }}</p></div>
              <a [routerLink]="['/store']" class="btn-neon sm">Shop →</a>
            </div>
            <div class="spec-table-wrap"><table class="spec-table">
              @for (r of p.attrs; track r.k) { <tr><td>{{ r.k }}</td><td><strong>{{ r.v }}</strong></td></tr> }
            </table></div>
            @if (p.attrs2) {
              <div class="spec-table-wrap"><table class="spec-table">
                @for (r of p.attrs2!; track r.k) { <tr><td>{{ r.k }}</td><td><strong>{{ r.v }}</strong></td></tr> }
              </table></div>
            }
          </article>
        }

        <div class="callout glass">
          <span class="eyebrow">Compare at a glance</span>
          <div class="spec-table-wrap"><table class="spec-table compare">
            <tr><th>Model</th><th>PPB</th><th>Capacity</th><th>Battery</th><th>Time</th><th>Price</th></tr>
            <tr><td>Luxe Touch</td><td>4000–8000</td><td>320 ML</td><td>2500 mAh</td><td>5/10 min</td><td>₦450,000</td></tr>
            <tr><td>Go Travel</td><td>6000–10000+</td><td>Travel</td><td>USB/Battery</td><td>—</td><td>₦180,000</td></tr>
            <tr><td>Pure Glass</td><td>1001–2000</td><td>460 ml</td><td>700 mAh</td><td>5 min</td><td>₦98,000</td></tr>
            <tr class="hl"><td>Legacy Elite</td><td>1,600</td><td>500 ml</td><td>2800 mAh</td><td>3/6 min</td><td>₦1,300,000</td></tr>
          </table></div>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container specs-grid">
        <div>
          <span class="eyebrow">Guarantee + certifications</span>
          <h2>30-day assurance. Bulletproof hardware.</h2>
          <ul class="bullets">
            <li><strong>30-day guarantee</strong> — profound upgrade or full refund, unquestioned.</li>
            <li><strong>Executive bundle</strong> — any 2 vessels → free Matte-Black Gift Box + Dual USB-C suite.</li>
            <li><strong>Lifetime ritual</strong> — seals + filter arrays via portal.</li>
            <li><strong>Certified:</strong> CE / FCC / ROHS / FDA / IP67 / BPA-Free.</li>
            <li><strong>Order:</strong> WhatsApp +2348080386208 • hydrogenwaterbottles.store • Free shipping.</li>
          </ul>
          <div class="actions">
            <a routerLink="/store" class="btn-neon">Shop Collection →</a>
            <a routerLink="/track" class="btn-ghost">Track order</a>
          </div>
        </div>
        <div class="visual glass">
          <img src="/images/ultraH2.jpeg" alt="H2Os Ultra H₂" class="spec-img" />
          <div class="float"><span class="eyebrow">Lab verified</span><strong>Up to 8,000 ppb</strong><span>Free shipping</span></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-science{ padding: 36px 0 28px; border-bottom:1px solid var(--border); background: radial-gradient(560px 280px at 18% 8%, rgba(0,255,136,0.12), transparent 62%), linear-gradient(180deg, #050507 0%, #0A0D12 100%); text-align:center; }
    .hero-science h1{ font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4.8vw,44px); letter-spacing:-0.03em; line-height:0.95; max-width: 820px; margin: 12px auto 10px; }
    .hero-science h1 em{ font-style:normal; color:var(--neon); }
    .lead{ color:var(--text-secondary); font-size:15px; max-width:680px; margin:0 auto 16px; line-height:1.6; }
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
    .callout{ margin-top:18px; border-radius:18px; padding:18px; }
    .spec-table-wrap{ overflow-x:auto; margin-top:12px; border:1px solid var(--border); border-radius:12px; }
    .spec-table{ width:100%; border-collapse:collapse; font-size:13px; min-width: 520px; }
    .spec-table th, .spec-table td{ padding:10px 12px; border-bottom:1px solid var(--border); text-align:left; }
    .spec-table th{ font-family:'JetBrains Mono',monospace; font-size:11px; text-transform:uppercase; color:var(--text-muted); background: rgba(255,255,255,0.02); }
    .spec-table tr.hl td{ background: rgba(0,255,136,0.06); font-weight:700; }
    .spec-table td strong{ color:var(--text-primary); }
    .alt{ background: linear-gradient(180deg, transparent, rgba(0,255,136,0.03)); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
    .benefits-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
    .benefit{ border-radius:18px; padding:18px; }
    .benefit .icon{ width:36px;height:36px;border-radius:10px;background:rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); display:grid; place-items:center; color:var(--neon); margin-bottom:10px; }
    .benefit h3{ font-size:14px; margin-bottom:6px; }
    .benefit p{ font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .benefit .health{ margin-top:10px; padding:9px 10px; border-radius:10px; background: linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.03)); border:1px solid rgba(0,255,136,0.12); font-size:12px; color:var(--text-primary); }
    .benefit .health span{ font-weight:800; color:var(--neon); font-family:'JetBrains Mono', monospace; font-size:10px; text-transform:uppercase; }
    .quotes{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:14px; }
    blockquote{ border-radius:16px; padding:16px; font-size:13px; color:var(--text-secondary); font-style:italic; line-height:1.6; }
    blockquote cite{ display:block; margin-top:8px; font-style:normal; font-size:12px; color:var(--text-primary); }
    .model{ border-radius:18px; padding:18px; margin-bottom:16px; }
    .model-head{ display:flex; justify-content:space-between; gap:12px; align-items:start; flex-wrap:wrap; }
    .model-head h3{ font-size:17px; margin:6px 0; }
    .btn-neon.sm{ padding:8px 14px; font-size:12px; }
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
    @media(max-width: 960px){ .benefits-grid, .quotes{ grid-template-columns:1fr 1fr; } .ritual-grid{ grid-template-columns:1fr; } .specs-grid{ grid-template-columns:1fr; } .hero-stats{ grid-template-columns:1fr 1fr; } }
    @media(max-width: 640px){ .benefits-grid, .quotes{ grid-template-columns:1fr; } }
  `]
})
export class SpecsComponent {
  products: SpecProduct[] = [
    { id:'luxe', name:'Ultra H₂ Luxe — Flagship Touch Masterpiece', price:'₦450,000', tag:'Aviation aluminum • Smart touch screen', desc:'Zenith of smart molecular health. Anodized aviation aluminum, real-time cycle tracking.',
      attrs: [
        {k:'Hydrogen concentration (ppb)', v:'5001 - 10000'}, {k:'Electrode technology', v:'SPE & PEM'},
        {k:'Capacity', v:'320 ML'}, {k:'Hydrogen content', v:'4000-8000 PPB'},
        {k:'Power source', v:'Battery, USB'}, {k:'Battery capacity', v:'2500 mAh'},
        {k:'Housing material', v:'Bpa Free'}, {k:'Power (W)', v:'4W'},
        {k:'Warranty', v:'1 Year'}, {k:'Dimensions (l x w x h)', v:'68*65*220MM'},
        {k:'Brand', v:'H2Os'}, {k:'Technology', v:'DuPont Proton Membrane + Platinum Titanium Electrode'},
      ],
      attrs2: [
        {k:'Working time', v:'5/10 mins'}, {k:'Material', v:'Food Grade Tritan + Aluminum Alloy'},
        {k:'Charging port', v:'Type-C USB'}, {k:'Color', v:'Silver/Black/Gold/Blue'},
      ]},
    { id:'go', name:'Ultra H₂ Go — High-Potency Travel Elite', price:'₦180,000', tag:'Compact • Travel • Massive yield', desc:'Moves with your schedule. Massive concentration on a single charge.',
      attrs: [
        {k:'Application', v:'Home/Hotel/Restaurant/Office/Outdoor/Personal'}, {k:'Power source', v:'USB, Battery, Electric'},
        {k:'Brand', v:'H2Os'}, {k:'Charging port', v:'Type-C USB'},
        {k:'Material', v:'BPA Free PC'}, {k:'Hydrogen solubility', v:'6000-10000ppb+'},
        {k:'Style', v:'Portable, Modern, Sport'}, {k:'Usage', v:'Skin care / Purification / Inhaler / Drinkware'},
        {k:'Warranty', v:'1 Year'}, {k:'Technology', v:'SPE PEM Membrane Electrolysis'},
      ]},
    { id:'pure', name:'Ultra H₂ Pure — Architectural Glass', price:'₦98,000', tag:'Borosilicate • Boardroom statement', desc:'Heavy pure high-borosilicate glass preserves purity at point of drink.',
      attrs: [
        {k:'Hydrogen concentration (ppb)', v:'1001 - 2000'}, {k:'Battery capacity', v:'700 mAh'},
        {k:'Capacity', v:'460ml'}, {k:'Self-cleaning', v:'Yes, 5min'},
        {k:'Power source', v:'USB, Battery'}, {k:'Application', v:'Car, Commercial, Hotel, Household, Outdoor'},
        {k:'Warranty', v:'1 Year'}, {k:'Power (W)', v:'5W'},
        {k:'Brand', v:'H2Os'}, {k:'Dimensions', v:'95*95*280mm'},
        {k:'Color', v:'Silver/Black/Gold/Blue'}, {k:'Technology', v:'SPE PEM Membrane Electrolysis'},
        {k:'Working time', v:'5 mins'},
      ]},
    { id:'legacy', name:'Ultra H₂ — Legacy Elite Flagship', price:'₦1,300,000', tag:'Timeless signature • West Africa executive', desc:'Highly requested mark of elite self-investment.',
      attrs: [
        {k:'Capacity', v:'500 ml'}, {k:'Hydrogen infusion', v:'1,600 PPB Premium'},
        {k:'Arrangement', v:'Double Electrolytic'}, {k:'Modes', v:'3 / 6 min'},
        {k:'Membrane', v:'DuPont Nafion® SPE/PEM'}, {k:'Electrodes', v:'Platinum titanium'},
      ]},
  ];
}
