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

// input
$input        = json_decode(file_get_contents('php://input'), true);

$name         = trim($input['name'] ?? '');
$email        = trim($input['email'] ?? '');
$password     = $input['password'] ?? '';
$class        = $input['class'] ?? null;
$board        = trim($input['board'] ?? '');
$parent_phone = trim($input['parent_phone'] ?? '');

// validation
if (!$name || !$email || !$password) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Name, email and password required"
    ]);

    exit();
}

// email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success"=>false,
        "message"=>"Invalid email"
    ]);

    exit();
}

// check existing email
$stmt = $pdo->prepare("SELECT id FROM users WHERE email=?");
$stmt->execute([$email]);

if ($stmt->fetch()) {

    echo json_encode([
        "success"=>false,
        "message"=>"Email already exists"
    ]);

    exit();
}

// hash password
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// insert user
$stmt = $pdo->prepare("
INSERT INTO users
(name,email,password_hash,class,board,parent_phone,role)
VALUES
(?,?,?,?,?,?,'student')
");

$stmt->execute([
$name,
$email,
$password_hash,
$class,
$board,
$parent_phone
]);

$userId = $pdo->lastInsertId();

// generate jwt
$secret = "pramyan_super_secret_key_2026";

$token = generateJWT([
"id" => (int)$userId,
"email"=>$email,
"name" => $name,
"role"=>"student",
"iat"=>time(),
"exp"=>time()+604800
],$secret);

// response
echo json_encode([
"success"=>true,
"message"=>"Account created successfully",
"token"=>$token,
"user"=>[
"id"=>(int)$userId,
"name"=>$name,
"email"=>$email,
"role"=>"student"
]
]);