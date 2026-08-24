export type VariantId = string; // flexible for future brands

export interface Variant {
  id: VariantId;
  name: string;
  finish: string;
  hex: string;
  price: number; // NGN
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
  image: string; // primary
  images?: string[]; // gallery (admin upload)
  videos?: string[]; // short videos per product
  rating?: number;
  reviewsCount?: number;
  variants: Variant[];
  specs: Spec[];
  features: { title: string; desc: string; icon: string }[];
  featured?: boolean;
}

// ─── H2Os Ultra H₂ — signature (image aligns with /images/ultraH2.jpeg) ───
export const ULTRA_H2_PRODUCT: Product = {
  id: 'ultra-h2-v1',
  name: 'Ultra H₂',
  brand: 'H2Os',
  category: 'Hydrogen Bottle',
  badge: 'Bestseller',
  tagline: 'Hydration, upgraded.',
  description: 'Advanced hydrogen infusion technology. ULTRA H₂ infuses 1200–1600 ppb of ultra-pure H₂ in 3 minutes — SPE/PEM, platinum titanium, borosilicate clarity. One button. Pure ritual.',
  image: '/images/ultraH2.jpeg',
  rating: 4.9,
  reviewsCount: 2847,
  featured: true,
  variants: [
    {
      id: 'ultra-h2',
      name: 'Ultra H₂',
      finish: 'Crystal Glass • Matte Black Base • Loop Cap',
      hex: '#0FD8B8',
      price: 1300000,
      compareAt: 1541000,
      sku: 'H2OS-ULTRA-H2-500',
      image: '/images/ultraH2.jpeg',
      gradient: 'linear-gradient(145deg,#0A0E14 0%, #111A1E 55%, #0B1014 100%)',
      stock: 47
    }
  ],
  specs: [
    { label: 'Capacity', value: '500 ml / 17 oz' },
    { label: 'Hydrogen Concentration', value: '1200–1600 ppb' },
    { label: 'Generation Time', value: '3 min / 6 min modes' },
    { label: 'Membrane', value: 'DuPont Nafion® + SPE/PEM' },
    { label: 'Electrodes', value: 'Platinum-coated titanium' },
    { label: 'Battery', value: '2800 mAh • 18 cycles • USB-C' },
    { label: 'Material', value: 'Borosilicate + 304 stainless' },
    { label: 'Weight', value: '298 g' },
    { label: 'Certification', value: 'CE, FCC, PSE, IP67' },
  ],
  features: [
    { title: 'Antioxidant Boost', desc: 'Molecular hydrogen selectively neutralizes •OH radicals.', icon: '◈' },
    { title: 'Cellular Recovery', desc: 'Accelerates post-workout recovery and mitochondrial efficiency.', icon: '⬢' },
    { title: 'Cognitive Clarity', desc: 'Crosses blood-brain barrier. Sustained focus within days.', icon: '⬣' },
    { title: 'Anti-Aging at the Source', desc: 'Supports telomere integrity and reduces oxidative stress.', icon: '⬔' },
    { title: 'Gut & Metabolic Health', desc: 'Promotes microbiome balance and healthy metabolic markers.', icon: '⬕' },
    { title: 'Ultra-Pure Hydration', desc: 'Every sip is freshly infused — no cartridges, no waste.', icon: '⬓' },
  ]
};

