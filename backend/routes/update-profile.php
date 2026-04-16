<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

// Get the raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// Extract the variables
$email = $data['email'] ?? null;
$class = $data['class'] ?? null;
$board = $data['board'] ?? null;
$parent_phone = $data['parent_phone'] ?? null;

if (!$email || !$class || !$board || !$parent_phone) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit();
}

try {
    // Update the database with the new details
    $stmt = $pdo->prepare("UPDATE users SET class=?, board=?, parent_phone=? WHERE email=?");
    $stmt->execute([$class, $board, $parent_phone, $email]);

    // Send success back so React can move them to the Instructions page!
    echo json_encode([
        "success" => true, 
        "message" => "Profile updated successfully!",
        "updated_class" => $class
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>