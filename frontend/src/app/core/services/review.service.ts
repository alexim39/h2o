import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../models/review.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly _reviews = signal<Review[]>([]);
  private readonly _loading = signal(false);

  readonly reviews = this._reviews.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly count = computed(() => this._reviews().length);
  readonly avgRating = computed(() => {
    const arr = this._reviews();
    if (!arr.length) return 0;
    return +(arr.reduce((s, r) => s + r.rating, 0) / arr.length).toFixed(1);
  });
  readonly sorted = computed(() =>
    [...this._reviews()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

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
    this.hydrate();
  }

  private async hydrate(): Promise<void> {
    this._loading.set(true);
    try {
      const res: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/reviews`).pipe(catchError(() => of(null))));
      const data: Review[] = res?.data ?? res ?? [];
      if (Array.isArray(data)) this._reviews.set(data);
    } finally { this._loading.set(false); }
  }

  async refresh(): Promise<void> { await this.hydrate(); }

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

  async add(input: { name?: string; phone?: string; text: string; rating: number; anonymous: boolean; productId?: string }): Promise<Review> {
    if (!input.text?.trim() || input.text.trim().length < 10) throw new Error('Review text must be at least 10 characters');
    const payload = {
      name: input.anonymous || !input.name?.trim() ? 'Anonymous' : input.name.trim().slice(0, 32),
      phone: input.phone?.trim() || undefined,
      text: input.text.trim().slice(0, 800),
      rating: Math.min(5, Math.max(1, input.rating)),
      anonymous: !!input.anonymous || !input.name?.trim(),
      productId: input.productId,
    };
    const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/reviews`, payload).pipe(catchError(() => of(null))));
    const created: Review = res?.data ?? res;
    if (created?.id) {
      this._reviews.update(arr => [created, ...arr]);
      return created;
    }
    // fallback — still add locally if API failed but DB may have persisted
    const fallback: Review = { id: 'rv_' + Date.now().toString(36), name: payload.name!, phone: payload.phone, rating: payload.rating, text: payload.text, createdAt: new Date().toISOString(), verified: false, anonymous: payload.anonymous, productId: payload.productId };
    this._reviews.update(arr => [fallback, ...arr]);
    await this.hydrate();
    return fallback;
  }

  remove(id: string) {
    this._reviews.update(arr => arr.filter(r => r.id !== id));
  }

  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }
  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
  goPage(n: number) { if (n >= 1 && n <= this.totalPages()) this.page.set(n); }
}
