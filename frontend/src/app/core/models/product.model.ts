export type VariantId = string;

export interface Variant {
  id: VariantId;
  name: string;
  finish: string;
  hex: string;
  price: number;
  compareAt?: number;
  sku: string;
  image: string;
  gradient: string;
  stock: number;
}

export interface Spec {
  label: string;
  value: string;
  hint?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  badge?: string;
  tagline: string;
  description: string;
  image: string;
  images?: string[];
  videos?: string[];
  rating?: number;
  reviewsCount?: number;
  variants: Variant[];
  specs: Spec[];
  features: { title: string; desc: string; icon: string; health?: string }[];
  featured?: boolean;
}
