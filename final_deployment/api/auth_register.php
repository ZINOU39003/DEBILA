<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(["success" => false, "message" => "Method Not Allowed"]));
}

$input = get_json_input();
$phone = $input['phone'] ?? '';
$password = $input['password'] ?? '';
$full_name = $input['full_name'] ?? '';
$username = $input['username'] ?? null;
$email = $input['email'] ?? null;
$role = $input['role'] ?? 'citizen';

if (empty($phone) || empty($password) || empty($full_name)) {
    http_response_code(400);
    exit(json_encode(["success" => false, "message" => "البيانات الأساسية مطلوبة"]));
}

try {
    $stmt = $pdo->prepare("INSERT INTO users (phone, password, full_name, username, email, role) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$phone, $password, $full_name, $username, $email, $role]);
    
    $userId = $pdo->lastInsertId();
    
    echo json_encode([
        "success" => true,
        "access_token" => "php-token-" . bin2hex(random_bytes(16)),
        "user" => [
            "id" => (string)$userId,
            "phone" => $phone,
            "full_name" => $full_name,
            "username" => $username,
            "role" => $role
        ]
    ]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "رقم الهاتف أو اسم المستخدم مسجل مسبقاً"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "خطأ في السيرفر: " . $e->getMessage()]);
    }
}
?>
