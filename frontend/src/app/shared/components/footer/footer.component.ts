import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="ft">
      <div class="container">
        <div class="grid">
          <div class="brand">
            <div class="mark">H<sub>2</sub>Os</div>
            <div>
              <strong>H2Os — Ultra H₂</strong>
              <span>hydrogenwaterbottles.store • Hydration, upgraded.</span>
            </div>
          </div>
          <div class="col">
            <h4>Ritual</h4>
            <a routerLink="/store">All Products</a>
            <a routerLink="/" fragment="science">Science & Benefits</a>
            <a routerLink="/videos">How to Use & Videos</a>
            <a routerLink="/reviews">Community Reviews</a>
          </div>
          <div class="col">
            <h4>Care</h4>
            <a routerLink="/store">Store • H2Os</a>
            <a href="#">Shipping & Returns</a>
            <a href="#">30-Day Guarantee</a>
            <a href="#">Contact H2Os Concierge</a>
          </div>
          <div class="col">
            <h4>Secure & Manage</h4>
            <div class="badges">
              <span class="badge">Paystack</span>
              <span class="badge">SSL Encrypted</span>
              <span class="badge">CE • FCC • IP67</span>
            </div>
            <p class="legal">© {{year}} H2Os. Ultra H₂ — Advanced hydrogen infusion. More H2Os bottles coming soon.</p>
            <a routerLink="/mgt" class="mgt-link">⚙ H2Os MGT — Restricted</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .ft { border-top: 1px solid var(--border); background: #07080A; padding: 48px 0 32px; margin-top: 40px; }
    .grid { display: grid; grid-template-columns: 1.2fr 0.8fr 0.8fr 1.2fr; gap: 32px; }
    .brand { display:flex; gap:12px; align-items:center; }
    .mark { width:44px; height:40px; border-radius:12px; background: var(--neon); color:#050507; display:inline-flex; align-items: baseline; justify-content:center; font-weight:800; box-shadow: var(--neon-glow); font-size:14px; padding-top:6px; }
    .mark sub { font-size:10px; font-weight:800; }
    .brand strong { display:block; letter-spacing:0.06em; font-size:13px; }
    .brand span { font-size:11px; color: var(--text-muted); }
    .col h4 { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color: var(--text-muted); margin-bottom: 14px; }
    .col a { display:block; font-size:13px; color: var(--text-secondary); margin: 8px 0; }
    .col a:hover { color: var(--text-primary); }
    .badges { display:flex; flex-wrap:wrap; gap:8px; }
    .badge { font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; padding:6px 10px; border-radius:999px; border:1px solid var(--border); color: var(--text-secondary); background: rgba(255,255,255,0.03); }
    .legal { margin-top:16px; font-size:11px; color: var(--text-muted); line-height:1.6; }
    .mgt-link { display:inline-flex; align-items:center; gap:6px; margin-top:12px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-muted) !important; opacity:0.55; border:1px dashed var(--border); padding:6px 10px; border-radius:999px; }
    .mgt-link:hover { opacity:1; color: var(--neon) !important; border-color: rgba(0,255,136,0.22); }
    @media (max-width: 900px){ .grid{ grid-template-columns: 1fr 1fr; } }
    @media (max-width: 560px){ .grid{ grid-template-columns: 1fr; } }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
