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
    $authHeader = null;

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = trim($value);
                break;
            }
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
    $envPath = dirname(__DIR__) . '/.env';
    $secret  = "pramyan_super_secret_key_2026"; // fallback default
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            [$envKey, $envVal] = array_pad(explode('=', $line, 2), 2, '');
            if (trim($envKey) === 'JWT_SECRET') {
                $secret = trim((string)$envVal, " \t\n\r\0\x0B\"'");
                break;
            }
        }
    }

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