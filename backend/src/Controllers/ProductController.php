<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

/**
 * Product catalog — Real DB only (no mocks).
 * Reads from `products` + `product_variants`.
 */
final class ProductController
{
    public function index(Request $req): void
    {
        // ?id= or ?sku= single, else full catalog
        if (isset($req->query['id']) || isset($req->query['sku'])) {
            $id = (string)($req->query['id'] ?? $req->query['sku']);
            $product = $this->findProduct($id);
            if ($product === null) Response::error('Product not found', 404);
            Response::success($product, 'Product retrieved');
            return;
        }

        $products = $this->fetchCatalog();
        Response::success($products, 'Catalog retrieved');
    }

    public function show(Request $req, string $id): void
    {
        $product = $this->findProduct($id);
        if ($product === null) Response::error('Product not found', 404);
        Response::success($product);
    }

    private function fetchCatalog(): array
    {
        $pdo = Database::connection();
        // throws if DB unavailable — no mock fallback
        $rows = Database::fetchAll('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at ASC');
        $out = [];
        foreach ($rows as $row) {
            $variants = Database::fetchAll('SELECT * FROM product_variants WHERE product_id = :pid AND is_active = 1 ORDER BY price ASC', ['pid' => $row['id']]);
            $out[] = $this->mapProduct($row, $variants);
        }
        return $out;
    }

    private function findProduct(string $id): ?array
    {
        $pdo = Database::connection();
        $row = Database::fetchOne('SELECT * FROM products WHERE (sku = :id OR id = :id) AND is_active = 1 LIMIT 1', ['id' => $id]);
        if (!$row) return null;
        $variants = Database::fetchAll('SELECT * FROM product_variants WHERE product_id = :pid AND is_active = 1 ORDER BY price ASC', ['pid' => $row['id']]);
        return $this->mapProduct($row, $variants);
    }

    private function mapProduct(array $row, array $variants): array
    {
        return [
            'id' => $row['sku'],
            'name' => $row['name'],
            'brand' => $row['brand'] ?? 'H2Os',
            'category' => $row['category'] ?? 'Hydrogen Bottle',
            'tagline' => $row['tagline'],
            'description' => $row['description'],
            'image' => $row['image'] ?? '/images/ultraH2.jpeg',
            'images' => json_decode($row['images_json'] ?? '[]', true) ?: [],
            'videos' => json_decode($row['videos_json'] ?? '[]', true) ?: [],
            'variants' => array_map(fn($v) => [
                'id' => $v['variant_key'],
                'name' => $v['name'],
                'finish' => $v['finish'],
                'hex' => $v['hex'],
                'price' => (int)$v['price'],
                'compareAt' => $v['compare_at'] !== null ? (int)$v['compare_at'] : null,
                'sku' => $v['sku'],
                'stock' => (int)$v['stock'],
                'image' => $v['image'] ?? $row['image'] ?? '/images/ultraH2.jpeg',
                'gradient' => $v['gradient'],
            ], $variants),
            'specs' => json_decode($row['specs_json'] ?? '[]', true) ?: [],
            'features' => json_decode($row['features_json'] ?? '[]', true) ?: [],
            'rating' => isset($row['rating']) ? (float)$row['rating'] : 4.9,
            'reviewsCount' => isset($row['reviews_count']) ? (int)$row['reviews_count'] : 0,
        ];
    }

