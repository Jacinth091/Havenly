<?php
namespace Havenly\controllers;

use Havenly\models\User;
use Havenly\utils\Response;

class UserController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function getProfile() {
        $authUser = $GLOBALS['auth_user'];
        
        $user = $this->userModel->findById($authUser->id);
        
        if ($user) {
            Response::success(['user' => $user], 'Profile retrieved successfully');
        } else {
            Response::error('User not found', 404);
        }
    }

    public function updateProfile() {
        $authUser = $GLOBALS['auth_user'];
        $data = json_decode(file_get_contents('php://input'), true);

        // Remove sensitive fields
        unset($data['password'], $data['email'], $data['id']);

        if ($this->userModel->update($authUser->id, $data)) {
            Response::success([], 'Profile updated successfully');
        } else {
            Response::error('Failed to update profile', 500);
        }
    }
}