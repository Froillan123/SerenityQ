        // Chart.js implementation
        document.addEventListener('DOMContentLoaded', function () {
            // Sessions Overview Chart
            var sessionsCtx = document.getElementById('sessionsChart').getContext('2d');
            var sessionsChart = new Chart(sessionsCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Sessions',
                        data: [28, 35, 32, 29],
                        borderColor: '#5D5FEF',
                        backgroundColor: 'rgba(93, 95, 239, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            // Demographics Chart
            var demographicsCtx = document.getElementById('demographicsChart').getContext('2d');
            var demographicsChart = new Chart(demographicsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Anxiety', 'Depression', 'PTSD', 'Stress', 'Others'],
                    datasets: [{
                        data: [35, 25, 15, 18, 7],
                        backgroundColor: [
                            '#5D5FEF',
                            '#FF7E5F',
                            '#FFD166',
                            '#4CAF50',
                            '#8D99AE'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    cutout: '70%'
                }
            });
        });