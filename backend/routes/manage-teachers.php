<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin only']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT id, name, email, created_at FROM users WHERE role='teacher' ORDER BY id DESC");
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($teachers as &$t) { $t['id'] = (int)$t['id']; }
    echo json_encode(['success' => true, 'teachers' => $teachers]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $teacher_id = (int)($input['teacher_id'] ?? 0);

    if (!$teacher_id) { echo json_encode(['success' => false, 'message' => 'teacher_id required']); exit(); }

    if ($teacher_id === (int)$user['id']) {
        echo json_encode(['success' => false, 'message' => 'Cannot remove yourself']);
        exit();
    }

    $del = $pdo->prepare("DELETE FROM users WHERE id=? AND role='teacher'");
    $del->execute([$teacher_id]);
    $msg = $del->rowCount() ? 'Teacher removed' : 'Teacher not found';
    echo json_encode(['success' => (bool)$del->rowCount(), 'message' => $msg]);
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);