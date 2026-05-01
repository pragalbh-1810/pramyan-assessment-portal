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

// ── 3. Get ALL questions + responses ────────────────────────────────────────
$stmt = $pdo->prepare("
    SELECT
        q.id,
        q.q_text,
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
    "P1" => ["score" => 0, "total" => 0],
    "P2" => ["score" => 0, "total" => 0],
    "P3" => ["score" => 0, "total" => 0],
];

// ── 5. Loop through ALL questions (1 Row = 1 Mark) ───────────────────────────
foreach ($rows as $r) {
    $marks = 1; // FIX: Every sub-question row is worth exactly 1 mark

    $selected  = strtolower(trim((string)($r['selected_option'] ?? '')));
    $answer    = strtolower(trim((string)($r['correct'] ?? '')));
    $attempted = $selected !== '';
    $correct   = ($attempted && $selected === $answer) ? $marks : 0;

    $totalScore += $correct;

    // Subject
    if (stripos($r['section'], 'Math') !== false) $math += $correct;
    else $sci += $correct;

    // Chapter
    $ch = $r['chapter'];
    if (!isset($chapterStats[$ch])) {
        $chapterStats[$ch] = ["score" => 0, "total" => 0];
    }
    $chapterStats[$ch]['total'] += $marks;
    if ($attempted) $chapterStats[$ch]['score'] += $correct;

    // Bloom
    $bl = strtoupper($r['bloom_level']);
    if (!isset($bloomStats[$bl])) {
        $bloomStats[$bl] = ["score" => 0, "total" => 0];
    }
    $bloomStats[$bl]['total'] += $marks;
    if ($attempted) $bloomStats[$bl]['score'] += $correct;

    // Skill
    $sk = strtoupper($r['skill_type']);
    if (strpos($sk, 'P1') !== false) {
        $skillStats['P1']['total'] += $marks;
        if ($attempted) $skillStats['P1']['score'] += $correct;
    }
    if (strpos($sk, 'P2') !== false) {
        $skillStats['P2']['total'] += $marks;
        if ($attempted) $skillStats['P2']['score'] += $correct;
    }
    if (strpos($sk, 'P3') !== false) {
        $skillStats['P3']['total'] += $marks;
        if ($attempted) $skillStats['P3']['score'] += $correct;
    }
}

// ── 6. Percentages ───────────────────────────────────────────────────────────
$totalMaxMarks = $totalQ; // 60 rows = 60 marks
$overall_pct = $totalMaxMarks > 0 ? round(($totalScore / $totalMaxMarks) * 100, 2) : 0;

$p1 = $skillStats['P1']['total'] ? round(($skillStats['P1']['score'] / $skillStats['P1']['total']) * 100, 2) : 0;
$p2 = $skillStats['P2']['total'] ? round(($skillStats['P2']['score'] / $skillStats['P2']['total']) * 100, 2) : 0;
$p3 = $skillStats['P3']['total'] ? round(($skillStats['P3']['score'] / $skillStats['P3']['total']) * 100, 2) : 0;

