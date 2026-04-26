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

// Load .env for JWT secret consistency with middleware/auth.php
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        [$name, $value] = explode('=', $line, 2);
        putenv(trim($name) . '=' . trim($value));
    }
}

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

$stmt = $pdo->prepare("
    SELECT id, name, email, password_hash, role, parent_phone, class
    FROM users
    WHERE email = ?
");

$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// email not found
if (!$user) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No account found with this email'
    ]);
    exit();
}

if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Incorrect password'
    ]);
    exit();
}

// generate token
$secret = trim((string)getenv("JWT_SECRET"), " \t\n\r\0\x0B\"'");
if ($secret === '') {
    $secret = "pramyan_super_secret_key_2026";
}

$token  = generateJWT([
    'id'    => (int)$user['id'],
    'email' => $user['email'],
    'name'  => $user['name'],
    'role'  => $user['role'],
    'name'  => $user['name'],
    'class' => (int)$user['class'],
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
        'class'        => (int)$user['class'],
        'parent_phone' => $user['parent_phone']
    ]
]);
