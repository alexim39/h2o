<?php
declare(strict_types=1);
namespace App\Core;

final class Request
{
    public readonly string $method;
    public readonly string $uri;
    public readonly string $path;
    public readonly array $query;
    public readonly array $headers;
    public readonly ?array $body;
    public readonly string $rawBody;

    public function __construct()
    {
        $this->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->uri    = $_SERVER['REQUEST_URI'] ?? '/';
        $this->path   = parse_url($this->uri, PHP_URL_PATH) ?? '/';
        $this->query  = $_GET;
        $this->headers = $this->parseHeaders();
        $this->rawBody = (string)file_get_contents('php://input');
        $this->body = $this->parseBody();
    }

    private function parseHeaders(): array
    {
        $out = [];
        foreach ($_SERVER as $k => $v) {
            if (str_starts_with($k, 'HTTP_')) {
                $name = strtolower(str_replace('_', '-', substr($k, 5)));
                $out[$name] = $v;
            } elseif (in_array($k, ['CONTENT_TYPE','CONTENT_LENGTH'], true)) {
                $out[strtolower(str_replace('_','-',$k))] = $v;
            }
        }
        return $out;
    }

    private function parseBody(): ?array
    {
        if ($this->rawBody === '') return null;
        $ct = $this->headers['content-type'] ?? '';
        if (str_contains($ct, 'application/json')) {
            $decoded = json_decode($this->rawBody, true);
            return is_array($decoded) ? $decoded : null;
        }
        // Fallback to POST
        if (!empty($_POST)) return $_POST;
        return null;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        if ($this->body !== null && array_key_exists($key, $this->body)) return $this->body[$key];
        return $this->query[$key] ?? $default;
    }

    public function all(): array
    {
        return array_merge($this->query, $this->body ?? []);
    }

    public function header(string $name, ?string $default = null): ?string
    {
        return $this->headers[strtolower($name)] ?? $default;
    }

    /** Normalized path without /api prefix and trailing slash */
    public function apiPath(): string
    {
        $p = $this->path;
        // Strip /api prefix if present (when hosted at domain/api)
        if (str_starts_with($p, '/api')) $p = substr($p, 4) ?: '/';
        if ($p !== '/' ) $p = rtrim($p, '/');
        if ($p === '') $p = '/';
        return $p;
    }
}
