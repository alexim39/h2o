import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AiChatWidgetComponent } from './shared/components/ai-chat/ai-chat-widget.component';
import { CartDrawerComponent } from './features/cart/cart-drawer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { LoadingService } from './core/services/loading.service';

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

    <!-- Background ambience -->
    <div class="ambient"></div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; position: relative; }
    main { min-height: 60vh; }
    .ambient {
      position: fixed; inset: 0; pointer-events: none; z-index: -1;
      background:
        radial-gradient(700px 420px at 18% 10%, rgba(0,255,136,0.10), transparent 60%),
        radial-gradient(900px 500px at 88% 28%, rgba(0,255,136,0.06), transparent 65%),
        radial-gradient(600px 600px at 50% 95%, rgba(0,255,136,0.04), transparent 70%),
        linear-gradient(180deg, #050507 0%, #07090C 100%);
    }
  `]
})
export class AppComponent {
  cartOpen = signal(false);
  private router = inject(Router);
  private loading = inject(LoadingService);

  constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) this.loading.show();
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
        setTimeout(() => this.loading.hide(), 320);
      }
    });
  }
}
