document.addEventListener('DOMContentLoaded', function() {
    const logoutLinks = document.querySelectorAll('a[href*="logout"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Correct URL for the POST request
            fetch('{{ url_for("psychologist.psychologist_logout") }}', {  // Use url_for in the template to correctly generate the logout URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'  // Important for cookie-based auth
            })
            .then(response => response.json())
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;  // Redirect to the URL sent from the backend
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
                window.location.href = '/';  // Fallback redirect if something goes wrong
            });
        });
    });
});
