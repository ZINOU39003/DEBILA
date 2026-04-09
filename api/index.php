<?php
/**
 * Bader Portal - API Router
 * Main entry point for all API requests
 */

require_once 'config.php';

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$path = str_replace('/api', '', $path);
$path = trim($path, '/');

// Route to appropriate endpoint
switch ($path) {
    case '':
    case 'index':
        // API Info
        echo json_encode([
            "success" => true,
            "message" => "Bader Portal API",
            "version" => "1.0.0",
            "endpoints" => [
                "POST /auth_login.php" => "User login",
                "POST /auth_register.php" => "User registration",
                "GET /get_complaints.php" => "Get complaints list",
                "POST /create_complaint.php" => "Create new complaint",
                "POST /update_complaint_status.php" => "Update complaint status",
                "GET/POST /messages.php" => "Get/Send messages",
                "GET /setup_db.php" => "Database setup (development only)"
            ]
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Endpoint not found. Visit /api/ for available endpoints."
        ]);
}
?>
