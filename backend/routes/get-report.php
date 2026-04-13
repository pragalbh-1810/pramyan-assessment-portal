<?php
header('Content-Type: application/json');
echo json_encode([
    "total_score" => 45,
    "math_score" => 25,
    "sci_score" => 20,
    "overall_pct" => 75.0,
    "performance_label" => "Good"
]);
?>