<?php
declare(strict_types=1);
namespace App\Core;

final class Response
{
    public static function json(mixed $data, int $status = 200, array $headers = []): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        foreach ($headers as $k => $v) header("$k: $v");
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): void
    {
        self::json(['status' => true, 'message' => $message, 'data' => $data], $status);
    }

    public static function error(string $message, int $status = 400, mixed $errors = null): void
    {
        $payload = ['status' => false, 'message' => $message];
        if ($errors !== null) $payload['errors'] = $errors;
        self::json($payload, $status);
    }

    public static function paginated(array $items, int $total, int $page, int $perPage): void
    {
        self::json([
            'status' => true,
            'data' => $items,
            'meta' => ['total' => $total, 'page' => $page, 'perPage' => $perPage, 'pages' => (int)ceil($total / $perPage)]
        ]);
    }
}
