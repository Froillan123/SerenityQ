 // Chart data and initialization
 document.addEventListener('DOMContentLoaded', function() {
    // User Registration Chart
    const userCtx = document.getElementById('userChart').getContext('2d');
    const userChart = new Chart(userCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'New Users',
          data: [12, 19, 15, 22, 18, 25, 30],
          backgroundColor: 'rgba(93, 95, 239, 0.1)',
          borderColor: 'rgba(93, 95, 239, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
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