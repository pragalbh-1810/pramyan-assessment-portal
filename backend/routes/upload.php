<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=utf-8');

// Handle Preflight CORS Requests from React
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

try {
    // 1) Authenticate user
    $authUser = authenticate();
    $userId = (int)($authUser['id'] ?? 0);

    if ($userId <= 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized."]);
        exit();
    }

    // 2) Validate file input
    if (!isset($_FILES['working_sheet'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "working_sheet file is required."]);
        exit();
    }

    $file = $_FILES['working_sheet'];
    if (!empty($file['error']) && (int)$file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Upload error code: " . $file['error']]);
        exit();
    }

    // 3) Accept either student_test_id (older clients) OR test_id (current client)
    $studentTestId = isset($_POST['student_test_id']) && $_POST['student_test_id'] !== '' ? (int)$_POST['student_test_id'] : 0;
    $testId = isset($_POST['test_id']) && $_POST['test_id'] !== '' ? (int)$_POST['test_id'] : 0;

    if ($studentTestId <= 0 && $testId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "student_test_id or test_id is required."]);
        exit();
    }

    // Derive student_test_id from test_id + auth user
    if ($studentTestId <= 0) {
        $stmt = $pdo->prepare("
            SELECT id
            FROM student_tests
            WHERE user_id = ? AND test_id = ?
            ORDER BY id DESC
            LIMIT 1
        ");
        $stmt->execute([$userId, $testId]);
        $studentTestId = (int)($stmt->fetchColumn() ?: 0);

        if ($studentTestId <= 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "No student_test found for this test."]);
            exit();
        }
    }

    // 4) File Validation
    $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    $fileExtension = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
    $maxSize = 5 * 1024 * 1024; // 5MB limit

    if (!$fileExtension || !in_array($fileExtension, $allowedExtensions, true)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid file type. Only PDF and Images allowed."]);
        exit();
    }

    if (($file['size'] ?? 0) > $maxSize) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "File too large. Max 5MB allowed."]);
        exit();
    }

    // 5) Prepare Upload Path (absolute, anchored to backend/)
    $uploadDir = dirname(__DIR__) . '/uploads/working_sheets/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    // Create a unique name to prevent overwriting: studentTestId_timestamp.ext
    $newFileName = "test_" . $studentTestId . "_" . time() . "." . $fileExtension;
    $targetPath = $uploadDir . $newFileName;

    // 6) Move uploaded file + update DB
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to move uploaded file."]);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE responses SET uploaded_file = ? WHERE student_test_id = ?");
    $stmt->execute([$newFileName, $studentTestId]);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "File uploaded successfully",
        "file_name" => $newFileName,
        "student_test_id" => $studentTestId,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Upload error: " . $e->getMessage()]);
}
?>