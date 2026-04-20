<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();

if (!in_array($user['role'], ['teacher', 'admin'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

$student_id = (int)($_GET['student_id'] ?? 0);
$test_id    = (int)($_GET['test_id']    ?? 0);

if (!$student_id || !$test_id) {
    echo json_encode(['success' => false, 'message' => 'student_id and test_id required']);
    exit();
}

// Get student info
$stStmt = $pdo->prepare("SELECT id, name, email, class, parent_phone FROM users WHERE id = ? AND role = 'student'");
$stStmt->execute([$student_id]);
$student = $stStmt->fetch(PDO::FETCH_ASSOC);
if (!$student) { echo json_encode(['success' => false, 'message' => 'Student not found']); exit(); }

// Get latest submitted attempt
$atStmt = $pdo->prepare("SELECT id FROM student_tests WHERE user_id = ? AND test_id = ? AND is_submitted = 1 ORDER BY id DESC LIMIT 1");
$atStmt->execute([$student_id, $test_id]);
$attempt = $atStmt->fetch(PDO::FETCH_ASSOC);
if (!$attempt) { echo json_encode(['success' => false, 'message' => 'No attempt found', 'student' => $student]); exit(); }

$student_test_id = (int)$attempt['id'];

// Get result
$rStmt = $pdo->prepare("SELECT * FROM results WHERE student_test_id = ?");
$rStmt->execute([$student_test_id]);
$result = $rStmt->fetch(PDO::FETCH_ASSOC);
if (!$result) { echo json_encode(['success' => false, 'message' => 'Results not ready']); exit(); }

// ✅ Dynamically get question totals from DB
$qStmt = $pdo->prepare("
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN section = 'Math'    THEN 1 ELSE 0 END) as mathMax,
        SUM(CASE WHEN section = 'Science' THEN 1 ELSE 0 END) as sciMax
    FROM questions WHERE test_id = ?
");
$qStmt->execute([$test_id]);
$qStats  = $qStmt->fetch(PDO::FETCH_ASSOC);
$total   = (int)$qStats['total'];
$mathMax = (int)$qStats['mathMax'];
$sciMax  = (int)$qStats['sciMax'];

// Count answers
$cStmt = $pdo->prepare("
    SELECT COUNT(*) AS answered,
    SUM(CASE WHEN r.selected_option = q.correct THEN 1 ELSE 0 END) AS correct
    FROM responses r JOIN questions q ON r.question_id = q.id
    WHERE r.student_test_id = ?
");
$cStmt->execute([$student_test_id]);
$counts   = $cStmt->fetch(PDO::FETCH_ASSOC);
$correct  = (int)$counts['correct'];
$answered = (int)$counts['answered'];
$wrong    = $answered - $correct;

// ✅ All dynamic - no hardcoded numbers
$unanswered = $total - $answered;
$mathPct    = $mathMax > 0 ? round(($result['math_score'] / $mathMax) * 100) : 0;
$sciPct     = $sciMax  > 0 ? round(($result['sci_score']  / $sciMax)  * 100) : 0;

// ✅ overall_pct based on total questions, not just answered
$overallPct = $total > 0 ? round(($correct / $total) * 100, 2) : 0;

// Chapter & Bloom scores
$chStmt = $pdo->prepare("SELECT chapter, score, max_score, pct, swot_category FROM chapter_scores WHERE result_id = ? ORDER BY pct DESC");
$chStmt->execute([$result['id']]);
$chapterScores = $chStmt->fetchAll(PDO::FETCH_ASSOC);

$blStmt = $pdo->prepare("SELECT bloom_level, score, max_score, pct FROM bloom_scores WHERE result_id = ? ORDER BY bloom_level ASC");
$blStmt->execute([$result['id']]);
$bloomScores = $blStmt->fetchAll(PDO::FETCH_ASSOC);

// Question detail
$qdStmt = $pdo->prepare("
    SELECT q.id as question_id, q.q_text, q.opt_a, q.opt_b, q.opt_c, q.opt_d,
    q.correct, q.chapter, q.bloom_level, q.skill_type, q.section,
    r.selected_option, CASE WHEN r.selected_option = q.correct THEN 1 ELSE 0 END as is_correct
    FROM questions q LEFT JOIN responses r
    ON r.question_id = q.id AND r.student_test_id = ?
    WHERE q.test_id = ? ORDER BY q.section, q.id
");
$qdStmt->execute([$student_test_id, $test_id]);
$questions = $qdStmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success'         => true,
    'student'         => $student,
    'student_test_id' => $student_test_id,
    'total_score'     => (int)$result['total_score'],
    'max_score'       => $total,        // ✅ dynamic
    'math_score'      => (int)$result['math_score'],
    'math_max'        => $mathMax,      // ✅ dynamic
    'math_pct'        => $mathPct,      // ✅ dynamic
    'sci_score'       => (int)$result['sci_score'],
    'sci_max'         => $sciMax,       // ✅ dynamic
    'sci_pct'         => $sciPct,       // ✅ dynamic
    'overall_pct'     => $overallPct,   // ✅ fixed: correct/total not correct/answered
    'correct'         => $correct,
    'wrong'           => $wrong,
    'unanswered'      => $unanswered,   // ✅ dynamic
    'answered'        => $answered,
    'p1'              => (float)($result['p1'] ?? 0),
    'p2'              => (float)($result['p2'] ?? 0),
    'p3'              => (float)($result['p3'] ?? 0),
    'action_plan'     => $result['action_plan'] ?? '',
    'chapter_scores'  => $chapterScores,
    'bloom_scores'    => $bloomScores,
    'questions'       => $questions
]);