// ─── Additional brands — premium ecommerce demo (editable via MGT) ───
export const CATALOG_SEED: Product[] = [
  ULTRA_H2_PRODUCT,
  {
    id: 'h2os-mini-v1',
    name: 'Ultra H₂ Mini',
    brand: 'H2Os',
    category: 'Hydrogen Bottle',
    badge: 'New',
    tagline: 'Pocket ritual. Same ppb.',
    description: '350ml compact for travel. Same SPE/PEM purity, lighter loop cap. Your pocket ritual.',
    image: '/images/ultraH2.jpeg',
    rating: 4.8,
    reviewsCount: 412,
    variants: [{ id:'mini', name:'Mini 350ml', finish:'Compact • 350ml • Frost Cap', hex:'#7ED7FF', price:980000, compareAt:1150000, sku:'H2OS-MINI-350', image:'/images/ultraH2.jpeg', gradient:'linear-gradient(145deg,#0A1A1F,#12202A)', stock: 28 }],
    specs: ULTRA_H2_PRODUCT.specs.map(s => s.label==='Capacity' ? {...s, value:'350 ml / 12 oz'} : s),
    features: ULTRA_H2_PRODUCT.features,
  },
  {
    id: 'hydropure-pro-v1',
    name: 'HydroPure Pro',
    brand: 'HydroPure',
    category: 'Hydrogen Bottle',
    badge: 'Limited',
    tagline: 'Pro-grade infusion.',
    description: 'HydroPure Pro — 1800ppb max, double PEM, OLED timer. For the performance-obsessed.',
    image: '/images/ultraH2.jpeg',
    rating: 4.7,
    reviewsCount: 892,
    variants: [{ id:'hydropure-pro', name:'Pro 500ml', finish:'Stealth Black • OLED • 1800ppb', hex:'#1A2A3A', price:1650000, compareAt:1890000, sku:'HYDRO-PRO-500', image:'/images/ultraH2.jpeg', gradient:'linear-gradient(145deg,#0A0F1A,#1A2A3A)', stock: 14 }],
    specs: ULTRA_H2_PRODUCT.specs,
    features: ULTRA_H2_PRODUCT.features,
  },
  {
    id: 'aquavive-h2-v1',
    name: 'AquaVive H₂',
    brand: 'AquaVive',
    category: 'Hydrogen Bottle',
    tagline: 'Vive la hydration.',
    description: 'AquaVive H₂ — French-designed, whisper-quiet 38dB, rose-tinted borosilicate for daily elegance.',
    image: '/images/ultraH2.jpeg',
    rating: 4.6,
    reviewsCount: 534,
    variants: [{ id:'aquavive', name:'AquaVive 480ml', finish:'Rose Tint • 480ml • Soft Grip', hex:'#E8AFA0', price:1150000, compareAt:1350000, sku:'AQV-H2-480', image:'/images/ultraH2.jpeg', gradient:'linear-gradient(145deg,#2A1A14,#3A2018)', stock: 22 }],
    specs: ULTRA_H2_PRODUCT.specs,
    features: ULTRA_H2_PRODUCT.features,
  },
  {
    id: 'ionmax-elite-v1',
    name: 'IonMax Elite',
    brand: 'IonMax',
    category: 'Hydrogen Bottle',
    tagline: 'Elite ions, elite you.',
    description: 'IonMax Elite — dual-chamber, 2000ppb burst mode, aerospace aluminium. Lab-grade ritual.',
    image: '/images/ultraH2.jpeg',
    rating: 4.8,
    reviewsCount: 1034,
    variants: [{ id:'ionmax', name:'Elite 600ml', finish:'Aerospace • 600ml • Burst', hex:'#FFD070', price:1780000, compareAt:2050000, sku:'ION-ELITE-600', image:'/images/ultraH2.jpeg', gradient:'linear-gradient(145deg,#1A1608,#2A2010)', stock: 9 }],
    specs: ULTRA_H2_PRODUCT.specs.map(s => s.label==='Capacity'?{...s, value:'600 ml / 20 oz'}:s),
    features: ULTRA_H2_PRODUCT.features,
  },
  {
    id: 'purehydro-x-v1',
    name: 'PureHydro X',
    brand: 'PureHydro',
    category: 'Hydrogen Bottle',
    tagline: 'Pure. Powerful. X.',
    description: 'PureHydro X — entry luxury, same H2Os-grade glass, accessible ritual for everyone.',
    image: '/images/ultraH2.jpeg',
    rating: 4.5,
    reviewsCount: 267,
    variants: [{ id:'purehydro', name:'X 500ml', finish:'Clear Glass • Essential', hex:'#CFF2E8', price:40000, compareAt:55000, sku:'PURE-X-500', image:'/images/ultraH2.jpeg', gradient:'linear-gradient(145deg,#0F1A14,#142520)', stock: 36 }],
    specs: ULTRA_H2_PRODUCT.specs,
    features: ULTRA_H2_PRODUCT.features,
  },
];

// Stored catalog (admin can mutate, persisted via localStorage)
export const PRODUCT_CATALOG: Product[] = [...CATALOG_SEED];

// Backwards compat
export const HYDRO_PRODUCT: Product = ULTRA_H2_PRODUCT;
export const CATALOG = PRODUCT_CATALOG;
