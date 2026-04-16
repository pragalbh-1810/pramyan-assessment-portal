<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (!$name || !$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'name, email and password required']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email']);
    exit();
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be 6+ chars']);
    exit();
}

$chk = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$chk->execute([$email]);
if ($chk->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit();
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$ins = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'teacher')");
$ins->execute([$name, $email, $hash]);

echo json_encode(['success' => true, 'message' => 'Teacher created', 'teacher_id' => (int)$pdo->lastInsertId()]);