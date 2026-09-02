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
            <span class="logo-wrap">
              <img src="/images/logo.png" alt="H2Os — Health | Quality | Luxury" class="logo-img" />
            </span>
            <div>
              <strong><!-- H2Os —  -->Ultra H₂</strong>
              <span>hydrogenwaterbottles.store • Health | Quality | Luxury • Hydration, upgraded.</span>
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
            <a href="https://www.google.com/maps/search/?api=1&query=3RD%20FLOOR%2C%20BANK%20OF%20AGRICULTURE%20BUILDING%2C%20Opposite%20Eco%20Bank%2C%20Olu-Obasanjo%20Road%2C%20Port%20Harcourt" target="_blank" rel="noopener" class="address-link">📍 3RD FLOOR, BANK OF AGRICULTURE BUILDING, Opposite Eco Bank, Olu-Obasanjo Road, Port Harcourt.</a>
            <a routerLink="/mgt" class="mgt-link" target="_blank">⚙ H2Os - mgt</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .ft { border-top: 1px solid var(--border); background: #07080A; padding: 48px 0 32px; margin-top: 40px; }
    .grid { display: grid; grid-template-columns: 1.2fr 0.8fr 0.8fr 1.2fr; gap: 32px; }
    .brand { display:flex; gap:12px; align-items:center; }
    .logo-wrap{ width:62px; height:52px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); display:grid; place-items:center; padding:5px; box-shadow: 0 4px 14px rgba(0,0,0,0.22); }
    .logo-img{ width:100%; height:100%; object-fit:contain; border-radius:14px; }
    .brand strong { display:block; letter-spacing:0.06em; font-size:13px; }
    .brand span { font-size:11px; color: var(--text-muted); }
    .col h4 { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color: var(--text-muted); margin-bottom: 14px; }
    .col a { display:block; font-size:13px; color: var(--text-secondary); margin: 8px 0; }
    .col a:hover { color: var(--text-primary); }
    .badges { display:flex; flex-wrap:wrap; gap:8px; }
    .badge { font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; padding:6px 10px; border-radius:999px; border:1px solid var(--border); color: var(--text-secondary); background: rgba(255,255,255,0.03); }
    .legal { margin-top:16px; font-size:11px; color: var(--text-muted); line-height:1.6; }
    .address-link{ display:inline-flex; align-items:center; gap:6px; margin-top:10px; font-size:11px; line-height:1.5; color: var(--text-secondary) !important; border:1px solid var(--border); background: rgba(255,255,255,0.03); padding:8px 10px; border-radius:12px; text-decoration:none; }
    .address-link:hover{ color: var(--neon) !important; border-color: rgba(0,255,136,0.22); background: rgba(0,255,136,0.06); }
    .mgt-link { display:inline-flex; align-items:center; gap:6px; margin-top:10px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-muted) !important; opacity:0.55; border:1px dashed var(--border); padding:6px 10px; border-radius:999px; }
    .mgt-link:hover { opacity:1; color: var(--neon) !important; border-color: rgba(0,255,136,0.22); }
    @media (max-width: 900px){ .grid{ grid-template-columns: 1fr 1fr; } }
    @media (max-width: 560px){ .grid{ grid-template-columns: 1fr; } }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
