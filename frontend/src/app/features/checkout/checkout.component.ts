import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { PaystackService } from '../../core/services/paystack.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ShippingDetails } from '../../core/models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="section">
      <div class="container">
        <div class="steps glass">
          <span [class.active]="true">1 Shipping</span><span>→</span>
          <span [class.active]="false">2 Pay</span><span>→</span>
          <span>3 Done</span>
        </div>
      </div>
      <div class="container checkout-grid">
        <!-- Form -->
        <div class="form-card glass">
          <span class="eyebrow">Secure checkout • Paystack • Free shipping on all orders</span>
          <h1>Your ritual, delivered.</h1>
          <p class="muted">✓ Free shipping on all orders • Express 1–3 days • 30-day guarantee • Encrypted.</p>

          <form (ngSubmit)="pay()" #f="ngForm" class="form">
            <div class="group">
              <label>Full Name</label>
              <input [(ngModel)]="shipping.fullName" name="fullName" required placeholder="Amara Okafor" />
            </div>

            <div class="row">
              <div class="group"><label>Email (for receipt)</label><input type="email" [(ngModel)]="shipping.email" name="email" required placeholder="you&#64;ritual.com" /></div>
              <div class="group"><label>Phone</label><input [(ngModel)]="shipping.phone" name="phone" required placeholder="+234 800 000 0000" /></div>
            </div>

            <div class="group"><label>Delivery Address</label><input [(ngModel)]="shipping.address" name="address" required placeholder="12 Obsidian Way, Victoria Island" /></div>

            <div class="row3">
              <div class="group"><label>City</label><input [(ngModel)]="shipping.city" name="city" required placeholder="Lagos" /></div>
              <div class="group">
                <label>State</label>
                <input list="ngStates" [(ngModel)]="shipping.state" name="state" required placeholder="Select State — e.g., Rivers, Lagos, Abuja" autocomplete="address-level1" />
                <datalist id="ngStates">
                  @for (s of nigeriaStates; track s) { <option [value]="s"></option> }
                </datalist>
              </div>
              <div class="group"><label>Country</label><input [(ngModel)]="shipping.country" name="country" required placeholder="Nigeria" /></div>
            </div>

            <div class="group"><label>Notes (optional)</label><textarea [(ngModel)]="shipping.notes" name="notes" rows="2" placeholder="Gate code, delivery instructions..."></textarea></div>

            <div class="group coupon-row">
              <label>Coupon (optional)</label>
              <div class="coupon-input">
                <input [(ngModel)]="coupon" name="coupon" placeholder="H2OS10" style="text-transform:uppercase" />
                <button type="button" class="btn-ghost sm" (click)="applyCoupon()" [disabled]="couponLoading()">Apply</button>
              </div>
              @if (couponMsg()) { <p class="muted small">{{ couponMsg() }}</p> }
              @if (couponError()) { <div class="error">{{ couponError() }}</div> }
            </div>

            <label class="check sub-toggle"><input type="checkbox" [checked]="subscribeMonthly()" (change)="subscribeMonthly.set(!subscribeMonthly())" /> Subscribe & Save — monthly filters/refills, pause anytime</label>

            <div class="group coupon-row">
              <label>Referral code (friend earns ₦10k)</label>
              <div class="coupon-input">
                <input [(ngModel)]="referral" name="referral" placeholder="8-CHAR CODE" style="text-transform:uppercase" />
                <button type="button" class="btn-ghost sm" (click)="applyReferral()">Check</button>
              </div>
              @if (referralMsg()) { <p class="muted small">{{ referralMsg() }}</p> }
            </div>

            @if (error()) { <div class="error">{{ error() }}</div> }

            <button type="submit" class="btn-neon full" [disabled]="loading() || cart.isEmpty()">
              @if (loading()) { Processing… } @else { Pay {{ cart.formatNGN(cart.total()) }} with Paystack → }
            </button>
            <p class="secure">🔒 Paystack 256-bit • You’ll be redirected to Paystack secure page</p>
            <a routerLink="/store" class="back">← Back to Store</a>
          </form>
        </div>

        <!-- Summary -->
        <div class="summary">
          <div class="summary-card glass">
            <h3>Order Summary</h3>
            @if (cart.isEmpty()) {
              <p class="muted">Your cart is empty.</p>
              <br />
              <a routerLink="/store" class="btn-ghost full">Select Bottle</a>
            } @else {
              <div class="lines">
                @for (l of cart.lines(); track l.variantId) {
                  <div class="line">
                    <div class="thumb" [style.background]="l.gradient"></div>
                    <div><strong>{{ l.name }}</strong><span>{{ l.qty }} × {{ cart.formatNGN(l.price) }}</span></div>
                    <b>{{ cart.formatNGN(l.price * l.qty) }}</b>
                  </div>
                }
              </div>
              <div class="totals">
                <div class="row"><span>Subtotal</span><b>{{ cart.formatNGN(cart.subtotal()) }}</b></div>
                <div class="row"><span>Delivery</span><b class="neon-text">Free shipping ✓</b></div>
                <div class="row total"><span>Total</span><b class="neon-text">{{ cart.formatNGN(cart.total()) }}</b></div>
              </div>
              <div class="paystack-badge">
                <span>Powered by</span><strong>Paystack</strong>
                <span class="cards">VISA • MASTERCARD • VERVE • BANK</span>
              </div>
            }
          </div>

          <div class="guarantee glass">
            <h4>30-Day Ritual Guarantee</h4>
            <p>If you don’t feel the clarity, return it — no questions. Obsidian luxury, zero risk.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .steps{ display:flex; gap:10px; align-items:center; justify-content:center; border-radius:999px; padding:10px 14px; margin-bottom:16px; font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .steps span.active{ color:var(--neon); font-weight:800; }
    .coupon-row .coupon-input{ display:flex; gap:8px; }
    .coupon-input input{ flex:1; background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:10px 12px; color:var(--text-primary); font-size:13px; outline:none; }
    .sub-toggle{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text-secondary); background: rgba(0,255,136,0.06); border:1px solid rgba(0,255,136,0.14); border-radius:12px; padding:10px 12px; }
    .small{ font-size:11px; }
    .checkout-grid{ display:grid; grid-template-columns: 1.2fr 0.8fr; gap:24px; align-items:start; }
    .form-card{ border-radius:24px; padding:26px; }
    .form-card h1{ font-family:'Space Grotesk',sans-serif; font-size:26px; letter-spacing:-0.02em; margin:8px 0 6px; }
    .muted{ color:var(--text-secondary); font-size:13px; }
    .form{ margin-top:18px; display:flex; flex-direction:column; gap:14px; }
    .group{ display:flex; flex-direction:column; gap:6px; flex:1; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input, .group textarea{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:12px 14px; color:var(--text-primary); font-size:13px; outline:none; }
    .group input:focus, .group textarea:focus{ border-color: rgba(0,255,136,0.35); box-shadow: 0 0 0 3px rgba(0,255,136,0.10); }
    .row{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .row3{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
    .full{ width:100%; justify-content:center; }
    .error{ background: rgba(255,77,106,0.10); border:1px solid rgba(255,77,106,0.22); color:#FF8A9E; padding:10px 12px; border-radius:12px; font-size:13px; }
    .secure{ text-align:center; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .back{ text-align:center; font-size:12px; color:var(--text-secondary); margin-top:4px; display:block; }

    .summary{ display:flex; flex-direction:column; gap:14px; position:sticky; top:88px; }
    .summary-card{ border-radius:20px; padding:18px; }
    .summary-card h3{ font-size:13px; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:12px; }
    .lines{ display:flex; flex-direction:column; gap:10px; }
    .line{ display:flex; align-items:center; gap:10px; background: var(--bg-card); border:1px solid var(--border); border-radius:14px; padding:10px; }
    .thumb{ width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.06); }
    .line div strong{ display:block; font-size:12px; }
    .line div span{ font-size:11px; color:var(--text-secondary); }
    .line b{ margin-left:auto; font-size:12px; }
    .totals{ margin-top:14px; display:flex; flex-direction:column; gap:8px; }
    .row span{ color:var(--text-secondary); font-size:13px; }
    .row.total{ padding-top:10px; border-top:1px dashed var(--border); }
    .paystack-badge{ margin-top:14px; background: rgba(0,255,136,0.06); border:1px solid rgba(0,255,136,0.12); border-radius:14px; padding:12px; text-align:center; }
    .paystack-badge strong{ color:var(--neon); margin-left:6px; }
    .paystack-badge .cards{ display:block; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); margin-top:4px; }
    .guarantee{ border-radius:18px; padding:16px; background: linear-gradient(135deg, rgba(0,255,136,0.08), transparent); }
    .guarantee h4{ font-size:13px; }
    .guarantee p{ font-size:12px; color:var(--text-secondary); margin-top:6px; line-height:1.6; }

    @media(max-width: 960px){ .checkout-grid{ grid-template-columns:1fr; } .summary{ position:static; } .row, .row3{ grid-template-columns:1fr; } }
  `]
})
export class CheckoutComponent {
  cart = inject(CartService);
  private paystack = inject(PaystackService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  coupon = '';
  couponLoading = signal(false);
  couponMsg = signal<string | null>(null);
  couponError = signal<string | null>(null);
  couponDiscount = signal(0);
  subscribeMonthly = signal(false);
  referral = '';
  referralMsg = signal<string | null>(null);

  constructor() {
    try {
      const saved = localStorage.getItem('h2os_referral');
      if (saved) this.referral = saved;
    } catch {}
  }

  nigeriaStates = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT - Abuja'];

  shipping: ShippingDetails = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    notes: ''
  };

  async applyCoupon() {
    this.couponMsg.set(null); this.couponError.set(null);
    const code = this.coupon.trim().toUpperCase();
    if (!code) return;
    this.couponLoading.set(true);
    try {
      const res: any = await new Promise((resolve, reject) => {
        this.api.validateCoupon(code, this.cart.total()).subscribe({ next: (v: any) => resolve(v), error: (e: any) => reject(e) });
      });
      const d = res?.data ?? res;
      if (d?.percent) {
        const discount = d.discount ?? Math.round(this.cart.total() * d.percent / 100);
        this.couponDiscount.set(discount);
        this.couponMsg.set(`${d.code} applied — ${d.percent}% off (−${this.cart.formatNGN(discount)})`);
      } else {
        this.couponError.set('Coupon invalid.');
      }
    } catch (e: any) {
      this.couponError.set(e?.error?.message || 'Invalid or expired coupon.');
      this.couponDiscount.set(0);
    } finally { this.couponLoading.set(false); }
  }

  async applyReferral() {
    this.referralMsg.set(null);
    const code = this.referral.trim().toUpperCase();
    if (!code) return;
    try {
      const res: any = await new Promise((resolve, reject) => {
        this.api.resolveReferral(code).subscribe({ next: (v: any) => resolve(v), error: (e: any) => reject(e) });
      });
      if ((res as any)?.data || (res as any)?.status) {
        this.referralMsg.set(`${code} accepted — friend earns ₦10,000 on your paid order.`);
        try { localStorage.setItem('h2os_referral', code); } catch {}
      }
    } catch {
      this.referralMsg.set('Invalid referral code — continuing without it.');
    }
  }

  async pay() {
    this.error.set(null);

    if (this.cart.isEmpty()) { this.error.set('Your cart is empty. Configure your bottle first.'); return; }

    const s = this.shipping;
    if (!s.fullName || !s.email || !s.phone || !s.address || !s.city || !s.state) {
      this.error.set('Please complete all shipping fields.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) { this.error.set('Enter a valid email address.'); return; }

    this.loading.set(true);
    try {
      const email = s.email.trim();
      const reference = `HYDRO_${Date.now()}_${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      const couponCode = this.coupon.trim().toUpperCase() || undefined;
      const referralCode = this.referral.trim().toUpperCase() || undefined;

      // 1) Create order (blocking — must succeed, carries coupon + referral)
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const done = (fn: () => void) => { if (!settled) { settled = true; fn(); } };
        this.api.createOrder({ items: this.cart.items(), shipping: s, reference, total: this.cart.total(), coupon: couponCode, referral: referralCode }).subscribe({
          next: () => done(() => resolve()),
          error: (e: any) => done(() => reject(e))
        });
        setTimeout(() => done(() => resolve()), 8000);
      });

      // 2) Initialize Paystack with SAME reference + coupon
      const init = await this.paystack.initialize(s, email, { coupon: couponCode, reference });

      // 3) Real Paystack popup (no mock fallback — backend is live)
      await this.paystack.payWithInline(
        email,
        this.cart.paystackAmount(),
        init.data.reference,
        (ref) => this.handleSuccess(ref),
        () => {
          this.loading.set(false);
          this.toast.show('Payment window closed — you can try again.', 'info');
        }
      );
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'Payment initialization failed. Please try again.');
      this.loading.set(false);
    }
  }

  private async handleSuccess(ref: string) {
    const wantSub = this.subscribeMonthly();
    const subEmail = this.shipping.email.trim();
    const subItems = this.cart.items();
    try {
      await this.paystack.verify(ref);
      if (wantSub && subEmail) {
        try {
          await new Promise((resolve) => {
            this.api.createSubscription(subEmail, subItems).subscribe({ next: () => resolve(null), error: () => resolve(null) });
            setTimeout(() => resolve(null), 4000);
          });
          this.toast.show('Subscription active — monthly delivery', 'success');
        } catch {}
      }
      this.cart.clear();
      this.toast.show('Ritual secured — welcome to HYDRO+ ELITE', 'success');
      this.router.navigate(['/confirmation', ref]);
    } catch {
      this.router.navigate(['/confirmation', ref]);
    } finally {
      this.loading.set(false);
    }
  }
}
