<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();

// ==========================================
// GET: FETCH ALL STUDENTS
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!in_array($user['role'], ['teacher', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.class, 
                u.board,
                u.parent_phone,
                u.assigned_teacher_id,
                st.test_id, 
                st.id AS student_test_id,
                r.total_score, 
                r.math_score, 
                r.sci_score, 
                r.overall_pct,
                r.p1, r.p2, r.p3, 
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
            $s['id']                  = (int)$s['id'];
            $s['class']               = (int)($s['class'] ?? 0);
            $s['test_id']             = (int)($s['test_id'] ?? 0);
            $s['overall_pct']         = (float)($s['overall_pct'] ?? 0);
            $s['assigned_teacher_id'] = $s['assigned_teacher_id'] ? (int)$s['assigned_teacher_id'] : null;
        }
        unset($s);

        echo json_encode(['success' => true, 'students' => $students]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// ==========================================
// POST & DELETE REQUIRE ADMIN ROLE
// ==========================================
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin only']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

// ==========================================
// POST: ADD A NEW STUDENT
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name         = trim($input['name'] ?? '');
    $email        = trim($input['email'] ?? '');
    $password     = trim($input['password'] ?? '');
    $class        = (int)($input['class'] ?? 0);
    $board        = trim($input['board'] ?? '');
    $parent_phone = trim($input['parent_phone'] ?? '');

    if (!$name || !$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'Name, email, and password are required']);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit();
    }

    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be 6+ characters']);
        exit();
    }

    try {
        $chk = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $chk->execute([$email]);
        if ($chk->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email is already registered']);
            exit();
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins = $pdo->prepare("
            INSERT INTO users (name, email, password_hash, class, board, parent_phone, role) 
            VALUES (?, ?, ?, ?, ?, ?, 'student')
        ");
        $ins->execute([$name, $email, $hash, $class, $board, $parent_phone]);

        echo json_encode([
            'success'    => true, 
            'message'    => 'Student created successfully', 
            'student_id' => (int)$pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// ==========================================
// DELETE: REMOVE A STUDENT
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $student_id = (int)($input['student_id'] ?? 0);

    if (!$student_id) {
        echo json_encode(['success' => false, 'message' => 'student_id required']);
        exit();
    }

    try {
        // Begin Transaction for Deep Clean
        $pdo->beginTransaction();

        $pdo->exec("DELETE FROM chapter_scores WHERE result_id IN (SELECT id FROM results WHERE student_test_id IN (SELECT id FROM student_tests WHERE user_id = $student_id))");
        $pdo->exec("DELETE FROM bloom_scores WHERE result_id IN (SELECT id FROM results WHERE student_test_id IN (SELECT id FROM student_tests WHERE user_id = $student_id))");
        $pdo->exec("DELETE FROM results WHERE student_test_id IN (SELECT id FROM student_tests WHERE user_id = $student_id)");
        $pdo->exec("DELETE FROM responses WHERE student_test_id IN (SELECT id FROM student_tests WHERE user_id = $student_id)");
        $pdo->exec("DELETE FROM student_tests WHERE user_id = $student_id");

        $del = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'student'");
        $del->execute([$student_id]);

        if ($del->rowCount()) {
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Student removed successfully']);
        } else {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Student not found']);
        }
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);