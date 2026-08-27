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
          <div class="health-hero glass">
            <span class="health-eyebrow">Health • Longevity • Purity</span>
            <h2 class="health-title">Stay Healthy <em>& Add Years</em> to Your Life</h2>
            <p class="health-sub">by drinking the purest hydrogen water — daily ritual, cellular renewal</p>
          </div>
          <span class="eyebrow">H2Os • SPE • PEM • 1600 PPB • Platinum Titanium</span>
          <h1>
            <span class="kicker">H2Os presents</span>
            <span class="title">Ultra <em>H₂</em></span>
            <span class="sub">Hydration, upgraded. Health, elevated.</span>
          </h1>
          <p class="lead">
            Advanced hydrogen infusion technology. <strong>1200–1600 ppb</strong> ultra-pure H₂ in 3 minutes. The ritual that turns water into cellular fuel.
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
            <a routerLink="/store" class="btn-ghost other-btn">See Other Products — From ₦40,000 upward <!-- <span>→</span> --></a>
            <span class="free-ship">✓ Free shipping on all orders <!-- • Also from ₦40k --></span>
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
            <!-- H2Os Obsidian Ultra — photoreal matte, brushed steel, H2Os 1.2ppm, bottom-rising bubbles -->
            <div class="obsidian-wrap">
              <div class="obsidian-mock">
                <div class="obsidian-cap"></div>
                <div class="obsidian-band">
                  <span class="brand">H2Os</span>
                  <span class="ppm"><small>H2</small><strong>1.2</strong><small>ppm</small></span>
                </div>
                <div class="obsidian-body">
                  <span class="rim left"></span>
                  <span class="rim right"></span>
                  <div class="body-highlight"></div>
                  <div class="body-watermark">H2Os</div>
                  <div class="obsidian-bubbles">
                    <span style="--x:22%; --d:2.8s; --s:2.2px; --delay:0s"></span>
                    <span style="--x:34%; --d:3.2s; --s:1.8px; --delay:0.4s"></span>
                    <span style="--x:48%; --d:2.6s; --s:2.6px; --delay:0.2s"></span>
                    <span style="--x:62%; --d:3.0s; --s:2.0px; --delay:0.7s"></span>
                    <span style="--x:74%; --d:2.9s; --s:1.6px; --delay:0.1s"></span>
                    <span style="--x:28%; --d:3.4s; --s:1.4px; --delay:0.9s"></span>
                    <span style="--x:52%; --d:3.1s; --s:2.4px; --delay:0.5s"></span>
                    <span style="--x:66%; --d:2.7s; --s:1.9px; --delay:0.3s"></span>
                    <span style="--x:38%; --d:3.6s; --s:1.5px; --delay:0.8s"></span>
                    <span style="--x:58%; --d:2.5s; --s:2.1px; --delay:1.0s"></span>
                    <span style="--x:44%; --d:3.3s; --s:1.7px; --delay:0.6s"></span>
                    <span style="--x:78%; --d:2.4s; --s:1.9px; --delay:1.2s"></span>
                  </div>
                </div>
                <div class="obsidian-base">
                  <button class="base-power" aria-label="Power"><span></span></button>
                </div>
              </div>
              <div class="obsidian-reflection"></div>
              <div class="obsidian-glow"></div>
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
              @if (f.health) {
                <p class="health"><span>→ Health benefit:</span> {{ f.health }}</p>
              }
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
        <div class="center" style="margin-top:18px;">
          <a routerLink="/science" class="btn-neon">Read More — Full Science & Health Benefits →</a>
          <p class="muted" style="margin-top:8px; font-size:12px;">Curious if hydrogen can help your condition? Get the detailed, honest guide.</p>
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
    .health-hero{ margin-bottom: 14px; padding: 14px 16px; border-radius: 16px; border:1px solid rgba(0,255,136,0.14); background: linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.02)); position:relative; overflow:hidden; }
    .health-hero::before{ content:""; position:absolute; left:-20%; top:-40%; width:60%; height:180%; background: radial-gradient(ellipse at center, rgba(0,255,136,0.10), transparent 68%); pointer-events:none; }
    .health-eyebrow{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--neon); display:flex; align-items:center; gap:8px; }
    .health-eyebrow::before{ content:"◆"; color:var(--neon); font-size:8px; }
    .health-title{ font-family:'Space Grotesk',sans-serif; font-size: clamp(22px, 3.2vw, 30px); font-weight:800; letter-spacing:-0.02em; line-height:1; margin: 6px 0 4px; }
    .health-title em{ font-style:normal; color:var(--neon); text-shadow: 0 0 14px rgba(0,255,136,0.32); }
    .health-sub{ font-size:12px; color:var(--text-secondary); letter-spacing:0.02em; }
    .copy h1 { margin: 14px 0 14px; line-height: 0.9; }
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
    .other-products{
      margin-top:18px; display:flex; flex-direction:column; gap:10px; max-width: 520px;
      padding:14px; border-radius:18px;
      background: linear-gradient(135deg, rgba(255,215,0,0.14) 0%, rgba(255,215,0,0.06) 42%, rgba(180, 140, 0, 0.06) 100%);
      border:1px solid rgba(255,215,0,0.22); box-shadow: 0 0 0 1px rgba(255,215,0,0.08), 0 12px 36px rgba(255,215,0,0.10), 0 8px 24px rgba(0,0,0,0.28);
      position:relative; overflow:hidden;
    }
    .other-products::before{ content:""; position:absolute; inset:-1px; background: radial-gradient(420px 120px at 18% 0%, rgba(255,215,0,0.16), transparent 68%); pointer-events:none; }
    .other-products::after{ content:""; position:absolute; left:0; right:0; top:0; height:1px; background: linear-gradient(90deg, transparent, rgba(255,215,0,0.28), transparent); }
    .other-btn{
      justify-content:center; gap:10px; width:100%;
      background: linear-gradient(180deg, #0B0E14, #050507) !important;
      border:1px solid rgba(255,215,0,0.32) !important;
      color: #FFD60A !important;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 0 1px rgba(255,215,0,0.10), 0 10px 28px rgba(0,0,0,0.32), 0 0 18px rgba(255,215,0,0.08);
      position:relative; overflow:hidden; font-weight:800; letter-spacing:0.02em;
      padding:14px 18px !important; font-size:13px !important;
      text-shadow: 0 1px 0 rgba(0,0,0,0.42);
      width:100%; display:inline-flex; align-items:center; transition:.32s;
    }
    .other-btn::before{ content:""; position:absolute; inset:0; background: linear-gradient(90deg, transparent, rgba(0,255,136,0.10), transparent); opacity:0; transition:.32s; }
    .other-btn:hover::before{ opacity:1; }
    .other-btn:hover{ border-color: rgba(255,215,0,0.42) !important; box-shadow: 0 0 0 1px rgba(255,215,0,0.18), 0 14px 36px rgba(255,215,0,0.10), 0 12px 32px rgba(0,0,0,0.32); transform: translateY(-1px); }
    .other-btn span{ color: #FFD60A; }
    .free-ship{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color: #00FF88; display:flex; align-items:center; gap:8px; justify-content:center; font-weight:700; background: rgba(255,215,0,0.10); border:1px solid rgba(255,215,0,0.18); padding:6px 10px; border-radius:999px; width:fit-content; align-self:center; }
    .free-ship::before{ content:"✓"; width:18px;height:18px;border-radius:50%; background: #00FF88; color:#050507; display:grid; place-items:center; font-size:11px; font-weight:800; box-shadow:0 0 10px rgba(255,215,0,0.4); }
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
    /* Obsidian Real — photoreal matte, brushed steel, H2Os band, bottom→top bubbles, reflection */
    .obsidian-wrap{ position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 32px 56px rgba(0,0,0,0.68)) drop-shadow(0 0 32px rgba(0,200,160,0.09)); }
    .obsidian-mock{
      width:168px; height: 412px; display:flex; flex-direction:column; align-items:center; position:relative;
      --cap-h: 30px; --band-h: 28px; --body-h: 304px;
    }
    .obsidian-cap{
      width:92px; height:var(--cap-h); background: linear-gradient(180deg,#6E737D 0%, #4E535D 12%, #32373F 38%, #1E2229 78%, #16191E 100%);
      border-radius: 12px 12px 6px 6px; border:1px solid rgba(255,255,255,0.09);
      box-shadow: inset 0 1.2px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.48), 0 8px 20px rgba(0,0,0,0.54), 0 0 0 1px rgba(0,0,0,0.18);
      position:relative;
    }
    .obsidian-cap::before{ content:""; position:absolute; inset: 5px 6px 7px 6px; border:1px solid rgba(255,255,255,0.08); border-radius:5px; pointer-events:none; }
    .obsidian-cap::after{ content:""; position:absolute; left:10%; right:10%; top:6px; height:1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent); }
    .obsidian-band{
      width:152px; height:28px; margin-top:4px;
      background: linear-gradient(180deg,#0E1218 0%, #0A0E14 100%);
      border-left:1px solid rgba(255,255,255,0.06); border-right:1px solid rgba(255,255,255,0.06);
      border-top:1px solid rgba(255,255,255,0.04); border-bottom:1px solid rgba(0,232,200,0.10);
      display:flex; align-items:center; justify-content:space-between;
      padding: 4px 12px;
      position:relative; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .obsidian-band .brand{
      font-family:'Space Grotesk',sans-serif; font-size:9px; font-weight:800; letter-spacing:0.12em;
      color:rgba(0,232,200,0.92); text-shadow: 0 0 8px rgba(0,232,200,0.42);
      display:flex; align-items:baseline; gap:1px; flex-shrink:0; opacity:0.96;
    }
    .obsidian-band .brand sub{ font-size:7px; font-weight:700; vertical-align: baseline; opacity:0.9; }
    .obsidian-band .ppm{
      display:flex; align-items:baseline; gap:3px;
      padding: 2px 0 3px; position:relative;
      line-height:1; flex-shrink:0;
    }
    .obsidian-band .ppm::after{
      content:""; position:absolute; left:0; right:0; bottom:0; height:1px;
      background: linear-gradient(90deg, transparent, rgba(0,232,200,0.42), transparent);
      box-shadow: 0 0 6px rgba(0,232,200,0.28);
    }
    .obsidian-band .ppm small{ font-family:'JetBrains Mono', monospace; font-size:5px; letter-spacing:0.08em; color:rgba(0,232,200,0.62); text-transform:uppercase; line-height:1; }
    .obsidian-band .ppm strong{ font-family:'JetBrains Mono', monospace; font-size:10px; font-weight:800; color:#00E8C8; text-shadow:0 0 6px rgba(0,232,200,0.62); line-height:1; letter-spacing:0.02em; }
    .obsidian-body{
      width:154px; height:var(--body-h);
      background:
        radial-gradient(420px 200px at 18% 12%, rgba(255,255,255,0.06), transparent 62%),
        linear-gradient(180deg, #11151B 0%, #0D0F14 14%, #090B0F 38%, #070A0D 82%, #05070A 100%);
      border-left:1px solid rgba(0,232,200,0.09); border-right:1px solid rgba(0,232,200,0.09); border-bottom:none;
      position:relative; overflow:hidden; border-radius: 0;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -16px 28px rgba(0,0,0,0.46);
    }
    .obsidian-body::before{ content:""; position:absolute; left:50%; top:22%; width:1px; height:52%; background: linear-gradient(180deg, transparent, rgba(255,215,0,0.08), transparent); transform:translateX(-50%); }
    .obsidian-body .rim{ position:absolute; top:0; bottom:0; width:1px; background: linear-gradient(180deg, transparent, rgba(0,232,200,0.32) 14%, rgba(0,232,200,0.58) 36%, rgba(0,232,200,0.24) 72%, transparent); filter: blur(0.5px); opacity:0.92; }
    .obsidian-body .rim.left{ left:0; } .obsidian-body .rim.right{ right:0; }
    .body-highlight{ position:absolute; left:9%; top:0; bottom:0; width:12%; background: linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 28%, transparent 68%); filter: blur(0.7px); pointer-events:none; }
    .body-highlight::after{ content:""; position:absolute; left:42%; top:0; bottom:0; width:18%; background: linear-gradient(180deg, rgba(255,255,255,0.04), transparent 56%); }
    .body-watermark{
      position:absolute; left:50%; top:50%; transform: translate(-50%,-52%) rotate(-90deg);
      font-family:'Space Grotesk',sans-serif; font-size:38px; font-weight:800; letter-spacing:0.14em;
      color: rgba(255,255,255,0.042); text-shadow: 0 1px 0 rgba(255,255,255,0.05);
      pointer-events:none; user-select:none; white-space:nowrap;
    }
    .obsidian-bubbles{ position:absolute; inset:0; overflow:hidden; pointer-events:none; }
    .obsidian-bubbles span{
      position:absolute; bottom:-12px; width:var(--s); height:var(--s); left:var(--x);
      background: radial-gradient(circle at 32% 28%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.94) 18%, rgba(210,255,240,0.78) 34%, rgba(0,232,200,0.62) 58%, rgba(0,160,130,0.32) 100%);
      border-radius:50%; box-shadow: 0 0 7px rgba(0,232,200,0.48), inset 0 1px 1px rgba(255,255,255,0.96), inset 0 -1px 1px rgba(0,0,0,0.12);
      animation: riseReal var(--d) linear infinite; animation-delay: var(--delay); opacity:0;
    }
    @keyframes riseReal{
      0%{ transform: translateY(0) translateX(0) scale(0.68); opacity:0; }
      6%{ opacity:0.98; }
      82%{ opacity:0.94; }
      100%{ transform: translateY(-272px) translateX(var(--drift, 0px)) scale(1.06); opacity:0; }
    }
    .obsidian-bubbles span:nth-child(odd){ --drift: 1.2px; } .obsidian-bubbles span:nth-child(even){ --drift: -1px; }
    .obsidian-bubbles span:nth-child(3n){ filter: brightness(1.08); }
    .obsidian-base{
      width:152px; height:32px;
      background: linear-gradient(180deg,#4A4F58 0%, #2E333C 26%, #1C1F26 78%, #121417 100%);
      border:1px solid rgba(255,255,255,0.08); border-top:none; border-radius: 0 0 16px 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.14); position:relative;
      display:grid; place-items:center;
    }
    .obsidian-base::after{ content:""; position:absolute; left:8%; right:8%; top:0; height:1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent); }
    .base-power{
      width:22px; height:22px; border-radius:50%;
      background: radial-gradient(circle at 32% 28%, #2A3038, #0E1116 62%, #080A0E);
      border:1px solid rgba(0,232,200,0.18);
      display:grid; place-items:center; cursor:pointer;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 0 10px rgba(0,232,200,0.16), 0 2px 8px rgba(0,0,0,0.42);
    }
    .base-power span{ width:8px; height:8px; border:1.6px solid #00E8C8; border-radius:50%; position:relative; box-shadow:0 0 7px rgba(0,232,200,0.62); display:block; }
    .base-power span::after{ content:""; position:absolute; left:50%; top:1.5px; width:1.4px; height:5px; background:#00E8C8; transform:translateX(-50%); border-radius:999px; box-shadow:0 0 5px #00E8C8; }
    .obsidian-reflection{
      width:152px; height:64px; margin-top:3px;
      background: linear-gradient(180deg, rgba(0,232,200,0.11) 0%, rgba(0,232,200,0.04) 32%, rgba(0,0,0,0) 72%);
      filter: blur(0.7px); opacity:0.86; border-radius: 0 0 12px 12px; position:relative; overflow:hidden;
    }
    .obsidian-reflection::before{ content:""; position:absolute; left:0; right:0; top:0; height:22px; background: linear-gradient(180deg, rgba(255,255,255,0.06), transparent); }
    .obsidian-reflection::after{ content:""; position:absolute; left:10%; right:10%; top:8px; height:1px; background: linear-gradient(90deg, transparent, rgba(0,232,200,0.18), transparent); }
    .obsidian-glow{ position:absolute; inset:auto 8% -16% 8%; height:68px; background: radial-gradient(ellipse at center, rgba(0,232,200,0.13), transparent 68%); filter:blur(16px); pointer-events:none; }
    @media(max-width: 640px){
      .obsidian-mock{ width:152px; --body-h: 268px; height: 368px; }
      .obsidian-body{ height:var(--body-h); }
      .obsidian-band .brand{ font-size:9px; }
      .obsidian-band .ppm strong{ font-size:9px; }
      .bottle-stage{ height: 480px; }
    }
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
    .benefit .health{ margin-top:10px; padding:9px 10px; border-radius:10px; background: linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.03)); border:1px solid rgba(0,255,136,0.12); font-size:12px; color:var(--text-primary); line-height:1.5; }
    .benefit .health span{ font-weight:800; color:var(--neon); font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; margin-right:4px; }
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
      .other-btn{ font-size: 12px !important; padding:12px 16px !important; }
    }
    @media (max-width: 640px){
      .benefits{ grid-template-columns: 1fr; }
      .bar-row{ grid-template-columns: 110px 1fr 60px; }
      .hero-grid{ padding: 18px 16px 24px; min-height:auto; }
      .bottle-stage{ height: 560px; min-height: 560px; }
      .obsidian-wrap{ transform: scale(0.96); }
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
