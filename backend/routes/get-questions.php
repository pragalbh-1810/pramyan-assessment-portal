<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user    = authenticate();
$test_id = $_GET['test_id'] ?? null;

if (!$test_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "test_id is required"]);
    exit();
}

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
        skill_type,
        question_number,
        sub_part
    FROM questions
    WHERE test_id = ?
    ORDER BY question_number ASC, sub_part ASC
");
$stmt->execute([$test_id]);
$questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Count unique main question numbers (e.g. Q1, Q2...Q32)
$uniqueMainQuestions = array_unique(
    array_filter(array_column($questions, 'question_number'))
);
$actual_total = count($uniqueMainQuestions);

// Group sub-parts under their parent question number
$grouped = [];
foreach ($questions as $q) {
    $qNum = $q['question_number'];
    if ($qNum) {
        if (!isset($grouped[$qNum])) {
            $grouped[$qNum] = [
                'question_number' => (int)$qNum,
                'sub_parts'       => []
            ];
        }
        $grouped[$qNum]['sub_parts'][] = $q;
    } else {
        // Fallback: questions without a number go flat
        $grouped[] = ['question_number' => null, 'sub_parts' => [$q]];
    }
}

echo json_encode([
    "success"          => true,
    "test_id"          => (int)$test_id,
    "total_questions"  => $actual_total,
    "questions"        => array_values($questions),   // flat list for test-taking UI
    "grouped_questions"=> array_values($grouped),      // grouped for report display
]);