<?php

function verifyJWT($token, $secret) {
    $parts = explode('.', $token);

    if(count($parts) !== 3){
        return false;
    }

    list($header, $payload, $signature) = $parts;

    // 1. Verify the signature matches
    $validSignature = rtrim(
        base64_encode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        ),
        '='
    );

    if($signature !== $validSignature){
        return false; // Signature was tampered with
    }

    $decoded = json_decode(base64_decode($payload), true);

    // 2. NEW: Check if the token has expired
    if (isset($decoded['exp']) && $decoded['exp'] < time()) {
        return false; // Token is expired
    }

    return $decoded;
}

function authenticate() {
    // NEW: Safely get the Authorization header regardless of the server type
    $authHeader = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $authHeader = trim($requestHeaders['Authorization']);
        }
    }

    // Check if the header was found
    if (!$authHeader) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Token missing"
        ]);
        exit();
    }

    // Extract the token (removing "Bearer ")
    $token = str_replace("Bearer ", "", $authHeader);
    
    // Use the exact same secret key
    $secret = "pramyan_super_secret_key_2026";

    // Verify it
    $decoded = verifyJWT($token, $secret);

    if (!$decoded) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired token"
        ]);
        exit();
    }

    return $decoded;
}
?>