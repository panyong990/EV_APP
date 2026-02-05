let tripsChartInstance = null;
let stationsChartInstance = null;

// Fetch analytics data from API
async function fetchAnalyticsData() {
  try {
    console.log('Fetching analytics data...');
    const response = await fetch('/EV_APP/BACKEND/API/ANALYTICS/get_analytics_data.php');
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Analytics Data received:', data);
    console.log('Charging sessions count:', data.total_charging_sessions);
    console.log('Charging sessions by station:', data.charging_sessions_by_station);
    
    // Update summary cards
    document.getElementById('totalTripsCount').textContent = data.total_trips.toLocaleString();
    document.getElementById('chargingSessionsCount').textContent = data.total_charging_sessions.toLocaleString();
    document.getElementById('avgEfficiencyCount').textContent = data.avg_efficiency + '%';
    
    // Update charts
    updateTripsChart(data.trips_by_location);
    
    // Fetch charging stations data separately if not available
    if (data.charging_sessions_by_station && Array.isArray(data.charging_sessions_by_station) && data.charging_sessions_by_station.length) {
      console.log('Using charging_sessions_by_station from API');
      updateStationsChart(data.charging_sessions_by_station, { type: 'sessions' });
    } else if (data.charging_by_region && Array.isArray(data.charging_by_region) && data.charging_by_region.length) {
      console.log('Using charging_by_region from API');
      updateStationsChart(data.charging_by_region, { type: 'stations' });
    } else {
      console.log('Fetching from charging stations fallback...');
      // Fallback: fetch from charging stations API
      await fetchChargingStationsData();
    }
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    // Still try to fetch charging data
    await fetchChargingStationsData();
  }
}

// Fetch charging stations data as fallback
async function fetchChargingStationsData() {
  try {
    const response = await fetch('/EV_APP/BACKEND/API/CHARGING/free.php');
    if (!response.ok) {
      throw new Error(`Failed to fetch charging stations: ${response.status}`);
    }
    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Group by station name and count sessions
      const stationMap = {};
      data.forEach(station => {
        const name = station.station_name || 'Unknown Station';
        stationMap[name] = (stationMap[name] || 0) + 1;
      });
      
      // Convert to chart format
      const chartData = Object.entries(stationMap).map(([name, count]) => ({
        station_name: name,
        sessions_count: count
      }));
      
      updateStationsChart(chartData, { type: 'sessions' });
    }
  } catch (error) {
    console.error('Error fetching charging stations:', error);
  }
}

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 5, bottom: 5 }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
        font: { family: 'Inter', size: 11, weight: '500' },
        color: '#64748b',
        padding: 10
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#f1f5f9',
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      titleFont: { family: 'Inter', size: 13, weight: '600' },
      bodyFont: { family: 'Inter', size: 12, weight: '500' },
      yAlign: 'bottom',
      caretSize: 6
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: { font: { family: 'Inter', size: 11, weight: '500' }, color: '#94a3b8', padding: 8 },
      border: { display: false }
    },
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { font: { family: 'Inter', size: 11, weight: '500' }, color: '#64748b' },
      border: { display: false }
    }
  }
};

// Update Trips Chart with real data
function updateTripsChart(tripsData) {
  const labels = tripsData.map(item => item.city);
  const data = tripsData.map(item => item.count);
  
  const tripsCtx = document.getElementById("tripsChart").getContext('2d');
  const tripsOpts = JSON.parse(JSON.stringify(commonOptions));
  
  if (tripsChartInstance) {
    tripsChartInstance.destroy();
  }
  
  tripsChartInstance = new Chart(tripsCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Trips (Locations)",
          data: data,
          backgroundColor: "#3b82f6",
          hoverBackgroundColor: "#1d4ed8",
          barPercentage: 0.6,
          categoryPercentage: 0.7,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: tripsOpts
  });
}

// Update Stations Chart with real data
function updateStationsChart(stationsData, opts = {}) {
  const mode = opts.type || 'stations';
  const labels = stationsData.map(item => item.station_name || item.region || item.operator_name || 'Station');
  const data = stationsData.map(item => {
    // support multiple field names
    if (mode === 'sessions') return Number(item.sessions_count || item.sessions || item.count || item.station_count || 0);
    return Number(item.station_count || item.count || item.sessions_count || 0);
  });
  
  const stationsCtx = document.getElementById("stationsChart").getContext('2d');
  const stationsOpts = JSON.parse(JSON.stringify(commonOptions));
  
  if (stationsChartInstance) {
    stationsChartInstance.destroy();
  }
  
  stationsChartInstance = new Chart(stationsCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: mode === 'sessions' ? "Charging Sessions (per station)" : "Charging Stations",
          data: data,
          backgroundColor: mode === 'sessions' ? "#10b981" : "#60a5fa",
          hoverBackgroundColor: mode === 'sessions' ? "#047857" : "#2563eb",
          barPercentage: 0.6,
          categoryPercentage: 0.7,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: stationsOpts
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchAnalyticsData();
  // Refresh every 10 seconds for real-time charging station updates
  setInterval(fetchAnalyticsData, 10000);
});

