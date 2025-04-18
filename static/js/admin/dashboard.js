// Chart data and initialization
document.addEventListener('DOMContentLoaded', function() {
    let userChart;
    let psychologistChart;
    
    // Initialize both charts
    fetchChartData('week', 'user');
    fetchChartData('week', 'psychologist');
    
    // Add event listeners to filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            const chartType = this.closest('.chart-header').querySelector('h3').textContent.includes('User') ? 'user' : 'psychologist';
            const period = this.dataset.period;
            
            // Update active state
            this.closest('.chart-filter').querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Fetch new data
            fetchChartData(period, chartType);
        });
    });
    
    function fetchChartData(period, chartType) {
        const endpoint = chartType === 'user' 
            ? `/admin/api/users/registration-stats?period=${period}`
            : `/admin/api/psychologists/registration-stats?period=${period}`;
            
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                updateChart(data, chartType);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                showToast('Could not load chart data', 'error');
            });
    }
    
    function updateChart(data, chartType) {
        const ctx = document.getElementById(`${chartType}Chart`).getContext('2d');
        const existingChart = chartType === 'user' ? userChart : psychologistChart;
        
        if (existingChart) {
            existingChart.destroy();
        }
        
        let title = chartType === 'user' ? 'User Registrations' : 'Psychologist Registrations';
        if (data.period === 'week') {
            title += ` (${data.week_range})`;
        } else if (data.period === 'month') {
            title += ` (${data.month})`;
        } else {
            title += ` (${data.current_year})`;
        }
        
        const chartConfig = {
            type: chartType === 'user' ? 'line' : 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: chartType === 'user' ? 'New Users' : 'New Psychologists',
                    data: data.data,
                    backgroundColor: chartType === 'user' 
                        ? 'rgba(93, 95, 239, 0.1)'
                        : 'rgba(76, 175, 80, 0.7)',
                    borderColor: chartType === 'user'
                        ? 'rgba(93, 95, 239, 1)'
                        : 'rgba(76, 175, 80, 1)',
                    borderWidth: chartType === 'user' ? 2 : 1,
                    tension: chartType === 'user' ? 0.4 : 0,
                    fill: chartType === 'user',
                    pointBackgroundColor: chartType === 'user' ? 'rgba(93, 95, 239, 1)' : undefined,
                    pointRadius: chartType === 'user' ? 4 : undefined,
                    pointHoverRadius: chartType === 'user' ? 6 : undefined
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: context => `${chartType === 'user' ? 'Users' : 'Psychologists'}: ${context.raw}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        };
        
        if (chartType === 'user') {
            userChart = new Chart(ctx, chartConfig);
        } else {
            psychologistChart = new Chart(ctx, chartConfig);
        }
    }
    
    // Helper function to show toast messages
    function showToast(message, type = 'success') {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Position the toast
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '4px';
        toast.style.color = '#fff';
        toast.style.backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-in-out';
        
        setTimeout(() => {
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
    }

    // Approve/Reject/View buttons
    const approveButtons = document.querySelectorAll('.approve-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    approveButtons.forEach(button => {
      button.addEventListener('click', function() {
        const row = this.closest('tr');
        row.remove();
        alert('User approved successfully!');
      });
    });
    
    rejectButtons.forEach(button => {
      button.addEventListener('click', function() {
        const row = this.closest('tr');
        row.remove();
        alert('User rejected successfully!');
      });
    });

    viewButtons.forEach(button => {
      button.addEventListener('click', function() {
        alert('Viewing user details...');
      });
    });
});