export interface Review {
  id: string;
  productId?: string;
  name: string;
  phone?: string;
  rating: number;
  text: string;
  createdAt: string;
  verified?: boolean;
  anonymous: boolean;
}
