import { Component, output, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="hdr" [class.scrolled]="true">
      <div class="container inner">
        <a routerLink="/" class="brand" (click)="closeMenu()">
          <span class="mark">H<sub>2</sub>Os</span>
          <span class="word">
            <strong>H2Os</strong>
            <em>Ultra H₂</em>
          </span>
          <span class="dot"></span>
        </a>

        <nav class="nav hide-m">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/store" routerLinkActive="active">Store</a>
          <a routerLink="/videos" routerLinkActive="active">Videos</a>
          <a routerLink="/reviews" routerLinkActive="active">Reviews</a>
          <a routerLink="/" fragment="science">Science</a>
          <a routerLink="/" fragment="specs">Specs</a>
        </nav>

        <div class="actions">
          <button class="cart-btn" (click)="openCart.emit()" aria-label="Open cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6h15l-1.5 9H7z"/><path d="M6 6L5 2H2"/><circle cx="9" cy="20" r="1.8"/><circle cx="18" cy="20" r="1.8"/></svg>
            <span class="hide-xs">Cart</span>
            @if (cartCount() > 0) {
              <span class="badge">{{ cartCount() }}</span>
            }
          </button>
          <a routerLink="/store" class="btn-neon sm hide-m">Shop — {{ priceLabel() }}</a>
          <button class="hamburger" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- Mobile drawer -->
      <div class="mobile-overlay" [class.open]="menuOpen()" (click)="closeMenu()"></div>
      <nav class="mobile-nav" [class.open]="menuOpen()">
        <div class="mobile-head">
          <span class="mark">H<sub>2</sub>Os</span>
          <strong>H2Os</strong>
          <button class="close" (click)="closeMenu()">×</button>
        </div>
        <a routerLink="/store" routerLinkActive="active" (click)="closeMenu()">🛍 Store — All Bottles</a>
        <a routerLink="/videos" routerLinkActive="active" (click)="closeMenu()">▶ Videos — How to & Testimonials</a>
        <a routerLink="/reviews" routerLinkActive="active" (click)="closeMenu()">★ Community Reviews</a>
        <a routerLink="/" fragment="science" (click)="closeMenu()">◈ Science</a>
        <a routerLink="/" fragment="specs" (click)="closeMenu()">⬢ Specs</a>
        <a routerLink="/product" (click)="closeMenu()">Ultra H₂ Detail</a>
        <div class="mobile-cta">
          <a routerLink="/store" class="btn-neon full" (click)="closeMenu()">Shop Store — From ₦40,000 →</a>
          <p class="free">✓ Free shipping on all orders • Paystack secure</p>
        </div>
      </nav>

      <div class="announce">
        <div class="container">
          <span class="pulse"></span> Free shipping on all orders • Ultra H₂ now ₦1,300,000 (was ₦1,541,000) • 30-day guarantee
        </div>
      </div>
    </header>
  `,
  styles: [`
    .hdr { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(16px) saturate(1.2); background: rgba(5,5,7,0.78); border-bottom: 1px solid rgba(255,255,255,0.06); }
    .inner { height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 10px; font-family: 'Space Grotesk', sans-serif; flex-shrink:0; }
    .mark { width: 44px; height: 36px; border-radius: 10px; display: inline-flex; align-items: baseline; justify-content: center; gap: 1px; background: var(--neon); color: #050507; font-weight: 800; font-size: 15px; letter-spacing: -0.02em; box-shadow: var(--neon-glow); line-height: 1; padding-top: 7px; }
    .mark sub { font-size: 11px; font-weight: 800; line-height: 1; vertical-align: sub; }
    .word { line-height: 1; display: flex; flex-direction: column; }
    .word strong { font-size: 15px; letter-spacing: 0.08em; font-weight: 800; }
    .word em { font-style: normal; font-size: 11px; letter-spacing: 0.18em; color: var(--neon); font-weight: 700; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--neon); box-shadow: 0 0 8px var(--neon); margin-left: 2px; }
    .nav { display: flex; gap: 18px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); }
    .nav a:hover { color: var(--text-primary); }
    .nav a.active { color: var(--neon); }
    .actions { display: flex; align-items: center; gap: 10px; }
    .link { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary); }
    .link:hover { color: var(--text-primary); }
    .cart-btn { position: relative; display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: var(--text-primary); padding: 10px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; white-space: nowrap; }
    .cart-btn:hover { background: rgba(255,255,255,0.08); }
    .badge { background: var(--neon); color: #050507; font-size: 11px; font-weight: 800; min-width: 18px; height: 18px; border-radius: 999px; display: grid; place-items: center; padding: 0 5px; }
    .btn-neon.sm { padding: 10px 18px; font-size: 12px; white-space: nowrap; }
    .hamburger{ display:none; width:42px;height:42px;border-radius:12px; background: rgba(255,255,255,0.06); border:1px solid var(--border); flex-direction:column; align-items:center; justify-content:center; gap:5px; }
    .hamburger span{ width:18px;height:2px;background: var(--text-primary); border-radius:999px; display:block; }
    .announce { background: linear-gradient(90deg, rgba(0,255,136,0.12), transparent 60%, rgba(0,255,136,0.06)); border-top: 1px solid rgba(0,255,136,0.12); font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); padding: 8px 0; display: flex; align-items: center; gap: 8px; text-align:center; }
    .announce .container{ display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; }
    .pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--neon); box-shadow: 0 0 10px var(--neon); display: inline-block; animation: pulse 1.8s infinite; flex-shrink:0; }
    @keyframes pulse { 0%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} 100%{opacity:1;transform:scale(1)} }

    .mobile-overlay{ position:fixed; inset:68px 0 0 0; background: rgba(0,0,0,0.62); backdrop-filter: blur(4px); opacity:0; pointer-events:none; transition:.22s; z-index:59; }
    .mobile-overlay.open{ opacity:1; pointer-events:auto; }
    .mobile-nav{ position:fixed; top:68px; right:0; bottom:0; width: min(86vw, 340px); background: #0B0D10; border-left:1px solid var(--border); z-index:60; transform: translateX(100%); transition: transform .28s cubic-bezier(.32,.72,0,1); display:flex; flex-direction:column; padding:16px; gap:4px; overflow:auto; box-shadow: -12px 0 32px rgba(0,0,0,0.45); }
    .mobile-nav.open{ transform: translateX(0); }
    .mobile-head{ display:flex; align-items:center; gap:10px; padding-bottom:12px; border-bottom:1px solid var(--border); margin-bottom:8px; }
    .mobile-head strong{ font-size:14px; }
    .mobile-head .close{ margin-left:auto; width:32px;height:32px;border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text-primary); font-size:20px; }
    .mobile-nav a{ padding:12px 10px; border-radius:12px; font-size:13px; font-weight:600; color:var(--text-secondary); border:1px solid transparent; }
    .mobile-nav a:hover{ background: rgba(255,255,255,0.04); color:var(--text-primary); }
    .mobile-nav a.active{ background: rgba(0,255,136,0.08); border-color: rgba(0,255,136,0.18); color:var(--neon); }
    .mobile-cta{ margin-top:12px; padding-top:14px; border-top:1px dashed var(--border); display:flex; flex-direction:column; gap:8px; }
    .mobile-cta .full{ width:100%; justify-content:center; }
    .free{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-muted); text-align:center; }

    @media (max-width: 960px){ .hide-m { display:none !important; } .hamburger{ display:flex; } .nav.hide-m{ display:none; } }
    @media (max-width: 640px){ .inner{ gap:10px; } .cart-btn{ padding:8px 10px; font-size:12px; } .hide-xs{ display:none; } .announce{ font-size: 10px; letter-spacing:0.06em; } }
  `]
})
export class HeaderComponent {
  openCart = output<void>();
  menuOpen = signal(false);
  private cart = inject(CartService);
  cartCount = computed(() => this.cart.count());
  priceLabel = computed(() => this.cart.formatNGN(1300000));
  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }
}
