<?php
header('Content-Type: application/json');
echo json_encode([
    "total_score" => 48,
    "math_score" => 25,
    "sci_score" => 23,
    "overall_pct" => 80.00,
    "performance_label" => "Good"
]);
?>