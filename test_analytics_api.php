<?php
// Test the analytics API
$ch = curl_init('http://localhost/EV_APP/BACKEND/API/ANALYTICS/get_analytics_data.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpcode\n\n";
$data = json_decode($response, true);

// Pretty print the relevant fields
echo "Total Charging Sessions: " . ($data['total_charging_sessions'] ?? 'N/A') . "\n";
echo "Total Trips: " . ($data['total_trips'] ?? 'N/A') . "\n\n";

echo "Charging Sessions by Station:\n";
if (isset($data['charging_sessions_by_station']) && is_array($data['charging_sessions_by_station'])) {
    foreach ($data['charging_sessions_by_station'] as $station) {
        echo "  - " . ($station['station_name'] ?? $station['region'] ?? 'Unknown') . ": " . ($station['sessions_count'] ?? 0) . " sessions\n";
    }
} else {
    echo "  No data available\n";
}
?>
