-- H2Os Ultra H₂ — Seed Data
-- Run after schema.sql: mysql -u user -p hydrogen_store < seed.sql

SET NAMES utf8mb4;

INSERT INTO `products` (`sku`, `name`, `brand`, `tagline`, `description`, `image`, `specs_json`, `features_json`) VALUES (
  'H2OS-ULTRA-H2',
  'Ultra H₂',
  'H2Os',
  'Hydration, upgraded.',
  'Advanced hydrogen infusion technology. Ultra H₂ infuses 1200–1600 ppb of ultra-pure H₂ in 3 minutes — SPE/PEM, platinum titanium, borosilicate clarity. One button. Pure ritual. Future H2Os bottles will share this DNA.',
  '/images/ultraH2.jpeg',
  JSON_ARRAY(
    JSON_OBJECT('label','Capacity','value','500 ml / 17 oz','hint','Perfect single-serve'),
    JSON_OBJECT('label','Hydrogen Concentration','value','1200–1600 ppb','hint','Lab-verified SPE/PEM'),
    JSON_OBJECT('label','Generation Time','value','3 min / 6 min modes'),
    JSON_OBJECT('label','Membrane','value','DuPont Nafion® + SPE/PEM'),
    JSON_OBJECT('label','Electrodes','value','Platinum-coated titanium'),
    JSON_OBJECT('label','Battery','value','2800 mAh • 18 cycles • USB-C'),
    JSON_OBJECT('label','Material','value','Borosilicate + 304 stainless'),
    JSON_OBJECT('label','Weight','value','298 g'),
    JSON_OBJECT('label','Certification','value','CE, FCC, PSE, IP67')
  ),
  JSON_ARRAY(
    JSON_OBJECT('title','Antioxidant Boost','desc','Molecular hydrogen selectively neutralizes •OH radicals.','icon','◈'),
    JSON_OBJECT('title','Cellular Recovery','desc','Accelerates post-workout recovery and mitochondrial efficiency.','icon','⬢'),
    JSON_OBJECT('title','Cognitive Clarity','desc','Crosses blood-brain barrier. Sustained focus within days.','icon','⬣'),
    JSON_OBJECT('title','Anti-Aging at the Source','desc','Supports telomere integrity and reduces oxidative stress.','icon','⬔'),
    JSON_OBJECT('title','Gut & Metabolic Health','desc','Promotes microbiome balance and healthy metabolic markers.','icon','⬕'),
    JSON_OBJECT('title','Ultra-Pure Hydration','desc','Freshly infused at the touch of a button — no cartridges.','icon','⬓')
  )
);

-- Single variant for Ultra H₂ (future H2Os bottles add new product rows + variants)
INSERT INTO `product_variants` (`product_id`, `variant_key`, `name`, `finish`, `hex`, `sku`, `price`, `compare_at`, `stock`, `image`, `gradient`) VALUES
(1, 'ultra-h2', 'Ultra H₂', 'Crystal Glass • Matte Black Base • Loop Cap', '#0FD8B8', 'H2OS-ULTRA-H2-500', 1300000, 1541000, 47, '/images/ultraH2.jpeg', 'linear-gradient(145deg,#0A0E14 0%, #111A1E 55%, #0B1014 100%)');

-- Demo order (Ultra H₂)
INSERT INTO `orders` (`reference`, `email`, `total`, `currency`, `status`, `shipping_json`, `tracking_number`, `paystack_ref`) VALUES
('H2OS_DEMO_001', 'demo@hydrogenwaterbottles.store', 1307500, 'NGN', 'paid',
 JSON_OBJECT('fullName','Demo Ritual','email','demo@hydrogenwaterbottles.store','phone','+2348000000000','address','12 Obsidian Way','city','Lagos','state','Lagos','country','Nigeria'),
 'HY-DEMO001', 'H2OS_DEMO_001');

INSERT INTO `order_items` (`order_id`, `variant_id`, `qty`, `price`, `sku`) VALUES
(1, 'ultra-h2', 1, 1300000, 'H2OS-ULTRA-H2-500');

-- Seed community reviews
INSERT INTO `reviews` (`id`, `name`, `rating`, `text`, `verified`, `anonymous`, `is_approved`, `created_at`) VALUES
('r1', 'Amara O.', 5, 'Three minutes and my water is literally sparkling with hydrogen. Recovery after Lagos traffic + gym is unreal. Ultra H₂ is stealth luxury on my desk.', 1, 0, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('r2', 'Daniel K.', 5, 'I track HRV daily — Ultra H₂ moved my recovery score 18% in two weeks. No placebo. The SPE membrane is legit.', 1, 0, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('r3', 'Sofia M.', 5, 'Finally a health device that is not ugly. Ultra H₂ lives next to my MacBook and people always ask. Hydration, upgraded indeed.', 1, 0, 1, DATE_SUB(NOW(), INTERVAL 9 DAY));
