import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError(err => {
      const msg = err?.error?.message || err?.message || 'Network error — please try again.';
      // Don't toast for silent mock fallbacks (GET products etc) — only for user actions
      if (req.method !== 'GET' || req.url.includes('/payments/') || req.url.includes('/orders')) {
        // throttle: only show if not a 404 for product list fallback
        if (!(req.url.includes('/products') && err.status === 0)) {
          // Uncomment to show global toasts for errors
          // toast.show(msg, 'error');
        }
      }
      console.error('[HTTP Error]', req.url, err);
      return throwError(() => err);
    })
  );
};
