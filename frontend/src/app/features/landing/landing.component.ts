import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- HERO — H2Os Ultra H₂ with real product image -->
    <section class="hero">
      <div class="container hero-grid">
        <div class="copy">
          <span class="eyebrow">H2Os • SPE • PEM • 1600 PPB • Platinum Titanium</span>
          <h1>
            <span class="kicker">H2Os presents</span>
            <span class="title">Ultra <em>H₂</em></span>
            <span class="sub">Hydration, upgraded.</span>
          </h1>
          <p class="lead">
            Advanced hydrogen infusion technology. <strong>1200–1600 ppb</strong> ultra-pure H₂ in 3 minutes. Borosilicate clarity, loop cap, and the ritual that turns water into cellular fuel.
          </p>

          <div class="price-row">
            <strong class="price">{{ cart.formatNGN(selected().price) }}</strong>
            <span class="compare">{{ cart.formatNGN(selected().compareAt!) }}</span>
            <span class="save">Save {{ cart.formatNGN(selected().compareAt! - selected().price) }}</span>
          </div>

          <div class="cta-row">
            <a routerLink="/store/ultra-h2-v1" class="btn-neon">Shop Ultra H₂ — {{ cart.formatNGN(selected().price) }} <span>→</span></a>
            <a routerLink="/videos" class="btn-ghost video-btn">
              <span class="play">▶</span> Watch how to use
            </a>
          </div>
          <div class="other-products">
            <a routerLink="/store" class="btn-ghost other-btn">Browse Other Products — From ₦40,000 <span>→</span></a>
            <span class="free-ship">✓ Free shipping on all orders • Also from ₦40k</span>
          </div>

          <div class="trust">
            <div class="dots"><span></span><span></span><span></span></div>
            <span><strong>4.9/5</strong> from 2,847 rituals • Lab verified • 30-day guarantee</span>
          </div>

          <div class="micro">
            <div><strong>500ml</strong><span>Perfect serve</span></div>
            <div><strong>3 min</strong><span>1600 ppb</span></div>
            <div><strong>18×</strong><span>Per charge</span></div>
            <div><strong>USB-C</strong><span>Loop cap</span></div>
          </div>
        </div>

        <div class="visual">
          <div class="bottle-stage">
            <div class="glow"></div>
            <!-- Premium Ultra H₂ mock — resembles real bottle (/images/ultraH2.jpeg) with bubbles -->
            <div class="ultra-mock">
              <div class="mock-handle"></div>
              <div class="mock-cap"></div>
              <div class="mock-body">
                <div class="mock-water">
                  <div class="mock-bubbles">
                    <span style="--x:18%; --d:1.9s; --s:3px;"></span>
                    <span style="--x:32%; --d:2.4s; --s:2px;"></span>
                    <span style="--x:48%; --d:2.0s; --s:4px;"></span>
                    <span style="--x:61%; --d:2.7s; --s:2.5px;"></span>
                    <span style="--x:74%; --d:1.8s; --s:3.5px;"></span>
                    <span style="--x:26%; --d:2.9s; --s:2px;"></span>
                    <span style="--x:58%; --d:2.2s; --s:3px;"></span>
                    <span style="--x:82%; --d:2.5s; --s:2px;"></span>
                  </div>
                  <div class="mock-label">
                    <strong>ULTRA</strong><strong>H₂</strong>
                    <em>H2Os • Advanced Hydrogen</em>
                  </div>
                  <div class="mock-shine"></div>
                </div>
              </div>
              <div class="mock-base">
                <button class="power-btn" aria-label="Power"><span class="power-icon"></span></button>
                <span class="timer">0:02</span>
                <span class="base-dot"></span>
                <span class="base-line"></span>
              </div>
            </div>
            <div class="float-card">
              <span class="eyebrow">Live infusion</span>
              <strong>Hydrogen Active — 0:02</strong>
              <div class="bar"><span></span></div>
            </div>
            <div class="price-pill">
              <span>Now</span><strong>{{ cart.formatNGN(selected().price) }}</strong>
            </div>
          </div>
          <p class="caption">Ultra Hydrogen Bottle • Original {{ cart.formatNGN(selected().compareAt!) }} → Now {{ cart.formatNGN(selected().price) }} • Hydration, upgraded.</p>
        </div>
      </div>
    </section>

    <!-- PROOF BAR -->
    <section class="proof-bar">
      <div class="container proof-inner">
        <span>Laboratory verified</span>
        <div class="certs">
          <span>CE</span><span>FCC</span><span>PSE</span><span>IP67</span><span>SPE/PEM</span><span>ISO 9001</span>
        </div>
        <span>30-day ritual guarantee</span>
      </div>
    </section>

    <!-- VIDEO PREVIEW — premium teaser -->
    <section class="section video-preview">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">See it in action</span>
          <h2>From button to bubbles — <em>in 3 minutes.</em></h2>
          <p>Real customers, real hydrogen tests, real results. Watch how Ultra H₂ transforms ordinary water.</p>
        </div>
        <div class="preview-grid">
          <a routerLink="/videos" class="preview-card glass">
            <div class="thumb">
              <video src="/videos/how-to-use-it.mp4" muted playsinline preload="metadata"></video>
              <span class="play-lg">▶</span>
              <span class="badge">How to Use • 01:24</span>
            </div>
            <h3>How to use Ultra H₂</h3>
            <p>One button, loop cap, USB-C. Your daily ritual in under 2 minutes.</p>
          </a>
          <a routerLink="/videos" class="preview-card glass">
            <div class="thumb">
              <video src="/videos/hydrogen-h2o-test.mp4" muted playsinline preload="metadata"></video>
              <span class="play-lg">▶</span>
              <span class="badge">Hydrogen Test • Lab demo</span>
            </div>
            <h3>Hydrogen H₂O test — see the ppb</h3>
            <p>Watch the hydrogen concentration rise in real time.</p>
          </a>
          <a routerLink="/videos" class="preview-card glass hide-m">
            <div class="thumb">
              <video src="/videos/brain-effect-testimonial.mp4" muted playsinline preload="metadata"></video>
              <span class="play-lg">▶</span>
              <span class="badge">Testimonial • Brain clarity</span>
            </div>
            <h3>Why customers feel the clarity</h3>
            <p>Tap to watch all 6 testimonials + science.</p>
          </a>
        </div>
        <div class="center">
          <a routerLink="/videos" class="btn-neon">Watch all videos — How to & Testimonials →</a>
        </div>
      </div>
    </section>

    <!-- SCIENCE / BENEFITS -->
    <section id="science" class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">The science of H₂</span>
          <h2>Molecular hydrogen, <em>cellular truth.</em></h2>
          <p>Not hype — peer-reviewed. Hydrogen is the smallest, most bioavailable antioxidant. It slips through membranes others cannot.</p>
        </div>

        <div class="benefits">
          @for (f of product.features(); track f.title) {
            <article class="benefit glass">
              <div class="icon">{{ f.icon }}</div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </article>
          }
        </div>

        <div class="compare glass">
          <div class="c-head">
            <h3>Why 1600 ppb matters</h3>
            <p>Most “hydrogen bottles” plateau at 400 ppb. Ultra H₂ sustains therapeutic concentration.</p>
          </div>
          <div class="bars">
            <div class="bar-row"><span>Generic Ionizer</span><div class="track"><span style="width: 25%"></span></div><b>~400 ppb</b></div>
            <div class="bar-row"><span>Premium Competitor</span><div class="track"><span style="width: 46%"></span></div><b>~740 ppb</b></div>
            <div class="bar-row elite"><span>Ultra H₂</span><div class="track"><span style="width: 100%"></span></div><b>1600 ppb</b></div>
          </div>
        </div>
      </div>
    </section>

    <!-- GALLERY — real image -->
    <section class="section gallery-sec">
      <div class="container">
        <div class="gallery-grid">
          <div class="gallery-main glass">
            <div class="angle-label">H2Os • Ultra H₂ — Crystal clarity</div>
            <div class="stage-sm">
              <img src="/images/ultraH2.jpeg" alt="Ultra H₂ detail" class="gallery-img" loading="lazy" />
            </div>
            <div class="zoom">Borosilicate glass • Platinum electrodes • 0:02 timer • Loop cap • USB-C</div>
          </div>
          <div class="details">
            <span class="eyebrow">Obsessive detail</span>
            <h2>The object you’ll reach for, daily.</h2>
            <ul class="bullets">
              <li><strong>Borosilicate</strong> clarity — no plastic contact, no leaching.</li>
              <li><strong>Platinum titanium</strong> electrodes — zero corrosion, pure H₂.</li>
              <li><strong>Loop cap</strong> — carry anywhere, ritual ready.</li>
              <li><strong>One-touch cycle</strong> — 3 min (daily) / 6 min (max) • Timer display.</li>
            </ul>
            <div class="actions">
              <button class="btn-neon" (click)="addToCart()">Add Ultra H₂ — {{ cart.formatNGN(selected().price) }}</button>
              <a routerLink="/product" class="btn-ghost">View details</a>
              <a routerLink="/videos" class="btn-ghost">Watch how to use</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SPECS -->
    <section id="specs" class="section specs">
      <div class="container">
        <div class="specs-grid">
          <div>
            <span class="eyebrow">Technical specifications</span>
            <h2>Engineered like a timepiece.</h2>
            <p class="muted">Every tolerance measured in microns. Every sip measured in ppb. Future H2Os bottles will share this ritual DNA.</p>
            <div class="spec-list">
              @for (s of product.specs(); track s.label) {
                <div class="spec">
                  <span>{{ s.label }}</span>
                  <strong>{{ s.value }}</strong>
                </div>
              }
            </div>
          </div>
          <div class="spec-visual glass">
            <img src="/images/ultraH2.jpeg" alt="Ultra H₂ specs" class="spec-img" />
            <div class="spec-callouts">
              <span class="callout top">DuPont Nafion® SPE</span>
              <span class="callout mid">Platinum Ti Electrodes</span>
              <span class="callout bot">USB-C • 2800 mAh • Loop Cap</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS PREVIEW -->
    <section class="section testimonials">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Community proof</span>
          <h2>Rituals, not reviews.</h2>
          <p>Real humans, real hydrogen. Watch the full video testimonials or read the community.</p>
        </div>
        <div class="carousel">
          @for (r of reviews; track r.name) {
            <article class="review glass">
              <div class="stars">★★★★★ <span>5.0</span></div>
              <p>“{{ r.text }}”</p>
              <div class="author">
                <div class="ava">{{ r.initials }}</div>
                <div><strong>{{ r.name }}</strong><span>{{ r.role }}</span></div>
                <span class="verified">Verified ritual</span>
              </div>
            </article>
          }
        </div>
        <div class="center" style="margin-top: 18px; display: flex; gap: 10px; justify-content:center; flex-wrap:wrap;">
          <a routerLink="/reviews" class="btn-neon">Read & write community reviews →</a>
          <a routerLink="/videos" class="btn-ghost">Watch video testimonials</a>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="cta-final">
      <div class="container cta-box glass">
        <div>
          <span class="eyebrow">H2Os — Ultra H₂ • Limited batch</span>
          <h2>Begin your hydrogen ritual today.</h2>
          <p>Free express delivery • 30-day guarantee • Paystack secure. More H2Os bottles coming soon — start with Ultra H₂.</p>
        </div>
        <div class="cta-actions">
          <a routerLink="/product" class="btn-neon large">Shop Ultra H₂ — {{ cart.formatNGN(selected().price) }} →</a>
          <span class="secure">🔒 Paystack • SSL • 256-bit • H2Os</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero { padding: 28px 0 0; border-bottom: 1px solid var(--border); }
    .hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center; min-height: 640px; padding: 36px 24px 40px; }
    .copy h1 { margin: 16px 0 14px; line-height: 0.9; }
    .kicker { display:block; font-family:'Space Grotesk',sans-serif; font-size: 13px; letter-spacing:0.18em; text-transform:uppercase; color: var(--neon); font-weight:700; }
    .title { display:block; font-family:'Space Grotesk',sans-serif; font-size: clamp(42px, 6vw, 64px); font-weight:700; letter-spacing:-0.03em; }
    .title em { font-style: normal; color: var(--neon); text-shadow: 0 0 20px rgba(0,255,136,0.35); }
    .sub { display:block; font-size: clamp(16px,2vw,18px); color: var(--text-secondary); font-weight:400; margin-top: 6px; letter-spacing:-0.01em; }
    .lead { font-size: 15px; color: var(--text-secondary); line-height: 1.7; max-width: 520px; margin: 14px 0 12px; }
    .lead strong { color: var(--text-primary); font-weight:700; }
    .price-row { display:flex; align-items:baseline; gap:10px; margin: 6px 0 14px; }
    .price { font-size:24px; font-weight:800; }
    .compare { font-size:13px; color:var(--text-muted); text-decoration:line-through; }
    .save { font-size:11px; background: rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:4px 8px; border-radius:999px; font-weight:700; }
    .cta-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
    .other-products{ margin-top:14px; display:flex; flex-direction:column; gap:8px; max-width: 520px; }
    .other-btn{
      justify-content:center; gap:10px;
      background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)) !important;
      border:1px solid rgba(255,255,255,0.12) !important;
      color: var(--text-primary) !important;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.24);
      position:relative; overflow:hidden;
    }
    .other-btn::before{ content:""; position:absolute; inset:0; background: linear-gradient(90deg, transparent, rgba(0,255,136,0.06), transparent); opacity:0; transition:.32s; }
    .other-btn:hover::before{ opacity:1; }
    .other-btn:hover{ border-color: rgba(0,255,136,0.22) !important; box-shadow: 0 0 0 1px rgba(0,255,136,0.12), 0 12px 32px rgba(0,0,0,0.32); transform: translateY(-1px); }
    .other-btn span{ color: var(--neon); }
    .free-ship{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color: var(--text-secondary); display:flex; align-items:center; gap:6px; justify-content:center; }
    .free-ship::before{ content:"✓"; width:16px;height:16px;border-radius:50%; background: rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.18); color:var(--neon); display:grid; place-items:center; font-size:9px; }
    .video-btn { display:inline-flex; align-items:center; gap:8px; }
    .video-btn .play { width:22px;height:22px;border-radius:50%; background:var(--neon); color:#050507; display:grid; place-items:center; font-size:10px; }
    .trust { display:flex; align-items:center; gap:10px; margin-top: 18px; font-size:12px; color: var(--text-secondary); }
    .trust strong { color: var(--text-primary); }
    .dots { display:flex; gap:6px; }
    .dots span { width:26px;height:26px;border-radius:50%; border:1px solid var(--border); background: var(--bg-card); display:inline-block; }
    .micro { display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-top: 22px; padding-top:18px; border-top:1px solid var(--border); max-width:520px; }
    .micro div strong { display:block; font-size:14px; }
    .micro div span { font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }

    .visual { position: relative; }
    .bottle-stage { position: relative; background: radial-gradient(420px 320px at 50% 38%, rgba(0,255,136,0.10), transparent 70%), linear-gradient(180deg, #0F1115 0%, #07080A 100%); border:1px solid var(--border); border-radius: 28px; height: 540px; display:grid; place-items:center; overflow:hidden; padding: 18px; }
    .glow { position:absolute; inset:auto 18% 14% 18%; height: 120px; background: radial-gradient(ellipse at center, rgba(0,255,136,0.22), transparent 70%); filter: blur(18px); }
    /* Ultra H₂ hyper-premium mock — obsidian luxury, crystal glass, power button, dense bubbles */
    .ultra-mock { width: 184px; height: 392px; position:relative; z-index:1; filter: drop-shadow(0 28px 48px rgba(0,0,0,0.62)) drop-shadow(0 0 24px rgba(0,255,136,0.08)); display:flex; flex-direction:column; align-items:center; }
    .mock-handle { width: 76px; height: 28px; border: 3.5px solid #090A0E; border-bottom: none; border-radius: 18px 18px 0 0; position:absolute; top:0; left:50%; transform:translateX(-50%); background: linear-gradient(180deg, rgba(255,255,255,0.06), transparent); box-shadow: 0 3px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08); }
    .mock-handle::after{ content:""; position:absolute; left:10%; right:10%; top:3px; height:1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); }
    .mock-cap { width: 88px; height: 32px; margin-top: 18px; background: linear-gradient(180deg,#F3F4F6 0%, #E5E7EB 8%, #C5CAD3 18%, #8A919E 48%, #5E6674 78%, #3A414D 100%); border-radius: 7px 7px 4px 4px; border:1px solid rgba(255,255,255,0.16); box-shadow: inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(0,0,0,0.22), 0 6px 16px rgba(0,0,0,0.42); position:relative; }
    .mock-cap::before{ content:""; position:absolute; inset: 5px 6px 7px 6px; border:1px solid rgba(255,255,255,0.12); border-radius: 4px; pointer-events:none; }
    .mock-cap::after{ content:""; position:absolute; left:8%; right:8%; top:5px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.82), transparent); }
    .mock-body { width: 162px; height: 290px; margin-top: 2px; background: linear-gradient(180deg, rgba(242,252,249,0.34) 0%, rgba(210,242,235,0.20) 18%, rgba(170,228,212,0.14) 42%, rgba(190,236,224,0.18) 68%, rgba(210,242,235,0.24) 100%); border:1px solid rgba(255,255,255,0.18); border-radius: 20px 20px 12px 12px; position:relative; overflow:hidden; backdrop-filter: blur(2px); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -8px 24px rgba(0,255,136,0.06), 0 12px 32px rgba(0,0,0,0.38); }
    .mock-body::before{ content:""; position:absolute; inset:0; background: linear-gradient(90deg, transparent 12%, rgba(255,255,255,0.06) 22%, transparent 36%, transparent 68%, rgba(255,255,255,0.04) 82%, transparent 94%); pointer-events:none; }
    .mock-water { position:absolute; inset: 8px 7px 50px 7px; background: linear-gradient(180deg, rgba(255,255,255,0.09), rgba(0,255,136,0.04) 42%, rgba(0,255,136,0.09) 86%); border-radius: 14px 14px 10px 10px; overflow:hidden; box-shadow: inset 0 0 16px rgba(0,255,136,0.10), inset 0 1px 0 rgba(255,255,255,0.10); }
    .mock-water::after{ content:""; position:absolute; left:0; right:0; bottom:0; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,255,136,0.22), transparent); }
    .mock-bubbles span{ position:absolute; bottom:-8px; width:var(--s); height:var(--s); left:var(--x); background: radial-gradient(circle at 28% 28%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 28%, rgba(0,255,136,0.72) 62%, rgba(0,255,136,0.42) 100%); border-radius:50%; box-shadow: 0 0 8px rgba(0,255,136,0.55), 0 1px 2px rgba(0,0,0,0.18); animation: rise var(--d) linear infinite; opacity:0.92; }
    .mock-bubbles span:nth-child(3){ --s:4.5px; } .mock-bubbles span:nth-child(5){ --s:2px; }
    @keyframes rise{ 0%{ transform: translateY(0) scale(0.78) translateX(0); opacity:0.95 } 28%{ transform: translateY(-70px) scale(0.92) translateX(1px); } 100%{ transform: translateY(-240px) scale(1.14) translateX(-1px); opacity:0 } }
    .mock-bubbles span:nth-child(2){ animation-delay: 0.3s; } .mock-bubbles span:nth-child(4){ animation-delay: 0.6s; } .mock-bubbles span:nth-child(6){ animation-delay: 0.9s; }
    .mock-label { position:absolute; right: 7px; top:50%; transform: translateY(-50%); writing-mode: vertical-rl; text-orientation: mixed; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-left:1px solid rgba(255,255,255,0.06); padding: 12px 7px; display:flex; flex-direction:column; align-items:center; gap:3px; border-radius: 8px; backdrop-filter: blur(2px); }
    .mock-label strong{ font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:800; letter-spacing:0.03em; color: #0B0E14; text-shadow: 0 1px 0 rgba(255,255,255,0.52), 0 0 12px rgba(255,255,255,0.18); line-height:1; }
    .mock-label strong:first-child{ font-size:19px; letter-spacing:0.14em; color: #0B0E14; }
    .mock-label em{ font-size:6.5px; letter-spacing:0.14em; text-transform:uppercase; color: rgba(11,14,20,0.58); font-style:normal; writing-mode: horizontal-tb; transform: rotate(180deg); margin-top:8px; font-family:'JetBrains Mono', monospace; font-weight:700; }
    .mock-shine{ position:absolute; left:9%; top:4%; width:13%; height:80%; background: linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.16) 32%, transparent 74%); border-radius:999px; opacity:0.95; filter: blur(0.2px); }
    .mock-shine::after{ content:""; position:absolute; left:44%; top:8%; width:32%; height:62%; background: linear-gradient(180deg, rgba(255,255,255,0.16), transparent); border-radius:999px; }
    .mock-base { width: 144px; height: 56px; margin-top: -1px; background: linear-gradient(180deg,#1A1E26 0%, #0F1218 42%, #050507 100%); border:1px solid rgba(255,255,255,0.10); border-radius: 0 0 16px 16px; display:flex; align-items:center; justify-content:space-between; padding:0 11px 0 12px; position:relative; box-shadow: 0 10px 24px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4); }
    .mock-base::before{ content:""; position:absolute; top:0; left:8%; right:8%; height:1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
    .power-btn{ width:28px;height:28px;border-radius:50%; background: radial-gradient(circle at 32% 30%, #2F3542, #0E1116 62%, #050507); border:1px solid rgba(255,255,255,0.16); display:grid; place-items:center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 2px rgba(0,0,0,0.5), 0 3px 10px rgba(0,0,0,0.55); flex-shrink:0; cursor:pointer; transition: transform .12s, box-shadow .12s; }
    .power-btn:active{ transform: scale(0.96); }
    .power-icon{ width:13px;height:13px;border:1.9px solid var(--neon); border-radius:50%; position:relative; box-shadow: 0 0 8px rgba(0,255,136,0.68), inset 0 0 4px rgba(0,255,136,0.18); display:block; }
    .power-icon::after{ content:""; position:absolute; left:50%; top:2.2px; width:1.9px; height:6.5px; background: var(--neon); transform:translateX(-50%); border-radius:999px; box-shadow: 0 0 6px var(--neon); }
    .mock-base .timer{ font-family:'JetBrains Mono', monospace; font-size:14px; font-weight:800; color: #00FF88; text-shadow: 0 0 10px rgba(0,255,136,0.92), 0 0 22px rgba(0,255,136,0.42), 0 1px 0 rgba(0,0,0,0.6); letter-spacing:0.07em; }
    .mock-base .base-dot{ width:7px; height:7px; border-radius:50%; background: var(--neon); box-shadow: 0 0 12px var(--neon), 0 0 22px rgba(0,255,136,0.42); animation: pulseLed 1.6s infinite; }
    .mock-base .base-line{ position:absolute; bottom:7px; left:50%; transform:translateX(-50%); width:32px; height:2.5px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent); border-radius:999px; box-shadow: 0 1px 0 rgba(0,0,0,0.5); }
    .float-card{ position:absolute; right:14px; bottom:14px; background: rgba(11,13,16,0.92); border:1px solid var(--border); border-radius:16px; padding:12px 14px; min-width:170px; backdrop-filter: blur(12px); z-index:2; }
    .float-card strong{ display:block; font-size:12px; margin: 2px 0 6px; }
    .float-card .bar{ height:4px; background: rgba(255,255,255,0.08); border-radius:999px; overflow:hidden; }
    .float-card .bar span{ display:block; width:72%; height:100%; background: var(--neon); box-shadow:0 0 8px var(--neon); animation: load 2s ease-in-out infinite alternate; }
    @keyframes load{ 0%{width:62%} 100%{width:88%} }
    .price-pill { position:absolute; left:14px; top:14px; background: var(--neon); color:#050507; border-radius:999px; padding:8px 12px; font-size:12px; font-weight:800; z-index:2; display:flex; gap:6px; align-items:baseline; box-shadow: var(--neon-glow); }
    .price-pill span { font-size:10px; letter-spacing:0.08em; text-transform:uppercase; opacity:0.7; }
    .caption { margin-top:10px; text-align:center; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-muted); }

    .proof-bar { background: #080A0D; border-y: 1px solid var(--border); }
    .proof-inner { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 24px; font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted); flex-wrap:wrap; }
    .certs { display:flex; gap:10px; flex-wrap:wrap; }
    .certs span { padding:6px 10px; border:1px solid var(--border); border-radius:999px; background: rgba(255,255,255,0.02); color: var(--text-secondary); }

    .video-preview { background: linear-gradient(180deg, transparent, rgba(0,255,136,0.03)); border-bottom: 1px solid var(--border); }
    .section-head { max-width: 640px; margin: 0 auto 28px; text-align:center; }
    .section-head h2 { font-family:'Space Grotesk',sans-serif; font-size: clamp(26px,4vw,36px); letter-spacing:-0.02em; margin: 10px 0; }
    .section-head h2 em { font-style:normal; color: var(--neon); }
    .section-head p { color: var(--text-secondary); font-size:14px; line-height:1.6; }
    .preview-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom: 18px; }
    .preview-card { border-radius:18px; padding:0; overflow:hidden; text-align:left; border:1px solid rgba(255,255,255,0.06); transition:.18s; display:flex; flex-direction:column; }
    .preview-card:hover { transform: translateY(-2px); border-color: rgba(0,255,136,0.22); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
    .thumb { position:relative; aspect-ratio: 16/9; background:#0B0D10; overflow:hidden; }
    .thumb video { width:100%; height:100%; object-fit:cover; display:block; }
    .play-lg { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:44px;height:44px;border-radius:50%; background: rgba(5,5,7,0.72); border:1px solid rgba(255,255,255,0.14); backdrop-filter: blur(8px); display:grid; place-items:center; color:white; font-size:14px; }
    .badge { position:absolute; left:10px; bottom:10px; background: rgba(5,5,7,0.82); border:1px solid rgba(255,255,255,0.10); color:var(--text-secondary); font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; padding:5px 8px; border-radius:999px; }
    .preview-card h3 { font-size:13px; padding:12px 14px 4px; }
    .preview-card p { font-size:12px; color:var(--text-secondary); padding:0 14px 14px; line-height:1.5; }
    .center { text-align:center; }

    .section-head.center { text-align:center; }
    .benefits { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
    .benefit { border-radius:20px; padding:22px; border:1px solid rgba(255,255,255,0.06); }
    .benefit .icon { width:36px;height:36px;border-radius:10px;background:rgba(0,255,136,0.10);border:1px solid rgba(0,255,136,0.18);display:grid;place-items:center;color:var(--neon);font-size:14px;margin-bottom:12px; }
    .benefit h3 { font-size:14px; margin-bottom:6px; }
    .benefit p { font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .compare { grid-column: 1 / -1; margin-top: 18px; border-radius:20px; padding:22px; display:grid; grid-template-columns: 1fr 1.2fr; gap:22px; align-items:center; }
    .c-head h3 { font-size:16px; }
    .c-head p { font-size:13px;color:var(--text-secondary);margin-top:6px; }
    .bars { display:flex; flex-direction:column; gap:12px; }
    .bar-row{ display:grid; grid-template-columns: 140px 1fr 70px; align-items:center; gap:12px; font-size:12px; }
    .bar-row .track{ height:8px; background: rgba(255,255,255,0.06); border-radius:999px; overflow:hidden; }
    .bar-row .track span{ display:block; height:100%; background: var(--text-muted); border-radius:999px; }
    .bar-row.elite .track span{ background: var(--neon); box-shadow:0 0 10px var(--neon); }
    .bar-row b{ text-align:right; font-family:'JetBrains Mono', monospace; font-size:11px; }

    .gallery-sec { background: linear-gradient(180deg, transparent, rgba(0,255,136,0.03)); }
    .gallery-grid { display:grid; grid-template-columns: 1.05fr 0.95fr; gap:24px; align-items:center; }
    .gallery-main { border-radius:24px; padding:18px; min-height: 420px; display:flex; flex-direction:column; }
    .stage-sm{ flex:1; display:grid; place-items:center; padding:18px; }
    .gallery-img { max-height: 340px; width:100%; object-fit:contain; border-radius:16px; filter: drop-shadow(0 16px 30px rgba(0,0,0,0.4)); }
    .zoom{ margin-top:12px; text-align:center; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .details h2{ font-family:'Space Grotesk',sans-serif; font-size:28px; letter-spacing:-0.02em; margin:10px 0 14px; }
    .bullets{ list-style:none; display:flex; flex-direction:column; gap:10px; }
    .bullets li{ font-size:13px; color:var(--text-secondary); padding-left:22px; position:relative; }
    .bullets li::before{ content:"◆"; position:absolute; left:0; color:var(--neon); font-size:8px; top:4px; }
    .bullets li strong{ color:var(--text-primary); }
    .details .actions{ display:flex; gap:10px; margin-top:18px; flex-wrap:wrap; }

    .specs-grid{ display:grid; grid-template-columns: 1fr 0.95fr; gap:32px; align-items:start; }
    .specs-grid h2{ font-family:'Space Grotesk',sans-serif; font-size:28px; letter-spacing:-0.02em; margin:10px 0 6px; }
    .muted{ color:var(--text-secondary); font-size:13px; margin-bottom:16px; }
    .spec-list{ display:flex; flex-direction:column; border:1px solid var(--border); border-radius:16px; overflow:hidden; }
    .spec{ display:flex; justify-content:space-between; padding:12px 14px; border-bottom:1px solid var(--border); font-size:13px; }
    .spec:last-child{ border-bottom:none; }
    .spec span{ color:var(--text-secondary); }
    .spec-visual{ border-radius:24px; min-height: 520px; display:grid; place-items:center; position:relative; overflow:hidden; padding:18px; }
    .spec-img { max-height: 420px; width:100%; object-fit:contain; border-radius:16px; }
    .callout{ position:absolute; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.10em; text-transform:uppercase; background: rgba(11,13,16,0.92); border:1px solid var(--border); padding:6px 10px; border-radius:999px; }
    .callout.top{ top:18%; right:12%; }
    .callout.mid{ top:46%; right:8%; }
    .callout.bot{ bottom:18%; right:14%; }

    .carousel{ display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
    .review{ border-radius:18px; padding:18px; }
    .stars{ color:var(--neon); font-size:12px; }
    .stars span{ color:var(--text-secondary); margin-left:6px; }
    .review p{ margin:10px 0 14px; font-size:13px; color:var(--text-primary); line-height:1.6; }
    .author{ display:flex; align-items:center; gap:10px; }
    .ava{ width:32px;height:32px;border-radius:50%; background: var(--bg-charcoal); border:1px solid var(--border); display:grid; place-items:center; font-size:11px; font-weight:700; }
    .author strong{ display:block; font-size:12px; }
    .author span{ font-size:11px; color:var(--text-muted); }
    .verified{ margin-left:auto; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:4px 8px; border-radius:999px; }

    .cta-final{ padding: 40px 0 60px; }
    .cta-box{ border-radius:24px; padding:28px; display:flex; align-items:center; justify-content:space-between; gap:24px; background: linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.02)); }
    .cta-box h2{ font-family:'Space Grotesk',sans-serif; font-size:22px; margin:8px 0; }
    .cta-box p{ font-size:13px; color:var(--text-secondary); max-width:520px; }
    .cta-actions{ display:flex; flex-direction:column; gap:10px; align-items:flex-end; }
    .btn-neon.large{ padding:18px 28px; font-size:13px; }
    .secure{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }

    @media (max-width: 960px){
      .hero-grid, .gallery-grid, .specs-grid, .cta-box, .preview-grid { grid-template-columns: 1fr; }
      .cta-box{ flex-direction:column; align-items:stretch; }
      .cta-actions{ align-items:stretch; }
      .benefits{ grid-template-columns: 1fr 1fr; }
      .compare{ grid-template-columns: 1fr; }
      .carousel{ grid-template-columns: 1fr; }
      .hide-m { display:none; }
    }
    @media (max-width: 640px){
      .benefits{ grid-template-columns: 1fr; }
      .bar-row{ grid-template-columns: 110px 1fr 60px; }
      .hero-grid{ padding: 18px 16px 24px; min-height:auto; }
      .bottle-stage{ height: 440px; }
    }
  `]
})
export class LandingComponent {
  product = inject(ProductService);
  cart = inject(CartService);
  private toast = inject(ToastService);

  selected = computed(() => this.product.selectedVariant());

  reviews = [
    { name: 'Amara O.', initials: 'AO', role: 'Founder, Lagos', text: 'Three minutes and my water is literally sparkling with hydrogen. Recovery after Lagos traffic + gym is unreal. Ultra H₂ is stealth luxury on my desk.' },
    { name: 'Daniel K.', initials: 'DK', role: 'Triathlete', text: 'I track HRV daily — Ultra H₂ moved my recovery score 18% in two weeks. No placebo. The SPE membrane is legit.' },
    { name: 'Sofia M.', initials: 'SM', role: 'Designer, London', text: 'Finally a health device that is not ugly. Ultra H₂ lives next to my MacBook and people always ask. Hydration, upgraded indeed.' },
  ];

  addToCart() {
    this.cart.add(this.selected().id, 1);
    this.cart.openDrawer();
    this.toast.show(`Added ${this.selected().name} to ritual`);
  }
}
