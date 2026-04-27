<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();

// ==========================================
// BOTH ACTIONS REQUIRE ADMIN ROLE
// ==========================================
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

// ==========================================
// POST: ASSIGN STUDENTS TO A TEACHER
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $teacher_id = (int)($input['teacher_id'] ?? 0);
    $student_ids = $input['student_ids'] ?? [];

    if (!$teacher_id || empty($student_ids) || !is_array($student_ids)) {
        echo json_encode(['success' => false, 'message' => 'Valid teacher_id and an array of student_ids are required']);
        exit();
    }

    try {
        // 1. Verify the assigned user is actually a teacher
        $checkT = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'");
        $checkT->execute([$teacher_id]);
        if (!$checkT->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Invalid teacher selected']);
            exit();
        }

        // 2. Loop through the array and update the students
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("UPDATE users SET assigned_teacher_id = ? WHERE id = ? AND role = 'student'");
        
        $assignedCount = 0;
        foreach ($student_ids as $sid) {
            $stmt->execute([$teacher_id, (int)$sid]);
            $assignedCount += $stmt->rowCount();
        }
        $pdo->commit();

        echo json_encode(['success' => true, 'message' => "$assignedCount student(s) assigned successfully"]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// ==========================================
// DELETE: UNASSIGN STUDENT FROM TEACHER
// ==========================================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $student_id = (int)($input['student_id'] ?? 0);

    if (!$student_id) {
        echo json_encode(['success' => false, 'message' => 'student_id is required']);
        exit();
    }

    try {
        // Just set the assigned_teacher_id back to NULL
        $stmt = $pdo->prepare("UPDATE users SET assigned_teacher_id = NULL WHERE id = ? AND role = 'student'");
        $stmt->execute([$student_id]);

        if ($stmt->rowCount()) {
            echo json_encode(['success' => true, 'message' => 'Student unassigned successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Student not found or already unassigned']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);