<?php
// routes/google-auth.php
header('Content-Type: application/json');

// Allow CORS for local React testing (Rounak will need this!)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// ---------------------------------------------------------
// FUTURE LOGIC (For Day 2/3)
// ---------------------------------------------------------

echo json_encode([
    "authenticated" => true,
    "message" => "Google Login Successful",
    "user" => [
        "id" => 2,
        "name" => "Student Keerthiga",
        "email" => "keerthiga@student.com",
        "role" => "student"
    ],
    "token" => "dummy_jwt_token_12345"
]);
?>