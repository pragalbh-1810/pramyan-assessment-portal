<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

try {
    $user = authenticate();
    $user_id = (int)$user['id'];

    $input = json_decode(file_get_contents('php://input'), true);
    $student_test_id = isset($input['student_test_id']) ? (int)$input['student_test_id'] : null;

    if (!$student_test_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'student_test_id is required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT id, test_id, is_submitted FROM student_tests WHERE id = ? AND user_id = ?");
    $stmt->execute([$student_test_id, $user_id]);
    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$attempt) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access to this test attempt']);
        exit();
    }

    if ((int)$attempt['is_submitted'] === 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Test is already submitted and locked']);
        exit();
    }

    $test_id = (int)$attempt['test_id'];

    // Lock the test
    $pdo->prepare("UPDATE student_tests SET is_submitted = 1 WHERE id = ?")
        ->execute([$student_test_id]);

    $calcStmt = $pdo->prepare("
        SELECT 
            q.correct, q.section, q.chapter, q.bloom_level, q.skill_type, r.selected_option
        FROM questions q
        LEFT JOIN responses r 
            ON r.question_id = q.id AND r.student_test_id = ?
        WHERE q.test_id = ?
    ");
    $calcStmt->execute([$student_test_id, $test_id]);
    $responses = $calcStmt->fetchAll(PDO::FETCH_ASSOC);

    // INITIALIZE COUNTERS
    $total = 0; $math = 0; $sci = 0;

    $chapterStats = [];
    $bloomStats   = [];
    $skillStats   = [
        "P1" => ["score" => 0, "total" => 0],
        "P2" => ["score" => 0, "total" => 0],
        "P3" => ["score" => 0, "total" => 0],
    ];

    // LOOP & CALCULATE (1 Row = 1 Mark)
    foreach ($responses as $r) {
        $marks = 1; // FIX: Every sub-question row is worth exactly 1 mark
        
        $selected = strtolower(trim((string)($r['selected_option'] ?? '')));
        $answer   = strtolower(trim((string)($r['correct'] ?? '')));
        $correct = ($selected !== '' && $selected === $answer) ? $marks : 0;
        $total += $correct;

        // Section score
        if ($r['section'] === 'Math') {
            $math += $correct;
        } else {
            $sci += $correct;
        }

        // Chapter grouping
        $ch = $r['chapter'];
        if (!isset($chapterStats[$ch])) $chapterStats[$ch] = ["score" => 0, "total" => 0];
        $chapterStats[$ch]['score'] += $correct;
        $chapterStats[$ch]['total'] += $marks;

        // Bloom grouping
        $bl = $r['bloom_level'];
        if (!isset($bloomStats[$bl])) $bloomStats[$bl] = ["score" => 0, "total" => 0];
        $bloomStats[$bl]['score'] += $correct;
        $bloomStats[$bl]['total'] += $marks;

        // Skill P1/P2/P3 grouping
        $sk = $r['skill_type'];
        if (strpos($sk, 'P1') !== false) {
            $skillStats['P1']['total'] += $marks;
            $skillStats['P1']['score'] += $correct;
        }
        if (strpos($sk, 'P2') !== false) {
            $skillStats['P2']['total'] += $marks;
            $skillStats['P2']['score'] += $correct;
        }
        if (strpos($sk, 'P3') !== false) {
            $skillStats['P3']['total'] += $marks;
            $skillStats['P3']['score'] += $correct;
        }
    }

    // CALCULATE PERCENTAGES
    $allQStmt = $pdo->prepare("SELECT COUNT(*) FROM questions WHERE test_id = (SELECT test_id FROM student_tests WHERE id = ?)");
    $allQStmt->execute([$student_test_id]);
    $totalQuestions = (int)$allQStmt->fetchColumn(); // Will be 60
    $pct = $totalQuestions > 0 ? round(($total / $totalQuestions) * 100, 2) : 0;

    $p1 = $skillStats['P1']['total'] > 0 ? round(($skillStats['P1']['score'] / $skillStats['P1']['total']) * 100, 2) : 0;
    $p2 = $skillStats['P2']['total'] > 0 ? round(($skillStats['P2']['score'] / $skillStats['P2']['total']) * 100, 2) : 0;
    $p3 = $skillStats['P3']['total'] > 0 ? round(($skillStats['P3']['score'] / $skillStats['P3']['total']) * 100, 2) : 0;

    $action_plan = json_encode([
        "week1" => "Focus on weak chapters",
        "week2" => "Practice Bloom levels L2 and L3",
        "week3" => "Revise mistakes",
        "week4" => "Attempt mock test"
    ]);

    // SAVE MAIN RESULT
    $insertResult = $pdo->prepare("
        INSERT INTO results
            (student_test_id, total_score, math_score, sci_score, overall_pct, status, p1, p2, p3, action_plan)
        VALUES (?, ?, ?, ?, ?, 'scored', ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_score = VALUES(total_score), math_score = VALUES(math_score), sci_score = VALUES(sci_score),
            overall_pct = VALUES(overall_pct), p1 = VALUES(p1), p2 = VALUES(p2), p3 = VALUES(p3),
            action_plan = VALUES(action_plan), status = 'scored'
    ");
    $insertResult->execute([$student_test_id, $total, $math, $sci, $pct, $p1, $p2, $p3, $action_plan]);

    $result_id = $pdo->lastInsertId() ?: $pdo->query("SELECT id FROM results WHERE student_test_id = $student_test_id")->fetchColumn();

    $pdo->prepare("DELETE FROM chapter_scores WHERE result_id = ?")->execute([$result_id]);
    $pdo->prepare("DELETE FROM bloom_scores WHERE result_id = ?")->execute([$result_id]);

    // Save chapter SWOT scores
    $t_strength = 70;
    $t_opportunity = 40;

    foreach ($chapterStats as $chapter => $data) {
        $cpct = $data['total'] > 0 ? round(($data['score'] / $data['total']) * 100, 2) : 0;

        if ($cpct >= $t_strength)         $swot = "Strength";
        elseif ($cpct >= $t_opportunity)  $swot = "Opportunity";
        else                              $swot = "Weakness";

        $pdo->prepare("
            INSERT INTO chapter_scores (result_id, chapter, score, max_score, pct, swot_category)
            VALUES (?, ?, ?, ?, ?, ?)
        ")->execute([$result_id, $chapter, $data['score'], $data['total'], $cpct, $swot]);
    }

    foreach ($bloomStats as $bloom => $data) {
        $bpct = $data['total'] > 0 ? round(($data['score'] / $data['total']) * 100, 2) : 0;

        $pdo->prepare("
            INSERT INTO bloom_scores (result_id, bloom_level, score, max_score, pct)
            VALUES (?, ?, ?, ?, ?)
        ")->execute([$result_id, $bloom, $data['score'], $data['total'], $bpct]);
    }

    http_response_code(200);
    echo json_encode([
        'success'   => true,
        'submitted' => true,
        'scored'    => true,
        'message'   => 'Test locked and graded successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>