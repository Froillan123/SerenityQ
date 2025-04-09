// activeLink.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Profile dropdown functionality
    const profile = document.querySelector('.profile');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (profile && dropdownMenu) {
        // Toggle dropdown when profile is clicked
        profile.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
    }

    // Active link functionality
    function setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // Remove active class from all links
            link.classList.remove('active');
            
            // Get the href attribute without the full path
            const linkHref = link.getAttribute('href').split('/').pop();
            
            // Check if the link matches the current page
            if (linkHref === currentPage) {
                link.classList.add('active');
                
                // Create or update the active underline
                let underline = link.querySelector('.active-underline');
                if (!underline) {
                    underline = document.createElement('span');
                    underline.className = 'active-underline';
                    link.appendChild(underline);
                }
            } else {
                // Remove underline if it exists
                const underline = link.querySelector('.active-underline');
                if (underline) {
                    underline.remove();
                }
            }
        });
    }

    // Set active link on page load
    setActiveLink();

    // Close mobile menu when a nav link is clicked
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });

    // Close dropdown when a dropdown item is clicked
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Close mobile menu if open
            if (navLinks) navLinks.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
        }
    });
});