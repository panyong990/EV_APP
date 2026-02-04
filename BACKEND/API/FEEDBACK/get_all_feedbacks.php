<?php
/* ================================================
   BACKEND/API/FEEDBACK/get_all_feedbacks.php
   ================================================ */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../CORE/Database.php';

try {
    $db = Database::conn();
    
    // Fetch all feedbacks ordered by created_at (newest first)
    $stmt = $db->prepare("
        SELECT 
            feedback_id,
            rating,
            text,
            category,
            reviewed,
            created_at
        FROM user_feedbacks
        ORDER BY created_at DESC
    ");
    
    $stmt->execute();
    $feedbacks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate statistics
    $total = count($feedbacks);
    $ratings = array_filter(array_map(function($f) { return $f['rating']; }, $feedbacks));
    $avg_rating = count($ratings) > 0 ? round(array_sum($ratings) / count($ratings), 1) : 0;

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'feedbacks' => $feedbacks,
        'stats' => [
            'total' => $total,
            'avg_rating' => $avg_rating
        ]
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Failed to fetch feedbacks: ' . $e->getMessage(),
        'feedbacks' => [],
        'stats' => ['total' => 0, 'avg_rating' => 0]
    ]);
    exit;
}
