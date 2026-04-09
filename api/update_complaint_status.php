<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    exit(json_encode(["success" => false, "message" => "Method Not Allowed"]));
}

$input = get_json_input();
$id = $input['id'] ?? null;
$status = $input['status'] ?? null;
$note = $input['note'] ?? '';

if (!$id || !$status) {
    http_response_code(400);
    exit(json_encode(["success" => false, "message" => "ID and status are required"]));
}

$validStatuses = ["submitted", "under_review", "in_progress", "resolved", "rejected"];
if (!in_array($status, $validStatuses)) {
    http_response_code(400);
    exit(json_encode(["success" => false, "message" => "Invalid status value"]));
}

try {
    $stmt = $pdo->prepare("UPDATE complaints SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        exit(json_encode(["success" => false, "message" => "Complaint not found"]));
    }
    
    echo json_encode(["success" => true, "message" => "Status updated successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
