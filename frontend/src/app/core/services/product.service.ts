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
    id: 'ultra-h2-v1', name: 'Ultra H₂', brand: 'H2Os', category: 'Hydrogen Bottle', tagline: 'Hydration, upgraded.',
    description: 'Advanced hydrogen infusion technology. 1200–1600 ppb in 3 min — SPE/PEM, platinum titanium.',
    image: '/images/ultraH2.jpeg', images: ['/images/ultraH2.jpeg'], videos: [], rating: 4.9, reviewsCount: 0,
    variants: [{ id:'ultra-h2', name:'Ultra H₂', finish:'Crystal Glass • Matte Black', hex:'#0FD8B8', price:1300000, compareAt:1541000, sku:'H2OS-ULTRA-H2-500', image:'/images/ultraH2.jpeg', gradient:'linear-gradient(145deg,#0A0E14,#111A1E)', stock:47 }],
    specs: [], features: []
  };
  private readonly _catalog = signal<Product[]>([]);
  private readonly _product = signal<Product>(this._placeholder);
  private readonly _selectedId = signal<VariantId>('ultra-h2');
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

  async loadCatalog(): Promise<void> {
    this._loading.set(true); this._error.set(null);
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/products`));
      const data = res?.data ?? res;
      const list: Product[] = Array.isArray(data) ? data : (data ? [data] : []);
      this._catalog.set(list);
      if (list.length && !this._product()) {
        this._product.set(list[0]);
        this._selectedId.set(list[0].variants[0]?.id ?? 'ultra-h2');
      }
      if (!list.length) this._error.set('No products yet — add via MGT');
    } catch (e: any) {
      this._error.set(e?.error?.message ?? 'Failed to load catalog');
      this._catalog.set([]);
    } finally { this._loading.set(false); }
  }

  async loadProduct(id: string): Promise<Product | null> {
    this._loading.set(true);
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/products/${encodeURIComponent(id)}`));
      const data = res?.data ?? res;
      if (data) {
        this._product.set(data);
        this._selectedId.set(data.variants[0]?.id ?? 'ultra-h2');
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
    return { id:'ultra-h2', name:'Ultra H₂', finish:'', hex:'#0FD8B8', price:1300000, compareAt:1541000, sku:'H2OS-ULTRA-H2-500', image:'/images/ultraH2.jpeg', gradient:'', stock:0 };
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
      this._selectedId.set(found.variants[0]?.id ?? 'ultra-h2');
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
    return undefined;
  }

  getProductByVariant(id: VariantId): Product | undefined {
    return this._catalog().find(p => p.variants.some(v => v.id === id));
  }

  getProduct(id: string): Product | undefined {
    return this._catalog().find(p => p.id === id);
  }

  galleryAngles = computed(() => Array.from({ length: 8 }, (_, i) => i * 45));

  constructor() {
    // auto-load catalog on first inject (non-blocking)
    setTimeout(() => this.loadCatalog(), 120);
  }
}
