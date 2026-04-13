<?php
// Local database credentials
$host = '127.0.0.1';
$db   = 'pramyan'; 
$user = 'root';       
$pass = '';   // your password        

try {
    // Create the connection
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    
    // Set PDO to throw exceptions on errors so they are easier to debug
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    // If the connection fails, return a JSON error so the frontend doesn't crash
    header('Content-Type: application/json');
    die(json_encode(["error" => "Database connection failed."]));
}
?>