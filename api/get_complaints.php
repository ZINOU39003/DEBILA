<?php
require_once 'config.php';

$reporter_id = $_GET['reporter_id'] ?? null;

try {
    if ($reporter_id) {
        $stmt = $pdo->prepare("SELECT * FROM complaints WHERE reporter_id = ? ORDER BY created_at DESC");
        $stmt->execute([$reporter_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM complaints ORDER BY created_at DESC");
    }
    
    $rows = $stmt->fetchAll();
    
    $complaints = array_map(function($r) {
        $r['media_urls'] = json_decode($r['media_urls'], true) ?: [];
        $r['history'] = [];
        $r['messages'] = [];
        return $r;
    }, $rows);
    
    echo json_encode(["success" => true, "data" => ["items" => $complaints]]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
