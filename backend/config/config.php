<?php
declare(strict_types=1);

/**
 * HYDRO+ ELITE — Central Config
 * Loads .env (above public_html) and exposes typed config.
 * Falls back to .env.example values if no .env present (mock/dev).
 */
final class Config
{
    private static array $env = [];
    private static bool $loaded = false;

    public static function load(string $basePath): void
    {
        if (self::$loaded) return;
        $candidates = [
            $basePath . '/.env',
            dirname($basePath) . '/.env',
            $basePath . '/backend/.env',
        ];
        $envFile = null;
        foreach ($candidates as $p) {
            if (is_file($p)) { $envFile = $p; break; }
        }
        if ($envFile === null) {
            // Mock defaults for local dev without .env / DB
            self::$env = [
                'APP_ENV' => 'development',
                'APP_DEBUG' => 'true',
                'DB_HOST' => '127.0.0.1',
                'DB_DATABASE' => 'hydrogen_store',
                'DB_USERNAME' => 'root',
                'DB_PASSWORD' => '',
                'DB_MOCK_FALLBACK' => 'true',
                'PAYSTACK_SECRET_KEY' => 'sk_test_mock_key',
                'PAYSTACK_PUBLIC_KEY' => 'pk_test_mock_key',
                'CORS_ALLOWED_ORIGINS' => 'http://localhost:4200,https://hydrogenwaterbottles.store',
            ];
            self::$loaded = true;
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            [$k, $v] = array_pad(explode('=', $line, 2), 2, '');
            $k = trim($k); $v = trim($v);
            // Strip quotes
            if (preg_match('/^["\'](.*)["\']$/', $v, $m)) $v = $m[1];
            self::$env[$k] = $v;
            $_ENV[$k] = $v;
            putenv("$k=$v");
        }
        self::$loaded = true;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::$env[$key] ?? $_ENV[$key] ?? getenv($key) ?: $default;
    }

    public static function isDebug(): bool
    {
        $v = strtolower((string)self::get('APP_DEBUG', 'false'));
        return in_array($v, ['1','true','yes','on'], true);
    }

    public static function allowedOrigins(): array
    {
        $raw = (string)self::get('CORS_ALLOWED_ORIGINS', 'https://hydrogenwaterbottles.store');
        return array_filter(array_map('trim', explode(',', $raw)));
    }
}
