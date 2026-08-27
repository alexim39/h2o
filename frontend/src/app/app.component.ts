import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AiChatWidgetComponent } from './shared/components/ai-chat/ai-chat-widget.component';
import { CartDrawerComponent } from './features/cart/cart-drawer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { LoadingService } from './core/services/loading.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AiChatWidgetComponent, CartDrawerComponent, ToastComponent, LoadingComponent],
  template: `
    <app-loading />
    <app-header (openCart)="cartOpen.set(true)" />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-ai-chat-widget />
    <app-cart-drawer [open]="cartOpen()" (closed)="cartOpen.set(false)" />
    <app-toast />

    <!-- Premium luxury ambience — hydrogen, health, crown watermark -->
    <div class="ambient">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="crown-watermark">♔</div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; position: relative; }
    main { min-height: 60vh; position:relative; z-index:1; }
    .ambient{
      position: fixed; inset:0; pointer-events:none; z-index:-1; overflow:hidden;
      background:
        radial-gradient(820px 420px at 14% 8%, rgba(0,255,136,0.09), transparent 62%),
        radial-gradient(720px 380px at 88% 22%, rgba(255,214,10,0.06), transparent 66%),
        radial-gradient(640px 420px at 50% 96%, rgba(0,200,160,0.05), transparent 70%),
        radial-gradient(520px 280px at 72% 68%, rgba(0,232,200,0.04), transparent 72%),
        linear-gradient(180deg, #050507 0%, #070A0F 48%, #050507 100%);
    }
    .ambient::before{
      content:""; position:absolute; inset:0;
      background-image:
        radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px);
      background-size: 32px 32px, 32px 32px;
      mask-image: radial-gradient(900px 600px at 50% 20%, black 30%, transparent 78%);
      opacity:0.6;
    }
    .orb{
      position:absolute; border-radius:50%; filter: blur(1px);
      will-change: transform;
    }
    .orb-1{
      width:min(42vw,520px); aspect-ratio:1; top:-8%; right:-6%;
      background: radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 62%);
      animation: drift1 18s ease-in-out infinite;
    }
    .orb-2{
      width:min(36vw,440px); aspect-ratio:1; bottom:-6%; left:-4%;
      background: radial-gradient(circle, rgba(255,214,10,0.06) 0%, transparent 62%);
      animation: drift2 20s ease-in-out infinite;
    }
    .orb-3{
      width:min(28vw,320px); aspect-ratio:1; top:42%; left:52%; transform: translate(-50%,-50%);
      background: radial-gradient(circle, rgba(0,232,200,0.04) 0%, transparent 62%);
      animation: pulse 14s ease-in-out infinite;
    }
    @keyframes drift1{ 0%,100%{ transform: translate(0,0) scale(1)} 50%{ transform: translate(-18px,14px) scale(1.06)}}
    @keyframes drift2{ 0%,100%{ transform: translate(0,0) scale(1)} 50%{ transform: translate(14px,-16px) scale(1.05)}}
    @keyframes pulse{ 0%,100%{ transform: translate(-50%,-50%) scale(1); opacity:0.6} 50%{ transform: translate(-50%,-50%) scale(1.08); opacity:1}}
    .crown-watermark{
      position:absolute; left:50%; top:46%; transform: translate(-50%,-50%);
      font-size: min(42vw, 520px); line-height:1; font-weight:100;
      color: rgba(255,255,255,0.015); text-shadow: 0 0 80px rgba(255,255,255,0.04);
      pointer-events:none; user-select:none;
      filter: blur(0.3px);
    }
    .crown-watermark::after{
      content:"H2Os  •  Health | Quality | Luxury";
      position:absolute; left:50%; top:108%; transform: translateX(-50%);
      font-family:'Space Grotesk',sans-serif; font-size: 11px; font-weight:700; letter-spacing:0.28em; text-transform:uppercase;
      color: rgba(255,255,255,0.018); white-space:nowrap;
    }
    @media(max-width: 640px){
      .crown-watermark{ font-size: min(68vw, 320px); top:44%; }
      .orb-1{ width: 72vw; } .orb-2{ width: 64vw; }
    }
    @media(prefers-reduced-motion: reduce){
      .orb{ animation:none; }
    }
  `]
})
export class AppComponent {
  cartOpen = signal(false);
  private router = inject(Router);
  private loading = inject(LoadingService);
  private seo = inject(SeoService);

  constructor() {
    this.seo.init();
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) this.loading.show();
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
        setTimeout(() => this.loading.hide(), 320);
      }
    });
  }
}
