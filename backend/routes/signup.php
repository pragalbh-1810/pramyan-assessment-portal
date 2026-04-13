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

// Simple JWT generator — no Composer needed
function generateJWT($payload, $secret) {
    $header    = rtrim(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])), '=');
    $payload   = rtrim(base64_encode(json_encode($payload)), '=');
    $signature = rtrim(base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)), '=');
    return "$header.$payload.$signature";
}

// Get input
$input        = json_decode(file_get_contents('php://input'), true);
$name         = trim($input['name']         ?? '');
$email        = trim($input['email']        ?? '');
$password     =      $input['password']     ?? '';
$phone        = trim($input['phone']        ?? '');
$parent_phone = trim($input['parent_phone'] ?? '');
$class_name   = trim($input['class_name']   ?? '');
$board        = trim($input['board']        ?? '');

// Validation
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Name, email and password are required'
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
    exit();
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email already registered'
    ]);
    exit();
}

// Hash password with bcrypt
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insert into users table
$stmt = $pdo->prepare("
    INSERT INTO users
        (name, email, password, phone, parent_phone, class_name, board, role)
    VALUES
        (?, ?, ?, ?, ?, ?, ?, 'student')
");
$stmt->execute([
    $name,
    $email,
    $hashedPassword,
    $phone,
    $parent_phone,
    $class_name,
    $board
]);

$userId = $pdo->lastInsertId();

// Generate JWT
$secret = "pramyan_super_secret_key_2026";
$token  = generateJWT([
    'id'    => (int)$userId,
    'email' => $email,
    'role'  => 'student',
    'iat'   => time(),
    'exp'   => time() + (7 * 24 * 60 * 60)
], $secret);

http_response_code(201);
echo json_encode([
    'success' => true,
    'message' => 'Account created successfully',
    'token'   => $token,
    'user'    => [
        'id'    => (int)$userId,
        'name'  => $name,
        'email' => $email,
        'role'  => 'student'
    ]
]);