import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  // Only show for API calls, not for assets
  const isApi = req.url.includes('/api') || req.url.includes('/chat');
  if (isApi) loading.show();
  return next(req).pipe(finalize(() => { if (isApi) loading.hide(); }));
};
