<?php
namespace Havenly\utils;

class Request {
    // Get all JSON data from request body
    public static function all() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    // Get specific field
    public static function get($key, $default = null) {
        $body = self::all();
        return $body[$key] ?? $default;
    }

    // Get only specified fields
    public static function only($keys) {
        $body = self::all();
        $result = [];
        foreach ($keys as $key) {
            if (isset($body[$key])) {
                $result[$key] = $body[$key];
            }
        }
        return $result;
    }
}