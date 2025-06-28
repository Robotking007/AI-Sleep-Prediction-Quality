document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    let gaugeChart, sleepStagesChart, correlationChart;
    
    // Form submission
    const sleepForm = document.getElementById('sleepForm');
    const resultsSection = document.getElementById('resultsSection');
    
    sleepForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            heartRate: parseInt(document.getElementById('heartRate').value),
            steps: parseInt(document.getElementById('steps').value),
            activeMinutes: parseInt(document.getElementById('activeMinutes').value),
            calories: parseInt(document.getElementById('calories').value),
            stressLevel: parseInt(document.getElementById('stressLevel').value),
            timeInBed: parseInt(document.getElementById('timeInBed').value),
            sleepInterruptions: parseInt(document.getElementById('sleepInterruptions').value)
        };
        
        // Send data to server
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            
            // Update UI with results
            document.getElementById('qualityScore').textContent = data.sleepQuality;
            updateGaugeChart(data.sleepQuality);
            updateSleepStagesChart(data.sleepStages);
            updateRecommendations(data.recommendations);
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });
    
    // Initialize correlation chart
    initCorrelationChart();
    
    // Initialize gauge chart placeholder
    function initGaugeChart() {
        const options = {
            series: [0],
            chart: {
                height: 300,
                type: 'radialBar',
            },
            plotOptions: {
                radialBar: {
                    startAngle: -135,
                    endAngle: 135,
                    hollow: {
                        margin: 0,
                        size: '70%',
                    },
                    dataLabels: {
                        name: {
                            offsetY: -10,
                            color: '#333',
                            fontSize: '13px'
                        },
                        value: {
                            color: '#333',
                            fontSize: '30px',
                            show: true
                        }
                    },
                    track: {
                        background: '#e0e0e0',
                        strokeWidth: '97%',
                        margin: 5,
                    }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 50, 65, 91]
                },
            },
            stroke: {
                dashArray: 4
            },
            labels: ['Sleep Quality Score'],
        };
        
        gaugeChart = new ApexCharts(document.querySelector("#gaugeChart"), options);
        gaugeChart.render();
    }
    
    // Update gauge chart with actual data
    function updateGaugeChart(score) {
        gaugeChart.updateSeries([score]);
        
        // Change color based on score
        let color;
        if (score < 40) {
            color = '#ff4560'; // Red for poor sleep
        } else if (score < 70) {
            color = '#feb019'; // Yellow for moderate sleep
        } else {
            color = '#00e396'; // Green for good sleep
        }
        
        gaugeChart.updateOptions({
            fill: {
                colors: [color]
            }
        });
    }
    
    // Initialize sleep stages chart
    function initSleepStagesChart() {
        const options = {
            series: [{
                name: 'Sleep Stages',
                data: [25, 35, 40] // Default data
            }],
            chart: {
                type: 'bar',
                height: 300,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '45%',
                    endingShape: 'rounded',
                    distributed: true
                },
            },
            dataLabels: {
                enabled: false
            },
            colors: ['#008FFB', '#00E396', '#FEB019'],
            xaxis: {
                categories: ['REM', 'Deep', 'Light'],
            },
            yaxis: {
                title: {
                    text: 'Percentage of Sleep'
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + "%"
                    }
                }
            }
        };
        
        sleepStagesChart = new ApexCharts(document.querySelector("#sleepStagesChart"), options);
        sleepStagesChart.render();
    }
    
    // Update sleep stages chart with actual data
    function updateSleepStagesChart(stages) {
        sleepStagesChart.updateSeries([{
            data: [stages.REM, stages.Deep, stages.Light]
        }]);
    }
    
    // Initialize correlation chart
    function initCorrelationChart() {
        const ctx = document.getElementById('correlationChart').getContext('2d');
        
        // Sample correlation data
        correlationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Heart Rate', 'Steps', 'Activity', 'Calories', 'Stress', 'Time in Bed'],
                datasets: [{
                    label: 'Correlation with Sleep Quality',
                    data: [-0.65, 0.42, 0.38, 0.35, -0.72, 0.58],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: -1,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Correlation Coefficient'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y.toFixed(2);
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update recommendations list
    function updateRecommendations(recommendations) {
        const list = document.getElementById('recommendationsList');
        list.innerHTML = '';
        
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            list.appendChild(li);
        });
    }
    
    // Initialize charts when page loads
    initGaugeChart();
    initSleepStagesChart();
});