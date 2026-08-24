import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, CartLine } from '../models/cart.model';
import { ProductService } from './product.service';
import { VariantId } from '../models/product.model';

const STORAGE_KEY = 'h2os_cart_v2';
const SHIPPING_FLAT = 0; // Free shipping on all orders

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());
  private readonly _drawerOpen = signal(false);

  readonly drawerOpen = this._drawerOpen.asReadonly();
  readonly items = this._items.asReadonly();

  readonly count = computed(() => this._items().reduce((a, b) => a + b.qty, 0));

  readonly lines = computed<CartLine[]>(() => {
    const productSvc = this.productRef;
    return this._items()
      .map(ci => {
        const v = productSvc.getVariant(ci.variantId) ?? productSvc.variants()[0];
        if (!v) return null;
        return {
          ...ci,
          variantId: v.id as any,
          name: v.name,
          finish: v.finish,
          price: v.price,
          sku: v.sku,
          hex: v.hex,
          gradient: v.gradient
        } as CartLine;
      })
      .filter(Boolean) as CartLine[];
  });

  readonly subtotal = computed(() => this.lines().reduce((s, l) => s + l.price * l.qty, 0));
  readonly shipping = computed(() => this._items().length ? SHIPPING_FLAT : 0);
  readonly total = computed(() => this.subtotal() + this.shipping());
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor(private productRef: ProductService) {
    effect(() => {
      const items = this._items();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    });
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CartItem[];
    } catch {}
    return [];
  }

  openDrawer() { this._drawerOpen.set(true); }
  closeDrawer() { this._drawerOpen.set(false); }
  toggleDrawer() { this._drawerOpen.update(v => !v); }

  add(variantId: VariantId, qty = 1): void {
    this._items.update(items => {
      const idx = items.findIndex(i => i.variantId === variantId);
      if (idx >= 0) {
        const clone = [...items];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + qty };
        return clone;
      }
      return [...items, { variantId, qty }];
    });
  }

  setQty(variantId: VariantId, qty: number): void {
    if (qty <= 0) { this.remove(variantId); return; }
    this._items.update(items => items.map(i => i.variantId === variantId ? { ...i, qty } : i));
  }

  remove(variantId: VariantId): void {
    this._items.update(items => items.filter(i => i.variantId !== variantId));
  }

  clear(): void {
    this._items.set([]);
  }

  increment(variantId: VariantId) { this.add(variantId, 1); }
  decrement(variantId: VariantId) {
    const item = this._items().find(i => i.variantId === variantId);
    if (item) this.setQty(variantId, item.qty - 1);
  }

  formatNGN(kobo: number): string {
    // price stored as NGN (not kobo) for simplicity; but keep kobo naming compat
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo);
  }

  /** For Paystack: amount in kobo (smallest unit) */
  paystackAmount(): number { return this.total() * 100; }
}
