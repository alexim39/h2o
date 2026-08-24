<?php
declare(strict_types=1);
namespace App\Core;

/**
 * Minimal stateless router — regex + named params.
 * No session, no cookies. Every request is stateless REST.
 */
final class Router
{
    /** @var array<string, array<int, array{pattern:string, regex:string, handler:callable|array}>> */
    private array $routes = [];

    public function get(string $pattern, callable|array $handler): void  { $this->add('GET', $pattern, $handler); }
    public function post(string $pattern, callable|array $handler): void { $this->add('POST', $pattern, $handler); }
    public function put(string $pattern, callable|array $handler): void  { $this->add('PUT', $pattern, $handler); }
    public function delete(string $pattern, callable|array $handler): void { $this->add('DELETE', $pattern, $handler); }
    public function any(string $pattern, callable|array $handler): void {
        foreach (['GET','POST','PUT','PATCH','DELETE','OPTIONS'] as $m) $this->add($m, $pattern, $handler);
    }

    private function add(string $method, string $pattern, callable|array $handler): void
    {
        $regex = $this->compile($pattern);
        $this->routes[$method][] = ['pattern' => $pattern, 'regex' => $regex, 'handler' => $handler];
    }

    private function compile(string $pattern): string
    {
        // Convert /orders/{ref} => #^/orders/(?P<ref>[^/]+)$#
        $regex = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $pattern);
        return '#^' . $regex . '$#';
    }

    public function dispatch(Request $req): void
    {
        $method = $req->method;
        // Handle preflight at router level — already handled in index.php but keep idempotent
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $path = $req->apiPath();
        $candidates = $this->routes[$method] ?? [];

        foreach ($candidates as $r) {
            if (preg_match($r['regex'], $path, $m)) {
                $params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
                $handler = $r['handler'];
                if (is_array($handler)) {
                    [$class, $methodName] = $handler;
                    $instance = new $class();
                    // Call with (Request, ...params)
                    $instance->$methodName($req, ...array_values($params));
                    return;
                }
                $handler($req, ...array_values($params));
                return;
            }
        }

        Response::error('Endpoint not found: ' . $method . ' ' . $path, 404);
    }
}
