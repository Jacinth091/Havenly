<?php
namespace Havenly\services;

use Firebase\JWT\JWT;
use Havenly\models\User;
use Respect\Validation\Validator as v;

class AuthService {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function register($data) {
        // Validation
        $errors = $this->validateRegistration($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        // Check if email exists
        if ($this->userModel->findByEmail($data['email'])) {
            return ['success' => false, 'message' => 'Email already exists'];
        }

        // Create user
        $userId = $this->userModel->create($data);
        
        if ($userId) {
            $token = $this->generateToken([
                'id' => $userId,
                'email' => $data['email'],
                'name' => $data['name']
            ]);

            return [
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'name' => $data['name'],
                    'email' => $data['email']
                ]
            ];
        }

        return ['success' => false, 'message' => 'Registration failed'];
    }

    public function login($email, $password) {
        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        if (!$this->userModel->verifyPassword($password, $user['password_hash'])) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        $token = $this->generateToken([
            'id' => $user['user_id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'role' => $user['role']
        ]);

        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['user_id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']

            ]
        ];
    }

    private function generateToken($data) {
        $issuedAt = time();
        $expirationTime = $issuedAt + (int)$_ENV['JWT_EXPIRATION'];

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'data' => $data
        ];

        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }

    private function validateRegistration($data) {
        $errors = [];

        if (!v::notEmpty()->validate($data['name'] ?? '')) {
            $errors['name'] = 'Name is required';
        }

        if (!v::email()->validate($data['email'] ?? '')) {
            $errors['email'] = 'Valid email is required';
        }

        if (!v::notEmpty()->length(6, null)->validate($data['password'] ?? '')) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        return $errors;
    }
}
