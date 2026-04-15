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


// STEP 1: verify login token
$user = authenticate();


// STEP 2: get test_id from URL
$test_id = $_GET['test_id'] ?? null;

if (!$test_id) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "test_id is required"
    ]);
    exit();
}


// STEP 3: fetch questions (without correct answer)
// FIXED: Added q_image to the SELECT statement
$stmt = $pdo->prepare("
    SELECT 
        id,
        section,
        q_text,
        q_image,
        opt_a,
        opt_b,
        opt_c,
        opt_d,
        chapter,
        bloom_level,
        skill_type
    FROM questions
    WHERE test_id = ?
");

$stmt->execute([$test_id]);

$questions = $stmt->fetchAll(PDO::FETCH_ASSOC);


// STEP 4: return response
echo json_encode([
    "success" => true,
    "test_id" => (int)$test_id,
    "total_questions" => count($questions),
    "questions" => $questions
]);