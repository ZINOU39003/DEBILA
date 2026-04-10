<?php
require_once 'config.php';

$complaint_id = $_GET['complaint_id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = get_json_input();
    $complaint_id = $input['complaint_id'] ?? $complaint_id;
    $sender_id = $input['sender_id'];
    $sender_name = $input['sender_name'];
    $sender_role = $input['sender_role'];
    $text = $input['text'];

    try {
        $stmt = $pdo->prepare("INSERT INTO messages (complaint_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$complaint_id, $sender_id, $sender_name, $sender_role, $text]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$complaint_id) {
        http_response_code(400);
        exit(json_encode(["success" => false, "message" => "Missing complaint_id"]));
    }
    try {
        $stmt = $pdo->prepare("SELECT * FROM messages WHERE complaint_id = ? ORDER BY created_at ASC");
        $stmt->execute([$complaint_id]);
        $rows = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => ["items" => $rows]]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}
?>
