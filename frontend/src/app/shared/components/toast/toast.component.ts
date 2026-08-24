import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="stack">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.error]="t.type==='error'" [class.success]="t.type==='success'">
          <span class="dot"></span>
          <span class="msg">{{ t.message }}</span>
          <button (click)="toast.dismiss(t.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .stack { position: fixed; top: 84px; right: 16px; z-index: 80; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
    .toast { pointer-events: auto; display:flex; align-items:center; gap:10px; background: #161A22; border:1px solid var(--border); color: var(--text-primary); padding: 12px 14px; border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.4); font-size:13px; font-weight:600; min-width: 280px; }
    .toast.success .dot { width:8px;height:8px;border-radius:50%;background:var(--neon);box-shadow:0 0 8px var(--neon); }
    .toast.error .dot { background:#FF4D6A; box-shadow:0 0 8px #FF4D6A; }
    .toast button { margin-left:auto; background:transparent;border:none;color:var(--text-secondary);font-size:18px;line-height:1; }
  `]
})
export class ToastComponent {
  toast = inject(ToastService);
}
