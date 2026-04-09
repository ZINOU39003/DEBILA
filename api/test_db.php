<?php
/**
 * Diagnostic Tool for Bader Portal Database
 * Call this via: https://your-domain.com/api/test_db.php
 */
require_once 'config.php';

header("Content-Type: application/json; charset=UTF-8");

$report = [
    "status" => "running",
    "timestamp" => date("Y-m-d H:i:s"),
    "checks" => []
];

try {
    // 1. Check Connection
    $report["checks"]["database_connection"] = "OK";
    
    // 2. Check Users Table
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        $report["checks"]["users_table_exists"] = "YES";
        
        // Check column structure
        $cols = $pdo->query("DESCRIBE users")->fetchAll();
        $report["checks"]["users_columns"] = array_column($cols, 'Field');
    } else {
        $report["checks"]["users_table_exists"] = "NO (Missing)";
    }

    // 3. Check Complaints Table
    $stmt = $pdo->query("SHOW TABLES LIKE 'complaints'");
    $report["checks"]["complaints_table_exists"] = ($stmt->rowCount() > 0) ? "YES" : "NO";

    $report["success"] = true;

} catch (PDOException $e) {
    $report["success"] = false;
    $report["error"] = $e->getMessage();
    $report["checks"]["database_connection"] = "FAILED";
}

echo json_encode($report, JSON_PRETTY_PRINT);
?>
