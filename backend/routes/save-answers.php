<?php
header('Content-Type: application/json');

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
?>