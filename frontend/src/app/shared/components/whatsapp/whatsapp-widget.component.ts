import { Component, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-whatsapp-widget',
  standalone: true,
  template: `
    <div class="wrap">
      @if (open()) {
        <div class="card glass glow-border">
          <div class="card-head">
            <div class="avatar">H<sub>2</sub></div>
            <div class="meta">
              <strong>H2Os Concierge</strong>
              <span>Typically replies in minutes</span>
            </div>
            <button class="close" (click)="open.set(false)" aria-label="Close">×</button>
          </div>
          <div class="body">
            <p class="bubble">Hi — curious about Ultra H₂? Ask anything about hydrogen, usage, or delivery. We’ll guide your ritual.</p>
            <div class="quick">
              <button (click)="send('Is Ultra H₂ in stock?')">Is Ultra H₂ in stock?</button>
              <button (click)="send('How do I use Ultra H₂?')">How to use?</button>
              <button (click)="send('Do you offer express delivery to Lagos?')">Delivery to Lagos?</button>
            </div>
          </div>
          <a class="cta" [href]="waLink()" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3  .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6.1c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.5.7-.6.8-.2.2-.4.1a6.6 6.6 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.2.2-.3s0-.2 0-.3 0-.2-.2-.5-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.3 0-.5.2s-.6.6-.6 1.4.6 1.6.7 1.7.9 1.9 2.5 2.7c.4.2.7.4 1 .5.4.2.8.2 1.1.1.3-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.2z"/></svg>
            Chat on WhatsApp
          </a>
          <span class="hint">Opens wa.me with pre-filled high-intent message</span>
        </div>
      }
      <button class="fab" (click)="toggle()" aria-label="Chat on WhatsApp">
        <span class="ring"></span><span class="ring2"></span>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6.1c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.5.7-.6.8-.2.2-.4.1a6.6 6.6 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.2.2-.3s0-.2 0-.3 0-.2-.2-.5-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.3 0-.5.2s-.6.6-.6 1.4.6 1.6.7 1.7.9 1.9 2.5 2.7c.4.2.7.4 1 .5.4.2.8.2 1.1.1.3-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.2z"/></svg>
      </button>
    </div>
  `,
  styles: [`
    .wrap { position: fixed; right: 22px; bottom: 22px; z-index: 60; display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }
    .fab { position: relative; width: 60px; height: 60px; border-radius: 50%; border: none; background: #25D366; display: grid; place-items: center; box-shadow: 0 10px 30px rgba(37,211,102,0.45), 0 0 0 1px rgba(0,0,0,0.06); cursor: pointer; }
    .fab svg { position: relative; z-index: 2; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
    .ring, .ring2 { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(37,211,102,0.5); animation: breathe 2.6s ease-in-out infinite; }
    .ring2 { animation-delay: 1.3s; }
    @keyframes breathe { 0%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.18);opacity:0} 100%{transform:scale(1.18);opacity:0} }
    .card { width: 340px; border-radius: 20px; overflow: hidden; padding: 0; background: rgba(17,19,24,0.88); }
    .card-head { display: flex; align-items:center; gap: 12px; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(90deg, rgba(0,255,136,0.10), transparent); }
    .avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--neon); color:#050507; display:grid; place-items:center; font-weight:800; }
    .meta strong { display:block; font-size: 13px; }
    .meta span { font-size: 11px; color: var(--text-secondary); }
    .close { margin-left: auto; background: rgba(255,255,255,0.06); border:none; width:28px; height:28px; border-radius:50%; color: var(--text-secondary); font-size:18px; line-height:1; }
    .body { padding: 16px; }
    .bubble { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); padding: 12px 14px; border-radius: 14px; border-bottom-left-radius: 4px; font-size: 13px; color: var(--text-primary); line-height: 1.5; }
    .quick { display:flex; flex-wrap:wrap; gap:8px; margin-top: 12px; }
    .quick button { font-size: 12px; font-weight: 600; padding: 7px 10px; border-radius: 999px; background: rgba(0,255,136,0.10); border: 1px solid rgba(0,255,136,0.18); color: var(--neon-2); }
    .quick button:hover { background: rgba(0,255,136,0.16); }
    .cta { margin: 0 16px 12px; background: #25D366; color: white; border-radius: 999px; padding: 12px; display:flex; align-items:center; justify-content:center; gap:8px; font-weight:700; font-size:13px; text-align:center; }
    .hint { display:block; text-align:center; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-muted); padding-bottom: 14px; }
    @media (max-width: 420px){ .card{ width: 300px; } }
  `]
})
export class WhatsappWidgetComponent {
  open = signal(false);
  waLink = signal(this.buildLink(environment.whatsappMessage));

  toggle(): void { this.open.update(v => !v); }

  private buildLink(msg: string) {
    const num = environment.whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }
  send(text: string) {
    const url = this.buildLink(text);
    window.open(url, '_blank', 'noopener');
  }
}
