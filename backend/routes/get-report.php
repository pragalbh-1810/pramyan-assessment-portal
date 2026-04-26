<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ FIX 1: LOAD .env FIRST before loading the database!
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . "=" . trim($value));
    }
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

try {
    $user = authenticate();
    $user_id = (int)$user['id'];
    $role = $user['role'];

    $test_id = (int)($_GET['test_id'] ?? 0);

    if (!$test_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'test_id required']);
        exit();
    }

    /*
    |--------------------------------------------------------------------------
    | GET ATTEMPT
    |--------------------------------------------------------------------------
    */
    if ($role === 'admin') {
        // Admin sees latest attempt of any student for this test
        $stmt = $pdo->prepare("
            SELECT id, user_id 
            FROM student_tests 
            WHERE test_id = ? 
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([$test_id]);
    } else {
        // Student sees only their own latest attempt
        $stmt = $pdo->prepare("
            SELECT id, user_id 
            FROM student_tests 
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

    /*
    |--------------------------------------------------------------------------
    | GET RESULT
    |--------------------------------------------------------------------------
    */
    $stmt = $pdo->prepare("SELECT * FROM results WHERE student_test_id = ?");
    $stmt->execute([$student_test_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Results not calculated yet']);
        exit();
    }

    /*
    |--------------------------------------------------------------------------
    | COUNT ANSWERS & QUESTION TOTALS (Optimized)
    |--------------------------------------------------------------------------
    */
    // Get correct/answered counts
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as answered,
            SUM(CASE WHEN r.selected_option = q.correct THEN 1 ELSE 0 END) as correct
        FROM responses r
        JOIN questions q ON r.question_id = q.id
        WHERE r.student_test_id = ?
    ");
    $stmt->execute([$student_test_id]);
    $counts = $stmt->fetch(PDO::FETCH_ASSOC);

    // ✅ FIX 2: Changed 'Mathematics' to 'Math' to perfectly match your database!
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN section = 'Math' THEN 1 ELSE 0 END) as mathMax,
            SUM(CASE WHEN section = 'Science' THEN 1 ELSE 0 END) as sciMax
        FROM questions 
        WHERE test_id = ?
    ");
    $stmt->execute([$test_id]);
    $qStats = $stmt->fetch(PDO::FETCH_ASSOC);

    $total = (int)$qStats['total'];
    $mathMax = (int)$qStats['mathMax'];
    $sciMax = (int)$qStats['sciMax'];

    $answered = (int)$counts['answered'];
    $correct = (int)$counts['correct'];
    $wrong = $answered - $correct;
    $unanswered = $total - $answered;

    /*
    |--------------------------------------------------------------------------
    | SECTION %
    |--------------------------------------------------------------------------
    */
    $mathPct = $mathMax > 0 ? round(($result['math_score'] / $mathMax) * 100) : 0;
    $sciPct = $sciMax > 0 ? round(($result['sci_score'] / $sciMax) * 100) : 0;

    // Get test class
    $stmt = $pdo->prepare("SELECT class FROM tests WHERE id = ?");
    $stmt->execute([$test_id]);
    $testRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $test_class = $testRow ? (int)$testRow['class'] : 0;

    /*
    |--------------------------------------------------------------------------
    | CHAPTER & BLOOM SCORES
    |--------------------------------------------------------------------------
    */
    $chStmt = $pdo->prepare("
        SELECT cs.chapter, cs.score, cs.max_score, cs.pct, cs.swot_category,
               MAX(q.section) as subject, MAX(q.risk_if_weak) as risk_if_weak
        FROM chapter_scores cs
        LEFT JOIN questions q ON q.chapter = cs.chapter AND q.test_id = ?
        WHERE cs.result_id = ? 
        GROUP BY cs.chapter, cs.score, cs.max_score, cs.pct, cs.swot_category
        ORDER BY cs.pct DESC
    ");
    $chStmt->execute([$test_id, $result['id']]);
    $chapterScores = $chStmt->fetchAll(PDO::FETCH_ASSOC);

    $blStmt = $pdo->prepare("SELECT bloom_level, score, max_score, pct FROM bloom_scores WHERE result_id = ? ORDER BY bloom_level ASC");
    $blStmt->execute([$result['id']]);
    $bloomScores = $blStmt->fetchAll(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | QUESTION-WISE DETAIL
    |--------------------------------------------------------------------------
    */
    $qStmt = $pdo->prepare("
        SELECT 
            q.id as question_id, q.q_text, q.opt_a, q.opt_b, q.opt_c, q.opt_d, 
            q.correct, q.chapter, q.bloom_level, q.skill_type, q.section,
            r.selected_option,
            CASE WHEN r.selected_option = q.correct THEN 1 ELSE 0 END as is_correct
        FROM questions q
        LEFT JOIN responses r ON r.question_id = q.id AND r.student_test_id = ?
        WHERE q.test_id = ?
        ORDER BY q.section, q.id
    ");
    $qStmt->execute([$student_test_id, $test_id]);
    $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | FINAL RESPONSE
    |--------------------------------------------------------------------------
    */
    echo json_encode([
        'success'         => true,
        'student_test_id' => $student_test_id,
        'test_class'      => $test_class,
        'total_score'     => (int)$result['total_score'],
        'max_score'       => $total,
        'math_score'      => (int)$result['math_score'],
        'math_max'        => $mathMax,
        'sci_score'       => (int)$result['sci_score'],
        'sci_max'         => $sciMax,
        'overall_pct'     => (float)$result['overall_pct'],
        'math_pct'        => (int)$mathPct,
        'sci_pct'         => (int)$sciPct,
        'correct'         => $correct,
        'wrong'           => $wrong,
        'unanswered'      => $unanswered,
        'answered'        => $answered,
        'p1'              => (float)($result['p1'] ?? 0),
        'p2'              => (float)($result['p2'] ?? 0),
        'p3'              => (float)($result['p3'] ?? 0),
        'action_plan'     => $result['action_plan'] ?? "",
        'test_class'      => $test_class,
        'chapter_scores'  => $chapterScores,
        'bloom_scores'    => $bloomScores,
        'questions'       => $questions
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal Server Error',
        'error'   => $e->getMessage() // Remove this line in production for security
    ]);
}