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
    return this.http.get(`${environment.apiUrl}/orders/${ref}`);
  }
}
