document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Load admin profile data via API
    function loadAdminProfile() {
        fetch('/admin/profile', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJWTToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/admin/login';
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Set profile picture
            const profileImg = document.getElementById('profile-image-preview');
            if (data.profile_picture) {
                profileImg.src = data.profile_picture;
            } else {
                profileImg.src = '/static/images/profile.jpg';
            }
            
            // Set other profile data
            document.getElementById('fullName').value = data.fullname || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('username').value = data.username || '';
            document.getElementById('account-username').value = data.username || '';
            
            // Set account tab fields
            const languageSelect = document.getElementById('language');
            if (languageSelect) {
                languageSelect.value = data.language || 'en';
            }
            
            const timezoneSelect = document.getElementById('timezone');
            if (timezoneSelect) {
                timezoneSelect.value = data.timezone || '-05:00';
            }
            
            document.getElementById('role').value = data.is_super_admin ? 'Super Admin' : 'Admin';
            document.getElementById('joined').value = data.created_at ? 
                new Date(data.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) : 'N/A';
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            showToast('Failed to load profile data', 'error');
        });
    }

    // Initial load
    loadAdminProfile();

    // Profile picture upload
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const profilePictureInput = document.getElementById('profile-picture-input');
    const profileImagePreview = document.getElementById('profile-image-preview');

    changePhotoBtn.addEventListener('click', () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('File size should be less than 2MB', 'error');
                return;
            }

            // Show loading state
            const originalText = changePhotoBtn.textContent;
            changePhotoBtn.textContent = 'Uploading...';
            changePhotoBtn.disabled = true;

            const reader = new FileReader();
            reader.onload = (event) => {
                // Show preview immediately
                profileImagePreview.src = event.target.result;
                
                // Upload the image
                const formData = new FormData();
                formData.append('profile_picture', file);

                fetch('/admin/profile/picture', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${getJWTToken()}`
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showToast('Profile picture updated successfully', 'success');
                        // Update the image with the new URL from server
                        if (data.profile_picture) {
                            profileImagePreview.src = data.profile_picture;
                        }
                        // Refresh the page after 2 seconds
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        throw new Error(data.error || 'Failed to update profile picture');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Revert to previous image on error
                    loadAdminProfile();
                    showToast(error.error || 'An error occurred while uploading the image', 'error');
                })
                .finally(() => {
                    // Reset button state
                    changePhotoBtn.textContent = originalText;
                    changePhotoBtn.disabled = false;
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Save profile changes
    document.getElementById('save-profile-btn').addEventListener('click', () => {
        const data = {
            fullname: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            username: document.getElementById('username').value.trim()
        };

        // Basic validation
        if (!data.fullname) {
            showToast('Full name is required', 'error');
            return;
        }

        if (!data.email) {
            showToast('Email is required', 'error');
            return;
        }

        if (!data.username) {
            showToast('Username is required', 'error');
            return;
        }

        // Show loading state
        const saveBtn = document.getElementById('save-profile-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        fetch('/admin/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJWTToken()}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showToast('Profile updated successfully!', 'success');
                // Refresh the page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error(data.error || 'Failed to update profile');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.error || 'Failed to update profile. Please try again.', 'error');
        })
        .finally(() => {
            // Reset button state
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        });
    });

    // Update account settings
    document.getElementById('update-account-btn').addEventListener('click', () => {
        const data = {
            language: document.getElementById('language').value,
            timezone: document.getElementById('timezone').value
        };

        fetch('/api/admin/account', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJWTToken()}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showToast('Account settings updated successfully');
            } else {
                showToast(data.error || 'Failed to update account settings', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('An error occurred while updating account settings', 'error');
        });
    });

    // Password change modal
    const passwordModal = document.getElementById('password-modal');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const closeModal = document.querySelector('.close');
    const cancelPasswordChange = document.getElementById('cancel-password-change');

    changePasswordBtn.addEventListener('click', () => {
        passwordModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });

    cancelPasswordChange.addEventListener('click', () => {
        passwordModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === passwordModal) {
            passwordModal.style.display = 'none';
        }
    });

    // Submit password change
    document.getElementById('submit-password-change').addEventListener('click', () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('All fields are required', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        fetch('/api/admin/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJWTToken()}`
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showToast('Password changed successfully');
                passwordModal.style.display = 'none';
                // Clear the password fields
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            } else {
                showToast(data.error || 'Failed to change password', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.error || 'An error occurred while changing password', 'error');
        });
    });

    // Helper function to get JWT token from cookies
    function getJWTToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'access_token_cookie') {
                return value;
            }
        }
        return '';
    }

    // Helper function to show toast messages
    function showToast(message, type = 'success') {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Position the toast
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '4px';
        toast.style.color = '#fff';
        toast.style.backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-in-out';
        
        setTimeout(() => {
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
    }
});