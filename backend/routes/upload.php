<?php
header('Content-Type: application/json');
echo json_encode([
    "uploaded" => true,
    "file_path" => "uploads/dummy_rough_work.pdf"
]);
?>