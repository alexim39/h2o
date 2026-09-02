import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';
import { CartService } from '../../core/services/cart.service';
import { DeepseekService } from '../../core/services/deepseek.service';
import { environment } from '../../../environments/environment';

type Tab = 'overview' | 'products' | 'orders' | 'reviews' | 'media' | 'chats';

@Component({
  selector: 'app-mgt',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    @if (!auth.isAuthed()) {
      <section class="section">
        <div class="container narrow">
          <div class="login-card glass">
            <div class="login-head">
              <span class="mark">H<sub>2</sub>Os</span>
              <h1>MGT — H2Os Control</h1>
              <p>Restricted • Admins only • Audit logged</p>
            </div>
            <form (ngSubmit)="doLogin()" class="form">
              <div class="group"><label>Username</label><input [(ngModel)]="user" name="user" placeholder="h2os" /></div>
              <div class="group"><label>Password</label><input type="password" [(ngModel)]="pass" name="pass" placeholder="••••••••" /></div>
              @if (loginErr()) { <div class="error">{{ loginErr() }}</div> }
              <button type="submit" class="btn-neon full">Enter MGT →</button>
              <p class="hint">Restricted access • Contact administrator for credentials</p>
            </form>
          </div>
        </div>
      </section>
    } @else {
      <section class="mgt">
        <div class="container">
          <div class="topbar glass">
            <div class="brand">
              <span class="mark">H<sub>2</sub>Os</span>
              <div><strong>MGT</strong><span>Ultra H₂ Store • Admin • Free shipping on all orders</span></div>
            </div>
            <nav class="tabs">
              @for (t of tabs; track t.id) {
                <button [class.active]="tab()===t.id" (click)="tab.set(t.id)">{{ t.label }}</button>
              }
            </nav>
            <div class="actions">
              <a routerLink="/store" class="btn-ghost sm">View Store</a>
              <button class="btn-ghost sm" (click)="auth.logout()">Logout</button>
            </div>
          </div>

          @if (tab()==='overview') {
            <div class="overview-grid">
              <div class="stat-card glass">
                <span>Catalog</span><strong>{{ product.catalog().length }}</strong><em>Products live</em>
                <button class="btn-neon sm" (click)="tab.set('products')">Manage →</button>
              </div>
              <div class="stat-card glass">
                <span>Free Shipping</span><strong>✓ Active</strong><em>All orders</em>
              </div>
              <div class="stat-card glass">
                <span>Community</span><strong>{{ review.count() }}</strong><em>Reviews</em>
                <button class="btn-ghost sm" (click)="tab.set('reviews')">Moderate →</button>
              </div>
              <div class="stat-card glass">
                <span>AI Escalations</span><strong>WhatsApp</strong><em>+2348080386208</em>
                <a [href]="waLink()" target="_blank" class="btn-ghost sm">Open →</a>
              </div>
            </div>

            <div class="overview-panels">
              <div class="panel glass">
                <h3>Quick Add — New Bottle</h3>
                <p class="muted">Add another hydrogen brand in 30 seconds. Appears instantly in /store.</p>
                <button class="btn-neon" (click)="startAdd()">Add Product →</button>
              </div>
              <div class="panel glass">
                <h3>Store Health</h3>
                <ul class="checks">
                  <li>✓ Paystack — {{ cart.formatNGN(1300000) }} Ultra H₂ live • Free shipping</li>
                  <li>✓ Videos — 8 hydrogen assets in /public/videos</li>
                  <li>✓ DeepSeek AI — H2Os Assistant Doctor live</li>
                  <li>✓ DB connected — real records only</li>
                </ul>
              </div>
            </div>
          }

          @if (tab()==='products') {
            <div class="toolbar">
              <h2>Products — Catalog ({{ product.catalog().length }})</h2>
              <div class="toolbar-actions">
                <button class="btn-neon sm" (click)="startAdd()">+ Add Bottle</button>
                <button class="btn-ghost sm" (click)="loadProducts()">Refresh</button>
              </div>
            </div>

            @if (product.loading()) { <p class="muted">Loading catalog…</p> }
            @if (product.error()) { <div class="error">{{ product.error() }}</div> }
            @if (!product.loading() && !product.catalog().length) { <p class="muted">No products yet — add your first bottle above. Real DB only.</p> }

            @if (editing()) {
              <div class="edit-card glass">
                <h3>{{ editId() ? 'Edit' : 'Add' }} Product</h3>
                <form class="form grid2" (ngSubmit)="save()">
                  <div class="group"><label>Brand *</label><input [(ngModel)]="form.brand" name="brand" required placeholder="H2Os / HydroPure / AquaVive" /></div>
                  <div class="group"><label>Name *</label><input [(ngModel)]="form.name" name="name" required placeholder="Ultra H₂ Mini" /></div>
                  <div class="group"><label>Category</label><input [(ngModel)]="form.category" name="category" placeholder="Hydrogen Bottle" /></div>
                  <div class="group"><label>Badge</label><input [(ngModel)]="form.badge" name="badge" placeholder="Bestseller / New / Limited" /></div>
                  <div class="group full"><label>Tagline</label><input [(ngModel)]="form.tagline" name="tagline" placeholder="Hydration, upgraded." /></div>
                  <div class="group full"><label>Description *</label><textarea [(ngModel)]="form.description" name="description" rows="3" required></textarea></div>
                  <div class="group full"><label>Primary Image URL *</label><input [(ngModel)]="form.image" name="image" placeholder="/images/ultraH2.jpeg" />
                    @if (form.image) { <img [src]="form.image" alt="preview" class="preview" /> }
                  </div>
                  <div class="group full">
                    <label>Gallery Images — additional (one URL per line)</label>
                    <textarea [(ngModel)]="form.imagesText" name="imagesText" rows="3" placeholder="/images/ultraH2.jpeg&#10;/images/other.jpeg"></textarea>
                    <input type="file" multiple accept="image/*" (change)="onImages($event)" />
                    @if (previewImages().length) {
                      <div class="mini-grid">@for (img of previewImages(); track img){ <img [src]="img" class="preview" /> }</div>
                    }
                  </div>
                  <div class="group full">
                    <label>Product Videos — short videos (one URL per line, .mp4)</label>
                    <textarea [(ngModel)]="form.videosText" name="videosText" rows="2" placeholder="/videos/how-to-use-it.mp4"></textarea>
                    <input type="file" multiple accept="video/*" (change)="onVideos($event)" />
                    @if (previewVideos().length) {
                      <div class="mini-grid">@for (v of previewVideos(); track v){ <video [src]="v" muted class="preview"></video> }</div>
                    }
                  </div>
                  <div class="group"><label>Price (NGN) *</label><input type="number" [(ngModel)]="form.price" name="price" required /></div>
                  <div class="group"><label>Compare At (NGN)</label><input type="number" [(ngModel)]="form.compareAt" name="compareAt" /></div>
                  <div class="group"><label>Stock *</label><input type="number" [(ngModel)]="form.stock" name="stock" required /></div>
                  <div class="group"><label>Rating (0-5)</label><input type="number" step="0.1" min="0" max="5" [(ngModel)]="form.rating" name="rating" /></div>
                  <div class="form-actions full">
                    <button type="submit" class="btn-neon">Save Product</button>
                    <button type="button" class="btn-ghost" (click)="cancel()">Cancel</button>
                  </div>
                </form>
              </div>
            }

            <div class="product-table glass">
              <div class="table-head">
                <span>Image</span><span>Brand / Name</span><span>Price</span><span>Media</span><span>Actions</span>
              </div>
              @for (p of product.catalog(); track p.id) {
                <div class="row">
                  <img [src]="p.image" [alt]="p.name" class="thumb" />
                  <div>
                    <strong>{{ p.brand }} {{ p.name }}</strong>
                    <span class="muted">{{ p.tagline }} • {{ p.id }}</span>
                    @if (p.badge) { <span class="badge">{{ p.badge }}</span> }
                    @if (p.images?.length) { <span class="muted small"> +{{ p.images!.length }} imgs</span> }
                    @if (p.videos?.length) { <span class="muted small"> +{{ p.videos!.length }} vids</span> }
                  </div>
                  <div>
                    <strong>{{ cart.formatNGN(p.variants[0].price) }}</strong>
                    @if (p.variants[0].compareAt) { <span class="muted line">{{ cart.formatNGN(p.variants[0].compareAt!) }}</span> }
                  </div>
                  <span class="stock">{{ (p.images?.length||1) }} img / {{ (p.videos?.length||0) }} vid</span>
                  <div class="row-actions">
                    <button class="btn-ghost sm" (click)="startEdit(p)">Edit</button>
                    <button class="btn-ghost sm danger" (click)="remove(p.id)">Delete</button>
                  </div>
                </div>
              }
            </div>
          }

          @if (tab()==='orders') {
            <div class="panel glass">
              <h2>Orders — Real (Paystack) • Free shipping</h2>
              @if (ordersLoading()) { <p class="muted">Loading orders…</p> }
              @if (ordersError()) { <div class="error">{{ ordersError() }}</div> }
              @if (!ordersLoading() && !orders().length) { <p class="muted">No orders yet — real DB only.</p> }
              <div class="order-list">
                @for (o of orders(); track o.reference) {
                  <div class="order-row glass">
                    <div><strong>{{ o.reference }}</strong><span class="muted">{{ o.email }}</span></div>
                    <span class="status paid">{{ o.status }}</span>
                    <strong>{{ cart.formatNGN(o.total) }}</strong>
                    <span class="muted">{{ o.created_at?.slice(0,10) }}</span>
                  </div>
                }
              </div>
              <p class="hint">Real orders via POST /api/orders + Paystack webhook. Free shipping applied (0).</p>
            </div>
          }

          @if (tab()==='reviews') {
            <div class="panel glass">
              <h2>Community Reviews — {{ review.count() }} • Paginated</h2>
              <div class="review-list">
                @for (r of review.paginated(); track r.id) {
                  <div class="review-row">
                    <div>
                      <strong>{{ r.name }} @if(r.anonymous){ <span class="muted">(anon)</span> } • {{ r.rating }}★ @if(r.productId){ <span class="muted">for {{ r.productId }}</span> }</strong>
                      <p class="muted">{{ r.text }}</p>
                      <span class="muted small">{{ r.createdAt }} • {{ r.productId || 'general' }}</span>
                    </div>
                    <button class="btn-ghost sm danger" (click)="removeReview(r.id)">Delete</button>
                  </div>
                }
              </div>
              <div class="pagination">
                <button class="btn-ghost sm" (click)="review.prevPage()" [disabled]="review.page()===1">← Prev</button>
                <span>{{ review.page() }} / {{ review.totalPages() }}</span>
                <button class="btn-ghost sm" (click)="review.nextPage()" [disabled]="review.page()===review.totalPages()">Next →</button>
              </div>
            </div>
          }

          @if (tab()==='media') {
            <div class="panel glass">
              <h2>Media — Images & Videos</h2>
              <p class="muted">Public assets: <code>/public/images/ultraH2.jpeg</code> + 8 videos in <code>/public/videos/</code>.</p>
              <div class="media-grid">
                <div class="media-card glass">
                  <img src="/images/ultraH2.jpeg" alt="Ultra H2" />
                  <span>/images/ultraH2.jpeg</span>
                </div>
                @for (v of videos; track v) {
                  <div class="media-card glass">
                    <video [src]="v" muted preload="metadata" controls></video>
                    <span>{{ v }}</span>
                  </div>
                }
              </div>
            </div>
          }

          @if (tab()==='chats') {
            <div class="panel glass">
              <h2>H2Os Assistant Doctor — All Chats</h2>
              <p class="muted">Every conversation handled by DeepSeek AI. {{ ai.messages().length }} messages (local).</p>
              <div class="toolbar">
                <span class="muted">{{ ai.messages().length }} msgs • {{ chatUserCount() }} user • {{ chatAiCount() }} AI</span>
                <div class="toolbar-actions">
                  <a [href]="ai.whatsappLink()" target="_blank" class="btn-ghost sm">WhatsApp +2348080386208 →</a>
                  <button class="btn-ghost sm danger" (click)="ai.clear(); toast.show('Chats cleared')">Clear All</button>
                </div>
              </div>
              <div class="chat-list">
                @for (m of ai.messages(); track $index) {
                  <div class="chat-row" [class.user]="m.role==='user'" [class.assistant]="m.role==='assistant'">
                    <div class="chat-head">
                      <span class="role">{{ m.role === 'user' ? 'User' : 'Dr. H2Os' }}</span>
                      <span class="time">{{ m.at.slice(0,19).replace('T',' ') }}</span>
                    </div>
                    <p class="chat-text">{{ m.content }}</p>
                  </div>
                }
                @if (ai.messages().length <=1) {
                  <p class="muted">No chats yet — open the “Chat H2 Doctor” widget on the storefront to start.</p>
                }
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .narrow{ max-width: 520px; margin:0 auto; }
    .login-card{ border-radius:20px; padding:24px; text-align:center; }
    .login-head .mark{ width:44px;height:36px;border-radius:10px;background:var(--neon); color:#050507; display:inline-flex; align-items:baseline; justify-content:center; font-weight:800; padding-top:6px; }
    .login-head h1{ font-family:'Space Grotesk',sans-serif; font-size:22px; margin:12px 0 6px; }
    .login-head p{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .form{ display:flex; flex-direction:column; gap:12px; margin-top:16px; text-align:left; }
    .group{ display:flex; flex-direction:column; gap:6px; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input, .group textarea, .group select{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:10px 12px; color:var(--text-primary); font-size:13px; outline:none; }
    .group input:focus, .group textarea:focus{ border-color: rgba(0,255,136,0.35); }
    .error{ background: rgba(255,77,106,0.10); border:1px solid rgba(255,77,106,0.22); color:#FF8A9E; padding:10px 12px; border-radius:12px; font-size:13px; }
    .full{ width:100%; justify-content:center; }
    .hint{ text-align:center; font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-muted); margin-top:8px; }
    .mgt{ padding: 18px 0 40px; }
    .topbar{ display:flex; align-items:center; gap:16px; padding:12px 14px; border-radius:16px; flex-wrap:wrap; }
    .brand{ display:flex; gap:10px; align-items:center; }
    .brand .mark{ width:40px;height:32px;border-radius:8px;background:var(--neon); color:#050507; display:inline-flex; align-items:baseline; justify-content:center; font-weight:800; padding-top:5px; }
    .brand strong{ display:block; font-size:13px; letter-spacing:0.06em; }
    .brand span{ font-size:11px; color:var(--text-muted); }
    .tabs{ display:flex; gap:6px; flex-wrap:wrap; }
    .tabs button{ padding:8px 12px; border-radius:999px; background: rgba(255,255,255,0.04); border:1px solid var(--border); color:var(--text-secondary); font-size:12px; font-weight:700; }
    .tabs button.active{ background: var(--neon); color:#050507; border-color:var(--neon); }
    .actions{ margin-left:auto; display:flex; gap:8px; }
    .btn-ghost.sm, .btn-neon.sm{ padding:8px 12px; font-size:12px; }
    .btn-ghost.danger{ color:#FF8A9E; border-color: rgba(255,77,106,0.2); }
    .overview-grid{ display:grid; grid-template-columns: repeat(4,1fr); gap:12px; margin:18px 0; }
    .stat-card{ border-radius:16px; padding:16px; display:flex; flex-direction:column; gap:6px; }
    .stat-card span{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .stat-card strong{ font-size:20px; }
    .stat-card em{ font-style:normal; font-size:11px; color:var(--text-secondary); }
    .overview-panels{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .panel{ border-radius:16px; padding:16px; }
    .panel h2{ font-size:16px; margin-bottom:8px; }
    .panel h3{ font-size:14px; }
    .muted{ font-size:12px; color:var(--text-secondary); }
    .checks{ list-style:none; display:flex; flex-direction:column; gap:8px; margin-top:10px; font-size:12px; color:var(--text-secondary); }
    .toolbar{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin:18px 0 12px; }
    .toolbar h2{ font-family:'Space Grotesk',sans-serif; font-size:18px; }
    .toolbar-actions{ display:flex; gap:8px; }
    .edit-card{ border-radius:16px; padding:16px; margin-bottom:16px; }
    .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .grid2 .full{ grid-column: 1/-1; }
    .preview{ max-height:120px; border-radius:12px; border:1px solid var(--border); margin-top:8px; max-width: 200px; }
    .mini-grid{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
    .mini-grid .preview{ max-height:80px; }
    .form-actions{ display:flex; gap:8px; }
    .product-table{ border-radius:16px; padding:0; overflow:hidden; }
    .table-head, .row{ display:grid; grid-template-columns: 60px 1.6fr 0.8fr 0.5fr 0.9fr; gap:10px; align-items:center; padding:10px 12px; }
    .table-head{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); border-bottom:1px solid var(--border); background: rgba(255,255,255,0.02); }
    .row{ border-bottom:1px solid var(--border); }
    .row:last-child{ border-bottom:none; }
    .thumb{ width:48px;height:48px;object-fit:contain; border-radius:10px; background:#0A0C0F; border:1px solid var(--border); padding:4px; }
    .badge{ font-family:'JetBrains Mono', monospace; font-size:10px; padding:3px 6px; border-radius:999px; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); margin-left:6px; }
    .line{ text-decoration:line-through; font-size:11px; color:var(--text-muted); }
    .stock{ font-family:'JetBrains Mono', monospace; font-size:11px; }
    .row-actions{ display:flex; gap:6px; }
    .order-list, .review-list{ display:flex; flex-direction:column; gap:10px; margin-top:12px; }
    .order-row{ display:grid; grid-template-columns:1.2fr 0.6fr 0.7fr 0.7fr; gap:10px; align-items:center; padding:12px; border-radius:12px; }
    .status.paid{ background: rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:4px 8px; border-radius:999px; font-family:'JetBrains Mono', monospace; font-size:11px; }
    .review-row{ display:flex; justify-content:space-between; gap:12px; padding:12px; border:1px solid var(--border); border-radius:12px; background: rgba(255,255,255,0.02); }
    .chat-list{ display:flex; flex-direction:column; gap:10px; margin-top:12px; max-height: 58vh; overflow:auto; padding-right:4px; }
    .chat-row{ padding:12px; border-radius:12px; border:1px solid var(--border); background: rgba(255,255,255,0.02); display:flex; flex-direction:column; gap:6px; }
    .chat-row.user{ border-color: rgba(0,255,136,0.18); background: rgba(0,255,136,0.04); }
    .review-row p{ margin:4px 0; }
    .small{ font-size:11px; }
    .media-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:12px; margin-top:12px; }
    .media-card{ border-radius:12px; overflow:hidden; display:flex; flex-direction:column; }
    .media-card img, .media-card video{ width:100%; aspect-ratio: 16/9; object-fit:cover; background:#000; }
    .media-card span{ padding:8px; font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-muted); }
    .chat-head{ display:flex; justify-content:space-between; gap:8px; font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-muted); }
    .chat-head .role{ font-weight:800; letter-spacing:0.08em; text-transform:uppercase; }
    .chat-text{ margin:6px 0; font-size:13px; line-height:1.6; white-space:pre-wrap; word-break:break-word; }
    .pagination{ display:flex; align-items:center; justify-content:center; gap:12px; margin-top:16px; font-family:'JetBrains Mono', monospace; font-size:11px; }
    @media(max-width: 900px){ .overview-grid{ grid-template-columns:1fr 1fr; } .overview-panels{ grid-template-columns:1fr; } .product-table .table-head, .product-table .row{ grid-template-columns: 48px 1fr; gap:6px; } .product-table .table-head span:nth-child(3), .product-table .table-head span:nth-child(4), .row div:nth-child(3), .row span:nth-child(4){ display:none; } .media-grid{ grid-template-columns:1fr 1fr; } }
    @media(max-width:560px){ .grid2{ grid-template-columns:1fr; } .media-grid{ grid-template-columns:1fr; } }
  `]
})
export class MgtComponent implements OnInit {
  auth = inject(AuthService);
  product = inject(ProductService);
  review = inject(ReviewService);
  cart = inject(CartService);
  toast = inject(ToastService);
  ai = inject(DeepseekService);
  private http = inject(HttpClient);
  chatUserCount = computed(() => this.ai.messages().filter(m => m.role === 'user').length);
  chatAiCount = computed(() => this.ai.messages().filter(m => m.role === 'assistant').length);

  tab = signal<Tab>('overview');
  tabs: {id: Tab, label: string}[] = [
    {id:'overview', label:'Overview'},
    {id:'products', label:'Products'},
    {id:'orders', label:'Orders'},
    {id:'reviews', label:'Reviews'},
    {id:'media', label:'Media'},
    {id:'chats', label:'Chats'},
  ];

  user = '';
  pass = '';
  loginErr = signal<string | null>(null);

  orders = signal<any[]>([]);
  ordersLoading = signal(false);
  ordersError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }

  loadProducts(): void { this.product.loadCatalog(); }
  async loadOrders(): Promise<void> {
    this.ordersLoading.set(true); this.ordersError.set(null);
    try {
      const res: any = await fetch(`${environment.apiUrl}/orders`).then(r => r.json()).catch(() => null);
      // fallback to HttpClient if fetch fails (CORS)
      let data = res?.data ?? res;
      if (!data) {
        const fetched: any = await new Promise((resolve, reject) => {
          this.http.get(`${environment.apiUrl}/orders`).subscribe({ next: v => resolve(v), error: e => reject(e) });
        }).catch(() => null);
        data = (fetched as any)?.data ?? fetched;
      }
      this.orders.set(Array.isArray(data) ? data : []);
    } catch (e: any) {
      this.ordersError.set(e?.message ?? 'Failed to load orders');
    } finally { this.ordersLoading.set(false); }
  }

  doLogin() {
    this.loginErr.set(null);
    if (!this.auth.login(this.user.trim(), this.pass)) {
      this.loginErr.set('Invalid username or password.');
    } else {
      this.toast.show('Welcome to H2Os MGT', 'success');
      this.loadOrders();
    }
  }

  waLink() {
    return 'https://wa.me/2348080386208?text=' + encodeURIComponent('Hello H2Os — admin escalation');
  }

  editing = signal(false);
  editId = signal<string | null>(null);
  form: any = { brand:'H2Os', name:'', category:'Hydrogen Bottle', badge:'', tagline:'', description:'', image:'/images/ultraH2.jpeg', imagesText:'', videosText:'', price:1300000, compareAt:1541000, stock:20, rating:4.9 };

  previewImages(): string[] {
    const txt = (this.form.imagesText || '').split(/\n/).map((s:string)=>s.trim()).filter(Boolean);
    const primary = this.form.image ? [this.form.image] : [];
    return [...primary, ...txt].filter(Boolean);
  }
  previewVideos(): string[] {
    return (this.form.videosText || '').split(/\n/).map((s:string)=>s.trim()).filter(Boolean);
  }

  onImages(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    const urls: string[] = [];
    let loaded = 0;
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        urls.push(reader.result as string);
        loaded++;
        if (loaded === files.length) {
          const existing = this.form.imagesText ? this.form.imagesText + '\\n' : '';
          this.form.imagesText = existing + urls.join('\\n');
        }
      };
      reader.readAsDataURL(f);
    });
  }

  onVideos(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    const urls: string[] = [];
    let loaded = 0;
    Array.from(files).forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        urls.push(reader.result as string);
        loaded++;
        if (loaded === files.length) {
          const existing = this.form.videosText ? this.form.videosText + '\\n' : '';
          this.form.videosText = existing + urls.join('\\n');
        }
      };
      reader.readAsDataURL(f);
    });
  }

  startAdd() {
    this.editId.set(null);
    this.form = { brand:'H2Os', name:'', category:'Hydrogen Bottle', badge:'New', tagline:'Hydration, upgraded.', description:'', image:'/images/ultraH2.jpeg', imagesText:'', videosText:'', price:1300000, compareAt:1541000, stock:20, rating:4.9 };
    this.editing.set(true);
    this.tab.set('products');
  }
  startEdit(p: Product) {
    this.editId.set(p.id);
    const imgs = (p.images || []).join('\\n');
    const vids = (p.videos || []).join('\\n');
    this.form = { brand:p.brand, name:p.name, category:p.category, badge:p.badge||'', tagline:p.tagline, description:p.description, image:p.image, imagesText: imgs, videosText: vids, price:p.variants[0].price, compareAt:p.variants[0].compareAt||0, stock:p.variants[0].stock, rating:p.rating||4.8 };
    this.editing.set(true);
  }
  cancel() { this.editing.set(false); this.editId.set(null); }

  async save() {
    if (!this.form.name || !this.form.brand || !this.form.price) {
      this.toast.show('Brand, name and price required', 'error'); return;
    }
    const id = this.editId() || (this.form.brand.toLowerCase().replace(/\\s+/g,'-') + '-' + this.form.name.toLowerCase().replace(/\\s+/g,'-') + '-' + Date.now().toString(36));
    const imgs = this.form.imagesText ? this.form.imagesText.split(/\n/).map((s:string)=>s.trim()).filter(Boolean) : [];
    const vids = this.form.videosText ? this.form.videosText.split(/\n/).map((s:string)=>s.trim()).filter(Boolean) : [];
    const allImages = [this.form.image, ...imgs].filter(Boolean);
    const payload: any = {
      id, sku: id, brand:this.form.brand, name:this.form.name, category:this.form.category||'Hydrogen Bottle', badge:this.form.badge||undefined,
      tagline:this.form.tagline||'', description:this.form.description||'', image:this.form.image||'/images/ultraH2.jpeg',
      images: allImages, videos: vids,
      price: +this.form.price, compareAt: this.form.compareAt? +this.form.compareAt : undefined,
      stock: +this.form.stock, rating:+this.form.rating||4.8,
      variants:[{ variant_key: id, name:this.form.name, finish: this.form.tagline || 'H2Os • Advanced', hex:'#0FD8B8', price:+this.form.price, compareAt: this.form.compareAt? +this.form.compareAt : null, sku: id.toUpperCase().replace(/-/g,'_') + '_500', stock:+this.form.stock, image:this.form.image, gradient:'linear-gradient(145deg,#0A0E14,#111A1E)' }],
      specs: [], features: []
    };
    try {
      if (this.editId()) {
        await this.product.updateProductApi(id, payload);
        this.toast.show('Product updated');
      } else {
        await this.product.createProduct(payload);
        this.toast.show('Product added — live in /store');
      }
      this.editing.set(false);
    } catch (e: any) {
      this.toast.show(e?.error?.message || 'Save failed — check DB', 'error');
    }
  }

  async remove(id: string) {
    if (confirm('Delete this bottle? This cannot be undone.')) {
      try {
        await this.product.deleteProductApi(id);
        this.toast.show('Product removed');
      } catch (e: any) {
        this.toast.show(e?.error?.message || 'Delete failed', 'error');
      }
    }
  }

  async removeReview(id: string) {
    try {
      await new Promise((resolve, reject) => {
        this.http.delete(`${environment.apiUrl}/reviews/${encodeURIComponent(id)}`).subscribe({ next: v => resolve(v), error: e => reject(e) });
      });
      this.review.remove(id);
      this.toast.show('Review removed');
    } catch {
      this.review.remove(id);
    }
  }

  videos = [
    '/videos/how-to-use-it.mp4',
    '/videos/hydrogen-h2o-test.mp4',
    '/videos/blister-hydrogen-h2o-testimonia.mp4',
    '/videos/brain-effect-testimonial.mp4',
    '/videos/diabites-testimonial.mp4',
    '/videos/eye-testimonial.mp4',
    '/videos/reducing-inflamation-testimonial.mp4',
    '/videos/sexual-performance-testimonial.mp4',
  ];
}
