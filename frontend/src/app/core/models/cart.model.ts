import { VariantId } from './product.model';

export interface CartItem {
  variantId: VariantId;
  qty: number;
}

export interface CartLine extends CartItem {
  name: string;
  finish: string;
  price: number;
  sku: string;
  hex: string;
  gradient: string;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
}

export interface OrderPayload {
  items: CartItem[];
  shipping: ShippingDetails;
  reference?: string;
}
