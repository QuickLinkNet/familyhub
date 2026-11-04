<?php
declare(strict_types=1);

namespace FamilyCompass\Core;

final class Router
{
    /** @var array<string, array<string, callable>> */
    private array $routes = [];

    public function get(string $path, callable $handler): void { $this->add('GET', $path, $handler); }
    public function post(string $path, callable $handler): void { $this->add('POST', $path, $handler); }
    public function put(string $path, callable $handler): void { $this->add('PUT', $path, $handler); }
    public function delete(string $path, callable $handler): void { $this->add('DELETE', $path, $handler); }

    public function dispatch(string $method, string $requestUri): void
    {
        if ($method === 'OPTIONS') { http_response_code(204); exit; }
        $path = $this->normalisePath($requestUri);
        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            $parameters = $this->parameters($route, $path);
            if ($parameters !== null) {
                $handler(...$parameters);
                return;
            }
        }
        Response::error('NOT_FOUND', 'Die angeforderte Ressource wurde nicht gefunden.', 404);
    }

    private function add(string $method, string $path, callable $handler): void { $this->routes[$method][$path] = $handler; }

    private function normalisePath(string $requestUri): string
    {
        $path = parse_url($requestUri, PHP_URL_PATH) ?: '/';
        $apiPosition = strpos($path, '/api/');
        $path = $apiPosition === false ? $path : substr($path, $apiPosition + 4);
        $path = preg_replace('#^/?index\\.php#', '', $path) ?? $path;
        return '/' . ltrim($path, '/');
    }

    /** @return list<string>|null */
    private function parameters(string $route, string $path): ?array
    {
        $pattern = preg_replace('#\\{[a-zA-Z_][a-zA-Z0-9_]*\\}#', '([^/]+)', $route) ?? $route;
        if (preg_match('#^' . $pattern . '$#', $path, $matches) !== 1) { return null; }
        array_shift($matches);
        return $matches;
    }
}