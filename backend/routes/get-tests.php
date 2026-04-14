<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';


// STEP 1: verify token
$user = authenticate();

// STEP 2: get class from token
$class = $user['class'];

if (!$class) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Class not found in token"
    ]);
    exit();
}


// STEP 3: fetch tests for that class
$stmt = $pdo->prepare("
    SELECT id, name, duration_mins, class
    FROM tests
    WHERE class = ?
");

$stmt->execute([$class]);

$tests = $stmt->fetchAll(PDO::FETCH_ASSOC);


// STEP 4: return response
echo json_encode([
    "success" => true,
    "class" => $class,
    "tests" => $tests
]);