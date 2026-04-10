<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(["success" => false, "message" => "Method Not Allowed"]));
}

$input = get_json_input();
$id = $input['id'];
$title = $input['title'];
$description = $input['description'];
$location_text = $input['location_text'];
$lat = $input['lat'];
$lng = $input['lng'];
$category = $input['category'];
$reporter_id = $input['reporter_id'];
$assigned_dept = $input['assigned_dept'] ?? 'المصلحة التقنية';
$media_urls = json_encode($input['media_urls'] ?? []);

try {
    $stmt = $pdo->prepare("INSERT INTO complaints (id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $title, $description, $location_text, $lat, $lng, $category, $reporter_id, $assigned_dept, $media_urls]);
    
    echo json_encode(["success" => true, "data" => ["id" => $id]]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
