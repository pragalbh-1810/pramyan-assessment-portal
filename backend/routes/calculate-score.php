<?php
header('Content-Type: application/json');

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();

$input           = json_decode(file_get_contents('php://input'), true);
$student_test_id = (int)($input['student_test_id'] ?? 0);

if (!$student_test_id) {
    echo json_encode(["success" => false, "message" => "student_test_id required"]);
    exit();
}

// ── 1. Get test_id + class ───────────────────────────────────────────────────
$metaStmt = $pdo->prepare("
    SELECT st.test_id, u.class
    FROM student_tests st
    JOIN users u ON u.id = st.user_id
    WHERE st.id = ?
");
$metaStmt->execute([$student_test_id]);
$meta = $metaStmt->fetch(PDO::FETCH_ASSOC);

if (!$meta) {
    echo json_encode(["success" => false, "message" => "Invalid student_test_id"]);
    exit();
}

$test_id      = (int)$meta['test_id'];
$studentClass = (int)$meta['class'];

// ── 2. Total questions ───────────────────────────────────────────────────────
$totalStmt = $pdo->prepare("
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN section = 'Math' THEN 1 ELSE 0 END) as mathTotal,
        SUM(CASE WHEN section = 'Science' THEN 1 ELSE 0 END) as sciTotal
    FROM questions 
    WHERE test_id = ?
");
$totalStmt->execute([$test_id]);
$totals    = $totalStmt->fetch(PDO::FETCH_ASSOC);

$totalQ    = (int)$totals['total'];
$mathTotal = (int)$totals['mathTotal'];
$sciTotal  = (int)$totals['sciTotal'];

// ── 3. Get ALL questions + responses (CRITICAL FIX) ──────────────────────────
$stmt = $pdo->prepare("
    SELECT
        q.id,
        q.correct,
        q.section,
        q.chapter,
        q.bloom_level,
        q.skill_type,
        r.selected_option
    FROM questions q
    LEFT JOIN responses r 
        ON r.question_id = q.id 
        AND r.student_test_id = ?
    WHERE q.test_id = ?
");
$stmt->execute([$student_test_id, $test_id]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ── 4. Initialize ────────────────────────────────────────────────────────────
$totalScore = 0;
$math = 0;
$sci  = 0;

$chapterStats = [];
$bloomStats   = [];
$skillStats   = [
    "P1" => ["score"=>0,"total"=>0],
    "P2" => ["score"=>0,"total"=>0],
    "P3" => ["score"=>0,"total"=>0],
];

// ── 5. Loop through ALL questions ────────────────────────────────────────────
foreach ($rows as $r) {

    $attempted = !empty($r['selected_option']);
    $correct   = ($attempted && $r['selected_option'] === $r['correct']) ? 1 : 0;

    $totalScore += $correct;

    // Subject
    if ($r['section'] === 'Math') $math += $correct;
    else $sci += $correct;

    // Chapter
    $ch = $r['chapter'];
    if (!isset($chapterStats[$ch])) {
        $chapterStats[$ch] = ["score"=>0,"total"=>0];
    }
    $chapterStats[$ch]['total']++;
    if ($attempted) $chapterStats[$ch]['score'] += $correct;

    // Bloom
    $bl = $r['bloom_level'];
    if (!isset($bloomStats[$bl])) {
        $bloomStats[$bl] = ["score"=>0,"total"=>0];
    }
    $bloomStats[$bl]['total']++;
    if ($attempted) $bloomStats[$bl]['score'] += $correct;

    // Skill
    $sk = $r['skill_type'];
    if (isset($skillStats[$sk])) {
        $skillStats[$sk]['total']++;
        if ($attempted) $skillStats[$sk]['score'] += $correct;
    }
}

// ── 6. Percentages ───────────────────────────────────────────────────────────
$overall_pct = $totalQ > 0 ? round(($totalScore / $totalQ) * 100, 2) : 0;

$p1 = $skillStats['P1']['total'] ? round(($skillStats['P1']['score']/$skillStats['P1']['total'])*100,2) : 0;
$p2 = $skillStats['P2']['total'] ? round(($skillStats['P2']['score']/$skillStats['P2']['total'])*100,2) : 0;
$p3 = $skillStats['P3']['total'] ? round(($skillStats['P3']['score']/$skillStats['P3']['total'])*100,2) : 0;

// ── 7. Save results ──────────────────────────────────────────────────────────
$stmt = $pdo->prepare("
    INSERT INTO results (
        student_test_id, total_score, math_score, sci_score,
        overall_pct, status, p1, p2, p3
    )
    VALUES (?, ?, ?, ?, ?, 'scored', ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        total_score=VALUES(total_score),
        math_score=VALUES(math_score),
        sci_score=VALUES(sci_score),
        overall_pct=VALUES(overall_pct),
        p1=VALUES(p1),
        p2=VALUES(p2),
        p3=VALUES(p3)
");
$stmt->execute([
    $student_test_id, $totalScore, $math, $sci,
    $overall_pct, $p1, $p2, $p3
]);

$result_id = $pdo->lastInsertId();
if (!$result_id) {
    $stmt = $pdo->prepare("SELECT id FROM results WHERE student_test_id=?");
    $stmt->execute([$student_test_id]);
    $result_id = $stmt->fetchColumn();
}

// ── 8. Clear old data ────────────────────────────────────────────────────────
$pdo->prepare("DELETE FROM chapter_scores WHERE result_id=?")->execute([$result_id]);
$pdo->prepare("DELETE FROM bloom_scores WHERE result_id=?")->execute([$result_id]);

// ── 9. Save Chapter SWOT ─────────────────────────────────────────────────────
foreach ($chapterStats as $ch=>$data) {

    $pct = $data['total'] ? round(($data['score']/$data['total'])*100,2) : 0;

    if ($pct >= 70) $swot="Strength";
    elseif ($pct >= 40) $swot="Opportunity";
    else $swot="Weakness";

    $stmt=$pdo->prepare("
        INSERT INTO chapter_scores (result_id,chapter,score,max_score,pct,swot_category)
        VALUES (?,?,?,?,?,?)
    ");
    $stmt->execute([$result_id,$ch,$data['score'],$data['total'],$pct,$swot]);
}

// ── 10. Save Bloom ───────────────────────────────────────────────────────────
foreach ($bloomStats as $bl=>$data) {

    $pct = $data['total'] ? round(($data['score']/$data['total'])*100,2) : 0;

    $stmt=$pdo->prepare("
        INSERT INTO bloom_scores (result_id,bloom_level,score,max_score,pct)
        VALUES (?,?,?,?,?)
    ");
    $stmt->execute([$result_id,$bl,$data['score'],$data['total'],$pct]);
}

// ── 11. Response ─────────────────────────────────────────────────────────────
echo json_encode([
    "success"=>true,
    "total_score"=>$totalScore,
    "total_q"=>$totalQ,
    "overall_pct"=>$overall_pct,
    "math_score"=>$math,
    "math_total"=>$mathTotal,
    "sci_score"=>$sci,
    "sci_total"=>$sciTotal,
    "p1"=>$p1,
    "p2"=>$p2,
    "p3"=>$p3
]);