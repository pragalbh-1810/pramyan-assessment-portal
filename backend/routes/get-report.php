<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function getRiskIfWeak($chapter, $test_class) {
    $chapter = trim($chapter);
    if ($test_class == 10) {
        $map = [
            "Number Systems"           => "Feeds Class 10 Real Numbers, Euclid's Lemma",
            "Polynomials"              => "Direct base for Class 10 Ch 2 Polynomials & Quadratics",
            "Linear Equations"         => "Direct base for Class 10 Pair of Linear Equations",
            "Lines & Angles"           => "Foundation for Class 10 Circles & Triangles",
            "Triangles"                => "Direct base for Similarity & Pythagoras in Class 10",
            "Surface Area & Volume"    => "Extended to Combination of Solids in Class 10",
            "Statistics"               => "Extended to Cumulative Frequency in Class 10",
            "Probability"              => "Continues directly into Class 10 Probability",
            "Heron's Formula"          => "Used in area calculations throughout Class 10",
            "Matter"                   => "Base for Chemical Reactions in Class 10",
            "Is Matter Pure?"          => "Base for Acids, Bases & Salts in Class 10",
            "Atoms & Molecules"        => "Essential for Class 10 Chemical Reactions",
            "Structure of Atom"        => "Needed for Periodic Table in Class 10",
            "Motion"                   => "Underpins numericals in Class 10 Electricity",
            "Force & Motion"           => "Foundation for gravitation & energy applications",
            "Work & Energy"            => "Extended to power and energy sources in Class 10",
            "Why Do We Fall Ill?"      => "Foundation for Control & Coordination in Class 10",
            "Cell - Fundamental Unit"  => "Base for Class 10 Life Processes & Heredity",
            "Cell – Fundamental Unit"  => "Base for Class 10 Life Processes & Heredity",
        ];
        return $map[$chapter] ?? "Class 10 foundations";
    } elseif ($test_class == 9) {
        $map = [
            "Rational Numbers"                     => "Feeds directly into Class 9 Real Numbers — irrational surds; Euclid's lemma",
            "Linear Equations (One Variable)"      => "Direct base: Class 9 Linear Equations in 2 Variables — same skills, extended",
            "Algebraic Expressions & Identities"   => "Essential for Class 9 Polynomials — identities, factorisation heavily used",
            "Squares, Cubes & Factorisation"       => "Class 9 Polynomials, Number Systems — square roots in irrational numbers",
            "Comparing Quantities"                 => "Class 9 has no direct chapter but used in all word problems & percentage Qs",
            "Mensuration"                          => "Extended to Combination of Solids in Class 10 — Class 9 introduces cylinder/cone",
            "Exponents & Powers"                   => "Class 9 continues into large/negative exponents; base for scientific notation",
            "Data Handling"                        => "Extended to mean/median/mode from grouped data and histograms in Class 9",
            "Metals & Non-metals"                  => "Class 9 Chemistry foundation — reactions, periodic table, physical/chemical changes",
            "Cell – Structure & Functions"         => "Class 9 Cell chapter directly continues this — tissues, life processes",
            "Force & Pressure"                     => "Underpins Class 9 Motion chapter (F=ma) and Gravitation",
            "Friction"                             => "Class 9 Laws of Motion — friction is a specific application of Newton's 1st Law",
            "Sound"                                => "Extended significantly in Class 9 Sound chapter — wave speed, echo, SONAR",
            "Light"                                => "Class 9 Light chapter continues — reflection, refraction, image formation",
            "Microorganisms & Combustion"          => "Class 9 Biology (Diseases) + Chemistry (reactions) both need this foundation",
            "Chemical Effects of Electric Current" => "Class 9 Chemical Effects continues into electrolysis; Class 10 Electricity",
            "Reproduction in Animals"              => "Class 9 Reproduction chapter directly continues this with plant reproduction",
        ];
        return $map[$chapter] ?? "Class 9 foundations";
    } else {
        $map = [
            "Integers"                       => "Class 8 Rational Numbers extends integers — negative operations used throughout",
            "Fractions & Decimals"           => "Class 8 uses fractions heavily in Comparing Quantities, Profit/Loss, Data handling",
            "Simple Equations"               => "Class 8 Linear Equations (2 step + word problems) directly continues this chapter",
            "Lines & Angles"                 => "Class 8 Understanding Quadrilaterals and Practical Geometry rely on angle properties",
            "Triangle & its Properties"      => "Class 8 Triangle congruency uses properties from this chapter extensively",
            "Comparing Quantities"           => "Class 8 Comparing Quantities: Profit/Loss, Tax, Discount, SI, CI all build on this",
            "Rational Numbers"               => "Class 8 Rational Numbers is a dedicated full chapter — direct continuation",
            "Perimeter & Area"               => "Class 8 Mensuration extends to area of polygons and 3D surface area/volume",
            "Algebraic Expressions"          => "Class 8 Algebraic Expressions + Identities is a major chapter — direct continuation",
            "Exponents & Powers"             => "Class 8 Exponents continues to negative exponents and standard form (science too)",
            "Data Handling"                  => "Class 8 Data Handling: probability introduced; grouped data; histograms",
            "Nutrition in Plants"            => "Class 9 Nutrition continues; Class 8 Crop Production needs photosynthesis knowledge",
            "Heat"                           => "Class 8 Heat chapter directly expands on this with calorimetry and specific heat",
            "Acids, Bases & Salts"           => "Class 8 Acids, Bases & Salts continues with indicators; pH introduced in Class 9",
            "Physical & Chemical Changes"    => "Class 8 Chemical Effects + Metals & Non-metals need this foundation",
            "Motion & Time"                  => "Class 8 Friction and Class 9 Force both need speed, distance, time mastery",
            "Electric Current & its Effects" => "Class 8 Chemical Effects of Electric Current builds directly on circuit knowledge",
            "Light"                          => "Class 8 Light chapter expands to refraction, prism, and lenses",
            "Respiration in Organisms"       => "Class 8/9 Life Processes (respiration) is a direct and critical continuation",
            "Nutrition in Animals"           => "Class 8 Human digestive system knowledge needed for crop nutrition and animal farming",
            "Reproduction in Plants"         => "Class 8 Reproduction in Plants expands to seed dispersal; Class 9 covers reproduction broadly",
        ];
        return $map[$chapter] ?? "Class 8 foundations";
    }
}

