<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();
$user_id = $user['id'];
$test_id = $_GET['test_id'] ?? null;

if (!$test_id) { http_response_code(400); echo json_encode(["success" => false, "message" => "test_id is required"]); exit(); }

$stmt = $pdo->prepare("SELECT id, name, duration_mins, class FROM tests WHERE id = ?");
$stmt->execute([$test_id]);
$test = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$test) { http_response_code(404); echo json_encode(["success" => false, "message" => "Test not found"]); exit(); }

// Send exact count for correct pagination
$stmt = $pdo->prepare("SELECT COUNT(id) FROM questions WHERE test_id = ?");
$stmt->execute([$test_id]);
$total_questions = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT id, start_time, is_submitted FROM student_tests WHERE user_id = ? AND test_id = ?");
$stmt->execute([$user_id, $test_id]);
$attempt = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "test" => [
        "id" => (int)$test['id'],
        "name" => $test['name'],
        "class" => (int)$test['class'],
        "duration_mins" => (int)$test['duration_mins'],
        "total_questions" => $total_questions,
        "is_attempted" => $attempt ? true : false,
        "is_submitted" => $attempt ? (bool)$attempt['is_submitted'] : false,
        "start_time" => $attempt ? $attempt['start_time'] : null
    ]
]);
?>