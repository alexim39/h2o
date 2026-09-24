import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'h2os_mgt_token_v1';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.includes('/api/') || req.url.includes('hydrogenwaterbottles.store') || req.url.includes('localhost:8080') || req.url.includes('127.0.0.1');
  if (!isApi) return next(req);
  let token: string | null = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch {}
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const cloned = req.clone({ setHeaders: headers });
  return next(cloned);
};
