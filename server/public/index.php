<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Havenly\utils\Router;
use Havenly\middleware\CorsMiddleware;
use Havenly\middleware\AuthMiddleware;
use Havenly\controllers\AuthController;
use Havenly\controllers\UserController;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '../../config');
$dotenv->load();

// Apply CORS
CorsMiddleware::handle();

// Initialize router
$router = new Router();

// ============================================================================
// ROOT ENDPOINT - Test if API is running
// ============================================================================
$router->get('/', function() {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Havenly API is running',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'POST /api/auth/refresh',
            'GET /api/user/profile (requires auth)',
            'PUT /api/user/profile (requires auth)'
        ]
    ]);
});

// ============================================================================
// DEBUG ENDPOINT - Check routing
// ============================================================================
$router->get('/debug', function() {
    header('Content-Type: application/json');
    $basePath = dirname($_SERVER['SCRIPT_NAME']);
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    if ($basePath !== '/' && strpos($requestUri, $basePath) === 0) {
        $adjustedUri = substr($requestUri, strlen($basePath));
    } else {
        $adjustedUri = $requestUri;
    }
    
    echo json_encode([
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'REQUEST_URI' => $_SERVER['REQUEST_URI'],
        'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'],
        'parsed_uri' => $requestUri,
        'base_path' => $basePath,
        'adjusted_uri' => $adjustedUri,
        'final_uri' => '/' . trim($adjustedUri, '/')
    ]);
});

// ============================================================================
// AUTH ROUTES (Public)
// ============================================================================
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/refresh', [AuthController::class, 'refresh']);

// ============================================================================
// USER ROUTES (Protected)
// ============================================================================
$router->get('/api/user/profile', [UserController::class, 'getProfile'], [AuthMiddleware::class]);
$router->put('/api/user/profile', [UserController::class, 'updateProfile'], [AuthMiddleware::class]);

// ============================================================================
// DISPATCH THE ROUTER
// ============================================================================
$router->dispatch();