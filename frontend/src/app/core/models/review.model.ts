export interface Review {
  id: string;
  productId?: string; // if set, review is for that product
  name: string;
  phone?: string;
  rating: number;
  text: string;
  createdAt: string;
  verified?: boolean;
  anonymous: boolean;
}

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'ultra-h2-v1',
    name: 'Amara O.',
    rating: 5,
    text: 'Three minutes and my water is literally sparkling with hydrogen. Recovery after Lagos traffic + gym is unreal. Ultra H₂ is stealth luxury on my desk.',
    createdAt: new Date(Date.now() - 1000*60*60*24*2).toISOString(),
    verified: true,
    anonymous: false
  },
  {
    id: 'r2',
    productId: 'ultra-h2-v1',
    name: 'Daniel K.',
    rating: 5,
    text: 'I track HRV daily — Ultra H₂ moved my recovery score 18% in two weeks. No placebo. The SPE membrane is legit.',
    createdAt: new Date(Date.now() - 1000*60*60*24*5).toISOString(),
    verified: true,
    anonymous: false
  },
  {
    id: 'r3',
    productId: 'ultra-h2-v1',
    name: 'Sofia M.',
    rating: 5,
    text: 'Finally a health device that is not ugly. Ultra H₂ lives next to my MacBook and people always ask. Hydration, upgraded indeed.',
    createdAt: new Date(Date.now() - 1000*60*60*24*9).toISOString(),
    verified: true,
    anonymous: false
  },
  {
    id: 'r4',
    productId: 'ultra-h2-v1',
    name: 'Anonymous',
    rating: 4,
    text: 'Eye comfort testimonial video convinced me — now I feel it. Will share a video soon!',
    createdAt: new Date(Date.now() - 1000*60*60*24*12).toISOString(),
    verified: false,
    anonymous: true
  }
];
