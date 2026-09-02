<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

/**
 * Reviews — Real DB only.
 */
final class ReviewController
{
    public function index(Request $req): void
    {
        $rows = Database::fetchAll('SELECT id, name, rating, text, created_at, verified, anonymous FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC LIMIT 100');
        $data = array_map(fn($r) => [
            'id' => $r['id'],
            'name' => $r['anonymous'] ? 'Anonymous' : $r['name'],
            'rating' => (int)$r['rating'],
            'text' => $r['text'],
            'createdAt' => $r['created_at'],
            'verified' => (bool)$r['verified'],
            'anonymous' => (bool)$r['anonymous'],
        ], $rows);
        Response::success($data, 'Reviews retrieved');
    }

    public function store(Request $req): void
    {
        $body = $req->body ?? [];
        $name = trim((string)($body['name'] ?? ''));
        $phone = trim((string)($body['phone'] ?? ''));
        $text = trim((string)($body['text'] ?? ''));
        $rating = (int)($body['rating'] ?? 5);
        $anonymous = (bool)($body['anonymous'] ?? false);

        $errors = [];
        if ($text === '' || mb_strlen($text) < 10) $errors['text'] = 'Review text must be at least 10 characters.';
        if (mb_strlen($text) > 800) $errors['text'] = 'Review text too long (max 800).';
        if ($rating < 1 || $rating > 5) $errors['rating'] = 'Rating must be 1-5.';
        if ($phone !== '' && !preg_match('/^[\+0-9\s\-\(\)]{7,20}$/', $phone)) $errors['phone'] = 'Invalid phone format.';
        if ($errors) Response::error('Validation failed', 422, $errors);

        $displayName = $anonymous || $name === '' ? 'Anonymous' : mb_substr($name, 0, 32);
        $id = 'rv_' . bin2hex(random_bytes(6));

        Database::execute(
            'INSERT INTO reviews (id, name, phone, rating, text, verified, anonymous, is_approved, created_at) VALUES (:id,:name,:phone,:rating,:text,0,:anon,1,NOW())',
            ['id'=>$id,'name'=>$displayName,'phone'=>$phone,'rating'=>$rating,'text'=>$text,'anon'=>$anonymous?1:0]
        );

        Response::success([
            'id' => $id,
            'name' => $displayName,
            'rating' => $rating,
            'text' => $text,
            'createdAt' => date('c'),
            'verified' => false,
            'anonymous' => $anonymous || $name === '',
        ], 'Review posted', 201);
    }
}
