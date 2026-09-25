import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    title: 'H2Os — Ultra H₂ | Hydration, upgraded'
  },
  {
    path: 'store',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
    title: 'Store — Hydrogen Water Bottles | H2Os'
  },
  {
    path: 'store/:id',
    loadComponent: () => import('./features/product/product.component').then(m => m.ProductComponent),
    title: 'Product — H2Os'
  },
  // Legacy aliases — redirect to /store
  {
    path: 'products',
    redirectTo: 'store'
  },
  {
    path: 'products/:id',
    redirectTo: 'store/:id'
  },
  {
    path: 'product',
    loadComponent: () => import('./features/product/product.component').then(m => m.ProductComponent),
    title: 'Ultra H₂ — Shop | H2Os'
  },
  {
    path: 'product/:id',
    redirectTo: 'store/:id'
  },
  {
    path: 'science',
    loadComponent: () => import('./features/science/science.component').then(m => m.ScienceComponent),
    title: 'Science — Hydrogen Water Health Benefits | H2Os'
  },
  {
    path: 'specs',
    loadComponent: () => import('./features/specs/specs.component').then(m => m.SpecsComponent),
    title: 'Specifications — H2Os Ultra H₂ Collection | H2Os'
  },
  {
    path: 'protocol',
    loadComponent: () => import('./features/protocol/protocol.component').then(m => m.ProtocolComponent),
    title: '30-Day Cellular Detox Protocol | H2Os'
  },
  {
    path: 'verify',
    loadComponent: () => import('./features/verify/verify.component').then(m => m.VerifyComponent),
    title: 'Verify Authenticity | H2Os'
  },
  {
    path: 'verify/:code',
    loadComponent: () => import('./features/verify/verify.component').then(m => m.VerifyComponent),
    title: 'Verify Authenticity | H2Os'
  },
  {
    path: 'videos',
    loadComponent: () => import('./features/videos/videos.component').then(m => m.VideosComponent),
    title: 'Videos — How to Use & Testimonials | H2Os Ultra H₂'
  },
  {
    path: 'reviews',
    loadComponent: () => import('./features/reviews/reviews.component').then(m => m.ReviewsComponent),
    title: 'Community Reviews — H2Os Ultra H₂'
  },
  {
    path: 'mgt',
    loadComponent: () => import('./features/mgt/mgt.component').then(m => m.MgtComponent),
    title: 'MGT — H2Os Control'
  },
  {
    path: 'admin',
    redirectTo: 'mgt'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout — H2Os Ultra H₂'
  },
  {
    path: 'confirmation/:ref',
    loadComponent: () => import('./features/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
    title: 'Order Confirmed — H2Os Ultra H₂'
  },
  {
    path: 'track',
    loadComponent: () => import('./features/track/track.component').then(m => m.TrackComponent),
    title: 'Track Order — H2Os'
  },
  {
    path: 'track/:ref',
    loadComponent: () => import('./features/track/track.component').then(m => m.TrackComponent),
    title: 'Track Order — H2Os'
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Not Found — H2Os'
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
