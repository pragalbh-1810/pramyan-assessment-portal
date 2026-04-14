<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';


// load .env
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


// create JWT
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


// get google token from frontend
$input = json_decode(file_get_contents("php://input"), true);

$google_token = $input["google_token"] ?? null;

if (!$google_token) {

    echo json_encode([
        "success" => false,
        "message" => "Google token missing"
    ]);

    exit();

}


// decode google token
$parts = explode(".", $google_token);

$payload = json_decode(
    base64_decode(strtr($parts[1], '-_', '+/')),
    true
);


// get user details
$email = $payload["email"] ?? null;

$name  = $payload["name"] ?? "Student";


if (!$email) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid Google token"
    ]);

    exit();

}


// check user exists
$stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");

$stmt->execute([$email]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);


// create user if not exists
if (!$user) {

    $stmt = $pdo->prepare("
        INSERT INTO users (name,email,password_hash,role)
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


// create jwt
$secret = getenv("JWT_SECRET");

$token = generateJWT([

    "id" => (int)$userId,

    "email" => $email,

    "role" => "student",

    "iat" => time(),

    "exp" => time() + 604800

], $secret);


// response
echo json_encode([

    "success" => true,

    "token" => $token,

    "user" => [

        "id" => (int)$userId,

        "name" => $name,

        "email" => $email,

        "role" => "student"

    ]

]);

?>