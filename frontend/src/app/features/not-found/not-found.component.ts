import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section"><div class="container narrow">
      <div class="card glass">
        <span class="eyebrow">404 — Lost ritual</span>
        <h1>Page not found.</h1>
        <p class="muted">The page moved or never existed. Continue your hydrogen ritual.</p>
        <div class="actions"><a routerLink="/" class="btn-neon">Home →</a><a routerLink="/store" class="btn-ghost">Store</a><a routerLink="/track" class="btn-ghost">Track order</a></div>
      </div>
    </div></section>
  `,
  styles: [`
    .narrow{ max-width:560px; margin:0 auto; text-align:center; }
    .card{ border-radius:20px; padding:32px; }
    .card h1{ font-family:'Space Grotesk',sans-serif; font-size:28px; margin:8px 0; }
    .muted{ color:var(--text-secondary); font-size:13px; }
    .actions{ display:flex; gap:10px; justify-content:center; margin-top:16px; flex-wrap:wrap; }
  `]
})
export class NotFoundComponent {}
