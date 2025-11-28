<?php
// Simple test file to verify symlink and PHP are working
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Havenly API - Setup Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { 
            color: #28a745; 
            background: #d4edda; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0;
        }
        .error { 
            color: #dc3545; 
            background: #f8d7da; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0;
        }
        .info { 
            background: #d1ecf1; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0;
        }
        pre { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Havenly API - Setup Test</h1>
        
        <?php
        require_once __DIR__ . '/../vendor/autoload.php';
        echo '<div class="success">✅ PHP is working! Version: ' . phpversion() . '</div>';

        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../config');
        $dotenv->load();

        try {
            $pdo = new PDO(
                "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']}",
                $_ENV['DB_USER'],
                $_ENV['DB_PASS'],
                [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION ]
            );

            echo '<div class="success">✅ MySQL server is accessible</div>';

            $dbName = $_ENV['DB_NAME'];

            $stmt = $pdo->query("SHOW DATABASES LIKE '$dbName'");
            if ($stmt->rowCount() > 0) {
                echo '<div class="success">✅ Database "' . $dbName . '" exists</div>';

                $db = new PDO(
                    "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname=$dbName",
                    $_ENV['DB_USER'],
                    $_ENV['DB_PASS'],
                    [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION ]
                );

                echo '<div class="success">✅ Successfully connected to havenly database</div>';
            } else {
                echo '<div class="error">❌ Database "' . $dbName . '" not found</div>';
            }

        } catch (PDOException $e) {
            echo '<div class="error">❌ MySQL connection failed: ' . $e->getMessage() . '</div>';
        }

        $basePath = realpath(__DIR__ . "/..");

        // Test 5: Check if Composer dependencies are loaded
        if (file_exists($basePath. '/vendor/autoload.php')) {
            echo '<div class="success">✅ Composer dependencies are installed</div>';
        } else {
            echo '<div class="error">❌ Composer dependencies not found</div>';
        }



        $requiredDirs = ['config', 'src/controllers', 'src/models', 'src/routes', 'uploads'];

        foreach ($requiredDirs as $dir) {
            if (is_dir($basePath . '/' . $dir)) {
                echo '<div class="success">✅ Directory exists: ' . $dir . '</div>';
            } else {
                echo '<div class="error">❌ Missing directory: ' . $dir . '</div>';
            }
        }

            $writableDirs = ['uploads', 'logs'];

            foreach ($writableDirs as $dir) {
                if (is_dir($basePath . '/' . $dir) && is_writable($basePath . '/' . $dir)) {
                    echo '<div class="success">✅ Directory is writable: ' . $dir . '</div>';
                } else {
                    echo '<div class="error">❌ Directory not writable: ' . $dir . '</div>';
                }
            }
        ?>

        <div class="info">
            <h3>📊 Server Information:</h3>
            <pre>
Server: <?php echo $_SERVER['SERVER_SOFTWARE'] . "\n"; ?>
PHP Version: <?php echo phpversion() . "\n"; ?>
Document Root: <?php echo $_SERVER['DOCUMENT_ROOT'] . "\n"; ?>
Request URI: <?php echo $_SERVER['REQUEST_URI'] . "\n"; ?>
Symlink Path: <?php echo __FILE__ . "\n"; ?>
            </pre>
        </div>

        <div class="info">
            <h3>🔗 API Endpoints Test:</h3>
            <p>Try these URLs in your browser or Postman:</p>
            <ul>
                <li><a href="/havenly-api/api/users" target="_blank">/havenly-api/api/users</a> - Users API</li>
                <li><a href="/havenly-api/api/properties" target="_blank">/havenly-api/api/properties</a> - Properties API</li>
                <li><a href="/havenly-api/api/auth" target="_blank">/havenly-api/api/auth</a> - Auth API</li>
            </ul>
        </div>

        <div class="info">
            <h3>✅ Next Steps:</h3>
            <ol>
                <li>If you see green checkmarks above, your setup is working!</li>
                <li>Start your React app: <code>cd client && npm start</code></li>
                <li>Access your React app at: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></li>
                <li>Your API is ready at: <a href="/havenly-api" target="_blank">/havenly-api</a></li>
            </ol>
        </div>
    </div>
</body>
</html>