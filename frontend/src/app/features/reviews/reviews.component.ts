import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../core/services/review.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="section">
      <div class="container narrow">
        <div class="head">
          <span class="eyebrow">H2Os Community • Ultra H₂</span>
          <h1>Real humans. <em>Real rituals.</em></h1>
          <p>Share your Ultra H₂ ritual — or read what the community feels. Every review grows trust for the next H2Os bottle.</p>

          <div class="stats glass">
            <div class="stat"><strong>{{ review.avgRating() }}</strong><span>Avg rating</span></div>
            <div class="divider"></div>
            <div class="stat"><strong>{{ review.count() }}</strong><span>Community reviews</span></div>
            <div class="divider"></div>
            <div class="stat"><strong>★★★★★</strong><span>Verified + Anonymous welcome</span></div>
          </div>

          <div class="actions">
            <a routerLink="/videos" class="btn-ghost sm">Watch video testimonials →</a>
            <a routerLink="/product" class="btn-neon sm">Shop Ultra H₂</a>
          </div>
        </div>

        <!-- Add review -->
        <div class="form-card glass">
          <h3>Share your ritual</h3>
          <p class="muted">Your name and phone are optional. Choose anonymous to post without identity. Phone is never shown publicly.</p>

          <form (ngSubmit)="submit()" class="form">
            <div class="row">
              <div class="group">
                <label>Name (optional)</label>
                <input [(ngModel)]="name" name="name" placeholder="Amara or leave blank" [disabled]="anonymous()" />
              </div>
              <div class="group">
                <label>Phone (optional, private)</label>
                <input [(ngModel)]="phone" name="phone" placeholder="+234 800 000 0000" />
              </div>
            </div>

            <label class="check">
              <input type="checkbox" [checked]="anonymous()" (change)="anonymous.set(!anonymous())" />
              <span>Post anonymously</span>
            </label>

            <div class="group">
              <label>Rating</label>
              <div class="stars-input">
                @for (s of [1,2,3,4,5]; track s) {
                  <button type="button" class="star" [class.active]="s <= rating()" (click)="rating.set(s)">★</button>
                }
                <span class="rating-label">{{ rating() }} / 5</span>
              </div>
            </div>

            <div class="group">
              <label>Your experience with Ultra H₂</label>
              <textarea [(ngModel)]="text" name="text" rows="4" maxlength="800" required placeholder="How has Ultra H₂ changed your hydration, recovery, clarity...? Be real — the community values honesty."></textarea>
              <span class="hint">{{ text.length }}/800</span>
            </div>

            @if (error()) { <div class="error">{{ error() }}</div> }

            <button type="submit" class="btn-neon full" [disabled]="!text.trim() || loading()">
              @if (loading()) { Posting… } @else { Post review — join H2Os community → }
            </button>
            <p class="secure">By posting you agree to community guidelines. No spam — real rituals only.</p>
          </form>
        </div>

        <!-- List — paginated for huge datasets -->
        <div class="list">
          <div class="list-head">
            <h3>Community voices — newest first</h3>
            <span class="muted">{{ review.count() }} total • Page {{ review.page() }} of {{ review.totalPages() }}</span>
          </div>
          @for (r of review.paginated(); track r.id) {
            <article class="review glass">
              <div class="top">
                <div class="stars"> {{ '★'.repeat(r.rating) }}<span class="empty">{{ '★'.repeat(5 - r.rating) }}</span> <span class="num">{{ r.rating }}.0</span></div>
                @if (r.verified) { <span class="verified">Verified ritual</span> }
                @if (r.anonymous) { <span class="anon">Anonymous</span> }
                <span class="date">{{ formatDate(r.createdAt) }}</span>
              </div>
              <p class="text">“{{ r.text }}”</p>
              <div class="author">
                <div class="ava">{{ initials(r.name) }}</div>
                <div><strong>{{ r.name }}</strong><span>{{ r.anonymous ? 'H2Os member' : 'H2Os community' }}</span></div>
              </div>
            </article>
          }
          @if (review.count()===0) {
            <p class="empty">No reviews yet — be the first to share your Ultra H₂ ritual.</p>
          }
          @if (review.totalPages() > 1) {
            <div class="pagination">
              <button class="btn-ghost sm" (click)="review.prevPage()" [disabled]="review.page()===1">← Prev</button>
              <span>{{ review.page() }} / {{ review.totalPages() }}</span>
              <button class="btn-ghost sm" (click)="review.nextPage()" [disabled]="review.page()===review.totalPages()">Next →</button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .narrow{ max-width: 780px; margin:0 auto; }
    .head{ text-align:center; margin-bottom:24px; }
    .head h1{ font-family:'Space Grotesk',sans-serif; font-size:clamp(28px,4vw,40px); letter-spacing:-0.02em; }
    .head h1 em{ font-style:normal; color:var(--neon); }
    .head p{ color:var(--text-secondary); font-size:14px; margin:10px auto 16px; max-width:560px; }
    .stats{ display:flex; align-items:center; justify-content:center; gap:18px; border-radius:18px; padding:14px 18px; flex-wrap:wrap; }
    .stat{ text-align:center; }
    .stat strong{ display:block; font-size:18px; }
    .stat span{ font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .divider{ width:1px; height:32px; background:var(--border); }
    .actions{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:14px; }
    .btn-neon.sm, .btn-ghost.sm{ padding:8px 14px; font-size:12px; }

    .form-card{ border-radius:20px; padding:18px; margin-top:18px; }
    .form-card h3{ font-size:16px; }
    .muted{ font-size:12px; color:var(--text-secondary); margin:6px 0 14px; }
    .form{ display:flex; flex-direction:column; gap:12px; }
    .row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .group{ display:flex; flex-direction:column; gap:6px; flex:1; }
    .group label{ font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
    .group input, .group textarea{ background: rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:12px; padding:12px 14px; color:var(--text-primary); font-size:13px; outline:none; }
    .group input:focus, .group textarea:focus{ border-color: rgba(0,255,136,0.35); box-shadow: 0 0 0 3px rgba(0,255,136,0.10); }
    .check{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text-secondary); }
    .stars-input{ display:flex; align-items:center; gap:6px; }
    .star{ width:32px;height:32px;border-radius:50%; border:1px solid var(--border); background: rgba(255,255,255,0.04); color:var(--text-muted); font-size:16px; }
    .star.active{ background: var(--neon); color:#050507; border-color: var(--neon); box-shadow:0 0 10px rgba(0,255,136,0.4); }
    .rating-label{ font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); margin-left:8px; }
    .hint{ font-size:10px; color:var(--text-muted); text-align:right; font-family:'JetBrains Mono', monospace; }
    .error{ background: rgba(255,77,106,0.10); border:1px solid rgba(255,77,106,0.22); color:#FF8A9E; padding:10px 12px; border-radius:12px; font-size:13px; }
    .full{ width:100%; justify-content:center; }
    .secure{ text-align:center; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-muted); }

    .list{ margin-top:22px; display:flex; flex-direction:column; gap:12px; }
    .list-head{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:4px; }
    .list h3{ font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .pagination{ display:flex; align-items:center; justify-content:center; gap:12px; margin-top:16px; font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); }
    .review{ border-radius:16px; padding:16px; }
    .top{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .stars{ color:var(--neon); font-size:13px; }
    .stars .empty{ color:var(--border); }
    .num{ color:var(--text-secondary); font-size:11px; margin-left:4px; font-family:'JetBrains Mono', monospace; }
    .verified{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); padding:3px 7px; border-radius:999px; }
    .anon{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; background: rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text-secondary); padding:3px 7px; border-radius:999px; }
    .date{ margin-left:auto; font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-muted); }
    .text{ margin:10px 0 12px; font-size:13px; color:var(--text-primary); line-height:1.6; }
    .author{ display:flex; align-items:center; gap:10px; }
    .ava{ width:32px;height:32px;border-radius:50%; background: var(--bg-card); border:1px solid var(--border); display:grid; place-items:center; font-size:11px; font-weight:700; }
    .author strong{ display:block; font-size:12px; }
    .author span{ font-size:11px; color:var(--text-muted); }
    .empty{ text-align:center; color:var(--text-muted); padding:20px 0; }

    @media(max-width:640px){ .row{ grid-template-columns:1fr; } }
  `]
})
export class ReviewsComponent {
  review = inject(ReviewService);
  private toast = inject(ToastService);

  name = '';
  phone = '';
  text = '';
  rating = signal(5);
  anonymous = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    this.error.set(null);
    if (!this.text.trim()) { this.error.set('Please share your experience.'); return; }
    if (this.text.trim().length < 10) { this.error.set('Review too short — share a bit more.'); return; }
    this.loading.set(true);
    try {
      this.review.add({
        name: this.name,
        phone: this.phone,
        text: this.text,
        rating: this.rating(),
        anonymous: this.anonymous()
      });
      this.toast.show('Thanks — your ritual is now community wisdom 🌱', 'success');
      this.text = '';
      this.review.goPage(1);
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to post');
    } finally {
      this.loading.set(false);
    }
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  }

  formatDate(iso: string): string {
    try { return new Date(iso).toLocaleDateString('en-NG', { year:'numeric', month:'short', day:'numeric'}); } catch { return iso; }
  }
}
