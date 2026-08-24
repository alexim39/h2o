import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <section class="section">
      <div class="container product-grid">
        <!-- Gallery — multiple images + videos per product (admin upload) -->
        <div class="preview">
          <div class="stage glass">
            <span class="badge-stock">● In Stock • Free shipping • {{ product.product().brand }}</span>
            @if (activeVideo()) {
              <video [src]="activeVideo()!" controls autoplay playsinline class="product-video"></video>
              <button class="close-video" (click)="activeVideo.set(null)">× Back to images</button>
            } @else {
              <img [src]="activeImage()" [alt]="product.product().brand + ' ' + product.product().name" class="product-img" />
            }
            <div class="price-tag">
              <span class="led"></span> 1600 <small>PPB</small>
            </div>
          </div>

          <div class="gallery-thumbs">
            @for (img of galleryImages(); track $index) {
              <button class="thumb-img" [class.active]="activeImage()===img && !activeVideo()" (click)="activeImage.set(img); activeVideo.set(null)">
                <img [src]="img" [alt]="'Image ' + ($index+1)" />
              </button>
            }
            @for (vid of galleryVideos(); track $index) {
              <button class="thumb-vid" [class.active]="activeVideo()===vid" (click)="activeVideo.set(vid)">
                <video [src]="vid" muted preload="metadata"></video>
                <span class="play-sm">▶</span>
              </button>
            }
          </div>

          <div class="trust-strip glass">
            <span>★ {{ product.product().rating || 4.9 }} ({{ product.product().reviewsCount || perProductReviews().length }})</span>
            <span>•</span>
            <span>Paystack Secure</span>
            <span>•</span>
            <span>Free shipping</span>
          </div>

          <a routerLink="/videos" class="video-cta glass">
            <span class="play">▶</span>
            <div>
              <strong>Watch how to use {{ product.product().name }}</strong>
              <span>60-sec ritual • Bubbles in real time</span>
            </div>
            <span class="arrow">→</span>
          </a>

          <div class="breadcrumbs">
            <a routerLink="/store">← Back to Store</a>
            <span>•</span>
            <span>{{ product.product().brand }} {{ product.product().name }}</span>
          </div>
        </div>

        <!-- Details -->
        <div class="details">
          <span class="eyebrow">{{ product.product().brand }} — {{ product.product().name }} • {{ product.product().tagline }}</span>
          <h1>{{ product.product().brand }} {{ product.product().name }}</h1>
          <p class="finish">{{ selected().finish }} • {{ selected().sku }}</p>
          <p class="desc">{{ product.product().description }}</p>

          <div class="pricing">
            <strong class="price">{{ cart.formatNGN(selected().price) }}</strong>
            @if (selected().compareAt) {
              <span class="compare">{{ cart.formatNGN(selected().compareAt!) }}</span>
              <span class="save">Save {{ cart.formatNGN(selected().compareAt! - selected().price) }}</span>
            }
            <span class="free-badge">Free shipping</span>
          </div>
          <p class="vat">VAT included • ✓ Free shipping on all orders</p>

          @if (product.hasMultipleVariants()) {
            <div class="variants">
              <h3>Finish</h3>
              <div class="variant-grid">
                @for (v of product.variants(); track v.id) {
                  <button class="variant" [class.active]="selected().id===v.id" (click)="select(v.id)">
                    <span class="swatch" [style.background]="v.hex"></span>
                    <span class="vname">{{ v.name }}</span>
                    <span class="vprice">{{ cart.formatNGN(v.price) }}</span>
                    @if (selected().id===v.id) { <span class="check">✓</span> }
                  </button>
                }
              </div>
            </div>
          } @else {
            <div class="single-badge">
              <span class="dot"></span> {{ product.product().name }} — {{ product.product().brand }} signature. More in <a routerLink="/store" style="color:var(--neon); text-decoration:underline;">Store</a>.
            </div>
          }

          <div class="qty-row">
            <h3>Quantity</h3>
            <div class="qty">
              <button (click)="dec()">−</button>
              <span>{{ qty() }}</span>
              <button (click)="inc()">+</button>
              <span class="stock">{{ selected().stock }} left • {{ selected().stock < 15 ? 'Low stock' : 'In stock' }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn-neon full" (click)="addToCart()">
              Add to Ritual — {{ cart.formatNGN(selected().price * qty()) }}
            </button>
            <button class="btn-ghost full" (click)="buyNow()">Buy Now with Paystack</button>
            <p class="secure">🔒 Encrypted checkout • Paystack • 256-bit SSL • Free shipping</p>
          </div>

          <div class="accordions">
            <details open>
              <summary>What’s in the box</summary>
              <p>{{ product.product().name }} bottle, USB-C cable, quick-ritual guide, authenticity card, 30-day guarantee. No cartridges, ever.</p>
            </details>
            <details>
              <summary>How hydrogen helps</summary>
              <p>1200–1600 ppb therapeutic hydrogen supports antioxidant defense, recovery, clarity, and gut health. One touch, 3-minute infusion.</p>
            </details>
            <details>
              <summary>Shipping & returns</summary>
              <p>✓ Free shipping on all orders — express 1–3 days Nigeria. 30-day ritual guarantee — if you don’t feel the clarity, return for full refund.</p>
            </details>
            <details>
              <summary>See it in action</summary>
              <p><a routerLink="/videos" style="color:var(--neon); text-decoration:underline;">Watch How to Use + 6 testimonials</a> — real hydrogen tests.</p>
            </details>
          </div>
        </div>
      </div>

      <div class="container specs-mini">
        <div class="spec-grid glass">
          @for (s of product.specs(); track s.label) {
            <div class="s"><span>{{ s.label }}</span><strong>{{ s.value }}</strong></div>
          }
        </div>
      </div>

      <!-- Per-product reviews -->
      <div class="container reviews-section">
        <div class="reviews-head glass">
          <div>
            <h3>Reviews — {{ product.product().name }}</h3>
            <p class="muted">{{ perProductReviews().length }} community reviews • Avg {{ avgForProduct() }}★ • <a routerLink="/reviews" style="color:var(--neon);">View all</a></p>
          </div>
          <span class="badge">Verified + Anonymous welcome</span>
        </div>

        <div class="review-form glass">
          <h4>Write a review for {{ product.product().name }}</h4>
          <div class="row">
            <div class="group"><label>Name (optional)</label><input [(ngModel)]="revName" placeholder="Amara or blank for anonymous" /></div>
            <div class="group"><label>Rating</label>
              <div class="stars-input">
                @for (s of [1,2,3,4,5]; track s) {
                  <button type="button" class="star" [class.active]="s <= revRating()" (click)="revRating.set(s)">★</button>
                }
              </div>
            </div>
          </div>
          <div class="group"><label>Your review</label><textarea [(ngModel)]="revText" rows="3" maxlength="800" placeholder="How was {{ product.product().name }}? Be real — helps next buyer."></textarea></div>
          <label class="check"><input type="checkbox" [checked]="revAnon()" (change)="revAnon.set(!revAnon())" /> Post anonymously</label>
          <button class="btn-neon sm" (click)="submitReview()">Post review for {{ product.product().name }} →</button>
          @if (revErr()) { <div class="error">{{ revErr() }}</div> }
        </div>

        <div class="review-list">
          @for (r of pagedReviews(); track r.id) {
            <article class="review glass">
              <div class="top">
                <span class="stars">{{ '★'.repeat(r.rating) }}<span class="empty">{{ '☆'.repeat(5 - r.rating) }}</span></span>
                @if (r.anonymous) { <span class="anon">Anonymous</span> } @else { <span class="verified">Verified</span> }
                <span class="date">{{ r.createdAt.slice(0,10) }}</span>
              </div>
              <p class="text">“{{ r.text }}”</p>
              <div class="author"><span class="ava">{{ r.name.slice(0,2).toUpperCase() }}</span><strong>{{ r.name }}</strong></div>
            </article>
          }
          @if (perProductReviews().length===0) { <p class="muted">No reviews yet — be the first for {{ product.product().name }}.</p> }
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="btn-ghost sm" (click)="prev()" [disabled]="page()===1">← Prev</button>
            <span>{{ page() }} / {{ totalPages() }}</span>
            <button class="btn-ghost sm" (click)="next()" [disabled]="page()===totalPages()">Next →</button>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .product-grid{ display:grid; grid-template-columns: 1.05fr 0.95fr; gap:32px; align-items:start; }
    .stage{ border-radius:24px; padding:18px; min-height:420px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; }
    .badge-stock{ position:absolute; top:14px; left:14px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:6px 10px; border-radius:999px; z-index:2; }
    .product-img, .product-video{ max-height: 380px; width:100%; object-fit:contain; border-radius:16px; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5)); }
    .product-video{ background:#000; }
    .close-video{ position:absolute; top:14px; right:14px; background: rgba(5,5,7,0.82); border:1px solid var(--border); color:white; padding:6px 10px; border-radius:999px; font-size:11px; z-index:3; }
    .gallery-thumbs{ display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; justify-content:center; }
    .thumb-img, .thumb-vid{ width:64px; height:64px; border-radius:12px; border:1px solid var(--border); overflow:hidden; position:relative; padding:0; background:#0A0C0F; flex-shrink:0; }
    .thumb-img.active, .thumb-vid.active{ outline:2px solid var(--neon); outline-offset:2px; }
    .thumb-img img{ width:100%; height:100%; object-fit:cover; }
    .thumb-vid video{ width:100%; height:100%; object-fit:cover; }
    .play-sm{ position:absolute; inset:0; display:grid; place-items:center; color:white; font-size:14px; background: rgba(0,0,0,0.28); }
    .price-tag{ position:absolute; bottom:14px; left:50%; transform:translateX(-50%); background:#050507; border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:6px 12px; font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:700; display:flex; gap:8px; align-items:center; }
    .led{ width:8px;height:8px;border-radius:50%;background:var(--neon);box-shadow:0 0 10px var(--neon); }
    .trust-strip{ margin-top:12px; border-radius:999px; padding:10px 14px; display:flex; gap:10px; justify-content:center; font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-secondary); flex-wrap:wrap; }
    .video-cta{ margin-top:10px; border-radius:16px; padding:12px 14px; display:flex; align-items:center; gap:12px; border:1px solid rgba(0,255,136,0.16); background: linear-gradient(135deg, rgba(0,255,136,0.08), transparent); }
    .video-cta .play{ width:36px;height:36px;border-radius:50%; background:var(--neon); color:#050507; display:grid; place-items:center; font-size:12px; flex-shrink:0; }
    .video-cta strong{ display:block; font-size:13px; }
    .video-cta span{ font-size:11px; color:var(--text-secondary); }
    .video-cta .arrow{ margin-left:auto; font-weight:700; color:var(--neon); }
    .breadcrumbs{ margin-top:10px; display:flex; gap:8px; align-items:center; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); flex-wrap:wrap; }
    .details h1{ font-family:'Space Grotesk',sans-serif; font-size:28px; letter-spacing:-0.02em; margin:8px 0 4px; }
    .finish{ font-size:11px; color:var(--text-secondary); font-family:'JetBrains Mono', monospace; }
    .desc{ font-size:13px; color:var(--text-secondary); margin:8px 0 10px; line-height:1.6; }
    .pricing{ display:flex; align-items:center; gap:8px; margin:14px 0 4px; flex-wrap:wrap; }
    .price{ font-size:24px; font-weight:800; }
    .compare{ font-size:13px; color:var(--text-muted); text-decoration:line-through; }
    .save{ font-size:11px; background: rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:4px 8px; border-radius:999px; font-weight:700; }
    .free-badge{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:4px 8px; border-radius:999px; }
    .vat{ font-size:11px; color:var(--text-muted); margin-bottom:16px; }
    .variants h3, .qty-row h3{ font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; }
    .single-badge{ display:flex; align-items:center; gap:8px; background: rgba(0,255,136,0.08); border:1px solid rgba(0,255,136,0.14); color:var(--text-secondary); font-size:12px; padding:10px 12px; border-radius:12px; }
    .single-badge .dot{ width:6px;height:6px;border-radius:50%;background:var(--neon);box-shadow:0 0 8px var(--neon); }
    .variant-grid{ display:grid; grid-template-columns: 1fr; gap:8px; }
    .variant{ display:flex; align-items:center; gap:10px; padding:12px; border-radius:14px; background: var(--bg-card); border:1px solid var(--border); position:relative; text-align:left; }
    .variant.active{ border-color: var(--neon); background: rgba(0,255,136,0.06); }
    .swatch{ width:22px;height:22px;border-radius:50%; border:1px solid rgba(255,255,255,0.12); }
    .vname{ font-size:13px; font-weight:700; }
    .vprice{ margin-left:auto; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-secondary); }
    .check{ width:22px;height:22px;border-radius:50%; background:var(--neon); color:#050507; display:grid; place-items:center; font-weight:800; font-size:12px; }
    .qty-row{ margin-top:16px; }
    .qty{ display:flex; align-items:center; gap:10px; }
    .qty button{ width:36px;height:36px;border-radius:50%; background: rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text-primary); font-size:18px; }
    .qty span{ min-width:24px; text-align:center; font-weight:800; }
    .stock{ font-size:11px; color:var(--text-muted); margin-left:8px; }
    .actions{ display:flex; flex-direction:column; gap:10px; margin-top:18px; }
    .full{ width:100%; justify-content:center; }
    .secure{ text-align:center; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .accordions{ margin-top:18px; display:flex; flex-direction:column; gap:8px; }
    details{ background: var(--bg-card); border:1px solid var(--border); border-radius:14px; padding:14px; }
    summary{ font-size:13px; font-weight:700; cursor:pointer; list-style:none; display:flex; justify-content:space-between; }
    summary::after{ content:"+"; color:var(--text-muted); }
    details[open] summary::after{ content:"−"; }
    details p{ font-size:13px; color:var(--text-secondary); margin-top:10px; line-height:1.6; }
    .specs-mini{ margin-top:24px; }
    .spec-grid{ border-radius:18px; padding:16px; display:grid; grid-template-columns: repeat(3,1fr); gap:0; overflow:hidden; }
    .s{ padding:12px 14px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); display:flex; flex-direction:column; gap:4px; }
    .s span{ font-size:10px; letter-spacing:0.10em; text-transform:uppercase; color:var(--text-muted); }
    .s strong{ font-size:12px; }
    .reviews-section{ margin-top:24px; }
    .reviews-head{ border-radius:16px; padding:16px; display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap; }
    .reviews-head h3{ font-size:16px; }
    .badge{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:6px 10px; border-radius:999px; }
    .review-form{ border-radius:16px; padding:16px; margin-top:12px; display:flex; flex-direction:column; gap:10px; }
    .review-form h4{ font-size:13px; }
    .row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .group{ display:flex; flex-direction:column; gap:6px; flex:1; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input, .group textarea{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:10px 12px; color:var(--text-primary); font-size:13px; outline:none; }
    .stars-input{ display:flex; gap:6px; align-items:center; }
    .star{ width:32px;height:32px;border-radius:50%; border:1px solid var(--border); background: rgba(255,255,255,0.04); color:var(--text-muted); font-size:16px; }
    .star.active{ background: var(--neon); color:#050507; border-color:var(--neon); }
    .check{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text-secondary); }
    .error{ background: rgba(255,77,106,0.10); border:1px solid rgba(255,77,106,0.22); color:#FF8A9E; padding:8px 12px; border-radius:12px; font-size:12px; }
    .review-list{ display:flex; flex-direction:column; gap:10px; margin-top:12px; }
    .review{ border-radius:14px; padding:14px; }
    .top{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .stars{ color:var(--neon); }
    .empty{ color:var(--border); }
    .verified, .anon{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; padding:4px 8px; border-radius:999px; }
    .verified{ background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); }
    .anon{ background: rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text-secondary); }
    .date{ margin-left:auto; font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-muted); }
    .text{ margin:8px 0; font-size:13px; line-height:1.6; }
    .author{ display:flex; gap:8px; align-items:center; }
    .ava{ width:28px;height:28px;border-radius:50%; background:var(--bg-card); border:1px solid var(--border); display:grid; place-items:center; font-size:11px; font-weight:700; }
    .pagination{ display:flex; align-items:center; justify-content:center; gap:12px; margin-top:16px; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); }
    @media(max-width: 960px){ .product-grid{ grid-template-columns:1fr; } .spec-grid{ grid-template-columns:1fr 1fr; } .row{ grid-template-columns:1fr; } }
    @media(max-width: 560px){ .spec-grid{ grid-template-columns:1fr; } .gallery-thumbs{ justify-content:flex-start; overflow:auto; } }
  `]
})
export class ProductComponent implements OnInit {
  product = inject(ProductService);
  cart = inject(CartService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private reviews = inject(ReviewService);
  qty = signal(1);
  selected = computed(() => this.product.selectedVariant());

  activeImage = signal<string>('');
  activeVideo = signal<string | null>(null);

  // Per-product gallery
  galleryImages = computed(() => {
    const p = this.product.product();
    const imgs = (p.images && p.images.length ? p.images : [p.image]).filter(Boolean);
    return imgs;
  });
  galleryVideos = computed(() => {
    const p = this.product.product();
    return (p.videos || []).filter(Boolean);
  });

  // Per-product reviews with pagination
  revName = '';
  revText = '';
  revRating = signal(5);
  revAnon = signal(false);
  revErr = signal<string | null>(null);
  page = signal(1);
  perPage = 5;

  perProductReviews = computed(() => this.reviews.reviewsFor(this.product.product().id));
  avgForProduct = computed(() => {
    const arr = this.perProductReviews();
    if (!arr.length) return 4.9;
    return +(arr.reduce((s,r)=>s+r.rating,0)/arr.length).toFixed(1);
  });
  pagedReviews = computed(() => {
    const all = this.perProductReviews();
    const p = this.page();
    const start = (p-1)*this.perPage;
    return all.slice(start, start + this.perPage);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.perProductReviews().length / this.perPage)));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.product.getProduct(id);
      if (found) this.product.selectProduct(id);
      else {
        const prodByVariant = this.product.getProductByVariant(id);
        if (prodByVariant) this.product.selectProduct(prodByVariant.id);
      }
    }
    // init gallery
    const imgs = this.galleryImages();
    if (imgs.length) this.activeImage.set(imgs[0]);
    // watch product change to reset gallery
    // (computed will update, but we need effect)
  }

  select(id: any) { this.product.selectVariant(id); }
  inc() { this.qty.update(v => Math.min(10, v + 1)); }
  dec() { this.qty.update(v => Math.max(1, v - 1)); }

  addToCart() {
    this.cart.add(this.selected().id as any, this.qty());
    this.cart.openDrawer();
    this.toast.show('Added ' + this.qty() + 'x ' + this.selected().name);
  }

  buyNow() {
    this.cart.add(this.selected().id as any, this.qty());
    this.toast.show('Added — proceed to secure checkout', 'info');
    this.cart.openDrawer();
  }

  submitReview() {
    this.revErr.set(null);
    if (!this.revText.trim()) { this.revErr.set('Please write your review'); return; }
    try {
      this.reviews.add({ name: this.revName, text: this.revText, rating: this.revRating(), anonymous: this.revAnon(), productId: this.product.product().id });
      this.toast.show('Review posted — thank you!');
      this.revText = ''; this.revName = '';
    } catch (e: any) { this.revErr.set(e?.message || 'Failed'); }
  }

  next() { if (this.page() < this.totalPages()) this.page.update(p => p+1); }
  prev() { if (this.page() > 1) this.page.update(p => p-1); }
}
