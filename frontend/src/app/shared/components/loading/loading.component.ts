import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    @if (loading.isLoading()) {
      <div class="bar">
        <span></span>
      </div>
      <div class="overlay">
        <div class="spinner">
          <span class="ring"></span>
          <span class="logo">H<sub>2</sub></span>
        </div>
        <span class="label">Loading H2Os…</span>
      </div>
    }
  `,
  styles: [`
    :host{ position: fixed; inset:0; pointer-events:none; z-index:100; }
    .bar{ position: fixed; top:0; left:0; right:0; height:2px; background: rgba(0,255,136,0.12); overflow:hidden; pointer-events:none; }
    .bar span{ display:block; height:100%; width:42%; background: linear-gradient(90deg, transparent, var(--neon), transparent); animation: slide 1.1s ease-in-out infinite; box-shadow: 0 0 10px var(--neon); }
    @keyframes slide{ 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
    .overlay{ position: fixed; top:68px; left:50%; transform:translateX(-50%); background: rgba(11,13,16,0.92); border:1px solid var(--border); border-radius:999px; padding:8px 14px; display:flex; align-items:center; gap:10px; backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); pointer-events:none; }
    .spinner{ position:relative; width:28px;height:28px; display:grid; place-items:center; }
    .ring{ position:absolute; inset:0; border:2px solid rgba(0,255,136,0.14); border-top-color: var(--neon); border-radius:50%; animation: spin 0.7s linear infinite; }
    @keyframes spin{ to{transform:rotate(360deg)} }
    .logo{ font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:11px; color:var(--neon); }
    .logo sub{ font-size:8px; }
    .label{ font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-secondary); }
  `]
})
export class LoadingComponent {
  loading = inject(LoadingService);
}
