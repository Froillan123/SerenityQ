 // Chart data and initialization
 document.addEventListener('DOMContentLoaded', function() {
  let userChart;
  fetchChartData('week'); // Default: weekly
  
  document.querySelectorAll('.filter-btn').forEach(button => {
      button.addEventListener('click', function () {
          document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
          fetchChartData(this.dataset.period);
      });
  });
  
  function fetchChartData(period) {
      fetch(`/admin/api/users/registration-stats?period=${period}`)
          .then(response => response.json())
          .then(data => {
              if (data.error) throw new Error(data.error);
              updateChart(data);
          })
          .catch(err => {
              console.error('Fetch error:', err);
              alert('Could not load chart data');
          });
  }
  
  function updateChart(data) {
      const ctx = document.getElementById('userChart').getContext('2d');
      if (userChart) userChart.destroy();
  
      let title = 'User Registrations';
      if (data.period === 'week') {
          title += ` (${data.week_range})`;
      } else if (data.period === 'month') {
          title += ` (${data.month})`;
      } else {
          title += ` (${data.current_year})`;
      }
  
      userChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: data.labels,
              datasets: [{
                  label: 'New Users',
                  data: data.data,
                  backgroundColor: 'rgba(93, 95, 239, 0.1)',
                  borderColor: 'rgba(93, 95, 239, 1)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: 'rgba(93, 95, 239, 1)',
                  pointRadius: 4,
                  pointHoverRadius: 6
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
                          label: context => `Users: ${context.raw}`
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
      });
  }
    // Psychologist Registration Chart
    const psychologistCtx = document.getElementById('psychologistChart').getContext('2d');
    const psychologistChart = new Chart(psychologistCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'New Psychologists',
          data: [5, 7, 6, 8, 4, 9, 6, 7, 8, 10, 7, 9],
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    // Chart filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
      });
    });

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