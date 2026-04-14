<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';

// --------------------------------------------------------------------
// LIGHTWEIGHT .ENV LOADER
// --------------------------------------------------------------------
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue; // Skip comments
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'"); // Strip spaces and quotes
        putenv(sprintf('%s=%s', $name, $value));
        $_ENV[$name] = $value;
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Missing .env file']);
    exit();
}

function generateJWT($payload, $secret) {
    $header    = rtrim(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])), '=');
    $payload   = rtrim(base64_encode(json_encode($payload)), '=');
    $signature = rtrim(base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)), '=');
    return "$header.$payload.$signature";
}

// Safely grab credentials from the .env file
$clientId     = getenv('GOOGLE_CLIENT_ID');
$clientSecret = getenv('GOOGLE_CLIENT_SECRET');
$redirectUri  = getenv('GOOGLE_REDIRECT_URI');
$jwtSecret    = getenv('JWT_SECRET');

// Step 1 — Redirect to Google
if (!isset($_GET['code'])) {
    $params = http_build_query([
        'client_id'     => $clientId,
        'redirect_uri'  => $redirectUri,
        'response_type' => 'code',
        'scope'         => 'openid email profile',
        'access_type'   => 'online',
        'prompt'        => 'select_account'
    ]);
    header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
    exit();
}

// Step 2 — Exchange code for tokens
$code = $_GET['code'];

$tokenResponse = file_get_contents('https://oauth2.googleapis.com/token', false,
    stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query([
                'code'          => $code,
                'client_id'     => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri'  => $redirectUri,
                'grant_type'    => 'authorization_code'
            ])
        ]
    ])
);

if (!$tokenResponse) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to get token from Google']);
    exit();
}

$tokenData = json_decode($tokenResponse, true);

if (!isset($tokenData['id_token'])) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'No ID token received from Google']);
    exit();
}

// Step 3 — Decode the ID token safely (Fixing Base64URL format)
$idToken  = $tokenData['id_token'];
$parts    = explode('.', $idToken);
$b64 = strtr($parts[1], '-_', '+/');
$payload  = json_decode(base64_decode($b64), true);

$email    = $payload['email'] ?? null;
$name     = $payload['name']  ?? 'Student';

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Could not get email from Google']);
    exit();
}

// Step 4 — Find existing user or create new one (Strict Schema Match)
$stmt = $pdo->prepare("SELECT id, name, email, role, parent_phone FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // New user — insert without a password since they use Google
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, '', 'student')
    ");
    $stmt->execute([$name, $email]);
    $userId = $pdo->lastInsertId();

    $user = [
        'id'           => (int)$userId,
        'name'         => $name,
        'email'        => $email,
        'role'         => 'student',
        'parent_phone' => null
    ];
}

// Step 5 — Generate our own JWT
$token = generateJWT([
    'id'    => (int)$user['id'],
    'email' => $user['email'],
    'role'  => $user['role'],
    'iat'   => time(),
    'exp'   => time() + (7 * 24 * 60 * 60)
], $jwtSecret);

// Step 6 — Redirect back to React frontend
$frontendUrl = 'http://localhost:5173/auth/google/callback';
header('Location: ' . $frontendUrl . '?token=' . $token . '&name=' . urlencode($user['name']) . '&email=' . urlencode($user['email']) . '&role=' . $user['role']);
exit();
?>