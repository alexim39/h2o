import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { CartService } from './cart.service';
import { ShippingDetails } from '../models/cart.model';

declare const PaystackPop: any;

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PaystackService {
  readonly loading = signal(false);
  readonly lastReference = signal<string | null>(null);

  constructor(private http: HttpClient, private cart: CartService) {}

  private ensureScript(): Promise<void> {
    if (typeof (window as any).PaystackPop !== 'undefined') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://js.paystack.co/v1/inline.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(s);
    });
  }

  async initialize(shipping: ShippingDetails, email: string): Promise<PaystackInitResponse> {
    this.loading.set(true);
    const items = this.cart.items();
    const amount = this.cart.paystackAmount();
    const reference = `HYDRO_${Date.now()}_${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    this.lastReference.set(reference);

    const payload = { email, amount, reference, items, shipping, currency: 'NGN' };

    try {
      const res = await firstValueFrom(
        this.http.post<PaystackInitResponse>(`${environment.apiUrl}/payments/initialize`, payload)
      );
      return res;
    } finally {
      this.loading.set(false);
    }
  }

  async payWithInline(email: string, amountKobo: number, reference: string, onSuccess: (ref: string) => void, onClose: () => void): Promise<void> {
    await this.ensureScript();
    const handler = (window as any).PaystackPop?.setup?.({
      key: environment.paystackPublicKey,
      email,
      amount: amountKobo,
      ref: reference,
      currency: 'NGN',
      callback: (resp: any) => onSuccess(resp.reference ?? reference),
      onClose
    });
    if (!handler) throw new Error('Paystack inline failed to initialize');
    handler.openIframe();
  }

  async verify(reference: string): Promise<{ status: boolean; data: any }> {
    const res = await firstValueFrom(
      this.http.get<{ status: boolean; data: any }>(`${environment.apiUrl}/payments/verify/${reference}`)
    );
    return res;
  }
}
