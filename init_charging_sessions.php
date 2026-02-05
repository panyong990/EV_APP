<?php
require_once 'BACKEND/CONFIG/database.php';
require_once 'BACKEND/CORE/Database.php';

try {
    $db = Database::conn();
    
    $sql = "CREATE TABLE IF NOT EXISTS charging_sessions (
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
    )";
    
    $db->exec($sql);
    echo json_encode(['ok' => true, 'message' => 'charging_sessions table created successfully']);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>
