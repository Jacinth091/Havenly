<?php

namespace Havenly\controllers;

use Havenly\services\AuthService;
use Havenly\utils\Response;

class AuthController {
    private $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $result = $this->authService->register($data);

        if ($result['success']) {
            Response::success($result, 'Registration successful', 201);
        } else {
            $statusCode = isset($result['errors']) ? 422 : 400;
            Response::error($result['message'] ?? 'Registration failed', $statusCode, $result['errors'] ?? null);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            Response::error('Email and password are required', 400);
        }

        $result = $this->authService->login($data['email'], $data['password']);

        if ($result['success']) {
            Response::success($result, 'Login successful');
        } else {
            Response::error($result['message'], 401);
        }
    }

    public function refresh() {
        Response::success([], 'Token refreshed');
    }
}