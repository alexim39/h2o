import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, Variant, VariantId } from '../models/product.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private readonly _placeholder: Product = {
    id: 'ultra-h2-luxe-v1', name: 'Ultra H₂ Luxe', brand: 'H2Os', category: 'Hydrogen Bottle', tagline: 'Smart touch flagship. Hydration, upgraded.',
    description: 'Zenith of smart molecular health. Anodized aviation aluminum, real-time touch cycle tracking — 4000–8000 ppb in 5/10 min, 320 ml, Type-C USB, 2500 mAh.',
    image: '/images/ultraH2.jpeg', images: ['/images/ultraH2.jpeg'], videos: [], rating: 4.9, reviewsCount: 0,
    variants: [{ id:'ultra-h2-luxe', name:'Ultra H₂ Luxe', finish:'Aviation Aluminum • Smart Touch • 320 ml', hex:'#C9A227', price:450000, compareAt:520000, sku:'H2OS-ULTRA-H2-LUXE', image:'/images/ultraH2.jpeg', gradient:'linear-gradient(145deg,#0A0E14,#111A1E)', stock:50 }],
    specs: [], features: []
  };
  private readonly _catalog = signal<Product[]>([]);
  private readonly _product = signal<Product>(this._placeholder);
  private readonly _selectedId = signal<VariantId>('ultra-h2-luxe');
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly catalog = this._catalog.asReadonly();
  readonly product = this._product.asReadonly();
  readonly selectedId = this._selectedId.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly selectedVariant = computed<Variant>(() => {
    const p = this._product();
    const id = this._selectedId();
    return p.variants.find(v => v.id === id) ?? p.variants[0] ?? this._placeholder.variants[0];
  });

  readonly variants = computed(() => this._product()?.variants ?? []);
  readonly specs = computed(() => this._product()?.specs ?? []);
  readonly features = computed(() => this._product()?.features ?? []);
  readonly hasMultipleVariants = computed(() => (this._product()?.variants.length ?? 0) > 1);
  readonly hasMultipleProducts = computed(() => this._catalog().length > 1);

  selectedVariantFallback(): Variant { return this.selectedVariant(); }

  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();
  readonly isPlaceholder = computed(() => this._product().id === this._placeholder.id && !this._catalog().some(p => p.id === this._placeholder.id));

  async loadCatalog(): Promise<void> {
    this._loading.set(true); this._error.set(null);
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/products`));
      const data = res?.data ?? res;
      const list: Product[] = Array.isArray(data) ? data : (data ? [data] : []);
      // Hero-first: keep local Luxe hero in the catalog even though the API
      // only knows the legacy Ultra H₂ — Luxe stays the default product.
      const hasLuxe = list.some(p => p.id === this._placeholder.id);
      const merged: Product[] = hasLuxe ? list : [this._placeholder, ...list];
      this._catalog.set(merged);
      this._loaded.set(true);
      if (merged.length) {
        const curId = this._product().id;
        const stillThere = merged.some(p => p.id === curId);
        if (!stillThere) {
          const hero = merged.find(p => p.id === this._placeholder.id) ?? merged[0];
          this._product.set(hero);
          this._selectedId.set(hero.variants[0]?.id ?? 'ultra-h2-luxe');
        }
      } else {
        this._error.set('No products yet — add via MGT');
      }
    } catch (e: any) {
      this._error.set(e?.error?.message ?? 'Failed to load catalog — check API');
      this._catalog.set([]);
      this._loaded.set(true);
    } finally { this._loading.set(false); }
  }

  async loadProduct(id: string): Promise<Product | null> {
    this._loading.set(true);
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/products/${encodeURIComponent(id)}`));
      const data = res?.data ?? res;
      if (data) {
        this._product.set(data);
        this._selectedId.set(data.variants[0]?.id ?? 'ultra-h2-luxe');
        return data;
      }
      return null;
    } catch {
      return null;
    } finally { this._loading.set(false); }
  }

  // Compatibility for old callers expecting sync selected()
  selectedVariantSync(): Variant {
    const v = this.selectedVariant();
    if (v) return v;
    // minimal placeholder to avoid template crash before load
    return { id:'ultra-h2-luxe', name:'Ultra H₂ Luxe', finish:'', hex:'#C9A227', price:450000, compareAt:520000, sku:'H2OS-ULTRA-H2-LUXE', image:'/images/ultraH2.jpeg', gradient:'', stock:0 };
  }

  // MGT helpers — real API
  async createProduct(p: Partial<Product>): Promise<any> {
    const res: any = await firstValueFrom(this.http.post(`${this.api}/products`, p));
    await this.loadCatalog();
    return res?.data ?? res;
  }

  async updateProductApi(id: string, patch: Partial<Product>): Promise<any> {
    const res: any = await firstValueFrom(this.http.put(`${this.api}/products/${encodeURIComponent(id)}`, patch));
    await this.loadCatalog();
    return res?.data ?? res;
  }

  async deleteProductApi(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.api}/products/${encodeURIComponent(id)}`));
    await this.loadCatalog();
  }

  // Legacy wrappers for components that used sync catalog mutation
  addProduct(p: Product): void { this.createProduct(p as any); }
  updateProduct(id: string, patch: Partial<Product>): void { this.updateProductApi(id, patch); }
  removeProduct(id: string): void { this.deleteProductApi(id); }

  selectVariant(id: VariantId): void { this._selectedId.set(id); }

  selectProduct(id: string): void {
    const found = this._catalog().find(p => p.id === id);
    if (found) {
      this._product.set(found);
      this._selectedId.set(found.variants[0]?.id ?? 'ultra-h2-luxe');
    } else {
      this.loadProduct(id);
    }
  }

  getVariant(id: VariantId): Variant | undefined {
    const fromSelected = this._product()?.variants.find(v => v.id === id);
    if (fromSelected) return fromSelected;
    for (const prod of this._catalog()) {
      const v = prod.variants.find(vv => vv.id === id);
      if (v) return v;
    }
    return this._placeholder.variants.find(v => v.id === id);
  }

  getProductByVariant(id: VariantId): Product | undefined {
    return this._catalog().find(p => p.variants.some(v => v.id === id))
      ?? (this._placeholder.variants.some(v => v.id === id) ? this._placeholder : undefined);
  }

  getProduct(id: string): Product | undefined {
    return this._catalog().find(p => p.id === id)
      ?? (this._placeholder.id === id ? this._placeholder : undefined);
  }

  galleryAngles = computed(() => Array.from({ length: 8 }, (_, i) => i * 45));

  constructor() {
    // auto-load catalog on first inject (non-blocking)
    setTimeout(() => this.loadCatalog(), 120);
  }
}
