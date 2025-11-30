<?php
namespace Havenly\middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Havenly\utils\Response;

class AuthMiddleware {
    public function handle() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader)) {
            Response::error('No token provided', 401);
            return false;
        }

        try {
            $token = str_replace('Bearer ', '', $authHeader);
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            
            // Store user data in global for controller access
            $GLOBALS['auth_user'] = $decoded->data;
            return true;
        } catch (\Exception $e) {
            Response::error('Invalid or expired token', 401);
            return false;
        }
    }
}