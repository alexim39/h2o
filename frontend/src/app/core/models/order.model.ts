export interface Order {
  id: string;
  reference: string;
  email: string;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  items: { variantId: string; qty: number; price: number; sku: string }[];
  shipping: Record<string,string>;
  paystackRef?: string;
  trackingNumber?: string;
}
