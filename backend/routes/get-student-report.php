<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

try {
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

    // ── 1. Student ─────────────────────────────────────────
    $stStmt = $pdo->prepare("
        SELECT id, name, email, class, parent_phone 
        FROM users 
        WHERE id = ? AND role = 'student'
    ");
    $stStmt->execute([$student_id]);
    $student = $stStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit();
    }

    // ── 2. Attempt ─────────────────────────────────────────
    $atStmt = $pdo->prepare("
        SELECT id, test_id 
        FROM student_tests 
        WHERE user_id = ? AND test_id = ? AND is_submitted = 1 
        ORDER BY id DESC LIMIT 1
    ");
    $atStmt->execute([$student_id, $test_id]);
    $attempt = $atStmt->fetch(PDO::FETCH_ASSOC);

    if (!$attempt) {
        echo json_encode(['success' => false, 'message' => 'No attempt found']);
        exit();
    }

    $student_test_id  = (int)$attempt['id'];
    $resolved_test_id = (int)$attempt['test_id'];

    // ── 3. Result ──────────────────────────────────────────
    $rStmt = $pdo->prepare("SELECT * FROM results WHERE student_test_id = ?");
    $rStmt->execute([$student_test_id]);
    $result = $rStmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Results not ready']);
        exit();
    }

    // ── 4. TOTAL QUESTIONS ─────────────────────────────────
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(DISTINCT question_number) as total,
            COUNT(DISTINCT CASE WHEN section = 'Math'    AND question_number IS NOT NULL THEN question_number END) as mathMax,
            COUNT(DISTINCT CASE WHEN section = 'Science' AND question_number IS NOT NULL THEN question_number END) as sciMax
        FROM questions 
        WHERE test_id = ?
    ");
    $stmt->execute([$resolved_test_id]);
    $qStats = $stmt->fetch(PDO::FETCH_ASSOC);

    $total   = (int)$qStats['total'];
    $mathMax = (int)$qStats['mathMax'];
    $sciMax  = (int)$qStats['sciMax'];

    // ── 5. CORRECT COUNT ───────────────────────────────────
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
    $stmt->execute([$student_test_id, $resolved_test_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $answered = 0;
    $correct  = 0;
    foreach ($rows as $row) {
        if ($row['was_answered']) $answered++;
        if ($row['all_correct'])  $correct++;
    }
    $wrong      = $answered - $correct;
    $unanswered = $total - $answered;

    // ── 6. Percentages ─────────────────────────────────────
    $mathPct    = $mathMax > 0 ? round(($result['math_score'] / $mathMax) * 100) : 0;
    $sciPct     = $sciMax  > 0 ? round(($result['sci_score']  / $sciMax)  * 100) : 0;
    $overallPct = $total   > 0 ? round(($correct / $total) * 100, 2) : 0;

    // ── 7. Chapter + Bloom ────────────────────────────────
    $chapterScoresStmt = $pdo->prepare("
        SELECT chapter, score, max_score, pct, swot_category 
        FROM chapter_scores 
        WHERE result_id = ? 
        ORDER BY pct DESC
    ");
    $chapterScoresStmt->execute([$result['id']]);
    $ch_scores = $chapterScoresStmt->fetchAll(PDO::FETCH_ASSOC);

    $bloomScoresStmt = $pdo->prepare("
        SELECT bloom_level, score, max_score, pct 
        FROM bloom_scores 
        WHERE result_id = ? 
        ORDER BY bloom_level ASC
    ");
    $bloomScoresStmt->execute([$result['id']]);
    $bl_scores = $bloomScoresStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 8. Questions ───────────────────────────────────────
    $qdStmt = $pdo->prepare("
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
    $qdStmt->execute([$student_test_id, $resolved_test_id]);
    $questions = $qdStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 9. Response ───────────────────────────────────────
    echo json_encode([
        'success' => true,
        'student' => $student,
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
        'chapter_scores' => $ch_scores ? $ch_scores : [], // Safely force empty array if false
        'bloom_scores' => $bl_scores ? $bl_scores : [],   // Safely force empty array if false
        'questions' => $questions ? $questions : []       // Safely force empty array if false
    ]);

} catch (Exception $e) {
    // Catch ANY database crash and return clean JSON instead of raw HTML!
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Backend Database Error: ' . $e->getMessage()
    ]);
}