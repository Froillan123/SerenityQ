document.getElementById('logout-btn').addEventListener('click', async function(e) {
    e.preventDefault();  // Prevent default anchor behavior
    
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',  // Important for cookies
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }

        const data = await response.json();
        
        // Clear all client-side storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Force a hard redirect to landing page
        window.location.replace(data.redirect || '/auth');
        
    } catch (error) {
        console.error('Logout error:', error);
        // Fallback redirect if something goes wrong
        window.location.replace('/auth');
    }
});