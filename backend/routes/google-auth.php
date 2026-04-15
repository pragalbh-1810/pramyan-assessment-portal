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


// LOAD .env
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


// CREATE JWT FUNCTION
function generateJWT($payload, $secret) {

    $header = rtrim(strtr(base64_encode(json_encode([
        "alg" => "HS256",
        "typ" => "JWT"
    ])), '+/', '-_'), '=');

    $payload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');

    $signature = rtrim(strtr(base64_encode(
        hash_hmac('sha256', "$header.$payload", $secret, true)
    ), '+/', '-_'), '=');

    return "$header.$payload.$signature";
}



/*
STEP 1
If Google has NOT redirected back yet,
redirect user to Google login
*/
if (!isset($_GET['code'])) {

    $client_id = getenv("GOOGLE_CLIENT_ID");

    $redirect_uri =
        "http://localhost/pramyan-assessment-portal/backend/routes/google-auth.php";

    $google_url =
        "https://accounts.google.com/o/oauth2/v2/auth?"
        . "client_id=$client_id"
        . "&redirect_uri=" . urlencode($redirect_uri)
        . "&response_type=code"
        . "&scope=openid%20email%20profile"
        . "&access_type=online";

    header("Location: $google_url");
    exit();
}



/*
STEP 2
Google redirected back with authorization code
*/
$code = $_GET['code'];



/*
STEP 3
Exchange code for Google ID token
*/
$token_url = "https://oauth2.googleapis.com/token";

$post_fields = [

    "code" => $code,

    "client_id" => getenv("GOOGLE_CLIENT_ID"),

    "client_secret" => getenv("GOOGLE_CLIENT_SECRET"),

    "redirect_uri" =>
        "http://localhost/pramyan-assessment-portal/backend/routes/google-auth.php",

    "grant_type" => "authorization_code"
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

    echo json_encode([
        "success" => false,
        "message" => "Failed to get Google token"
    ]);

    exit();
}



/*
STEP 4
Decode token to get user info
*/
$parts = explode(".", $id_token);

$payload = json_decode(
    base64_decode(strtr($parts[1], '-_', '+/')),
    true
);

$email = $payload["email"] ?? null;
$name  = $payload["name"] ?? "Student";


if (!$email) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid Google token"
    ]);

    exit();
}



/*
STEP 5
Check if user exists
*/
$stmt = $pdo->prepare(
    "SELECT * FROM users WHERE email=?"
);

$stmt->execute([$email]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);



/*
STEP 6
Create user if not exists
*/
if (!$user) {

    $stmt = $pdo->prepare("
        INSERT INTO users
        (name,email,password_hash,role)
        VALUES (?,?,?,?)
    ");

    $stmt->execute([
        $name,
        $email,
        "",
        "student"
    ]);

    $userId = $pdo->lastInsertId();

} else {

    $userId = $user["id"];
}



/*
STEP 7
Create JWT
*/
$secret = getenv("JWT_SECRET");

$token = generateJWT([

    "id" => (int)$userId,

    "email" => $email,

    "role" => "student",

    "iat" => time(),

    "exp" => time() + 604800

], $secret);




/*
STEP 8
Redirect back to React app with token
*/

    header(
    "Location: http://localhost:5173/google-callback?token=$token&role=student"
);


exit();