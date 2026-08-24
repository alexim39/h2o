import { Component, inject, signal, effect, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeepseekService } from '../../../core/services/deepseek.service';

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="wrap">
      @if (open()) {
        <div class="panel glass glow-border">
          <div class="head">
            <div class="avatar">H<sub>2</sub></div>
            <div class="meta">
              <strong>H2Os Assistant Doctor</strong>
              <span>DeepSeek AI • Typically replies in seconds</span>
            </div>
            <div class="head-actions">
              <button class="icon" (click)="clear()" title="Clear">↺</button>
              <button class="close" (click)="open.set(false)">×</button>
            </div>
          </div>

          <div class="alert">
            <span class="dot"></span> AI answers hydrogen health & business • Escalates to human on WhatsApp when needed
          </div>

          <div #scroll class="threads">
            @for (m of ai.messages(); track $index) {
              <div class="msg" [class.user]="m.role==='user'" [class.assistant]="m.role!=='user'">
                <div class="bubble">
                  @if (m.role!=='user') { <span class="role">Dr. H2Os</span> }
                  <p>{{ m.content }}</p>
                </div>
                <span class="time">{{ time(m.at) }}</span>
              </div>
            }
            @if (ai.loading()) {
              <div class="msg assistant">
                <div class="bubble typing"><span></span><span></span><span></span></div>
              </div>
            }
          </div>

          <div class="quick">
            <button (click)="ask('What are the health benefits of Ultra H₂?')">Benefits?</button>
            <button (click)="ask('How do I use Ultra H₂?')">How to use?</button>
            <button (click)="ask('What is the price and delivery to Lagos?')">Price & delivery?</button>
            <button (click)="ask('Can I speak to a real human?')">Speak to human</button>
          </div>

          <form class="input-row" (ngSubmit)="send()">
            <input [(ngModel)]="draft" name="draft" placeholder="Ask about hydrogen, health, Ultra H₂… " autocomplete="off" />
            <button type="submit" class="send" [disabled]="!draft.trim() || ai.loading()">➤</button>
          </form>

          <div class="escalate">
            <span>Need a human?</span>
            <a [href]="ai.whatsappLink(draft || undefined)" target="_blank" rel="noopener" class="wa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6.1c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.5.7-.6.8-.2.2-.4.1a6.6 6.6 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.2.2-.3s0-.2 0-.3 0-.2-.2-.5-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.3 0-.5.2s-.6.6-.6 1.4.6 1.6.7 1.7.9 1.9 2.5 2.7c.4.2.7.4 1 .5.4.2.8.2 1.1.1.3-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.2z"/></svg>
              WhatsApp +2348080386208
            </a>
          </div>
          <span class="hint">H2Os Assistant Doctor • DeepSeek AI • Mock key — replace in .env for production</span>
        </div>
      }
      <button class="fab" (click)="toggle()" aria-label="Chat with H2Os Assistant Doctor">
        <span class="ring"></span><span class="ring2"></span>
        <span class="fab-icon">H<sub>2</sub></span>
        <span class="fab-text">Chat H2 Doctor</span>
      </button>
    </div>
  `,
  styles: [`
    .wrap { position: fixed; right: 18px; bottom: 18px; z-index: 60; display:flex; flex-direction:column; align-items:flex-end; gap:12px; }
    .fab { position:relative; height:52px; padding:0 18px 0 14px; border-radius:999px; border:none; background: linear-gradient(135deg, #0FD8B8, #00FF88); display:inline-flex; align-items:center; gap:8px; box-shadow: 0 12px 30px rgba(0,255,136,0.45), 0 0 0 1px rgba(0,0,0,0.06); cursor:pointer; }
    .fab-icon{ position:relative; z-index:2; font-family:'Space Grotesk',sans-serif; font-weight:800; color:#050507; font-size:15px; display:inline-flex; align-items:baseline; gap:1px; background: rgba(5,5,7,0.08); width:32px; height:32px; border-radius:50%; align-items:center; justify-content:center; }
    .fab-icon sub{ font-size:10px; }
    .fab-text{ position:relative; z-index:2; font-family:'Space Grotesk',sans-serif; font-weight:700; color:#050507; font-size:12px; letter-spacing:0.02em; white-space:nowrap; }
    .ring,.ring2{ position:absolute; inset:0; border-radius:50%; border:1px solid rgba(0,255,136,0.5); animation: breathe 2.6s ease-in-out infinite; }
    .ring2{ animation-delay:1.3s; }
    @keyframes breathe{ 0%{transform:scale(1);opacity:0.7}50%{transform:scale(1.18);opacity:0}100%{transform:scale(1.18);opacity:0} }
    .panel{ width:380px; max-width:92vw; max-height: 78vh; border-radius:20px; overflow:hidden; display:flex; flex-direction:column; background: rgba(17,19,24,0.94); backdrop-filter: blur(18px); }
    .head{ display:flex; align-items:center; gap:10px; padding:14px; border-bottom:1px solid rgba(255,255,255,0.06); background: linear-gradient(90deg, rgba(0,255,136,0.10), transparent); }
    .avatar{ width:36px;height:36px;border-radius:50%; background:var(--neon); color:#050507; display:inline-flex; align-items:baseline; justify-content:center; font-weight:800; font-size:13px; padding-top:6px; }
    .avatar sub{ font-size:9px; }
    .meta strong{ display:block; font-size:13px; }
    .meta span{ font-size:10px; color:var(--text-secondary); }
    .head-actions{ margin-left:auto; display:flex; gap:6px; align-items:center; }
    .icon{ background:rgba(255,255,255,0.06); border:1px solid var(--border); width:28px;height:28px;border-radius:50%; color:var(--text-secondary); }
    .close{ background:rgba(255,255,255,0.06); border:none; width:28px;height:28px;border-radius:50%; color:var(--text-secondary); font-size:18px; line-height:1; }
    .alert{ display:flex; align-items:center; gap:8px; background: rgba(0,255,136,0.08); border-bottom:1px solid rgba(0,255,136,0.12); padding:8px 12px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-secondary); }
    .dot{ width:6px;height:6px;border-radius:50%;background:var(--neon);box-shadow:0 0 8px var(--neon); display:inline-block; }
    .threads{ flex:1; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:10px; min-height: 220px; }
    .msg{ display:flex; flex-direction:column; gap:4px; max-width:88%; }
    .msg.user{ align-self:flex-end; }
    .msg.assistant{ align-self:flex-start; }
    .bubble{ padding:10px 12px; border-radius:14px; font-size:13px; line-height:1.5; white-space:pre-wrap; word-break:break-word; }
    .msg.user .bubble{ background: var(--neon); color:#050507; border-bottom-right-radius:4px; }
    .msg.assistant .bubble{ background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.06); border-bottom-left-radius:4px; }
    .role{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--neon); display:block; margin-bottom:4px; }
    .time{ font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-muted); }
    .msg.user .time{ align-self:flex-end; }
    .typing{ display:flex; gap:4px; align-items:center; }
    .typing span{ width:6px;height:6px;border-radius:50%; background:var(--text-muted); animation: dot 1s infinite; }
    .typing span:nth-child(2){ animation-delay:0.15s; } .typing span:nth-child(3){ animation-delay:0.3s; }
    @keyframes dot{0%,100%{opacity:0.4}50%{opacity:1}}
    .quick{ display:flex; flex-wrap:wrap; gap:6px; padding:8px 12px; border-top:1px solid rgba(255,255,255,0.06); }
    .quick button{ font-size:11px; font-weight:600; padding:6px 8px; border-radius:999px; background: rgba(0,255,136,0.10); border:1px solid rgba(0,255,136,0.18); color:var(--neon); }
    .input-row{ display:flex; gap:8px; padding:10px 12px; border-top:1px solid rgba(255,255,255,0.06); }
    .input-row input{ flex:1; background: rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:999px; padding:10px 14px; color:var(--text-primary); font-size:13px; outline:none; }
    .input-row input:focus{ border-color: rgba(0,255,136,0.35); }
    .send{ width:36px;height:36px;border-radius:50%; background:var(--neon); color:#050507; border:none; font-weight:800; }
    .send:disabled{ opacity:0.5; }
    .escalate{ display:flex; align-items:center; gap:8px; justify-content:space-between; padding:8px 12px; background: rgba(37,211,102,0.06); border-top:1px solid rgba(37,211,102,0.12); font-size:11px; color:var(--text-secondary); }
    .escalate .wa{ background:#25D366; color:white; padding:6px 10px; border-radius:999px; font-weight:700; font-size:11px; display:inline-flex; align-items:center; gap:6px; }
    .hint{ display:block; text-align:center; font-size:9px; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-muted); padding:8px 0 10px; }
    @media(max-width:420px){ .panel{ width:92vw; } }
  `]
})
export class AiChatWidgetComponent {
  ai = inject(DeepseekService);
  open = signal(false);
  draft = '';

  private scrollEl = viewChild<ElementRef>('scroll');

  constructor() {
    effect(() => {
      // auto-scroll on new message
      this.ai.messages();
      this.ai.loading();
      setTimeout(() => {
        const el = (this.scrollEl() as any)?.nativeElement as HTMLElement | undefined;
        if (el) el.scrollTop = el.scrollHeight;
      }, 40);
    });
  }

  async send() {
    const t = this.draft.trim();
    if (!t) return;
    this.draft = '';
    await this.ai.send(t);
  }

  ask(q: string) {
    this.draft = q;
    this.send();
  }

  toggle(): void { this.open.update(v => !v); }

  time(iso: string): string {
    try { return new Date(iso).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit'}); } catch { return ''; }
  }

  clear() { this.ai.clear(); }
}
