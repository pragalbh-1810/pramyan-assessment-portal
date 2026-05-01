<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

$user = authenticate();
$test_id = $_GET['test_id'] ?? null;

if (!$test_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "test_id is required"]);
    exit();
}

// Fetch all questions exactly as they appear in the database
$stmt = $pdo->prepare("
    SELECT id, section, q_text, q_image, opt_a, opt_b, opt_c, opt_d, chapter, bloom_level, skill_type
    FROM questions WHERE test_id = ?
");
$stmt->execute([$test_id]);
$questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return EXACTLY the number of questions in the database (usually 60) so pagination works correctly!
echo json_encode([
    "success" => true,
    "test_id" => (int)$test_id,
    "total_questions" => count($questions), 
    "questions" => $questions
]);
?>