try {
    $user    = authenticate();
    $user_id = (int)$user['id'];
    $role    = $user['role'];
    $test_id = (int)($_GET['test_id'] ?? 0);

    if (!$test_id) {
        echo json_encode(['success' => false, 'message' => 'test_id required']);
        exit();
    }

    if ($role === 'admin') {
        $stmt = $pdo->prepare("SELECT id FROM student_tests WHERE test_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$test_id]);
    } else {
        $stmt = $pdo->prepare("SELECT id FROM student_tests WHERE user_id = ? AND test_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$user_id, $test_id]);
    }

    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$attempt) {
        echo json_encode(['success' => false, 'message' => 'No attempt found']);
        exit();
    }

    $student_test_id = (int)$attempt['id'];

    $result = $pdo->query("SELECT * FROM results WHERE student_test_id = $student_test_id")->fetch(PDO::FETCH_ASSOC);
    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Results not calculated yet']);
        exit();
    }

    $testRow    = $pdo->query("SELECT class FROM tests WHERE id = $test_id")->fetch(PDO::FETCH_ASSOC);
    $test_class = $testRow ? (int)$testRow['class'] : 8;

    // ── Chapter scores with risk_if_weak ────────────────────
    $chapterScores = $pdo->query("
        SELECT * FROM chapter_scores
        WHERE result_id = {$result['id']}
        ORDER BY pct DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    foreach ($chapterScores as &$ch) {
        $ch['risk_if_weak'] = getRiskIfWeak($ch['chapter'], $test_class);
    }
    unset($ch);

    // ── Bloom scores ─────────────────────────────────────────
    $bloomScores = $pdo->query("
        SELECT * FROM bloom_scores
        WHERE result_id = {$result['id']}
        ORDER BY bloom_level ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // ── Questions with risk_if_weak ──────────────────────────
    $qdStmt = $pdo->prepare("
        SELECT
            q.id as question_id,
            q.q_text,
            q.correct,
            q.chapter,
            q.bloom_level,
            q.skill_type,
            q.section,
            r.selected_option,
            CASE
                WHEN LOWER(TRIM(r.selected_option)) = LOWER(TRIM(q.correct)) THEN 1
                ELSE 0
            END as is_correct
        FROM questions q
        LEFT JOIN responses r
            ON r.question_id = q.id
            AND r.student_test_id = ?
        WHERE q.test_id = ?
        ORDER BY q.id
    ");
    $qdStmt->execute([$student_test_id, $test_id]);
    $questions = $qdStmt->fetchAll(PDO::FETCH_ASSOC);

    $answered = 0;
    $correct  = 0;
    foreach ($questions as &$q) {
        $q['risk_if_weak'] = getRiskIfWeak($q['chapter'], $test_class);
        if (!empty($q['selected_option'])) $answered++;
        if ($q['is_correct'] == 1) $correct++;
    }
    unset($q);

    $total = count($questions);

    echo json_encode([
        'success'         => true,
        'student_test_id' => $student_test_id,
        'test_class'      => $test_class,
        'total_score'     => (int)$result['total_score'],
        'max_score'       => $total,
        'math_score'      => (int)$result['math_score'],
        'sci_score'       => (int)$result['sci_score'],
        'overall_pct'     => (float)$result['overall_pct'],
        'correct'         => $correct,
        'wrong'           => $answered - $correct,
        'unanswered'      => $total - $answered,
        'answered'        => $answered,
        'p1'              => (float)($result['p1'] ?? 0),
        'p2'              => (float)($result['p2'] ?? 0),
        'p3'              => (float)($result['p3'] ?? 0),
        'action_plan'     => $result['action_plan'] ?? "",
        'chapter_scores'  => $chapterScores,
        'bloom_scores'    => $bloomScores,
        'questions'       => $questions,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal Server Error',
        'error'   => $e->getMessage(),
    ]);
}