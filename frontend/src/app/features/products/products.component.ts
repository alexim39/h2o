import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';

type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <section class="section">
      <div class="container">
        <div class="page-head">
          <div>
            <span class="eyebrow">H2Os Store • Hydrogen, curated</span>
            <h1>Hydrogen Water <em>Bottles</em></h1>
            <p>Ultra H₂ and curated hydrogen brands — one ritual, many bottles. All SPE/PEM, lab-verified. ✓ Free shipping on all orders</p>
          </div>
          <div class="head-stats glass">
            <div><strong>{{ filtered().length }}</strong><span>Products</span></div>
            <div><strong>{{ brands().length }}</strong><span>Brands</span></div>
            <div><strong>4.8★</strong><span>Avg rating</span></div>
          </div>
        </div>

        <div class="toolbar glass">
          <div class="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>
            <input [ngModel]="q()" (ngModelChange)="q.set($event)" placeholder="Search brand, name, tagline…" />
            @if (q()) { <button class="clear" (click)="q.set('')">×</button> }
          </div>

          <div class="filters">
            <select [ngModel]="brand()" (ngModelChange)="brand.set($event)">
              <option value="all">All Brands</option>
              @for (b of brands(); track b) { <option [value]="b">{{ b }}</option> }
            </select>

            <select [ngModel]="category()" (ngModelChange)="category.set($event)">
              <option value="all">All Categories</option>
              @for (c of categories(); track c) { <option [value]="c">{{ c }}</option> }
            </select>

            <select [ngModel]="sort()" (ngModelChange)="sort.set($event)">
              <option value="featured">Featured</option>
              <option value="priceAsc">Price: Low → High</option>
              <option value="priceDesc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div class="chips">
          @for (b of ['all','H2Os','HydroPure','AquaVive','IonMax','PureHydro']; track b) {
            <button class="chip" [class.active]="brand()===b" (click)="brand.set(b)">{{ b === 'all' ? 'All' : b }}</button>
          }
          <span class="count">{{ filtered().length }} of {{ product.catalog().length }} bottles • Free shipping</span>
        </div>

        <div class="grid">
          @for (p of paginated(); track p.id) {
            <article class="card glass" [class.featured]="p.featured">
              @if (p.badge) { <span class="badge" [class.bestseller]="p.badge==='Bestseller'">{{ p.badge }}</span> }
              <a [routerLink]="['/store', p.id]" class="img-wrap">
                <img [src]="p.image" [alt]="p.brand + ' ' + p.name" loading="lazy" />
                <span class="quick">Quick view →</span>
              </a>
              <div class="body">
                <span class="brand">{{ p.brand }} • {{ p.category }}</span>
                <h3><a [routerLink]="['/store', p.id]">{{ p.name }}</a></h3>
                <p class="tagline">{{ p.tagline }}</p>

                <div class="rating">
                  <span class="stars">{{ stars(p.rating || 4.8) }}</span>
                  <span class="num">{{ p.rating || 4.8 }} ({{ p.reviewsCount || 0 }})</span>
                  <span class="stock" [class.low]="(p.variants[0].stock||0) < 15">{{ p.variants[0].stock }} left</span>
                </div>

                <div class="pricing">
                  <strong>{{ cart.formatNGN(p.variants[0].price) }}</strong>
                  @if (p.variants[0].compareAt) {
                    <span class="compare">{{ cart.formatNGN(p.variants[0].compareAt!) }}</span>
                  }
                  <span class="free">Free shipping</span>
                </div>

                <div class="actions">
                  <button class="btn-neon sm" (click)="add(p)">Add to cart</button>
                  <a [routerLink]="['/store', p.id]" class="btn-ghost sm">Details</a>
                </div>
              </div>
            </article>
          }
          @if (paginated().length===0) {
            <div class="empty glass">
              <p>No bottles match your filters.</p>
              <button class="btn-ghost sm" (click)="clear()">Clear filters</button>
            </div>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="btn-ghost sm" (click)="prevPage()" [disabled]="page()===1">← Prev</button>
            <span>{{ page() }} / {{ totalPages() }} • {{ filtered().length }} bottles</span>
            <button class="btn-ghost sm" (click)="nextPage()" [disabled]="page()===totalPages()">Next →</button>
          </div>
        }

        <div class="highlight glass">
          <img src="/images/ultraH2.jpeg" alt="Ultra H₂" />
          <div>
            <span class="eyebrow">H2Os Signature</span>
            <h2>Ultra H₂ — The ritual that started it all</h2>
            <p>Crystal glass, 1600ppb, loop cap, timer. The benchmark. Future H2Os bottles share this DNA. ✓ Free shipping on all orders</p>
            <a routerLink="/store/ultra-h2-v1" class="btn-neon">Shop Ultra H₂ — ₦1,300,000 →</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-head{ display:flex; justify-content:space-between; gap:24px; align-items:start; flex-wrap:wrap; margin-bottom:18px; }
    .page-head h1{ font-family:'Space Grotesk',sans-serif; font-size:clamp(28px,4vw,40px); letter-spacing:-0.02em; }
    .page-head h1 em{ font-style:normal; color:var(--neon); }
    .page-head p{ color:var(--text-secondary); font-size:14px; max-width:520px; margin-top:8px; }
    .head-stats{ display:flex; gap:18px; border-radius:16px; padding:14px 16px; align-items:center; }
    .head-stats div{ text-align:center; min-width:70px; }
    .head-stats strong{ display:block; font-size:16px; }
    .head-stats span{ font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .toolbar{ display:flex; gap:12px; flex-wrap:wrap; align-items:center; justify-content:space-between; border-radius:16px; padding:12px; margin-bottom:12px; }
    .search{ position:relative; flex:1; min-width:240px; display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:999px; padding:8px 12px; }
    .search input{ background:transparent; border:none; outline:none; color:var(--text-primary); flex:1; font-size:13px; }
    .search .clear{ background:rgba(255,255,255,0.08); border:none; width:22px;height:22px;border-radius:50%; color:var(--text-secondary); }
    .filters{ display:flex; gap:8px; flex-wrap:wrap; }
    .filters select{ background: rgba(255,255,255,0.04); border:1px solid var(--border); color:var(--text-primary); border-radius:999px; padding:8px 12px; font-size:12px; font-weight:600; outline:none; }
    .chips{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:16px; }
    .chip{ padding:6px 12px; border-radius:999px; background: rgba(255,255,255,0.04); border:1px solid var(--border); color:var(--text-secondary); font-size:12px; font-weight:600; }
    .chip.active{ background: var(--neon); color:#050507; border-color:var(--neon); box-shadow:0 0 12px rgba(0,255,136,0.3); }
    .count{ margin-left:auto; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); }
    .grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
    .card{ border-radius:18px; overflow:hidden; display:flex; flex-direction:column; position:relative; border:1px solid rgba(255,255,255,0.06); transition:.18s; }
    .card:hover{ transform: translateY(-2px); border-color: rgba(0,255,136,0.18); box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
    .card.featured{ border-color: rgba(0,255,136,0.22); box-shadow: 0 0 0 1px rgba(0,255,136,0.10), 0 16px 40px rgba(0,0,0,0.35); }
    .badge{ position:absolute; top:10px; left:10px; z-index:2; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; padding:5px 8px; border-radius:999px; background: rgba(5,5,7,0.82); border:1px solid rgba(255,255,255,0.10); color:var(--text-secondary); }
    .badge.bestseller{ background: var(--neon); color:#050507; border-color:var(--neon); }
    .img-wrap{ position:relative; display:block; background: linear-gradient(180deg,#0F1115,#07080A); aspect-ratio: 1/1; overflow:hidden; }
    .img-wrap img{ width:100%; height:100%; object-fit:contain; padding:18px; transition: transform .35s; }
    .card:hover .img-wrap img{ transform: scale(1.04); }
    .quick{ position:absolute; bottom:10px; right:10px; background: rgba(5,5,7,0.82); border:1px solid rgba(255,255,255,0.10); color:white; font-size:11px; font-weight:700; padding:6px 10px; border-radius:999px; opacity:0; transform: translateY(6px); transition:.18s; }
    .card:hover .quick{ opacity:1; transform: translateY(0); }
    .body{ padding:14px; flex:1; display:flex; flex-direction:column; gap:6px; }
    .brand{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .body h3{ font-size:15px; }
    .body h3 a{ color:inherit; }
    .tagline{ font-size:12px; color:var(--text-secondary); line-height:1.4; }
    .rating{ display:flex; gap:6px; align-items:center; font-size:11px; color:var(--text-muted); }
    .stars{ color:var(--neon); }
    .num{ color:var(--text-secondary); font-family:'JetBrains Mono', monospace; }
    .stock{ margin-left:auto; font-family:'JetBrains Mono', monospace; font-size:10px; padding:3px 6px; border-radius:999px; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); }
    .stock.low{ background: rgba(255,160,0,0.10); border-color: rgba(255,160,0,0.18); color:#FFB86A; }
    .pricing{ display:flex; gap:6px; align-items:center; margin-top:4px; flex-wrap:wrap; }
    .pricing strong{ font-size:15px; }
    .compare{ font-size:11px; color:var(--text-muted); text-decoration:line-through; }
    .free{ font-family:'JetBrains Mono', monospace; font-size:9px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:3px 6px; border-radius:999px; }
    .actions{ display:flex; gap:8px; margin-top:8px; }
    .btn-neon.sm, .btn-ghost.sm{ padding:8px 12px; font-size:12px; flex:1; justify-content:center; }
    .empty{ grid-column: 1/-1; border-radius:16px; padding:40px; text-align:center; }
    .empty p{ color:var(--text-secondary); }
    .pagination{ display:flex; align-items:center; justify-content:center; gap:12px; margin:18px 0 8px; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); }
    .highlight{ margin-top:24px; border-radius:20px; padding:18px; display:grid; grid-template-columns: 160px 1fr auto; gap:18px; align-items:center; }
    .highlight img{ width:100%; border-radius:14px; border:1px solid var(--border); }
    .highlight h2{ font-family:'Space Grotesk',sans-serif; font-size:20px; }
    .highlight p{ font-size:13px; color:var(--text-secondary); margin:6px 0 12px; }
    @media(max-width: 960px){ .grid{ grid-template-columns: 1fr 1fr; } .highlight{ grid-template-columns: 1fr; } }
    @media(max-width: 640px){ .grid{ grid-template-columns: 1fr; } .toolbar{ flex-direction:column; align-items:stretch; } }
  `]
})
export class ProductsComponent {
  product = inject(ProductService);
  cart = inject(CartService);
  private toast = inject(ToastService);

  q = signal('');
  brand = signal<string>('all');
  category = signal<string>('all');
  sort = signal<SortKey>('featured');
  page = signal(1);
  perPage = 9;

  brands = computed(() => [...new Set(this.product.catalog().map(p => p.brand))]);
  categories = computed(() => [...new Set(this.product.catalog().map(p => p.category))]);

  filtered = computed<Product[]>(() => {
    let arr = [...this.product.catalog()];
    const q = this.q().trim().toLowerCase();
    if (q) {
      arr = arr.filter(p => (p.name + ' ' + p.brand + ' ' + p.tagline + ' ' + p.description).toLowerCase().includes(q));
    }
    if (this.brand() !== 'all') arr = arr.filter(p => p.brand === this.brand());
    if (this.category() !== 'all') arr = arr.filter(p => p.category === this.category());

    switch (this.sort()) {
      case 'priceAsc': arr.sort((a,b)=> a.variants[0].price - b.variants[0].price); break;
      case 'priceDesc': arr.sort((a,b)=> b.variants[0].price - a.variants[0].price); break;
      case 'rating': arr.sort((a,b)=> (b.rating||0)-(a.rating||0)); break;
      case 'newest': arr.reverse(); break;
      default: arr.sort((a,b)=> (b.featured?1:0)-(a.featured?1:0)); break;
    }
    return arr;
  });

  paginated = computed(() => {
    const all = this.filtered();
    const p = this.page();
    const start = (p - 1) * this.perPage;
    return all.slice(start, start + this.perPage);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.perPage)));

  constructor() {
    effect(() => {
      // reset page when filters change
      this.filtered();
      // use queueMicrotask to avoid signal write in same computed
      queueMicrotask(() => this.page.set(1));
    });
  }

  stars(r: number): string {
    const full = Math.round(r);
    return '★'.repeat(full) + '☆'.repeat(5-full);
  }

  add(p: Product) {
    const v = p.variants[0];
    this.cart.add(v.id as any, 1);
    this.cart.openDrawer();
    this.toast.show('Added ' + p.brand + ' ' + p.name);
  }

  clear() {
    this.q.set(''); this.brand.set('all'); this.category.set('all'); this.sort.set('featured'); this.page.set(1);
  }
  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }
  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
}
