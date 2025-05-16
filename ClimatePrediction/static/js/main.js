document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const predictBtn = document.getElementById('predict-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsSection = document.getElementById('results-section');
    const dayBtns = document.querySelectorAll('.day-btn');
    const metricBtns = document.querySelectorAll('.metric-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const locationText = document.getElementById('location-text');
    const changeLocationBtn = document.getElementById('change-location');
    const locationForm = document.getElementById('location-form');
    const saveLocationBtn = document.getElementById('save-location');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    
    // State variables
    let selectedDays = 7; // Default to 7 days
    let currentMetric = 'temperature';
    let predictions = [];
    let userLocation = {
        latitude: 28.6139, // Default: Delhi
        longitude: 77.2090
    };
    let climateChart = null;
    
    // Initialize the application
    function init() {
        getUserLocation();
        setupEventListeners();
    }
    
    // Get user's location
    function getUserLocation() {
        if (navigator.geolocation) {
            locationText.textContent = "Detecting your location...";
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    userLocation.latitude = position.coords.latitude;
                    userLocation.longitude = position.coords.longitude;
                    updateLocationDisplay();
                },
                function(error) {
                    console.error("Geolocation error:", error);
                    locationText.textContent = "Location access denied. Using default location.";
                }
            );
        } else {
            locationText.textContent = "Geolocation not supported. Using default location.";
        }
    }
    
    // Update location display
    function updateLocationDisplay() {
        // Round to 4 decimal places for display
        const lat = userLocation.latitude.toFixed(4);
        const lon = userLocation.longitude.toFixed(4);
        locationText.textContent = `Lat: ${lat}, Lon: ${lon}`;
        
        // Update form inputs
        latitudeInput.value = userLocation.latitude;
        longitudeInput.value = userLocation.longitude;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Day selection buttons
        dayBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                dayBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update selected days
                selectedDays = parseInt(this.dataset.days);
            });
        });
        
        // Metric selection buttons
        metricBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                metricBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update selected metric
                currentMetric = this.dataset.metric;
                
                // Update chart if we have predictions
                if (predictions.length > 0) {
                    updateChart();
                }
            });
        });
        
        // Tab buttons
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => content.classList.add('hidden'));
                
                // Show the selected tab content
                const targetId = this.dataset.view + '-view';
                document.getElementById(targetId).classList.remove('hidden');
            });
        });
        
        // Prediction button
        predictBtn.addEventListener('click', getPredictions);
        
        // Location buttons
        changeLocationBtn.addEventListener('click', function() {
            locationForm.classList.remove('hidden');
        });
        
        saveLocationBtn.addEventListener('click', function() {
            const lat = parseFloat(latitudeInput.value);
            const lon = parseFloat(longitudeInput.value);
            
            // Validate inputs
            if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                alert('Please enter valid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.');
                return;
            }
            
            userLocation.latitude = lat;
            userLocation.longitude = lon;
            updateLocationDisplay();
            locationForm.classList.add('hidden');
        });
    }
    
    // Get climate predictions
    function getPredictions() {
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        predictBtn.disabled = true;
        
        // Create form data
        const formData = new FormData();
        formData.append('days', selectedDays);
        formData.append('latitude', userLocation.latitude);
        formData.append('longitude', userLocation.longitude);
        
        // Send request to backend
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            predictBtn.disabled = false;
            
            if (data.success) {
                // Store predictions
                predictions = data.predictions;
                
                // Display results
                displayResults();
                
                // Show results section
                resultsSection.classList.remove('hidden');
                
                // Scroll to results
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            predictBtn.disabled = false;
            
            alert('Error fetching predictions: ' + error.message);
        });
    }
    
    // Display prediction results
    function displayResults() {
        // Update chart
        updateChart();
        
        // Update table
        updateTable();
    }
    
    // Update the climate chart
    function updateChart() {
        const ctx = document.getElementById('climate-chart').getContext('2d');
        
        // Prepare data
        const labels = predictions.map(p => p.date);
        const data = predictions.map(p => p[currentMetric]);
        
        // Define chart colors based on metric
        const colorMap = {
            'temperature': {
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)'
            },
            'humidity': {
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)'
            },
            'precipitation': {
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)'
            },
            'wind_speed': {
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)'
            }
        };
        
        // Define metric units
        const unitMap = {
            'temperature': '°C',
            'humidity': '%',
            'precipitation': 'mm',
            'wind_speed': 'km/h'
        };
        
        // Format metric display name
        const formatMetricName = (metric) => {
            return metric.charAt(0).toUpperCase() + metric.slice(1).replace('_', ' ');
        };
        
        // Destroy existing chart if it exists
        if (climateChart) {
            climateChart.destroy();
        }
        
        // Create new chart
        climateChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${formatMetricName(currentMetric)} (${unitMap[currentMetric]})`,
                    data: data,
                    borderColor: colorMap[currentMetric].borderColor,
                    backgroundColor: colorMap[currentMetric].backgroundColor,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: colorMap[currentMetric].borderColor,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: currentMetric !== 'temperature',
                        title: {
                            display: true,
                            text: `${formatMetricName(currentMetric)} (${unitMap[currentMetric]})`,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${formatMetricName(currentMetric)}: ${context.parsed.y} ${unitMap[currentMetric]}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update the predictions table
    function updateTable() {
        const tbody = document.getElementById('predictions-tbody');
        tbody.innerHTML = '';
        
        // Create table rows for each prediction
        predictions.forEach(prediction => {
            const row = document.createElement('tr');
            
            // Date cell
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(prediction.date);
            row.appendChild(dateCell);
            
            // Temperature cell
            const tempCell = document.createElement('td');
            tempCell.textContent = `${prediction.temperature} °C`;
            row.appendChild(tempCell);
            
            // Humidity cell
            const humidityCell = document.createElement('td');
            humidityCell.textContent = `${prediction.humidity} %`;
            row.appendChild(humidityCell);
            
            // Precipitation cell
            const precipCell = document.createElement('td');
            precipCell.textContent = `${prediction.precipitation} mm`;
            row.appendChild(precipCell);
            
            // Wind speed cell
            const windCell = document.createElement('td');
            windCell.textContent = `${prediction.wind_speed} km/h`;
            row.appendChild(windCell);
            
            tbody.appendChild(row);
        });
    }
    
    // Format date for display
    function formatDate(dateStr) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }
    
    // Initialize the application
    init();
});