<?php
/**
 * Database Configuration and Global Headers
 * Official Bader Portal PHP Backend
 */

// --- Global Headers for CORS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Database Credentials (Aiven MySQL) ---
$db_host = "mysql-159b2565-zinou.i.aivencloud.com";
$db_port = "27815";
$db_user = "avnadmin";
$db_pass = "AVNS_I5yYt0o7M0oY7g6fWw8"; // Password from user
$db_name = "defaultdb";

try {
    // Aiven requires SSL. For many PHP setups, PDO can handle this via options.
    $options = [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5, // 5 seconds timeout to prevent hanging
        // Aiven requires SSL. Try without certificate verification first to debug
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ];
    
    $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8";
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]));
}

/**
 * Helper function to read JSON input
 */
function get_json_input() {
    return json_decode(file_get_contents("php://input"), true);
}
?>
