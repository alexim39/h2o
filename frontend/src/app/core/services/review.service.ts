import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review, MOCK_REVIEWS } from '../models/review.model';
import { environment } from '../../../environments/environment';
import { catchError, of } from 'rxjs';

const STORAGE_KEY = 'h2os_reviews_v1';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly _reviews = signal<Review[]>(this.load());
  private readonly _loading = signal(false);

  readonly reviews = this._reviews.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly count = computed(() => this._reviews().length);
  readonly avgRating = computed(() => {
    const arr = this._reviews();
    if (!arr.length) return 4.9;
    return +(arr.reduce((s, r) => s + r.rating, 0) / arr.length).toFixed(1);
  });
  readonly sorted = computed(() =>
    [...this._reviews()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  // Pagination helpers for large datasets (virtual pagination)
  readonly page = signal(1);
  readonly perPage = signal(10);
  readonly paginated = computed(() => {
    const all = this.sorted();
    const p = this.page();
    const pp = this.perPage();
    const start = (p - 1) * pp;
    return all.slice(start, start + pp);
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.count() / this.perPage())));

  constructor(private http: HttpClient) {
    effect(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._reviews())); } catch {}
    });
    this.hydrate();
  }

  private load(): Review[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Review[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return MOCK_REVIEWS;
  }

  private hydrate(): void {
    this.http.get<{ status: boolean; data: Review[] }>(`${environment.apiUrl}/reviews`)
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        if (res?.data && Array.isArray(res.data) && res.data.length) {
          const localIds = new Set(this._reviews().map(r => r.id));
          const incoming = res.data.filter(r => !localIds.has(r.id));
          if (incoming.length) this._reviews.update(arr => [...incoming, ...arr]);
        }
      });
  }

  // Per-product filter
  reviewsFor(productId?: string): Review[] {
    if (!productId) return this.sorted();
    return this.sorted().filter(r => !r.productId || r.productId === productId);
  }

  paginatedFor(productId?: string, page = 1, perPage = 10): { items: Review[]; total: number; pages: number } {
    const all = this.reviewsFor(productId);
    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    return { items: all.slice(start, start + perPage), total, pages };
  }

  add(input: { name?: string; phone?: string; text: string; rating: number; anonymous: boolean; productId?: string }): Review {
    const id = 'rv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const displayName = input.anonymous || !input.name?.trim() ? 'Anonymous' : input.name.trim().slice(0, 32);
    const review: Review = {
      id,
      productId: input.productId,
      name: displayName,
      phone: input.phone?.trim() || undefined,
      rating: Math.min(5, Math.max(1, input.rating)),
      text: input.text.trim().slice(0, 800),
      createdAt: new Date().toISOString(),
      verified: false,
      anonymous: input.anonymous || !input.name?.trim()
    };
    if (!review.text) throw new Error('Review text required');
    this._reviews.update(arr => [review, ...arr]);

    this.http.post(`${environment.apiUrl}/reviews`, review).pipe(catchError(() => of(null))).subscribe();

    return review;
  }

  remove(id: string) {
    this._reviews.update(arr => arr.filter(r => r.id !== id));
  }

  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }
  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
  goPage(n: number) { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
}
