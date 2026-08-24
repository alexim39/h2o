<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

/**
 * Product catalog — H2Os Ultra H₂ (single current product, catalog-ready for future H2Os bottles).
 * Reads from DB if available; falls back to hardcoded mock for zero-config dev.
 */
final class ProductController
{
    public function index(Request $req): void
    {
        // Future: support ?catalog=true to return array of products
        if (isset($req->query['catalog'])) {
            Response::success([$this->fetchProduct()], 'Catalog retrieved');
            return;
        }
        $product = $this->fetchProduct();
        Response::success($product, 'Product retrieved');
    }

    public function show(Request $req, string $id): void
    {
        $product = $this->fetchProduct();
        if ($product['id'] !== $id && !in_array($id, ['ultra-h2-v1', 'hydro-elite-v1', 'H2OS-ULTRA-H2'], true)) {
            Response::error('Product not found', 404);
        }
        Response::success($product);
    }

    private function fetchProduct(): array
    {
        // Try DB first
        try {
            $pdo = Database::connection();
            if ($pdo !== null) {
                $row = Database::fetchOne('SELECT * FROM products WHERE sku IN (:a, :b) LIMIT 1', ['a' => 'H2OS-ULTRA-H2', 'b' => 'HYDRO-ELITE']);
                // Fallback query without named IN (PDO limitation) — try second query
                if (!$row) {
                    $row = Database::fetchOne('SELECT * FROM products WHERE sku = :sku LIMIT 1', ['sku' => 'H2OS-ULTRA-H2']);
                }
                if (!$row) {
                    $row = Database::fetchOne('SELECT * FROM products WHERE sku = :sku LIMIT 1', ['sku' => 'HYDRO-ELITE']);
                }
                if ($row) {
                    $variants = Database::fetchAll('SELECT * FROM product_variants WHERE product_id = :pid ORDER BY price ASC', ['pid' => $row['id']]);
                    if (!empty($variants)) {
                        return [
                            'id' => $row['sku'],
                            'name' => $row['name'],
                            'brand' => $row['brand'] ?? 'H2Os',
                            'tagline' => $row['tagline'],
                            'description' => $row['description'],
                            'image' => $row['image'] ?? '/images/ultraH2.jpeg',
                            'variants' => array_map(fn($v) => [
                                'id' => $v['variant_key'],
                                'name' => $v['name'],
                                'finish' => $v['finish'],
                                'hex' => $v['hex'],
                                'price' => (int)$v['price'],
                                'compareAt' => $v['compare_at'] ? (int)$v['compare_at'] : null,
                                'sku' => $v['sku'],
                                'stock' => (int)$v['stock'],
                                'image' => $v['image'] ?? '/images/ultraH2.jpeg',
                                'gradient' => $v['gradient'],
                            ], $variants),
                            'specs' => json_decode($row['specs_json'] ?? '[]', true) ?: $this->mockSpecs(),
                            'features' => json_decode($row['features_json'] ?? '[]', true) ?: $this->mockFeatures(),
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {
            error_log('[ProductController] DB fetch failed — mock fallback: ' . $e->getMessage());
        }

        return $this->mockProduct();
    }

    public function mockProduct(): array
    {
        return [
            'id' => 'ultra-h2-v1',
            'name' => 'Ultra H₂',
            'brand' => 'H2Os',
            'tagline' => 'Hydration, upgraded.',
            'description' => 'Advanced hydrogen infusion technology. ULTRA H₂ infuses 1200–1600 ppb of ultra-pure H₂ in 3 minutes — SPE/PEM, platinum titanium, borosilicate clarity. One button. Pure ritual. Future H2Os bottles will share this DNA.',
            'image' => '/images/ultraH2.jpeg',
            'variants' => [
                ['id'=>'ultra-h2','name'=>'Ultra H₂','finish'=>'Crystal Glass • Matte Black Base • Loop Cap','hex'=>'#0FD8B8','price'=>1300000,'compareAt'=>1541000,'sku'=>'H2OS-ULTRA-H2-500','stock'=>47,'image'=>'/images/ultraH2.jpeg','gradient'=>'linear-gradient(145deg,#0A0E14 0%, #111A1E 55%, #0B1014 100%)'],
            ],
            'specs' => $this->mockSpecs(),
            'features' => $this->mockFeatures(),
        ];
    }

    private function mockSpecs(): array
    {
        return [
            ['label'=>'Capacity','value'=>'500 ml / 17 oz','hint'=>'Perfect single-serve'],
            ['label'=>'Hydrogen Concentration','value'=>'1200–1600 ppb','hint'=>'Lab-verified SPE/PEM'],
            ['label'=>'Generation Time','value'=>'3 min / 6 min modes'],
            ['label'=>'Membrane','value'=>'DuPont Nafion® + SPE/PEM'],
            ['label'=>'Electrodes','value'=>'Platinum-coated titanium'],
            ['label'=>'Battery','value'=>'2800 mAh • 18 cycles • USB-C'],
            ['label'=>'Material','value'=>'Borosilicate + 304 stainless'],
            ['label'=>'Weight','value'=>'298 g'],
            ['label'=>'Certification','value'=>'CE, FCC, PSE, IP67'],
        ];
    }

    private function mockFeatures(): array
    {
        return [
            ['title'=>'Antioxidant Boost','desc'=>'Molecular hydrogen selectively neutralizes •OH radicals.','icon'=>'◈'],
            ['title'=>'Cellular Recovery','desc'=>'Accelerates post-workout recovery and mitochondrial efficiency.','icon'=>'⬢'],
            ['title'=>'Cognitive Clarity','desc'=>'Crosses blood-brain barrier. Sustained focus within days.','icon'=>'⬣'],
            ['title'=>'Anti-Aging at the Source','desc'=>'Supports telomere integrity and reduces oxidative stress.','icon'=>'⬔'],
            ['title'=>'Gut & Metabolic Health','desc'=>'Promotes microbiome balance and healthy metabolic markers.','icon'=>'⬕'],
            ['title'=>'Ultra-Pure Hydration','desc'=>'Freshly infused at the touch of a button — no cartridges.','icon'=>'⬓'],
        ];
    }

    // ─── MGT Admin: Create ───
    public function store(Request $req): void
    {
        $body = $req->body ?? [];
        $name = trim((string)($body['name'] ?? ''));
        $brand = trim((string)($body['brand'] ?? 'H2Os'));
        if ($name === '') Response::error('Product name required', 422);
        $id = $body['id'] ?? strtolower(preg_replace('/[^a-z0-9]+/i','-', $brand.'-'.$name)).'-'.bin2hex(random_bytes(3));
        $price = (int)($body['price'] ?? $body['variants'][0]['price'] ?? 1300000);

        // If DB available, persist; else mock
        try {
            $pdo = Database::connection();
            if ($pdo !== null) {
                Database::execute(
                    'INSERT INTO products (sku, name, brand, tagline, description, image, specs_json, features_json) VALUES (:sku,:name,:brand,:tag,:desc,:img,:specs,:feats)',
                    [
                        'sku'=>$id, 'name'=>$name, 'brand'=>$brand,
                        'tag'=>$body['tagline'] ?? 'Hydration, upgraded.',
                        'desc'=>$body['description'] ?? '',
                        'img'=>$body['image'] ?? '/images/ultraH2.jpeg',
                        'specs'=>json_encode($body['specs'] ?? $this->mockSpecs()),
                        'feats'=>json_encode($body['features'] ?? $this->mockFeatures()),
                    ]
                );
                $pid = (int)Database::lastInsertId();
                $variant = $body['variants'][0] ?? ['variant_key'=>'ultra-h2','name'=>$name,'finish'=>'H2Os • Advanced','hex'=>'#0FD8B8','sku'=>strtoupper($id).'-500','price'=>$price,'stock'=>20,'image'=>'/images/ultraH2.jpeg','gradient'=>'linear-gradient(145deg,#0A0E14,#111A1E)'];
                Database::execute(
                    'INSERT INTO product_variants (product_id, variant_key, name, finish, hex, sku, price, compare_at, stock, image, gradient) VALUES (:pid,:vk,:name,:fin,:hex,:sku,:price,:ca,:stock,:img,:grad)',
                    ['pid'=>$pid,'vk'=>$variant['variant_key']??'var','name'=>$variant['name'],'fin'=>$variant['finish'],'hex'=>$variant['hex'],'sku'=>$variant['sku'],'price'=>$variant['price'],'ca'=>$variant['compareAt']??null,'stock'=>$variant['stock']??20,'img'=>$variant['image']??'/images/ultraH2.jpeg','grad'=>$variant['gradient']??'linear-gradient(...)']
                );
            }
        } catch (\Throwable $e) {
            error_log('[Product store] DB error: '.$e->getMessage());
        }

        Response::success(['id'=>$id, 'name'=>$name, 'brand'=>$brand, 'price'=>$price], 'Product created', 201);
    }

    public function update(Request $req, string $id): void
    {
        $body = $req->body ?? [];
        try {
            $pdo = Database::connection();
            if ($pdo !== null) {
                $fields = [];
                $params = ['id'=>$id];
                foreach (['name','brand','tagline','description','image'] as $f) {
                    if (isset($body[$f])) { $fields[] = "$f = :$f"; $params[$f] = $body[$f]; }
                }
                if ($fields) {
                    $sql = 'UPDATE products SET '.implode(',', $fields).', updated_at=NOW() WHERE sku=:id OR id=:id';
                    Database::execute($sql, $params);
                }
                if (isset($body['variants'][0])) {
                    $v = $body['variants'][0];
                    Database::execute('UPDATE product_variants SET name=:name, price=:price, stock=:stock, image=:img WHERE product_id=(SELECT id FROM products WHERE sku=:sku LIMIT 1) LIMIT 1',
                        ['name'=>$v['name'],'price'=>$v['price'],'stock'=>$v['stock'],'img'=>$v['image'],'sku'=>$id]);
                }
            }
        } catch (\Throwable $e) { error_log('[Product update] '.$e->getMessage()); }
        Response::success(['id'=>$id], 'Product updated');
    }

    public function destroy(Request $req, string $id): void
    {
        try {
            Database::execute('DELETE FROM products WHERE sku=:id OR id=:id', ['id'=>$id]);
        } catch (\Throwable $e) { error_log('[Product destroy] '.$e->getMessage()); }
        Response::success(null, 'Product deleted');
    }
}
