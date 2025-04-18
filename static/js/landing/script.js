document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.innerHTML = `
        <ul class="mobile-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#psychologists">Psychologists</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        <div class="mobile-auth-links">
            <a href="#" class="btn btn-outline btn-sm" id="mobile-login-btn">Login</a>
            <a href="#" class="btn btn-primary btn-sm" id="mobile-get-started-btn">Get Started</a>
        </div>
    `;
    document.body.appendChild(mobileNav);
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
    });
    
    overlay.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        closeAllModals();
    });
    
    // Modal functionality
    const userTypeModal = document.getElementById('user-type-modal');
    const loginTypeModal = document.getElementById('login-type-modal');
    const getStartedBtn = document.getElementById('get-started-btn');
    const loginBtn = document.getElementById('login-btn');
    const mobileGetStartedBtn = document.getElementById('mobile-get-started-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const showLoginFromType = document.getElementById('show-login-from-type');
    const showUserType = document.getElementById('show-user-type');
    const closeModals = document.querySelectorAll('.close-modal');
    
    function openModal(modal) {
        closeAllModals();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
    }
    
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            closeModal(modal);
        });
    }
    
    // Event listeners for desktop buttons
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(userTypeModal);
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(loginTypeModal);
        });
    }
    
    // Event listeners for mobile buttons
    if (mobileGetStartedBtn) {
        mobileGetStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            openModal(userTypeModal);
        });
    }
    
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            openModal(loginTypeModal);
        });
    }
    
    // Switch between modals
    if (showLoginFromType) {
        showLoginFromType.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(userTypeModal);
            openModal(loginTypeModal);
        });
    }
    
    if (showUserType) {
        showUserType.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginTypeModal);
            openModal(userTypeModal);
        });
    }
    
    // Close modals
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Close mobile menu if open
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Skip if it's a modal trigger
            if (this.id === 'login-btn' || this.id === 'get-started-btn' || 
                this.id === 'show-login-from-type' || this.id === 'show-user-type' ||
                this.id === 'mobile-login-btn' || this.id === 'mobile-get-started-btn') {
                return;
            }
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});