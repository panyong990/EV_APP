<?php
/* ========================================
   BACKEND/API/FEEDBACK/add_feedback.php
   ======================================== */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../CORE/Database.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$rating = isset($input['rating']) ? intval($input['rating']) : null;
$text = isset($input['text']) ? trim($input['text']) : '';
$category = isset($input['category']) ? trim($input['category']) : '';

// Validate input
if ($rating === null || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Rating must be between 1 and 5']);
    exit;
}

if (empty($text)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Feedback text is required']);
    exit;
}

if (strlen($text) > 500) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Feedback text must not exceed 500 characters']);
    exit;
}

try {
    $db = Database::conn();
    
    // Insert feedback into database
    $stmt = $db->prepare("
        INSERT INTO user_feedbacks (rating, text, category, reviewed, created_at)
        VALUES (?, ?, ?, 0, NOW())
    ");
    
    $stmt->execute([$rating, $text, $category]);
    $feedback_id = $db->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'ok' => true,
        'message' => 'Feedback submitted successfully',
        'feedback_id' => $feedback_id,
        'rating' => $rating,
        'text' => $text,
        'category' => $category,
        'created_at' => date('Y-m-d H:i:s')
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to submit feedback: ' . $e->getMessage()]);
    exit;
}
