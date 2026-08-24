import { Injectable, signal, computed, effect } from '@angular/core';
import { ULTRA_H2_PRODUCT, PRODUCT_CATALOG, CATALOG_SEED, Variant, VariantId, Product } from '../models/product.model';

const CATALOG_KEY = 'h2os_catalog_v2';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _selectedId = signal<VariantId>('ultra-h2');
  private readonly _product = signal<Product>(ULTRA_H2_PRODUCT);
  private readonly _catalog = signal<Product[]>(this.loadCatalog());

  readonly product = this._product.asReadonly();
  readonly catalog = this._catalog.asReadonly();
  readonly selectedId = this._selectedId.asReadonly();

  readonly selectedVariant = computed<Variant>(() => {
    const p = this._product();
    const id = this._selectedId();
    return p.variants.find(v => v.id === id) ?? p.variants[0];
  });

  readonly variants = computed(() => this._product().variants);
  readonly specs = computed(() => this._product().specs);
  readonly features = computed(() => this._product().features);

  readonly hasMultipleVariants = computed(() => this._product().variants.length > 1);
  readonly hasMultipleProducts = computed(() => this._catalog().length > 1);

  constructor() {
    effect(() => {
      try { localStorage.setItem(CATALOG_KEY, JSON.stringify(this._catalog())); } catch {}
    });
    // Ensure selected product syncs with catalog if catalog changes
    effect(() => {
      const cat = this._catalog();
      const cur = this._product();
      const stillExists = cat.find(p => p.id === cur.id);
      if (!stillExists && cat.length) {
        this._product.set(cat[0]);
        this._selectedId.set(cat[0].variants[0]?.id as VariantId ?? 'ultra-h2');
      }
    });
  }

  private loadCatalog(): Product[] {
    try {
      const raw = localStorage.getItem(CATALOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Product[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return [...CATALOG_SEED];
  }

  resetCatalog(): void {
    this._catalog.set([...CATALOG_SEED]);
    try { localStorage.removeItem(CATALOG_KEY); } catch {}
  }

  // Product CRUD for MGT
  addProduct(p: Product): void {
    this._catalog.update(arr => [p, ...arr]);
  }

  updateProduct(id: string, patch: Partial<Product>): void {
    this._catalog.update(arr => arr.map(prod => prod.id === id ? { ...prod, ...patch } : prod));
    if (this._product().id === id) {
      this._product.update(cur => ({ ...cur, ...patch }));
    }
  }

  removeProduct(id: string): void {
    this._catalog.update(arr => arr.filter(p => p.id !== id));
  }

  selectVariant(id: VariantId): void {
    this._selectedId.set(id);
  }

  selectProduct(id: string): void {
    const found = this._catalog().find(p => p.id === id);
    if (found) {
      this._product.set(found);
      this._selectedId.set(found.variants[0]?.id as VariantId ?? 'ultra-h2');
    }
  }

  // Search across catalog
  getVariant(id: VariantId): Variant | undefined {
    // First try selected product, then entire catalog
    const fromSelected = this._product().variants.find(v => v.id === id);
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
}
