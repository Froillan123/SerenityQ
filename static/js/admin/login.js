        // Toggle password visibility
        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#password');
        const eyeIcon = togglePassword.querySelector('i');

        togglePassword.addEventListener('click', function () {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            
            if (type === 'password') {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            } else {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            }
        });

        // Enhanced Alert System
        function showAlert(type, title, message, duration = 3000) {
            const alertContainer = document.getElementById('alertContainer');
            const alertId = 'alert-' + Date.now();
            
            const alertEl = document.createElement('div');
            alertEl.className = `alert ${type}`;
            alertEl.id = alertId;
            
            alertEl.innerHTML = `
                <div class="alert-icon">
                    <i class="fas ${
                        type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-circle' :
                        type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
                    }"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${title}</div>
                    <div class="alert-message">${message}</div>
                </div>
                <div class="alert-close">&times;</div>
                <div class="progress-bar"><div class="progress-fill"></div></div>
            `;
            
            alertContainer.appendChild(alertEl);
            
            // Show alert
            setTimeout(() => {
                alertEl.classList.add('show');
            }, 10);
            
            // Close button handler
            const closeBtn = alertEl.querySelector('.alert-close');
            closeBtn.addEventListener('click', () => {
                hideAlert(alertId);
            });
            
            // Auto-hide if duration is set
            if (duration > 0) {
                setTimeout(() => {
                    hideAlert(alertId);
                }, duration);
            }
            
            return alertId;
        }
        
        function hideAlert(alertId) {
            const alertEl = document.getElementById(alertId);
            if (alertEl) {
                alertEl.classList.remove('show');
                alertEl.classList.add('hide');
                
                // Remove after animation
                setTimeout(() => {
                    alertEl.remove();
                }, 400);
            }
        }

        // Form submission
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Clear previous errors
            document.getElementById('username-error').style.display = 'none';
            document.getElementById('password-error').style.display = 'none';
            
            // Validate inputs
            if (!username) {
                document.getElementById('username-error').textContent = 'Username is required';
                document.getElementById('username-error').style.display = 'block';
                return;
            }
            
            if (!password) {
                document.getElementById('password-error').textContent = 'Password is required';
                document.getElementById('password-error').style.display = 'block';
                return;
            }
            
            try {
                // Show loading state
                const loginBtn = document.querySelector('.login-button');
                const originalText = loginBtn.textContent;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
                loginBtn.disabled = true;
                
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        remember
                    }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showAlert('success', 'Login Successful', 'Redirecting to dashboard...');
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = data.redirect || '/admin/dashboard';
                    }, 1000);
                } else {
                    showAlert('error', 'Login Failed', data.error || 'Invalid credentials');
                    window.location.reload();
                    
                    if (data.field === 'username') {
                        document.getElementById('username-error').textContent = data.error;
                        document.getElementById('username-error').style.display = 'block';
                    } else if (data.field === 'password') {
                        document.getElementById('password-error').textContent = data.error;
                        document.getElementById('password-error').style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('error', 'Connection Error', 'Failed to connect to server. Please try again.');
            } finally {
                // Reset button state
                const loginBtn = document.querySelector('.login-button');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        });