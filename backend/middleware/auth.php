<?php
// middleware/auth.php

function authenticate() {
    // Get headers from the request
    $headers = apache_request_headers();

    // ---------------------------------------------------------
    // FUTURE LOGIC (Uncomment when real authentication is built)
    // ---------------------------------------------------------

    return [
        "authenticated" => true,
        "user_id" => 2,
        "role" => "student"
    ];
}
?>