<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ LOAD .env FIRST before anything else
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        putenv("$name=$value");
    }
}

// ✅ THEN load db connection
require_once dirname(__DIR__) . '/config/db.php';


// CREATE JWT FUNCTION
function generateJWT($payload, $secret) {
    $header = rtrim(base64_encode(json_encode([
        "alg" => "HS256",
        "typ" => "JWT"
    ])), '=');
    $payload = rtrim(base64_encode(json_encode($payload)), '=');
    $signature = rtrim(base64_encode(
        hash_hmac('sha256', "$header.$payload", $secret, true)
    ), '=');
    return "$header.$payload.$signature";
}


/*
STEP 1 — Redirect to Google login if no code yet
*/
if (!isset($_GET['code'])) {
    $client_id = getenv("GOOGLE_CLIENT_ID");
    $redirect_uri = "https://pramyan.com/assessment/backend_test/backend/routes/google-auth.php";
    $google_url = "https://accounts.google.com/o/oauth2/v2/auth?"
        . "client_id=$client_id"
        . "&redirect_uri=" . urlencode($redirect_uri)
        . "&response_type=code"
        . "&scope=openid%20email%20profile"
        . "&access_type=online";
    header("Location: $google_url");
    exit();
}


/*
STEP 2 — Exchange code for Google ID token
*/
$code = $_GET['code'];

$token_url = "https://oauth2.googleapis.com/token";
$post_fields = [
    "code"          => $code,
    "client_id"     => getenv("GOOGLE_CLIENT_ID"),
    "client_secret" => getenv("GOOGLE_CLIENT_SECRET"),
    "redirect_uri"  => "http://localhost/pramyan-assessment-portal/backend/routes/google-auth.php",
    "grant_type"    => "authorization_code"
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $token_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_fields));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$id_token = $data["id_token"] ?? null;

if (!$id_token) {
    echo json_encode(["success" => false, "message" => "Failed to get Google token"]);
    exit();
}


/*
STEP 3 — Decode Google token to get user info
*/
$parts = explode(".", $id_token);
$payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

$email = $payload["email"] ?? null;
$name  = $payload["name"] ?? "Student";

if (!$email) {
    echo json_encode(["success" => false, "message" => "Invalid Google token"]);
    exit();
}


/*
STEP 4 — Find or create user
*/
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$needsProfileUpdate = false;
$userClass = null;
$userRole  = 'student';

if (!$user) {
    // Brand new user
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, "", "student"]);
    $userId = $pdo->lastInsertId();
    $needsProfileUpdate = true;
} else {
    $userId    = $user["id"];
    $userClass = $user["class"];
    $userRole  = $user["role"];
    $name      = $user["name"]; // use saved name, not Google name

    // Profile incomplete?
    if (empty($user["class"]) || empty($user["board"]) || empty($user["parent_phone"])) {
        $needsProfileUpdate = true;
    }
}


/*
STEP 5 — Generate JWT with name included
*/
$secret = trim((string)getenv("JWT_SECRET"), " \t\n\r\0\x0B\"'");
if ($secret === '') {
    $secret = "pramyan_super_secret_key_2026";
}
$token = generateJWT([
    "id"    => (int)$userId,
    "name"  => $name,
    "email" => $email,
    "role"  => $userRole,
    "class" => $userClass,
    "iat"   => time(),
    "exp"   => time() + 604800
], $secret);


/*
STEP 6 — Smart routing
*/
$frontend_url = "http://localhost:5173";
$encodedToken = rawurlencode($token);

// Case 1: Profile incomplete → complete profile first
if ($needsProfileUpdate) {
    header("Location: $frontend_url/complete-profile?token=$encodedToken");
    exit();
}

// Case 2: Admin → admin panel
if ($userRole === 'admin') {
    header("Location: $frontend_url/admin?token=$encodedToken");
    exit();
}

// Case 3: Student — map class to test_id
$classToTest = [
    8  => 3,
    9  => 2,
    10 => 1,
];
$testId = $classToTest[$userClass] ?? 1;

// Case 3a: Already submitted → go to report
$stmt = $pdo->prepare("
    SELECT id FROM student_tests 
    WHERE user_id = ? AND test_id = ? AND is_submitted = 1 
    ORDER BY id DESC LIMIT 1
");
$stmt->execute([$userId, $testId]);
$submitted = $stmt->fetch();

if ($submitted) {
    // ✅ Already submitted → show their report
    header("Location: $frontend_url/report/$testId?token=$encodedToken");
    exit();
}

// Case 3b: Started but NOT submitted → resume test
$stmt = $pdo->prepare("
    SELECT id FROM student_tests 
    WHERE user_id = ? AND test_id = ? AND is_submitted = 0 
    ORDER BY id DESC LIMIT 1
");
$stmt->execute([$userId, $testId]);
$inProgress = $stmt->fetch();

if ($inProgress) {
    // ✅ Test in progress → resume it
    header("Location: $frontend_url/test/$testId?token=$encodedToken");
    exit();
}

// Case 3c: Never taken test → go to instructions
header("Location: $frontend_url/instructions/$testId?token=$encodedToken");
exit();