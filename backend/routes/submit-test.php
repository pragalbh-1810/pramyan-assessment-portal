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

    // Security Check
    $stmt = $pdo->prepare("SELECT id, is_submitted FROM student_tests WHERE id = ? AND user_id = ?");
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

    // Lock the test
    $pdo->prepare("UPDATE student_tests SET is_submitted = 1 WHERE id = ?")
        ->execute([$student_test_id]);

    // =========================================
    // FETCH ALL RESPONSES WITH QUESTION DETAILS
    // =========================================
    $calcStmt = $pdo->prepare("
        SELECT 
            r.selected_option,
            q.correct,
            q.section,
            q.chapter,
            q.bloom_level,
            q.skill_type
        FROM responses r
        JOIN questions q ON r.question_id = q.id
        WHERE r.student_test_id = ?
    ");
    $calcStmt->execute([$student_test_id]);
    $responses = $calcStmt->fetchAll(PDO::FETCH_ASSOC);

    // =========================================
    // INITIALIZE COUNTERS
    // =========================================
    $total = 0;
    $math  = 0;
    $sci   = 0;

    $chapterStats = [];
    $bloomStats   = [];
    $skillStats   = [
        "P1" => ["score" => 0, "total" => 0],
        "P2" => ["score" => 0, "total" => 0],
        "P3" => ["score" => 0, "total" => 0],
    ];

    // =========================================
    // LOOP & CALCULATE EVERYTHING
    // =========================================
    foreach ($responses as $r) {
        $correct = ($r['selected_option'] === $r['correct']) ? 1 : 0;
        $total += $correct;

        // Section score
        if ($r['section'] === 'Math') {
            $math += $correct;
        } else {
            $sci += $correct;
        }

        // Chapter grouping
        $ch = $r['chapter'];
        if (!isset($chapterStats[$ch])) {
            $chapterStats[$ch] = ["score" => 0, "total" => 0];
        }
        $chapterStats[$ch]['score'] += $correct;
        $chapterStats[$ch]['total']++;

        // Bloom grouping
        $bl = $r['bloom_level'];
        if (!isset($bloomStats[$bl])) {
            $bloomStats[$bl] = ["score" => 0, "total" => 0];
        }
        $bloomStats[$bl]['score'] += $correct;
        $bloomStats[$bl]['total']++;

        // Skill P1/P2/P3 grouping
        $sk = $r['skill_type'];
        if (isset($skillStats[$sk])) {
            $skillStats[$sk]['score'] += $correct;
            $skillStats[$sk]['total']++;
        }
    }

    // =========================================
    // CALCULATE PERCENTAGES
    // =========================================
    $totalQ = count($responses);
    $pct    = $totalQ > 0 ? round(($total / $totalQ) * 100, 2) : 0;

    $p1 = $skillStats['P1']['total'] > 0
        ? round(($skillStats['P1']['score'] / $skillStats['P1']['total']) * 100, 2) : 0;
    $p2 = $skillStats['P2']['total'] > 0
        ? round(($skillStats['P2']['score'] / $skillStats['P2']['total']) * 100, 2) : 0;
    $p3 = $skillStats['P3']['total'] > 0
        ? round(($skillStats['P3']['score'] / $skillStats['P3']['total']) * 100, 2) : 0;

    $action_plan = json_encode([
        "week1" => "Focus on weak chapters",
        "week2" => "Practice Bloom levels L2 and L3",
        "week3" => "Revise mistakes",
        "week4" => "Attempt mock test"
    ]);

    // =========================================
    // SAVE MAIN RESULT (with p1, p2, p3)
    // =========================================
    $insertResult = $pdo->prepare("
        INSERT INTO results
            (student_test_id, total_score, math_score, sci_score, overall_pct, status, p1, p2, p3, action_plan)
        VALUES (?, ?, ?, ?, ?, 'scored', ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_score = VALUES(total_score),
            math_score  = VALUES(math_score),
            sci_score   = VALUES(sci_score),
            overall_pct = VALUES(overall_pct),
            p1          = VALUES(p1),
            p2          = VALUES(p2),
            p3          = VALUES(p3),
            action_plan = VALUES(action_plan),
            status      = 'scored'
    ");
    $insertResult->execute([$student_test_id, $total, $math, $sci, $pct, $p1, $p2, $p3, $action_plan]);

    // Get result_id
    $result_id = $pdo->lastInsertId();
    if (!$result_id) {
        $r2 = $pdo->prepare("SELECT id FROM results WHERE student_test_id = ?");
        $r2->execute([$student_test_id]);
        $result_id = $r2->fetchColumn();
    }

    // =========================================
    // CLEAR OLD CHAPTER/BLOOM DATA THEN RE-SAVE
    // =========================================
    $pdo->prepare("DELETE FROM chapter_scores WHERE result_id = ?")->execute([$result_id]);
    $pdo->prepare("DELETE FROM bloom_scores WHERE result_id = ?")->execute([$result_id]);

    // Save chapter SWOT scores
    foreach ($chapterStats as $chapter => $data) {
        $cpct = $data['total'] > 0 ? round(($data['score'] / $data['total']) * 100, 2) : 0;

        if ($cpct >= 80)     $swot = "Strength";
        elseif ($cpct >= 50) $swot = "Opportunity";
        else                 $swot = "Weakness";

        $pdo->prepare("
            INSERT INTO chapter_scores (result_id, chapter, score, max_score, pct, swot_category)
            VALUES (?, ?, ?, ?, ?, ?)
        ")->execute([$result_id, $chapter, $data['score'], $data['total'], $cpct, $swot]);
    }

    // Save bloom scores
    foreach ($bloomStats as $bloom => $data) {
        $bpct = $data['total'] > 0 ? round(($data['score'] / $data['total']) * 100, 2) : 0;

        $pdo->prepare("
            INSERT INTO bloom_scores (result_id, bloom_level, score, max_score, pct)
            VALUES (?, ?, ?, ?, ?)
        ")->execute([$result_id, $bloom, $data['score'], $data['total'], $bpct]);
    }

    // =========================================
    // RETURN RESPONSE
    // =========================================
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