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

    $normalize = function($s) {
        $s = mb_strtolower(trim((string)$s));
        $s = preg_replace('/[^\\p{L}\\p{N}]+/u', ' ', $s);
        $s = preg_replace('/\s+/',' ', $s);
        return trim($s);
    };

    $map = [];
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
        $default = "Class 10 foundations";
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
        $default = "Class 9 foundations";
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
        $default = "Class 8 foundations";
    }

    // create normalized lookup map
    $normalizedMap = [];
    foreach ($map as $k => $v) {
        $normalizedMap[$normalize($k)] = $v;
    }

    $normChapter = $normalize($chapter);
    if (isset($normalizedMap[$normChapter])) {
        return $normalizedMap[$normChapter];
    }

    // try substring matches
    foreach ($normalizedMap as $k => $v) {
        if ($k !== '' && (strpos($k, $normChapter) !== false || strpos($normChapter, $k) !== false)) {
            return $v;
        }
    }

    // try fuzzy match (similar_text)
    foreach ($normalizedMap as $k => $v) {
        similar_text($k, $normChapter, $perc);
        if ($perc >= 60) {
            return $v;
        }
    }

    return $default;
}

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

    $studentClass = (int)($student['class'] ?? 10);

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

    // ── 4. Total marks ─────────────────────────────────────
    $stmt = $pdo->prepare("
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN section = 'Math'    THEN 1 ELSE 0 END) as mathMax,
            SUM(CASE WHEN section = 'Science' THEN 1 ELSE 0 END) as sciMax
        FROM questions
        WHERE test_id = ?
    ");
    $stmt->execute([$resolved_test_id]);
    $qStats = $stmt->fetch(PDO::FETCH_ASSOC);

    $total   = (int)$qStats['total'];
    $mathMax = (int)$qStats['mathMax'];
    $sciMax  = (int)$qStats['sciMax'];

    // ── 5. Scored / answered counts ────────────────────────
    $stmt = $pdo->prepare("
        SELECT
            SUM(CASE WHEN r.selected_option IS NOT NULL AND TRIM(r.selected_option) <> '' THEN 1 ELSE 0 END) as answered,
            SUM(CASE
                WHEN LOWER(TRIM(COALESCE(r.selected_option, ''))) = LOWER(TRIM(COALESCE(q.correct, '')))
                     AND TRIM(COALESCE(r.selected_option, '')) <> ''
                THEN 1 ELSE 0 END
            ) as correct
        FROM questions q
        LEFT JOIN responses r
            ON r.question_id = q.id
            AND r.student_test_id = ?
        WHERE q.test_id = ?
    ");
    $stmt->execute([$student_test_id, $resolved_test_id]);
    $counts = $stmt->fetch(PDO::FETCH_ASSOC);

    $answered   = (int)($counts['answered'] ?? 0);
    $correct    = (int)($counts['correct']  ?? 0);
    $wrong      = $answered - $correct;
    $unanswered = $total - $answered;

    // ── 6. Percentages ─────────────────────────────────────
    $mathPct    = $mathMax > 0 ? round(($result['math_score'] / $mathMax) * 100) : 0;
    $sciPct     = $sciMax  > 0 ? round(($result['sci_score']  / $sciMax)  * 100) : 0;
    $overallPct = $total   > 0 ? round(($correct / $total) * 100, 2) : 0;

    // ── 7. Chapter scores with risk_if_weak ────────────────
    $chapterScoresStmt = $pdo->prepare("
        SELECT chapter, score, max_score, pct, swot_category
        FROM chapter_scores
        WHERE result_id = ?
        ORDER BY pct DESC
    ");
    $chapterScoresStmt->execute([$result['id']]);
    $ch_scores = $chapterScoresStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($ch_scores as &$ch) {
        $ch['risk_if_weak'] = getRiskIfWeak($ch['chapter'], $studentClass);
    }
    unset($ch);

    // ── 8. Bloom scores ────────────────────────────────────
    $bloomScoresStmt = $pdo->prepare("
        SELECT bloom_level, score, max_score, pct
        FROM bloom_scores
        WHERE result_id = ?
        ORDER BY bloom_level ASC
    ");
    $bloomScoresStmt->execute([$result['id']]);
    $bl_scores = $bloomScoresStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 9. Questions with risk_if_weak ─────────────────────
    $qdStmt = $pdo->prepare("
        SELECT
            q.id, q.q_text, q.chapter, q.section,
            q.bloom_level, q.skill_type, q.correct,
            r.selected_option,
            CASE
                WHEN LOWER(TRIM(COALESCE(r.selected_option, ''))) = LOWER(TRIM(COALESCE(q.correct, '')))
                     AND TRIM(COALESCE(r.selected_option, '')) <> ''
                THEN 1 ELSE 0 END as is_correct
        FROM questions q
        LEFT JOIN responses r
            ON r.question_id = q.id
            AND r.student_test_id = ?
        WHERE q.test_id = ?
    ");
    $qdStmt->execute([$student_test_id, $resolved_test_id]);
    $questions = $qdStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($questions as &$q) {
        $q['risk_if_weak'] = getRiskIfWeak($q['chapter'], $studentClass);
    }
    unset($q);

    // ── 9.5. Uploaded File ─────────────────────────────────
    $fileStmt = $pdo->prepare("SELECT uploaded_file FROM responses WHERE student_test_id = ? AND uploaded_file IS NOT NULL AND uploaded_file != '' LIMIT 1");
    $fileStmt->execute([$student_test_id]);
    $uploadedFile = $fileStmt->fetchColumn() ?: null;

    // ── 10. Response ───────────────────────────────────────
    echo json_encode([
        'success'        => true,
        'student'        => $student,
        'total_score'    => (int)$result['total_score'],
        'max_score'      => $total,
        'math_score'     => (int)$result['math_score'],
        'math_pct'       => $mathPct,
        'sci_score'      => (int)$result['sci_score'],
        'sci_pct'        => $sciPct,
        'overall_pct'    => $overallPct,
        'correct'        => $correct,
        'wrong'          => $wrong,
        'unanswered'     => $unanswered,
        'answered'       => $answered,
        'chapter_scores' => $ch_scores ?: [],
        'bloom_scores'   => $bl_scores ?: [],
        'questions'      => $questions  ?: [],
        'uploaded_file'  => $uploadedFile,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Backend Database Error: ' . $e->getMessage(),
    ]);
}