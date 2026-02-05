<?php
/**
 * Record Charging Session
 * Saves a charging station visit/session for analytics
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../CORE/Database.php';

try {
    $db = Database::conn();

    // GET Request: Fetch user's charging sessions
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $userId = $_GET['user_id'] ?? null;
        $limit = $_GET['limit'] ?? 50;

        if (!$userId) {
            throw new Exception("user_id is required");
        }

        $stmt = $db->prepare("
            SELECT * FROM charging_sessions 
            WHERE user_id = ? 
            ORDER BY session_start DESC 
            LIMIT ?
        ");
        $stmt->execute([$userId, (int)$limit]);
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['ok' => true, 'sessions' => $sessions]);
        exit;
    }

    // POST Request: Record new charging session
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $userId = (int)($input['user_id'] ?? 0);
        $stationId = (int)($input['station_id'] ?? 0);
        $stationName = $input['station_name'] ?? 'Unknown Station';
        $operatorName = $input['operator_name'] ?? 'Unknown Operator';
        $latitude = (float)($input['latitude'] ?? 0);
        $longitude = (float)($input['longitude'] ?? 0);
        $energyAddedKwh = (float)($input['energy_added_kwh'] ?? 0);
        $durationMin = (int)($input['duration_min'] ?? 0);

        // Validation
        if ($userId <= 0) {
            throw new Exception("Invalid user_id");
        }

        // Auto-create table if missing
        $db->exec("CREATE TABLE IF NOT EXISTS charging_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            station_id INT,
            station_name VARCHAR(255),
            operator_name VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            energy_added_kwh FLOAT DEFAULT 0,
            duration_min INT DEFAULT 0,
            session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_end DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(user_id),
            INDEX(station_id),
            INDEX(session_start)
        )");

        // Insert charging session
        $stmt = $db->prepare("
            INSERT INTO charging_sessions 
            (user_id, station_id, station_name, operator_name, latitude, longitude, energy_added_kwh, duration_min, session_start)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $userId,
            $stationId > 0 ? $stationId : null,
            $stationName,
            $operatorName,
            $latitude,
            $longitude,
            $energyAddedKwh,
            $durationMin
        ]);

        $sessionId = $db->lastInsertId();

        echo json_encode([
            'ok' => true,
            'message' => 'Charging session recorded',
            'session_id' => $sessionId
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
?>
