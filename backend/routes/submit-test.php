<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 1. Handle Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

try {
    // 2. Gatekeeper: Authenticate user
    $user = authenticate();
    $user_id = (int)$user['id'];

    // 3. Parse Payload
    $input = json_decode(file_get_contents('php://input'), true);
    $student_test_id = isset($input['student_test_id']) ? (int)$input['student_test_id'] : null;

    if (!$student_test_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'student_test_id is required']);
        exit();
    }

    // 4. Security Check: Does this test belong to the user? Is it already submitted?
    $stmt = $pdo->prepare("SELECT id, is_submitted FROM student_tests WHERE id = ? AND user_id = ?");
    $stmt->execute([$student_test_id, $user_id]);
    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$attempt) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access to this test attempt']);
        exit();
    }

    if ((int)$attempt['is_submitted'] === 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Test is already submitted and locked']);
        exit();
    }

    // 5. The Lock-In: Mark the test as submitted
    // (This inherently locks all responses because save-answers.php respects this flag)
    $updateStmt = $pdo->prepare("UPDATE student_tests SET is_submitted = 1 WHERE id = ?");
    $updateStmt->execute([$student_test_id]);

    // ---------------------------------------------------------
    // 6. STUB: Trigger calculate-score.php
    // We will wire up the actual grading logic here in Task 4.
    // For now, it's an empty hook waiting for the engine.
    // 
    // require_once __DIR__ . '/calculate-score.php';
    // calculateScoreForTest($student_test_id);
    // ---------------------------------------------------------

    // 7. Return success to React
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'submitted' => true,
        'message' => 'Test locked successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>