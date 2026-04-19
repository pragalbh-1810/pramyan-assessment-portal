<?php

header('Content-Type: application/json');

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();

$input = json_decode(file_get_contents('php://input'), true);
$student_test_id = (int)($input['student_test_id'] ?? 0);

if (!$student_test_id) {
    echo json_encode(["success" => false, "message" => "student_test_id required"]);
    exit();
}

// GET RESPONSES WITH QUESTION TAGS
$stmt = $pdo->prepare("
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
$stmt->execute([$student_test_id]);
$responses = $stmt->fetchAll(PDO::FETCH_ASSOC);

// INITIALIZE COUNTERS
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

// LOOP THROUGH RESPONSES
foreach ($responses as $r) {
    $correct = ($r['selected_option'] === $r['correct']) ? 1 : 0;
    $total += $correct;

    // Match your actual DB section values
    if ($r['section'] === 'Math') {
        $math += $correct;
    } else {
        $sci += $correct;
    }

    // Chapter Grouping
    $chapter = $r['chapter'];
    if (!isset($chapterStats[$chapter])) {
        $chapterStats[$chapter] = ["score" => 0, "total" => 0];
    }
    $chapterStats[$chapter]['score'] += $correct;
    $chapterStats[$chapter]['total']++;

    // Bloom Grouping
    $bloom = $r['bloom_level'];
    if (!isset($bloomStats[$bloom])) {
        $bloomStats[$bloom] = ["score" => 0, "total" => 0];
    }
    $bloomStats[$bloom]['score'] += $correct;
    $bloomStats[$bloom]['total']++;

    // Skill Grouping
    $skill = $r['skill_type'];
    if (isset($skillStats[$skill])) {
        $skillStats[$skill]['score'] += $correct;
        $skillStats[$skill]['total']++;
    }
}

// CALCULATE PERCENTAGES
$totalQ      = count($responses);
$overall_pct = $totalQ > 0 ? round(($total / $totalQ) * 100, 2) : 0;

$p1 = $skillStats['P1']['total'] > 0
    ? round(($skillStats['P1']['score'] / $skillStats['P1']['total']) * 100, 2) : 0;

$p2 = $skillStats['P2']['total'] > 0
    ? round(($skillStats['P2']['score'] / $skillStats['P2']['total']) * 100, 2) : 0;

$p3 = $skillStats['P3']['total'] > 0
    ? round(($skillStats['P3']['score'] / $skillStats['P3']['total']) * 100, 2) : 0;

// ACTION PLAN
$action_plan = json_encode([
    "week1" => "Focus on weak chapters",
    "week2" => "Practice Bloom levels L2 and L3",
    "week3" => "Revise mistakes",
    "week4" => "Attempt mock test"
]);

// INSERT / UPDATE RESULTS
$stmt = $pdo->prepare("
    INSERT INTO results (
        student_test_id, total_score, math_score, sci_score,
        overall_pct, status, p1, p2, p3, action_plan
    )
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
$stmt->execute([$student_test_id, $total, $math, $sci, $overall_pct, $p1, $p2, $p3, $action_plan]);

// Get result_id
$result_id = $pdo->lastInsertId();
if (!$result_id) {
    $stmt = $pdo->prepare("SELECT id FROM results WHERE student_test_id = ?");
    $stmt->execute([$student_test_id]);
    $result_id = $stmt->fetchColumn();
}

// DELETE OLD DATA before re-inserting (prevents duplicates)
$pdo->prepare("DELETE FROM chapter_scores WHERE result_id = ?")->execute([$result_id]);
$pdo->prepare("DELETE FROM bloom_scores WHERE result_id = ?")->execute([$result_id]);

// SAVE CHAPTER SWOT
foreach ($chapterStats as $chapter => $data) {
    $pct = $data['total'] > 0 ? round(($data['score'] / $data['total']) * 100, 2) : 0;

    if ($pct >= 80)     $swot = "Strength";
    elseif ($pct >= 50) $swot = "Opportunity";
    else                $swot = "Weakness";

    $stmt = $pdo->prepare("
        INSERT INTO chapter_scores (result_id, chapter, score, max_score, pct, swot_category)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$result_id, $chapter, $data['score'], $data['total'], $pct, $swot]);
}

// SAVE BLOOM SCORES
foreach ($bloomStats as $bloom => $data) {
    $pct = $data['total'] > 0 ? round(($data['score'] / $data['total']) * 100, 2) : 0;

    $stmt = $pdo->prepare("
        INSERT INTO bloom_scores (result_id, bloom_level, score, max_score, pct)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$result_id, $bloom, $data['score'], $data['total'], $pct]);
}

// RETURN RESPONSE
echo json_encode([
    "success"     => true,
    "overall_pct" => $overall_pct,
    "p1"          => $p1,
    "p2"          => $p2,
    "p3"          => $p3
]);

