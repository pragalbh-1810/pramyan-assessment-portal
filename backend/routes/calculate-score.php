<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();

$input = json_decode(file_get_contents('php://input'), true);
$student_test_id = (int)($input['student_test_id'] ?? 0);

if (!$student_test_id) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'student_test_id required'
    ]);
    exit();
}

/*
|--------------------------------------------------------------------------
| GET RESPONSES
|--------------------------------------------------------------------------
*/
$stmt = $pdo->prepare("
    SELECT r.selected_option, q.correct, q.section
    FROM responses r
    JOIN questions q ON r.question_id = q.id
    WHERE r.student_test_id = ?
");

$stmt->execute([$student_test_id]);
$responses = $stmt->fetchAll(PDO::FETCH_ASSOC);

$total = 0;
$math = 0;
$sci = 0;

foreach ($responses as $r) {

    if ($r['selected_option'] === $r['correct']) {

        $total++;

        if ($r['section'] === 'A') {
            $math++;
        } else {
            $sci++;
        }

    }
}

$totalQ = count($responses);

$pct = $totalQ > 0
    ? round(($total / $totalQ) * 100, 2)
    : 0;

/*
|--------------------------------------------------------------------------
| SAVE OVERALL RESULT
|--------------------------------------------------------------------------
*/
$insert = $pdo->prepare("
    INSERT INTO results
    (
        student_test_id,
        total_score,
        math_score,
        sci_score,
        overall_pct,
        status
    )
    VALUES (?, ?, ?, ?, ?, 'scored')

    ON DUPLICATE KEY UPDATE

        total_score = VALUES(total_score),
        math_score = VALUES(math_score),
        sci_score = VALUES(sci_score),
        overall_pct = VALUES(overall_pct),
        status = 'scored'
");

$insert->execute([
    $student_test_id,
    $total,
    $math,
    $sci,
    $pct
]);


/*
|--------------------------------------------------------------------------
| GET result_id
|--------------------------------------------------------------------------
*/
$result_id = $pdo->lastInsertId();

if (!$result_id) {

    $r = $pdo->prepare("
        SELECT id
        FROM results
        WHERE student_test_id = ?
    ");

    $r->execute([$student_test_id]);

    $result_id = $r->fetchColumn();
}


/*
|--------------------------------------------------------------------------
| CHAPTER SCORES
|--------------------------------------------------------------------------
*/
$pdo->prepare("
    DELETE FROM chapter_scores
    WHERE result_id = ?
")->execute([$result_id]);

$chStmt = $pdo->prepare("
    SELECT
        q.chapter,

        SUM(
            CASE
                WHEN r.selected_option = q.correct
                THEN 1
                ELSE 0
            END
        ) AS score,

        COUNT(*) AS max_score

    FROM responses r

    JOIN questions q
        ON r.question_id = q.id

    WHERE r.student_test_id = ?

    GROUP BY q.chapter
");

$chStmt->execute([$student_test_id]);

$chapters = $chStmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($chapters as $ch) {

    $chapter_pct = $ch['max_score'] > 0
        ? round(($ch['score'] / $ch['max_score']) * 100, 2)
        : 0;

    if ($chapter_pct >= 75) {
        $swot = 'Strength';
    }
    elseif ($chapter_pct >= 50) {
        $swot = 'Opportunity';
    }
    else {
        $swot = 'Weakness';
    }

    $pdo->prepare("
        INSERT INTO chapter_scores
        (
            result_id,
            chapter,
            score,
            max_score,
            pct,
            swot_category
        )
        VALUES (?, ?, ?, ?, ?, ?)
    ")->execute([
        $result_id,
        $ch['chapter'],
        $ch['score'],
        $ch['max_score'],
        $chapter_pct,
        $swot
    ]);

}


/*
|--------------------------------------------------------------------------
| BLOOM SCORES
|--------------------------------------------------------------------------
*/
$pdo->prepare("
    DELETE FROM bloom_scores
    WHERE result_id = ?
")->execute([$result_id]);

$blStmt = $pdo->prepare("
    SELECT

        q.bloom_level,

        SUM(
            CASE
                WHEN r.selected_option = q.correct
                THEN 1
                ELSE 0
            END
        ) AS score,

        COUNT(*) AS max_score

    FROM responses r

    JOIN questions q
        ON r.question_id = q.id

    WHERE r.student_test_id = ?

    GROUP BY q.bloom_level
");

$blStmt->execute([$student_test_id]);

$blooms = $blStmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($blooms as $b) {

    $bloom_pct = $b['max_score'] > 0
        ? round(($b['score'] / $b['max_score']) * 100, 2)
        : 0;

    $pdo->prepare("
        INSERT INTO bloom_scores
        (
            result_id,
            bloom_level,
            score,
            max_score,
            pct
        )
        VALUES (?, ?, ?, ?, ?)
    ")->execute([
        $result_id,
        $b['bloom_level'],
        $b['score'],
        $b['max_score'],
        $bloom_pct
    ]);

}


/*
|--------------------------------------------------------------------------
| SKILL SCORES (P1 P2 P3)
|--------------------------------------------------------------------------
*/
$skStmt = $pdo->prepare("
    SELECT

        q.skill_type,

        ROUND(

            SUM(
                CASE
                    WHEN r.selected_option = q.correct
                    THEN 1
                    ELSE 0
                END
            ) / COUNT(*) * 100,

        2) AS pct

    FROM responses r

    JOIN questions q
        ON r.question_id = q.id

    WHERE r.student_test_id = ?

    GROUP BY q.skill_type
");

$skStmt->execute([$student_test_id]);

$skills = $skStmt->fetchAll(PDO::FETCH_ASSOC);

$skillMap = [
    'P1' => 0,
    'P2' => 0,
    'P3' => 0
];

foreach ($skills as $s) {

    $skillMap[$s['skill_type']] = $s['pct'];

}


/*
|--------------------------------------------------------------------------
| ACTION PLAN
|--------------------------------------------------------------------------
*/
$plan = [];

if ($skillMap['P1'] < 60) {
    $plan[] =
        "Strengthen concept clarity — revisit definitions and formulas.";
}

if ($skillMap['P2'] < 60) {
    $plan[] =
        "Practice procedural problems step-by-step.";
}

if ($skillMap['P3'] < 60) {
    $plan[] =
        "Work on application-type word problems.";
}

foreach ($chapters as $ch) {

    $chapter_pct = $ch['max_score'] > 0
        ? round(($ch['score'] / $ch['max_score']) * 100, 2)
        : 0;

    if ($chapter_pct < 50) {

        $plan[] =
            "Revise chapter '" .
            $ch['chapter'] .
            "' — scored only " .
            $chapter_pct .
            "%.";

    }

}

$actionPlan =
    count($plan) > 0
    ? implode(" ", $plan)
    : "Good performance! Keep practicing regularly.";


/*
|--------------------------------------------------------------------------
| SAVE SKILL SCORES + ACTION PLAN
|--------------------------------------------------------------------------
*/
$pdo->prepare("
    UPDATE results

    SET

        p1 = ?,
        p2 = ?,
        p3 = ?,
        action_plan = ?

    WHERE id = ?
")->execute([
    $skillMap['P1'],
    $skillMap['P2'],
    $skillMap['P3'],
    $actionPlan,
    $result_id
]);


/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/
echo json_encode([

    'success' => true,

    'result_id' => $result_id,

    'total_score' => $total,

    'math_score' => $math,

    'sci_score' => $sci,

    'overall_pct' => $pct,

    'p1' => $skillMap['P1'],
    'p2' => $skillMap['P2'],
    'p3' => $skillMap['P3'],

    'action_plan' => $actionPlan

]);
?>