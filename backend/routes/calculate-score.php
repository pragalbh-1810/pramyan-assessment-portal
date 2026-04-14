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
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();
$input = json_decode(file_get_contents('php://input'), true);
$student_test_id = (int)($input['student_test_id'] ?? 0);

if (!$student_test_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'student_test_id required']);
    exit();
}

// Get all responses with correct answers
$stmt = $pdo->prepare("
    SELECT r.selected_option, q.correct, q.section
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    WHERE r.student_test_id = ?
");
$stmt->execute([$student_test_id]);
$responses = $stmt->fetchAll(PDO::FETCH_ASSOC);

$total = 0; 
$math = 0; 
$sci = 0;

foreach ($responses as $r) {
    if ($r['selected_option'] === $r['correct']) {
        $total++;
        if ($r['section'] === 'A') {
            $math++;
        } else {
            $sci++;
        }
    }
}

$totalQ = count($responses);
$pct = $totalQ > 0 ? round(($total / $totalQ) * 100, 2) : 0;

// Save to results table using ON DUPLICATE KEY UPDATE for safety
$insert = $pdo->prepare("
    INSERT INTO results 
    (student_test_id, total_score, math_score, sci_score, overall_pct, status)
    VALUES (?, ?, ?, ?, ?, 'scored')
    ON DUPLICATE KEY UPDATE 
    total_score = VALUES(total_score), 
    math_score = VALUES(math_score), 
    sci_score = VALUES(sci_score), 
    overall_pct = VALUES(overall_pct), 
    status = 'scored'
");

$insert->execute([$student_test_id, $total, $math, $sci, $pct]);

echo json_encode([
    'success' => true, 
    'total_score' => $total,
    'math_score' => $math, 
    'sci_score' => $sci, 
    'overall_pct' => $pct
]);
?>