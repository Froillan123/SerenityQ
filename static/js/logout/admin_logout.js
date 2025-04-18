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
                    credentials: 'include'  // Important for cookies
                });

                // Check if response is OK before trying to parse JSON
                if (response.ok) {
                    // Clear client-side storage
                    localStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_token');
                    
                    // Get the redirect URL from response if available
                    let redirectUrl = '/admin/login';
                    try {
                        const data = await response.json();
                        if (data.redirect) {
                            redirectUrl = data.redirect;
                        }
                    } catch (e) {
                        console.log('No JSON in response, using default redirect');
                    }
                    
                    // Force redirect with cache busting
                    window.location.href = redirectUrl + '?timestamp=' + new Date().getTime();
                    
                    // Prevent any further execution
                    return;
                } else {
                    // Handle non-OK responses
                    try {
                        const errorData = await response.json();
                        console.error('Logout failed:', errorData.error || 'Unknown error');
                        alert(errorData.error || 'Logout failed. Please try again.');
                    } catch (e) {
                        console.error('Logout failed:', response.statusText);
                        alert('Logout failed. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred during logout.');
            }
        });
    }
});