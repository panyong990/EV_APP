<?php
// Test the record_session.php API
$ch = curl_init('http://localhost/EV_APP/BACKEND/API/CHARGING/record_session.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'user_id' => 1,
    'station_id' => 1,
    'station_name' => 'Test Station 1',
    'operator_name' => 'Test Operator',
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'energy_added_kwh' => 10
]));

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpcode\n";
echo "Response: $response";
?>
