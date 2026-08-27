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
        <span class="brand">
          <span class="crown">♔</span>
          <span class="h2os">H2Os</span>
        </span>
        <span class="sep"></span>
        <div class="spinner">
          <span class="ring"></span>
        </div>
        <span class="label">Loading — Health | Quality | Luxury</span>
      </div>
    }
  `,
  styles: [`
    :host{ position: fixed; inset:0; pointer-events:none; z-index:100; }
    .bar{ position: fixed; top:0; left:0; right:0; height:2px; background: rgba(0,255,136,0.12); overflow:hidden; pointer-events:none; }
    .bar span{ display:block; height:100%; width:42%; background: linear-gradient(90deg, transparent, var(--neon), transparent); animation: slide 1.1s ease-in-out infinite; box-shadow: 0 0 10px var(--neon); }
    @keyframes slide{ 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
    .overlay{
      position: fixed; top:68px; left:50%; transform:translateX(-50%);
      background: rgba(11,13,16,0.94); border:1px solid var(--border); border-radius:999px;
      padding:7px 14px 7px 10px; display:flex; align-items:center; gap:10px;
      backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); pointer-events:none;
      max-width: calc(100vw - 24px); box-sizing:border-box; white-space:nowrap;
    }
    .brand{ display:inline-flex; align-items:center; gap:6px; flex-shrink:0; }
    .crown{ font-size:13px; color:#FFD60A; filter: drop-shadow(0 0 6px rgba(255,214,10,0.22)); line-height:1; }
    .h2os{
      font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:800; letter-spacing:0.04em;
      background: linear-gradient(135deg, #00FF88 0%, #FFD60A 100%);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
    .sep{ width:1px; height:18px; background: var(--border); flex-shrink:0; }
    .spinner{ position:relative; width:18px;height:18px; display:grid; place-items:center; flex-shrink:0; }
    .ring{ position:absolute; inset:0; border:2px solid rgba(0,255,136,0.14); border-top-color: var(--neon); border-radius:50%; animation: spin 0.7s linear infinite; }
    @keyframes spin{ to{transform:rotate(360deg)} }
    .label{ font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.10em; text-transform:uppercase; color:var(--text-secondary); white-space:nowrap; }
    @media(max-width: 640px){
      .overlay{
        left:12px; right:12px; transform:none; width: calc(100vw - 24px); max-width: calc(100vw - 24px);
        padding:7px 10px; gap:7px; border-radius:999px; justify-content:flex-start; flex-wrap:nowrap;
      }
      .brand{ gap:5px; }
      .crown{ font-size:11px; }
      .h2os{ font-size:11px; }
      .sep{ height:14px; }
      .spinner{ width:16px; height:16px; }
      .ring{ border-width:1.6px; }
      .label{ font-size:9px; letter-spacing:0.08em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0; }
    }
    @media(max-width: 360px){
      .overlay{ left:10px; right:10px; width: calc(100vw - 20px); max-width: calc(100vw - 20px); padding:6px 10px; gap:6px; }
      .h2os{ font-size:10px; }
      .label{ font-size:8.5px; letter-spacing:0.06em; }
      .crown{ font-size:10px; }
    }
  `]
})
export class LoadingComponent {
  loading = inject(LoadingService);
}
