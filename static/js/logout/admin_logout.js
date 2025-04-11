document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/admin/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                    },
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    // Clear any admin tokens from storage
                    localStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_token');
                    
                    // Redirect to login page
                    window.location.href = data.redirect || '/admin/login';
                } else {
                    console.error('Logout failed:', data.error);
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred during logout.');
            }
        });
    }
});