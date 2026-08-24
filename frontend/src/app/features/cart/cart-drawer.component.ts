import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="overlay" [class.open]="open()" (click)="closed.emit()"></div>
    <aside class="drawer" [class.open]="open()">
      <div class="head">
        <h3>Your Ritual <span>({{ cart.count() }})</span></h3>
        <button class="icon" (click)="closed.emit()" aria-label="Close">×</button>
      </div>

      @if (cart.isEmpty()) {
        <div class="empty">
          <img src="/images/ultraH2.jpeg" alt="Ultra H₂" class="empty-img" />
          <h4>Your cart is still pure</h4>
          <p>Add H2Os Ultra H₂ and experience 1600 ppb hydration.</p>
          <a routerLink="/store" (click)="closed.emit()" class="btn-neon">Shop Ultra H₂</a>
          <a routerLink="/videos" (click)="closed.emit()" class="ghost">Watch how to use →</a>
        </div>
      } @else {
        <div class="lines">
          @for (l of cart.lines(); track l.variantId) {
            <div class="line">
              <img src="/images/ultraH2.jpeg" class="thumb-img" alt="Ultra H₂" />
              <div class="info">
                <strong>H2Os {{ l.name }}</strong>
                <span>{{ l.finish }}</span>
                <span class="sku">{{ l.sku }}</span>
              </div>
              <div class="qty">
                <button (click)="cart.decrement(l.variantId)">−</button>
                <span>{{ l.qty }}</span>
                <button (click)="cart.increment(l.variantId)">+</button>
              </div>
              <div class="price">{{ cart.formatNGN(l.price * l.qty) }}</div>
              <button class="remove" (click)="cart.remove(l.variantId)" aria-label="Remove">×</button>
            </div>
          }
        </div>

        <div class="summary">
          <div class="row"><span>Subtotal</span><strong>{{ cart.formatNGN(cart.subtotal()) }}</strong></div>
          <div class="row"><span>Delivery</span><strong class="free">Free shipping ✓</strong></div>
          <div class="row total"><span>Total</span><strong class="neon-text">{{ cart.formatNGN(cart.total()) }}</strong></div>
          <p class="note">✓ Free shipping on all orders • Paystack secure • 256-bit SSL • H2Os</p>
          <a routerLink="/checkout" (click)="closed.emit()" class="btn-neon full">Secure Checkout →</a>
          <a routerLink="/store" (click)="closed.emit()" class="ghost">Continue shopping</a>
        </div>
      }
    </aside>
  `,
  styles: [`
    .overlay { position: fixed; inset:0; background: rgba(0,0,0,0.54); backdrop-filter: blur(2px); opacity:0; pointer-events:none; transition:.25s; z-index: 70; }
    .overlay.open { opacity:1; pointer-events:auto; }
    .drawer { position: fixed; top:0; right:0; bottom:0; width: 420px; max-width: 92vw; background: #0B0D10; border-left: 1px solid var(--border); z-index: 71; transform: translateX(100%); transition: transform .32s cubic-bezier(.32,.72,0,1); display:flex; flex-direction:column; }
    .drawer.open { transform: translateX(0); }
    .head { height: 72px; padding: 0 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); }
    .head h3 { font-size:15px; letter-spacing:0.06em; text-transform:uppercase; }
    .head h3 span { color: var(--text-secondary); font-weight:500; }
    .icon { width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--text-primary);font-size:20px; }
    .empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px; text-align:center; gap:14px; }
    .empty-img{ width:120px; height:auto; border-radius:16px; border:1px solid var(--border); filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4)); }
    .empty h4{ font-size:16px; }
    .empty p{ font-size:13px; color:var(--text-secondary); max-width:260px; }
    .lines{ flex:1; overflow:auto; padding:14px; display:flex; flex-direction:column; gap:12px; }
    .line{ display:grid; grid-template-columns: 56px 1fr auto; gap:10px; align-items:center; background: var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:12px; position:relative; }
    .thumb-img{ width:56px;height:64px;border-radius:12px; border:1px solid rgba(255,255,255,0.06); object-fit:contain; background:#0A0C0F; padding:4px; }
    .info strong{ font-size:13px; display:block; }
    .info span{ font-size:11px; color:var(--text-secondary); display:block; }
    .info .sku{ font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.08em; color:var(--text-muted); }
    .qty{ grid-column:2; display:flex; align-items:center; gap:8px; margin-top:6px; }
    .qty button{ width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--text-primary); }
    .qty span{ min-width:20px; text-align:center; font-weight:700; font-size:13px; }
    .price{ grid-column:3; grid-row:1; font-weight:800; font-size:13px; }
    .remove{ position:absolute; top:8px; right:8px; width:22px;height:22px;border-radius:50%;background:transparent;border:none;color:var(--text-muted); }
    .summary{ padding:18px; border-top:1px solid var(--border); background: linear-gradient(180deg, rgba(0,255,136,0.04), transparent); display:flex; flex-direction:column; gap:10px; }
    .row{ display:flex; justify-content:space-between; font-size:13px; color:var(--text-secondary); }
    .row .free{ color:var(--neon); font-weight:700; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); padding:2px 8px; border-radius:999px; font-size:11px; }
    .row.total{ color:var(--text-primary); font-size:15px; padding-top:10px; border-top:1px dashed var(--border); }
    .note{ font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); text-align:center; }
    .full{ width:100%; }
    .ghost{ text-align:center; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-secondary); padding:8px; }
  `]
})
export class CartDrawerComponent {
  open = input.required<boolean>();
  closed = output<void>();
  cart = inject(CartService);
}
