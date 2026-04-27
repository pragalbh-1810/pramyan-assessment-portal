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

try {
    $user    = authenticate();
    $user_id = (int)$user['id'];
    $role    = $user['role'];
    $test_id = (int)($_GET['test_id'] ?? 0);

    if (!$test_id) {
        echo json_encode(['success' => false, 'message' => 'test_id required']);
        exit();
    }

    // ── 1. GET ATTEMPT ─────────────────────────────────
    if ($role === 'admin') {
        $stmt = $pdo->prepare("
            SELECT id FROM student_tests 
            WHERE test_id = ? 
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([$test_id]);
    } else {
        $stmt = $pdo->prepare("
            SELECT id FROM student_tests 
            WHERE user_id = ? AND test_id = ? 
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([$user_id, $test_id]);
    }

    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$attempt) {
        echo json_encode(['success' => false, 'message' => 'No attempt found']);
        exit();
    }

    $student_test_id = (int)$attempt['id'];

    // ── 2. RESULT ──────────────────────────────────────
    $stmt = $pdo->prepare("SELECT * FROM results WHERE student_test_id = ?");
    $stmt->execute([$student_test_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Results not ready']);
        exit();
    }

    // ── 3. TOTAL QUESTIONS (count unique parent questions, not sub-parts) ──────
$stmt = $pdo->prepare("
    SELECT 
        COUNT(DISTINCT question_number) as total,
        COUNT(DISTINCT CASE WHEN section = 'Math'    AND question_number IS NOT NULL THEN question_number END) as mathMax,
        COUNT(DISTINCT CASE WHEN section = 'Science' AND question_number IS NOT NULL THEN question_number END) as sciMax
    FROM questions 
    WHERE test_id = ?
");
$stmt->execute([$test_id]);
$qStats = $stmt->fetch(PDO::FETCH_ASSOC);

$total   = (int)$qStats['total'];
$mathMax = (int)$qStats['mathMax'];
$sciMax  = (int)$qStats['sciMax'];

    // ── 4. CORRECT COUNT — score per parent question (all sub-parts must be correct) ──
$stmt = $pdo->prepare("
    SELECT 
        q.question_number,
        MAX(CASE WHEN r.selected_option IS NOT NULL AND r.selected_option != '' THEN 1 ELSE 0 END) as was_answered,
        MIN(CASE WHEN r.selected_option = q.correct THEN 1 ELSE 0 END) as all_correct
    FROM questions q
    LEFT JOIN responses r 
        ON r.question_id = q.id 
        AND r.student_test_id = ?
    WHERE q.test_id = ?
      AND q.question_number IS NOT NULL
    GROUP BY q.question_number
");
$stmt->execute([$student_test_id, $test_id]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$answered = 0;
$correct  = 0;
foreach ($rows as $row) {
    if ($row['was_answered']) $answered++;
    if ($row['all_correct'])  $correct++;
}
$wrong      = $answered - $correct;
$unanswered = $total - $answered;

    // ── 5. PERCENTAGES ─────────────────────────────────
    $mathPct    = $mathMax > 0 ? round(($result['math_score'] / $mathMax) * 100) : 0;
    $sciPct     = $sciMax  > 0 ? round(($result['sci_score']  / $sciMax)  * 100) : 0;
    $overallPct = $total   > 0 ? round(($correct / $total) * 100, 2) : 0;

    // ── 6. CHAPTER ─────────────────────────────────────
    $chStmt = $pdo->prepare("
        SELECT chapter, score, max_score, pct, swot_category 
        FROM chapter_scores 
        WHERE result_id = ? 
        ORDER BY pct DESC
    ");
    $chStmt->execute([$result['id']]);
    $chapterScores = $chStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 7. BLOOM ───────────────────────────────────────
    $blStmt = $pdo->prepare("
        SELECT bloom_level, score, max_score, pct 
        FROM bloom_scores 
        WHERE result_id = ? 
        ORDER BY bloom_level ASC
    ");
    $blStmt->execute([$result['id']]);
    $bloomScores = $blStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 8. QUESTIONS ───────────────────────────────────
    $qStmt = $pdo->prepare("
        SELECT 
            q.id, q.q_text, q.chapter, q.section,
            q.bloom_level, q.skill_type, q.correct,
            r.selected_option,
            CASE WHEN r.selected_option = q.correct THEN 1 ELSE 0 END as is_correct
        FROM questions q
        LEFT JOIN responses r 
            ON r.question_id = q.id 
            AND r.student_test_id = ?
        WHERE q.test_id = ?
    ");
    $qStmt->execute([$student_test_id, $test_id]);
    $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 9. RESPONSE ────────────────────────────────────
    echo json_encode([
        'success' => true,
        'student_test_id' => $student_test_id,
        'total_score' => (int)$result['total_score'],
        'max_score' => $total,
        'math_score' => (int)$result['math_score'],
        'math_pct' => $mathPct,
        'sci_score' => (int)$result['sci_score'],
        'sci_pct' => $sciPct,
        'overall_pct' => $overallPct,
        'correct' => $correct,
        'wrong' => $wrong,
        'unanswered' => $unanswered,
        'answered' => $answered,
        'p1' => (float)($result['p1'] ?? 0),
        'p2' => (float)($result['p2'] ?? 0),
        'p3' => (float)($result['p3'] ?? 0),
        'action_plan' => $result['action_plan'] ?? '',
        'chapter_scores' => $chapterScores,
        'bloom_scores' => $bloomScores,
        'questions' => $questions
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}