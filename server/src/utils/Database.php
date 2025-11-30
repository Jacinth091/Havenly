<?php

namespace Havenly\utils;

use PDO;
use PDOException;

class Database {
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        try {
            $this->validateEnvironment();
            
            $dsn = "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_DATABASE'];
            
            $this->connection = new PDO(
                $dsn,
                $_ENV['DB_USERNAME'],
                $_ENV['DB_PASSWORD'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
            
        } catch(PDOException $e) {
            // Fixed: Pass 0 as integer code instead of string
            throw new \Exception("Database Connection Failed: " . $e->getMessage(), 0);
        }
    }

    private function validateEnvironment()
    {
        $required = ['DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'];
        $missing = [];
        
        foreach ($required as $key) {
            if (empty($_ENV[$key])) {
                $missing[] = $key;
            }
        }
        
        if (!empty($missing)) {
            throw new \Exception(
                "Missing required environment variables: " . implode(', ', $missing) . 
                ". Please check your .env file configuration.", 
                0
            );
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }
}