    // ─── MGT Admin: Create ───
    public function store(Request $req): void
    {
        $body = $req->body ?? [];
        $name = trim((string)($body['name'] ?? ''));
        $brand = trim((string)($body['brand'] ?? 'H2Os'));
        if ($name === '') Response::error('Product name required', 422);
        $sku = trim((string)($body['id'] ?? $body['sku'] ?? ''));
        if ($sku === '') $sku = strtoupper(preg_replace('/[^A-Z0-9]+/i','-', $brand.'-'.$name)).'-'.strtoupper(bin2hex(random_bytes(2)));
        $pdo = Database::connection();

        try {
            Database::execute(
                'INSERT INTO products (sku, name, brand, category, badge, tagline, description, image, images_json, videos_json, specs_json, features_json, rating) VALUES (:sku,:name,:brand,:cat,:badge,:tag,:desc,:img,:imgs,:vids,:specs,:feats,:rating)',
                [
                    'sku'=>$sku, 'name'=>$name, 'brand'=>$brand,
                    'cat'=>$body['category'] ?? 'Hydrogen Bottle',
                    'badge'=>$body['badge'] ?? null,
                    'tag'=>$body['tagline'] ?? 'Hydration, upgraded.',
                    'desc'=>$body['description'] ?? '',
                    'img'=>$body['image'] ?? '/images/ultraH2.jpeg',
                    'imgs'=>json_encode($body['images'] ?? []),
                    'vids'=>json_encode($body['videos'] ?? []),
                    'specs'=>json_encode($body['specs'] ?? []),
                    'feats'=>json_encode($body['features'] ?? []),
                    'rating'=>$body['rating'] ?? 4.9,
                ]
            );
        } catch (\Throwable $e) {
            // Fallback for live DB without new columns (category etc not yet migrated)
            if (str_contains($e->getMessage(), 'Unknown column') || str_contains($e->getMessage(), '42S22')) {
                Database::execute(
                    'INSERT INTO products (sku, name, brand, tagline, description, image, specs_json, features_json) VALUES (:sku,:name,:brand,:tag,:desc,:img,:specs,:feats)',
                    [
                        'sku'=>$sku, 'name'=>$name, 'brand'=>$brand,
                        'tag'=>$body['tagline'] ?? 'Hydration, upgraded.',
                        'desc'=>$body['description'] ?? '',
                        'img'=>$body['image'] ?? '/images/ultraH2.jpeg',
                        'specs'=>json_encode($body['specs'] ?? []),
                        'feats'=>json_encode($body['features'] ?? []),
                    ]
                );
            } else { throw $e; }
        }
        $pid = (int)Database::lastInsertId();
        $variant = $body['variants'][0] ?? null;
        if ($variant) {
            Database::execute(
                'INSERT INTO product_variants (product_id, variant_key, name, finish, hex, sku, price, compare_at, stock, image, gradient) VALUES (:pid,:vk,:name,:fin,:hex,:sku,:price,:ca,:stock,:img,:grad)',
                ['pid'=>$pid,'vk'=>$variant['variant_key']??'var','name'=>$variant['name'],'fin'=>$variant['finish'],'hex'=>$variant['hex'],'sku'=>$variant['sku'],'price'=>$variant['price'],'ca'=>$variant['compareAt']??null,'stock'=>$variant['stock']??20,'img'=>$variant['image']??'/images/ultraH2.jpeg','grad'=>$variant['gradient']??'linear-gradient(145deg,#0A0E14,#111A1E)']
            );
        }

        Response::success(['id'=>$sku, 'name'=>$name, 'brand'=>$brand], 'Product created', 201);
    }

    public function update(Request $req, string $id): void
    {
        $body = $req->body ?? [];
        $pdo = Database::connection();
        $fields = [];
        $params = ['id'=>$id];
        foreach (['name','brand','category','badge','tagline','description','image','rating'] as $f) {
            if (isset($body[$f])) { $fields[] = "$f = :$f"; $params[$f] = $body[$f]; }
        }
        if (isset($body['images'])) { $fields[] = "images_json = :images_json"; $params['images_json'] = json_encode($body['images']); }
        if (isset($body['videos'])) { $fields[] = "videos_json = :videos_json"; $params['videos_json'] = json_encode($body['videos']); }
        if (isset($body['specs'])) { $fields[] = "specs_json = :specs_json"; $params['specs_json'] = json_encode($body['specs']); }
        if (isset($body['features'])) { $fields[] = "features_json = :features_json"; $params['features_json'] = json_encode($body['features']); }
        if ($fields) {
            $sql = 'UPDATE products SET '.implode(',', $fields).', updated_at=NOW() WHERE sku=:id OR id=:id';
            try {
                Database::execute($sql, $params);
            } catch (\Throwable $e) {
                if (str_contains($e->getMessage(), 'Unknown column') || str_contains($e->getMessage(), '42S22')) {
                    $allowed = ['name','brand','tagline','description','image'];
                    $filtered = [];
                    $filteredParams = ['id'=>$id];
                    foreach ($allowed as $f) if (isset($params[$f])) { $filtered[] = "$f = :$f"; $filteredParams[$f] = $params[$f]; }
                    if ($filtered) {
                        $sql2 = 'UPDATE products SET '.implode(',', $filtered).', updated_at=NOW() WHERE sku=:id OR id=:id';
                        Database::execute($sql2, $filteredParams);
                    }
                } else { throw $e; }
            }
        }
        if (isset($body['variants'][0])) {
            $v = $body['variants'][0];
            try {
                // Use separate query to get product_id to avoid MySQL subquery LIMIT issue
                $prod = Database::fetchOne('SELECT id FROM products WHERE sku = :sku LIMIT 1', ['sku'=>$id]);
                if (!$prod) $prod = Database::fetchOne('SELECT id FROM products WHERE id = :id LIMIT 1', ['id'=>$id]);
                if ($prod) {
                    Database::execute('UPDATE product_variants SET name=:name, price=:price, stock=:stock, image=:img WHERE product_id=:pid LIMIT 1',
                        ['name'=>$v['name'],'price'=>$v['price'],'stock'=>$v['stock'],'img'=>$v['image'],'pid'=>$prod['id']]);
                }
            } catch (\Throwable $e) {
                error_log('[Product update variant] ' . $e->getMessage());
                // Do not fail whole request if variant update fails — product main fields already saved
            }
        }
        Response::success(['id'=>$id], 'Product updated');
    }

    public function destroy(Request $req, string $id): void
    {
        Database::execute('DELETE FROM products WHERE sku=:id OR id=:id', ['id'=>$id]);
        Response::success(null, 'Product deleted');
    }
}
