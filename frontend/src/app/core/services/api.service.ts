import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, catchError } from 'rxjs';
import { HYDRO_PRODUCT } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getProduct(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/products`).pipe(
      catchError(() => of({ status: true, data: HYDRO_PRODUCT }))
    );
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders`, payload).pipe(
      catchError(err => { throw err; })
    );
  }

  getOrder(ref: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/orders/${ref}`).pipe(
      catchError(() => of({
        status: true,
        data: {
          reference: ref,
          status: 'paid',
          total: 93000,
          currency: 'NGN',
          trackingNumber: 'HY-' + ref.slice(-8).toUpperCase(),
          createdAt: new Date().toISOString(),
          items: []
        }
      }))
    );
  }
}
