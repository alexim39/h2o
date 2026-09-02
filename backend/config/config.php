<?php
declare(strict_types=1);

/**
 * H2Os — Central Config — Real .env required (no mock fallback).
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
            dirname($basePath) . '/backend/.env',
            // cPanel subdomain api.hydrogenwaterbottles.store
            dirname($basePath) . '/api.hydrogenwaterbottles.store/.env',
            dirname(dirname($basePath)) . '/api.hydrogenwaterbottles.store/.env',
            dirname(dirname($basePath)) . '/h2o-api/.env',
        ];
        $envFile = null;
        foreach ($candidates as $p) {
            if (is_file($p)) { $envFile = $p; break; }
        }
        if ($envFile === null) {
            throw new \RuntimeException('Missing .env — create ~/api.hydrogenwaterbottles.store/.env or ~/h2o-api/.env (see .env.example)');
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            [$k, $v] = array_pad(explode('=', $line, 2), 2, '');
            $k = trim($k); $v = trim($v);
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
