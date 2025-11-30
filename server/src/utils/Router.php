<?php

namespace Havenly\utils;

use Havenly\helpers\Logger;

class Router {
    private $routes = [];

    public function get($path, $handler, $middleware = []) {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post($path, $handler, $middleware = []) {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put($path, $handler, $middleware = []) {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete($path, $handler, $middleware = []) {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute($method, $path, $handler, $middleware) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware
        ];
    }

    public function dispatch() {
        $requestMethod = $_SERVER['REQUEST_METHOD'];
        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Remove base path (everything before /public/)
        $basePath = dirname($_SERVER['SCRIPT_NAME']);
        if ($basePath !== '/' && strpos($requestUri, $basePath) === 0) {
            $requestUri = substr($requestUri, strlen($basePath));
        }

        // Remove /index.php if present
        $requestUri = str_replace('/index.php', '', $requestUri);

        // Normalize the path
        $requestUri = '/' . trim($requestUri, '/');
        if ($requestUri !== '/') {
            $requestUri = rtrim($requestUri, '/');
        }

        // Find matching route
        foreach ($this->routes as $route) {
            $routePath = '/' . trim($route['path'], '/');
            if ($routePath !== '/') {
                $routePath = rtrim($routePath, '/');
            }
            
            if ($route['method'] === $requestMethod && $routePath === $requestUri) {
                // Execute middleware
                if (!empty($route['middleware'])) {
                    foreach ($route['middleware'] as $middlewareClass) {
                        $middlewareInstance = new $middlewareClass();
                        if (method_exists($middlewareInstance, 'handle')) {
                            $result = $middlewareInstance->handle();
                            if ($result === false) {
                                return;
                            }
                        }
                    }
                }

                // Execute the handler
                $handler = $route['handler'];
                
                if (is_array($handler) && count($handler) === 2) {
                    [$controllerClass, $method] = $handler;
                    
                    if (class_exists($controllerClass) && method_exists($controllerClass, $method)) {
                        $controllerInstance = new $controllerClass();
                        $controllerInstance->$method();
                    } else {
                        Logger::console("Controller or method not found: $controllerClass::$method", "error");
                        $this->sendError(500, 'Internal server error');
                    }
                } elseif (is_callable($handler)) {
                    $handler();
                } else {
                    Logger::console("Invalid handler type", "error");
                    $this->sendError(500, 'Internal server error');
                }
                return;
            }
        }

        // 404 Not Found
        $this->sendError(404, 'Endpoint not found', [
            'requested' => $requestMethod . ' ' . $requestUri,
            'hint' => 'Check if your route is registered in index.php'
        ]);
    }

    private function sendError($code, $message, $debug = null) {
        http_response_code($code);
        header('Content-Type: application/json');
        $response = [
            'success' => false, 
            'message' => $message
        ];
        
        // Only add debug info in development
        if ($debug && ($_ENV['APP_DEBUG'] ?? false)) {
            $response['debug'] = $debug;
        }
        
        echo json_encode($response);
    }
}