import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);

  init(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects as string;
      this.updateForUrl(url);
    });
  }

  updateForUrl(url: string): void {
    const base = 'https://hydrogenwaterbottles.store';
    const canonical = base + url.split('?')[0].split('#')[0];
    this.setCanonical(canonical);

    if (url.startsWith('/store/')) {
      const id = url.split('/')[2];
      this.setTags({
        title: `Buy ${this.humanize(id)} | Hydrogen Water Bottle | H2Os`,
        description: `Buy ${this.humanize(id)} hydrogen water bottle — SPE/PEM 1600ppb, free shipping Nigeria. Shop H2Os hydrogen water bottles from ₦40,000.`,
        url: canonical
      });
    } else if (url.startsWith('/store')) {
      this.setTags({
        title: 'Buy Hydrogen Water Bottle | Store from ₦40,000 | H2Os',
        description: 'Buy hydrogen water bottle in Nigeria — H2Os Ultra H₂ and 5 more hydrogen brands from ₦40,000. 1600ppb, free shipping, Paystack secure.',
        url: canonical
      });
    } else if (url.startsWith('/videos')) {
      this.setTags({
        title: 'How to Use Hydrogen Water Bottle | Videos | H2Os',
        description: 'Watch how to use hydrogen water bottle — Ultra H₂ demo, hydrogen tests, customer testimonials. Buy hydrogen water bottle with confidence.',
        url: canonical
      });
    } else if (url.startsWith('/reviews')) {
      this.setTags({
        title: 'Hydrogen Water Bottle Reviews | H2Os Community',
        description: 'Read reviews for hydrogen water bottles — real H2Os customers on recovery, clarity, hydration. Buy hydrogen water bottle with 30-day guarantee.',
        url: canonical
      });
    } else {
      this.setTags({
        title: 'Buy Hydrogen Water Bottle | H2Os Ultra H₂ | Free Shipping',
        description: 'Buy hydrogen water bottle in Nigeria. H2Os Ultra H₂ — 1600ppb ultra-pure hydrogen, SPE/PEM, free shipping. Shop hydrogen water bottles from ₦40,000.',
        url: canonical
      });
    }
  }

  private setTags({ title, description, url }: { title: string; description: string; url: string }): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  private setCanonical(url: string): void {
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private humanize(id: string): string {
    return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
