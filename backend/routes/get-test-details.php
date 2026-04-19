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


// STEP 1: authenticate user
$user = authenticate();
$user_id = $user['id'];


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


// STEP 3: get test basic info
$stmt = $pdo->prepare("
    SELECT id, name, duration_mins, class
    FROM tests
    WHERE id = ?
");
$stmt->execute([$test_id]);
$test = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$test) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Test not found"
    ]);
    exit();
}


// STEP 4: count unique main questions (Outputs 32 instead of 60)
$stmt = $pdo->prepare("SELECT q_text FROM questions WHERE test_id = ?");
$stmt->execute([$test_id]);
$questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

$main_questions = [];
foreach ($questions as $q) {
    // Looks for "Q1", "Q21", etc., and counts them as a single question
    if (preg_match('/^Q(\d+)/i', $q['q_text'], $matches)) {
        $main_questions[$matches[1]] = true;
    }
}
$total_questions = count($main_questions);


// STEP 5: check if student already started test
$stmt = $pdo->prepare("
    SELECT id, start_time, is_submitted
    FROM student_tests
    WHERE user_id = ? AND test_id = ?
");
$stmt->execute([$user_id, $test_id]);
$attempt = $stmt->fetch(PDO::FETCH_ASSOC);


// STEP 6: prepare attempt info
$is_attempted = false;
$is_submitted = false;
$start_time = null;

if ($attempt) {
    $is_attempted = true;
    $is_submitted = (bool)$attempt['is_submitted'];
    $start_time = $attempt['start_time'];
}


// STEP 7: response
echo json_encode([
    "success" => true,
    "test" => [
        "id" => (int)$test['id'],
        "name" => $test['name'],
        "class" => (int)$test['class'],
        "duration_mins" => (int)$test['duration_mins'],
        "total_questions" => $total_questions,
        "is_attempted" => $is_attempted,
        "is_submitted" => $is_submitted,
        "start_time" => $start_time
    ]
]);