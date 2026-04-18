<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/db.php';

// Load .env for JWT secret
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . '=' . trim($value));
    }
}

function generateJWT($payload, $secret) {
    $header = rtrim(base64_encode(json_encode(['alg'=>'HS256','typ'=>'JWT'])), '=');
    $payload = rtrim(base64_encode(json_encode($payload)), '=');
    $sig = rtrim(base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)), '=');
    return "$header.$payload.$sig";
}

$data = json_decode(file_get_contents("php://input"), true);
$email        = $data['email']        ?? null;
$class        = $data['class']        ?? null;
$board        = $data['board']        ?? null;
$parent_phone = $data['parent_phone'] ?? null;

if (!$email || !$class || !$board || !$parent_phone) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE users SET class=?, board=?, parent_phone=? WHERE email=?");
    $stmt->execute([$class, $board, $parent_phone, $email]);

    // Fetch updated user
    $stmt = $pdo->prepare("SELECT id, name, email, role, class FROM users WHERE email=?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Generate fresh JWT with correct class
    $secret = getenv("JWT_SECRET") ?: "pramyan_super_secret_key_2026";
    $token = generateJWT([
        "id"    => (int)$user['id'],
        "email" => $user['email'],
        "name"  => $user['name'],
        "role"  => $user['role'],
        "class" => (int)$user['class'],
        "iat"   => time(),
        "exp"   => time() + 604800
    ], $secret);

    echo json_encode([
        "success"       => true,
        "message"       => "Profile updated successfully!",
        "updated_class" => (int)$class,
        "token"         => $token
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>