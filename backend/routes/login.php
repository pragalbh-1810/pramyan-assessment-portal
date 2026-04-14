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

<<<<<<< HEAD
function generateJWT($payload, $secret) {
    $header    = rtrim(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])), '=');
    $payload   = rtrim(base64_encode(json_encode($payload)), '=');
    $signature = rtrim(base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)), '=');
=======
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function generateJWT($payload, $secret) {

    $header = base64url_encode(json_encode([
        'alg' => 'HS256',
        'typ' => 'JWT'
    ]));

    $payload = base64url_encode(json_encode($payload));

    $signature = base64url_encode(
        hash_hmac('sha256', "$header.$payload", $secret, true)
    );

>>>>>>> origin/new-feature
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

// IMPORTANT CHANGE HERE
$stmt = $pdo->prepare("
<<<<<<< HEAD
    SELECT id, name, email, password_hash, role, parent_phone
=======
    SELECT id, name, email, password_hash, role, parent_phone, class
>>>>>>> origin/new-feature
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

// IMPORTANT CHANGE HERE
if (!password_verify($password, $user['password_hash'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Incorrect password'
    ]);

    exit();
}

// generate token
$secret = "pramyan_super_secret_key_2026";

$token  = generateJWT([
    'id'    => (int)$user['id'],
    'email' => $user['email'],
    'role'  => $user['role'],
<<<<<<< HEAD
=======
    'class' => $user['class'],
>>>>>>> origin/new-feature
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
<<<<<<< HEAD
        'parent_phone' => $user['parent_phone']
    ]
]);
=======
        'class'=>$user['class'],
        'parent_phone' => $user['parent_phone']
    ]
]);
>>>>>>> origin/new-feature
