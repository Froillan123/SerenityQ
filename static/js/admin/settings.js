document.addEventListener('DOMContentLoaded', function() {
    // Toast notification system
    function showToast(message, type = 'success', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            toast.remove();
        });
        
        toast.appendChild(messageSpan);
        toast.appendChild(closeButton);
        toastContainer.appendChild(toast);
        
        // Auto-remove after duration
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease-in forwards';
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, duration);
    }

    // Tab switching functionality
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Load admin profile data
    function loadAdminProfile() {
        fetch('/admin/profile', {
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const profileImg = document.getElementById('profile-image-preview');
            if (data.profile_picture) {
                profileImg.src = data.profile_picture;
            } else {
                profileImg.src = '/static/images/profile.jpg';
            }
            
            document.getElementById('fullName').value = data.fullname || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('username').value = data.username || '';
            document.getElementById('account-username').value = data.username || '';
            
            if (data.created_at) {
                const date = new Date(data.created_at);
                document.getElementById('joined').value = date.toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                });
            }
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

    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            profilePictureInput.click();
        });
    }

    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast('File size should be less than 2MB', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    if (profileImagePreview) {
                        profileImagePreview.src = event.target.result;
                    }
                    
                    const formData = new FormData();
                    formData.append('profile_picture', file);

                    fetch('/admin/profile/picture', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => { throw err; });
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            showToast('Profile picture updated successfully!', 'success');
                            if (data.profile_picture && profileImagePreview) {
                                profileImagePreview.src = data.profile_picture;
                            }
                        } else {
                            loadAdminProfile();
                            showToast(data.error || 'Failed to update profile picture', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        loadAdminProfile();
                        showToast(error.error || 'Failed to upload image', 'error');
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Save profile changes
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const fullName = document.getElementById('fullName')?.value.trim();
            const email = document.getElementById('email')?.value.trim();

            if (!fullName || !email) {
                showToast('Full name and email are required', 'error');
                return;
            }

            const data = {
                fullname: fullName,
                email: email
            };

            fetch('/admin/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
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
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showToast(data.error || 'Failed to update profile', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast(error.error || 'Failed to update profile', 'error');
            });
        });
    }

    // Update account settings
    const updateAccountBtn = document.getElementById('update-account-btn');
    if (updateAccountBtn) {
        updateAccountBtn.addEventListener('click', () => {
            const data = {
                language: document.getElementById('language')?.value || 'en',
                timezone: document.getElementById('timezone')?.value || '+00:00'
            };

            fetch('/admin/account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showToast('Account settings updated successfully!', 'success');
                } else {
                    showToast(data.error || 'Failed to update account settings', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast(error.error || 'Failed to update account settings', 'error');
            });
        });
    }

    // Password change modal
    const passwordModal = document.getElementById('password-modal');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const closeModal = document.querySelector('.close');
    const cancelPasswordChange = document.getElementById('cancel-password-change');

    if (changePasswordBtn && passwordModal) {
        changePasswordBtn.addEventListener('click', () => {
            passwordModal.style.display = 'block';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (passwordModal) passwordModal.style.display = 'none';
        });
    }

    if (cancelPasswordChange) {
        cancelPasswordChange.addEventListener('click', () => {
            if (passwordModal) passwordModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === passwordModal) {
            passwordModal.style.display = 'none';
        }
    });

    // Submit password change
    const submitPasswordChange = document.getElementById('submit-password-change');
    if (submitPasswordChange) {
        submitPasswordChange.addEventListener('click', () => {
            const currentPassword = document.getElementById('current-password')?.value || '';
            const newPassword = document.getElementById('new-password')?.value || '';
            const confirmPassword = document.getElementById('confirm-password')?.value || '';

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

            fetch('/admin/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                }),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showToast('Password changed successfully!', 'success');
                    if (passwordModal) passwordModal.style.display = 'none';
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-password').value = '';
                } else {
                    showToast(data.error || 'Failed to change password', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast(error.error || 'Failed to change password', 'error');
            });
        });
    }
});