// ── 6b. Risk-if-Weak map (keyed by class → chapter) ─────────────────────────
$riskMap = [
    8 => [
        'Integers'                     => 'Class 8 Rational Numbers extends integers — negative operations used throughout',
        'Fractions & Decimals'         => 'Class 8 uses fractions heavily in Comparing Quantities, Profit/Loss, Data handling',
        'Simple Equations'             => 'Class 8 Linear Equations (2 step + word problems) directly continues this chapter',
        'Lines & Angles'               => 'Class 8 Understanding Quadrilaterals and Practical Geometry rely on angle properties',
        'Triangle & its Properties'    => 'Class 8 Triangle congruency uses properties from this chapter extensively',
        'Comparing Quantities'         => 'Class 8 Comparing Quantities: Profit/Loss, Tax, Discount, SI, CI all build on this',
        'Rational Numbers'             => 'Class 8 Rational Numbers is a dedicated full chapter — direct continuation',
        'Perimeter & Area'             => 'Class 8 Mensuration extends to area of polygons and 3D surface area/volume',
        'Algebraic Expressions'        => 'Class 8 Algebraic Expressions + Identities is a major chapter — direct continuation',
        'Exponents & Powers'           => 'Class 8 Exponents continues to negative exponents and standard form (science too)',
        'Data Handling'                => 'Class 8 Data Handling: probability introduced; grouped data; histograms',
        'Nutrition in Plants'          => 'Class 9 Nutrition continues; Class 8 Crop Production needs photosynthesis knowledge',
        'Heat'                         => 'Class 8 Heat chapter directly expands on this with calorimetry and specific heat',
        'Acids, Bases & Salts'         => 'Class 8 Acids, Bases & Salts continues with indicators; pH introduced in Class 9',
        'Physical & Chemical Changes'  => 'Class 8 Chemical Effects + Metals & Non-metals need this foundation',
        'Motion & Time'                => 'Class 8 Friction and Class 9 Force both need speed, distance, time mastery',
        'Electric Current & Effects'   => 'Class 8 Chemical Effects of Electric Current builds directly on circuit knowledge',
        'Light'                        => 'Class 8 Light chapter expands to refraction, prism, and lenses',
        'Respiration in Organisms'     => 'Class 8/9 Life Processes (respiration) is a direct and critical continuation',
        'Nutrition in Animals'         => 'Class 8 Human digestive system knowledge needed for crop nutrition and animal farming',
        'Reproduction in Plants'       => 'Class 8 Reproduction in Plants expands to seed dispersal; Class 9 covers reproduction broadly',
    ]
];

// ── 7. Save results ──────────────────────────────────────────────────────────
$stmt = $pdo->prepare("
    INSERT INTO results (
        student_test_id, total_score, math_score, sci_score,
        overall_pct, status, p1, p2, p3
    )
    VALUES (?, ?, ?, ?, ?, 'scored', ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        total_score  = VALUES(total_score),
        math_score   = VALUES(math_score),
        sci_score    = VALUES(sci_score),
        overall_pct  = VALUES(overall_pct),
        p1           = VALUES(p1),
        p2           = VALUES(p2),
        p3           = VALUES(p3)
");
$stmt->execute([
    $student_test_id, $totalScore, $math, $sci,
    $overall_pct, $p1, $p2, $p3
]);

$result_id = $pdo->lastInsertId();
if (!$result_id) {
    $stmt = $pdo->prepare("SELECT id FROM results WHERE student_test_id = ?");
    $stmt->execute([$student_test_id]);
    $result_id = $stmt->fetchColumn();
}

// ── 8. Clear old data ────────────────────────────────────────────────────────
$pdo->prepare("DELETE FROM chapter_scores WHERE result_id = ?")->execute([$result_id]);
$pdo->prepare("DELETE FROM bloom_scores   WHERE result_id = ?")->execute([$result_id]);

// ── 9. Save Chapter SWOT ─────────────────────────────────────────────────────
$t_strength = 70;
$t_opportunity = 40;

foreach ($chapterStats as $ch => $data) {

    $pct = $data['total'] ? round(($data['score'] / $data['total']) * 100, 2) : 0;

    if ($pct >= $t_strength)         $swot = "Strength";
    elseif ($pct >= $t_opportunity)  $swot = "Opportunity";
    else                             $swot = "Weakness";

    $risk = $riskMap[$studentClass][$ch] ?? '';

    $stmt = $pdo->prepare("
        INSERT INTO chapter_scores 
            (result_id, chapter, score, max_score, pct, swot_category, risk_if_weak)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $result_id, $ch, $data['score'], $data['total'], $pct, $swot, $risk
    ]);
}

// ── 10. Save Bloom ───────────────────────────────────────────────────────────
foreach ($bloomStats as $bl => $data) {

    $pct = $data['total'] ? round(($data['score'] / $data['total']) * 100, 2) : 0;

    $stmt = $pdo->prepare("
        INSERT INTO bloom_scores (result_id, bloom_level, score, max_score, pct)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$result_id, $bl, $data['score'], $data['total'], $pct]);
}

// ── 11. Response ─────────────────────────────────────────────────────────────
echo json_encode([
    "success"      => true,
    "total_score"  => $totalScore,
    "total_q"      => $totalMaxMarks,
    "overall_pct"  => $overall_pct,
    "math_score"   => $math,
    "math_total"   => $mathTotal,
    "sci_score"    => $sci,
    "sci_total"    => $sciTotal,
    "p1"           => $p1,
    "p2"           => $p2,
    "p3"           => $p3,
]);