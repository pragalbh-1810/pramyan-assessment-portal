<?php
header('Content-Type: application/json');
<<<<<<< HEAD
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 1. Handle Preflight CORS Requests from React
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// 2. Bring in Database and Auth
require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

try {
    // 3) Authenticate and parse payload
    $authUser = authenticate();
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
        exit();
    }

    // Supports both contracts:
    // A) Bulk: { user_id, test_id, answers: [{question_id, selected_option, time_on_question?}] }
    // B) Single click: { student_test_id, question_id, selected_option, time_on_question? }
    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : (int)$authUser['id'];
    $test_id = isset($input['test_id']) ? (int)$input['test_id'] : null;
    $student_test_id = isset($input['student_test_id']) ? (int)$input['student_test_id'] : null;
    $answers = [];

    if (isset($input['answers']) && is_array($input['answers'])) {
        $answers = $input['answers'];
    } elseif (isset($input['question_id'], $input['selected_option'])) {
        $answers[] = [
            'question_id' => $input['question_id'],
            'selected_option' => $input['selected_option'],
            'time_on_question' => $input['time_on_question'] ?? 0
        ];
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing answers payload']);
        exit();
    }

    if ($user_id !== (int)$authUser['id']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'User mismatch']);
        exit();
    }

    if (!$student_test_id && !$test_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'test_id or student_test_id is required']);
        exit();
    }

    $pdo->beginTransaction();

    // 4) Resolve or create student_tests row
    if ($student_test_id) {
        $stmt = $pdo->prepare("SELECT id, test_id, is_submitted FROM student_tests WHERE id = ? AND user_id = ?");
        $stmt->execute([$student_test_id, $user_id]);
        $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$attempt) {
            $pdo->rollBack();
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized access to this test attempt']);
            exit();
        }
        if ((int)$attempt['is_submitted'] === 1) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Test is already submitted and locked']);
            exit();
        }
        $test_id = (int)$attempt['test_id'];
    } else {
        $stmt = $pdo->prepare("SELECT id, is_submitted FROM student_tests WHERE user_id = ? AND test_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$user_id, $test_id]);
        $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($attempt && (int)$attempt['is_submitted'] === 1) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Test is already submitted and locked']);
            exit();
        }

        if ($attempt) {
            $student_test_id = (int)$attempt['id'];
        } else {
            $insertAttempt = $pdo->prepare("
                INSERT INTO student_tests (user_id, test_id, start_time, is_submitted)
                VALUES (?, ?, NOW(), 0)
            ");
            $insertAttempt->execute([$user_id, $test_id]);
            $student_test_id = (int)$pdo->lastInsertId();
        }
    }

    // Prepared statements reused for each answer
    $questionCheckStmt = $pdo->prepare("SELECT id FROM questions WHERE id = ? AND test_id = ?");
    $responseLookupStmt = $pdo->prepare("SELECT id FROM responses WHERE student_test_id = ? AND question_id = ?");
    $responseInsertStmt = $pdo->prepare("
        INSERT INTO responses (student_test_id, question_id, selected_option)
        VALUES (?, ?, ?)
    ");
    $responseUpdateStmt = $pdo->prepare("UPDATE responses SET selected_option = ? WHERE id = ?");
    $questionTimeStmt = $pdo->prepare("UPDATE questions SET time_on_question = ? WHERE id = ?");

    // 5) Validate + upsert all answers
    foreach ($answers as $answer) {
        $question_id = isset($answer['question_id']) ? (int)$answer['question_id'] : 0;
        $selected_option = strtolower(trim((string)($answer['selected_option'] ?? '')));
        $time_on_question = isset($answer['time_on_question']) ? (int)$answer['time_on_question'] : 0;

        if (!$question_id || !in_array($selected_option, ['a', 'b', 'c', 'd'], true)) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid question_id or selected_option']);
            exit();
        }

        $questionCheckStmt->execute([$question_id, $test_id]);
        if (!$questionCheckStmt->fetch(PDO::FETCH_ASSOC)) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Question {$question_id} does not belong to test {$test_id}"]);
            exit();
        }

        $responseLookupStmt->execute([$student_test_id, $question_id]);
        $existing = $responseLookupStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $responseUpdateStmt->execute([$selected_option, $existing['id']]);
        } else {
            $responseInsertStmt->execute([$student_test_id, $question_id, $selected_option]);
        }

        if ($time_on_question >= 0) {
            $questionTimeStmt->execute([$time_on_question, $question_id]);
        }
    }

    $pdo->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'saved' => true,
        'student_test_id' => $student_test_id
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
=======

// 1. Require the middleware
require_once '../middleware/auth.php';

// 2. Run the gatekeeper (this will kill the script if auth fails)
$user = authenticate(); 

// 3. If they pass, send back success AND prove we know who they are!
echo json_encode([
    "saved" => true, 
    "message" => "Welcome to the secure route!",
    "logged_in_user_id" => $user['id']
]);
>>>>>>> origin/new-feature
?>