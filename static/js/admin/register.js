document.addEventListener('DOMContentLoaded', function() {
    // Toast notification system
    function showToast(message, type = 'success', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        let icon;
        switch(type) {
            case 'success':
                icon = 'fa-check-circle';
                break;
            case 'error':
                icon = 'fa-exclamation-circle';
                break;
            case 'warning':
                icon = 'fa-exclamation-triangle';
                break;
            case 'info':
                icon = 'fa-info-circle';
                break;
            default:
                icon = 'fa-info-circle';
        }
        
        toast.innerHTML = `
            <i class="fas ${icon} toast-icon"></i>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            hideToast(toast);
        });
        
        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                hideToast(toast);
            }, duration);
        }
        
        return toast;
    }
    
    function hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    // Check admin limit
    fetch('/admin/api/admin/count')
        .then(response => {
            if (!response.ok) throw new Error('Failed to check admin count');
            return response.json();
        })
        .then(data => {
            if (data.count >= 2) {
                document.getElementById('adminLimitWarning').style.display = 'block';
                document.getElementById('registerForm').style.display = 'none';
                document.querySelector('.register-header p').textContent = 
                    'Maximum admin accounts reached (2/2)';
            }
        })
        .catch(error => {
            console.error('Error checking admin count:', error);
            showToast('Failed to check admin limit', 'error');
        });

    // Form submission handler
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        
        // Get form data
        const formData = {
            fullname: document.getElementById('fullname').value.trim(),
            email: document.getElementById('email').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            confirm_password: document.getElementById('confirm-password').value,
            secret_key: document.getElementById('secret-key').value
        };
        
        // Client-side validation
        let isValid = true;
        
        if (!formData.fullname) {
            document.getElementById('fullname-error').style.display = 'block';
            isValid = false;
        }
        
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            document.getElementById('email-error').style.display = 'block';
            isValid = false;
        }
        
        if (!formData.username || formData.username.length < 4) {
            document.getElementById('username-error').style.display = 'block';
            isValid = false;
        }
        
        if (!formData.password || formData.password.length < 8 || 
            !/[A-Z]/.test(formData.password) || 
            !/[a-z]/.test(formData.password) || 
            !/[0-9]/.test(formData.password) || 
            !/[^A-Za-z0-9]/.test(formData.password)) {
            document.getElementById('password-error').style.display = 'block';
            isValid = false;
        }
        
        if (formData.password !== formData.confirm_password) {
            document.getElementById('confirm-password-error').style.display = 'block';
            isValid = false;
        }
        
        if (!formData.secret_key) {
            document.getElementById('secret-key-error').style.display = 'block';
            isValid = false;
        }
        
        if (!isValid) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }
        
        // Disable button during submission
        const registerButton = document.getElementById('registerButton');
        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';
        
        // Send data to server
        fetch('/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw err;
                });
            }
            return response.json();
        })
        .then(data => {
            showToast('Admin registered successfully! Redirecting to login...', 'success');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = '/admin/login';
            }, 2000);
        })
        .catch(error => {
            console.error('Registration error:', error);
            
            let errorMessage = 'An error occurred during registration';
            if (error.error) {
                errorMessage = error.error;
                
                // Show specific field errors
                if (error.error.includes('secret key')) {
                    document.getElementById('secret-key-error').textContent = error.error;
                    document.getElementById('secret-key-error').style.display = 'block';
                } else if (error.error.includes('Username')) {
                    document.getElementById('username-error').textContent = error.error;
                    document.getElementById('username-error').style.display = 'block';
                } else if (error.error.includes('Email')) {
                    document.getElementById('email-error').textContent = error.error;
                    document.getElementById('email-error').style.display = 'block';
                }
            }
            
            showToast(errorMessage, 'error');
        })
        .finally(() => {
            registerButton.disabled = false;
            registerButton.textContent = 'Register Admin';
        });
    });

    // Toggle password visibility
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');
    const eyeIcon = togglePassword.querySelector('i');

    const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');
    const confirmPassword = document.querySelector('#confirm-password');
    const confirmEyeIcon = toggleConfirmPassword.querySelector('i');

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

    toggleConfirmPassword.addEventListener('click', function () {
        const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPassword.setAttribute('type', type);
        
        if (type === 'password') {
            confirmEyeIcon.classList.remove('fa-eye-slash');
            confirmEyeIcon.classList.add('fa-eye');
        } else {
            confirmEyeIcon.classList.remove('fa-eye');
            confirmEyeIcon.classList.add('fa-eye-slash');
        }
    });

    // Password strength meter
    password.addEventListener('input', function() {
        const strengthMeter = document.getElementById('strength-meter');
        const strengthText = document.getElementById('strength-text');
        const passwordValue = this.value;
        let strength = 0;

        // Check password length
        if (passwordValue.length >= 8) strength += 1;
        if (passwordValue.length >= 12) strength += 1;

        // Check for character variety
        if (/[A-Z]/.test(passwordValue)) strength += 1; // Uppercase
        if (/[a-z]/.test(passwordValue)) strength += 1; // Lowercase
        if (/[0-9]/.test(passwordValue)) strength += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(passwordValue)) strength += 1; // Special chars

        // Update meter and text
        const width = (strength / 5) * 100;
        strengthMeter.style.width = width + '%';

        if (strength <= 1 || passwordValue.length < 8) {
            strengthMeter.style.background = 'var(--error)';
            strengthText.textContent = 'Weak';
            strengthText.style.color = 'var(--error)';
        } else if (strength <= 3) {
            strengthMeter.style.background = 'var(--warning)';
            strengthText.textContent = 'Medium';
            strengthText.style.color = 'var(--warning)';
        } else {
            strengthMeter.style.background = 'var(--success)';
            strengthText.textContent = 'Strong';
            strengthText.style.color = 'var(--success)';
        }
    });
});