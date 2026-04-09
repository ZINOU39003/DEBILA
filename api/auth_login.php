<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

$input = get_json_input();
$phone = $input['phone'] ?? '';
$password = $input['password'] ?? '';

if (empty($phone) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => " الهاتف وكلمة المرور مطلوبان"]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE (phone = ? OR username = ?) AND password = ?");
    $stmt->execute([$phone, $phone, $password]);
    $user = $stmt->fetch();

    if ($user) {
        $response = [
            "success" => true,
            "access_token" => "php-token-" . bin2hex(random_bytes(16)), // Simple token for this prototype
            "user" => [
                "id" => (string)$user['id'],
                "phone" => $user['phone'],
                "full_name" => $user['full_name'],
                "username" => $user['username'],
                "role" => $user['role'],
                "organization" => $user['organization'],
                "coverUri" => $user['cover_uri']
            ]
        ];
        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "بيانات الدخول غير صحيحة"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Internal Server Error"]);
}
?>
