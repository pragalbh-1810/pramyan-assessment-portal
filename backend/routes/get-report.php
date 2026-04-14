<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();
$user_id = (int)$user['id'];
$test_id = (int)($_GET['test_id'] ?? 0);

if (!$test_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'test_id required']);
    exit();
}

// Get student test attempt
$stmt = $pdo->prepare("
    SELECT id FROM student_tests
    WHERE user_id = ? AND test_id = ?
    ORDER BY id DESC LIMIT 1
");
$stmt->execute([$user_id, $test_id]);
$attempt = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$attempt) {
    echo json_encode(['success' => false, 'message' => 'No attempt found']);
    exit();
}

$student_test_id = $attempt['id'];

// Get results
$stmt = $pdo->prepare("SELECT * FROM results WHERE student_test_id = ?");
$stmt->execute([$student_test_id]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Results not calculated yet']);
    exit();
}

// Count correct, wrong, unanswered
$stmt = $pdo->prepare("
    SELECT COUNT(*) as answered,
    SUM(CASE WHEN r.selected_option = q.correct THEN 1 ELSE 0 END) as correct
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    WHERE r.student_test_id = ?
");
$stmt->execute([$student_test_id]);
$counts = $stmt->fetch(PDO::FETCH_ASSOC);

$total = 32;
$answered = (int)$counts['answered'];
$correct = (int)$counts['correct'];
$wrong = $answered - $correct;
$unanswered = $total - $answered;

$mathMax = 16; 
$sciMax = 16;
$mathPct = $mathMax > 0 ? round(($result['math_score'] / $mathMax) * 100) : 0;
$sciPct = $sciMax > 0 ? round(($result['sci_score'] / $sciMax) * 100) : 0;

echo json_encode([
    'success' => true,
    'total_score' => (int)$result['total_score'],
    'max_score' => $total,
    'math_score' => (int)$result['math_score'],
    'math_max' => $mathMax,
    'sci_score' => (int)$result['sci_score'],
    'sci_max' => $sciMax,
    'overall_pct' => (float)$result['overall_pct'],
    'math_pct' => $mathPct,
    'sci_pct' => $sciPct,
    'correct' => $correct,
    'wrong' => $wrong,
    'unanswered' => $unanswered,
    'answered' => $answered,
    'action_plan' => $result['action_plan'] ?? ""
]);
?>