import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getProduct(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/products`);
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders`, payload);
  }

  getOrder(ref: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/orders/${encodeURIComponent(ref)}`);
  }

  validateCoupon(code: string, subtotal: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/coupons/validate`, { code, subtotal });
  }

  updateOrderStatus(ref: string, status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/orders/${encodeURIComponent(ref)}/status`, { status });
  }

  getLowStock(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/low-stock`);
  }

  getAnalytics(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/analytics`);
  }

  createSubscription(email: string, items: any[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/subscriptions`, { email, items });
  }

  resolveReferral(code: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/referrals/code/${encodeURIComponent(code)}`);
  }

  createReferral(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/referrals/create`, { email });
  }
}
