<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';

function generateJWT($payload, $secret) {
    $header    = rtrim(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])), '=');
    $payload   = rtrim(base64_encode(json_encode($payload)), '=');
    $signature = rtrim(base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)), '=');
    return "$header.$payload.$signature";
}

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email']    ?? '');
$password =      $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit();
}

// Look up email
$stmt = $pdo->prepare("
    SELECT id, name, email, password, role, parent_phone
    FROM users
    WHERE email = ?
");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Email not found
if (!$user) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No account found with this email'
    ]);
    exit();
}

// Wrong password
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Incorrect password'
    ]);
    exit();
}

// Generate JWT
$secret = "pramyan_super_secret_key_2026";
$token  = generateJWT([
    'id'    => (int)$user['id'],
    'email' => $user['email'],
    'role'  => $user['role'],
    'iat'   => time(),
    'exp'   => time() + (7 * 24 * 60 * 60)
], $secret);

http_response_code(200);
echo json_encode([
    'success' => true,
    'token'   => $token,
    'user'    => [
        'id'           => (int)$user['id'],
        'name'         => $user['name'],
        'email'        => $user['email'],
        'role'         => $user['role'],
        'parent_phone' => $user['parent_phone']
    ]
]);