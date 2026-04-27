<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();

if (!in_array($user['role'], ['teacher', 'admin'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

// ✅ Single correct query — matches test class to student class
$stmt = $pdo->prepare("
    SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.class, 
        u.parent_phone,
        st.test_id, 
        st.id AS student_test_id,
        r.total_score, 
        r.math_score, 
        r.sci_score, 
        r.overall_pct,
        r.p1, 
        r.p2, 
        r.p3, 
        t.name AS test_name
    FROM users u
    LEFT JOIN student_tests st
        ON st.user_id = u.id 
        AND st.is_submitted = 1
        AND st.id = (
            SELECT MAX(st2.id) 
            FROM student_tests st2
            JOIN tests t2 ON t2.id = st2.test_id
            WHERE st2.user_id = u.id 
            AND st2.is_submitted = 1
            AND t2.class = u.class
        )
    LEFT JOIN results r ON r.student_test_id = st.id
    LEFT JOIN tests t ON t.id = st.test_id
    WHERE u.role = 'student'
    ORDER BY u.id DESC 
");

$stmt->execute();
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($students as &$s) {
    $s['id']          = (int)$s['id'];
    $s['class']       = (int)($s['class']       ?? 0);
    $s['test_id']     = (int)($s['test_id']      ?? 0);
    $s['overall_pct'] = (float)($s['overall_pct'] ?? 0);
}
unset($s);

echo json_encode(['success' => true, 'students' => $students]);