document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const profileForm = document.getElementById('profileForm');
    const editAboutBtn = document.getElementById('editAboutBtn');
    const editAboutModal = document.getElementById('editAboutModal');
    const closeAboutModal = document.getElementById('closeAboutModal');
    const cancelAboutEdit = document.getElementById('cancelAboutEdit');
    const aboutForm = document.getElementById('aboutForm');
    const aboutText = document.getElementById('aboutText');
    const profileCameraIcon = document.getElementById('profileCameraIcon');
    const imageUploadModal = document.getElementById('imageUploadModal');
    const closeImageModal = document.getElementById('closeImageModal');
    const cancelImageUpload = document.getElementById('cancelImageUpload');
    const chooseImageBtn = document.getElementById('chooseImageBtn');
    const profileImageUpload = document.getElementById('profileImageUpload');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const viewAllAppointments = document.getElementById('viewAllAppointments');
    const appointmentItems = document.querySelectorAll('.appointment-item');
    const profileName = document.getElementById('profileName');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordChange = document.getElementById('cancelPasswordChange');
    const passwordForm = document.getElementById('passwordForm');
    const tabContents = document.querySelectorAll('.tab-content');
    const profileTabs = document.querySelectorAll('.profile-tab');

    // Profile data object
    let profileData = {};

    // Initialize the page
    init();

    async function init() {
        await updateProfileUI();
        setupEventListeners();
        setupCustomAlert();
    }

    // Custom Alert System
    function setupCustomAlert() {
        const alertContainer = document.createElement('div');
        alertContainer.id = 'customAlertContainer';
        document.body.appendChild(alertContainer);
    }

    function showAlert(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('customAlertContainer');
        const alert = document.createElement('div');
        alert.className = `custom-alert ${type}`;
        
        const iconMap = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };
        
        alert.innerHTML = `
            <i class="fas ${iconMap[type]} custom-alert-icon"></i>
            <div class="custom-alert-content">${message}</div>
            <div class="custom-alert-close">&times;</div>
        `;
        
        const closeBtn = alert.querySelector('.custom-alert-close');
        closeBtn.addEventListener('click', () => {
            alert.remove();
        });
        
        alertContainer.appendChild(alert);
        
        // Trigger reflow to enable animation
        void alert.offsetWidth;
        
        alert.classList.add('show');
        
        if (duration) {
            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 300);
            }, duration);
        }
    }

    // Fetch user profile from API
    async function fetchUserProfile() {
        try {
            const response = await fetch('/user/api/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching profile:', error);
            showAlert('Failed to load profile data', 'error');
            throw error;
        }
    }

    // Update the UI with profile data
    async function updateProfileUI() {
        try {
            const userData = await fetchUserProfile();
            if (!userData) {
                throw new Error('No user data received');
            }
            
            // Update profile data object
            profileData = {
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                dob: userData.dob || '',
                gender: userData.gender || '',
                about: userData.about || '',
                profile_picture: userData.profile_picture || 'images/profile.jpg',
                created_at: userData.created_at || ''
            };
            
            // Update UI elements
            if (profileName) profileName.textContent = `${profileData.first_name} ${profileData.last_name}`;
            if (aboutText) aboutText.textContent = profileData.about || 'Tell us about yourself...';
            
            // Update profile picture
            const profilePic = document.querySelector('.profile-pic img');
            if (profilePic) {
                profilePic.src = profileData.profile_picture.startsWith('uploads/') 
                    ? `/static/${profileData.profile_picture}`
                    : `/static/${profileData.profile_picture}`;
            }
            
        } catch (error) {
            console.error('Error updating profile UI:', error);
            showAlert('Failed to load profile data', 'error');
        }
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Tab switching functionality
        profileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                profileTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Show the corresponding tab content
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });

        // Edit Profile Modal
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                // Populate form with current data
                document.getElementById('editFirstName').value = profileData.first_name;
                document.getElementById('editLastName').value = profileData.last_name;
                document.getElementById('editPhone').value = profileData.phone;
                document.getElementById('editDob').value = profileData.dob ? 
                    new Date(profileData.dob).toISOString().split('T')[0] : '';
                    const genderSelect = document.getElementById('editGender');
                    const userGender = profileData.gender
                    if (userGender) {
                        // Normalize the case for comparison
                        const normalizedUserGender = userGender.trim().toLowerCase();
                        
                        // Find matching option (case-insensitive)
                        for (let option of genderSelect.options) {
                            if (option.value.trim().toLowerCase() === normalizedUserGender) {
                                option.selected = true;
                                break;
                            }
                        }
                    } else {
                        genderSelect.value = '';
                    }
                
                editProfileModal.style.display = 'flex';
            });
        }

        // Close modal handlers
        if (closeModal) closeModal.addEventListener('click', () => editProfileModal.style.display = 'none');
        if (cancelEdit) cancelEdit.addEventListener('click', () => editProfileModal.style.display = 'none');
        if (closeAboutModal) closeAboutModal.addEventListener('click', () => editAboutModal.style.display = 'none');
        if (cancelAboutEdit) cancelAboutEdit.addEventListener('click', () => editAboutModal.style.display = 'none');
        if (closeImageModal) closeImageModal.addEventListener('click', () => {
            imageUploadModal.style.display = 'none';
            resetImageUpload();
        });
        if (cancelImageUpload) cancelImageUpload.addEventListener('click', () => {
            imageUploadModal.style.display = 'none';
            resetImageUpload();
        });
        if (closePasswordModal) closePasswordModal.addEventListener('click', () => changePasswordModal.style.display = 'none');
        if (cancelPasswordChange) cancelPasswordChange.addEventListener('click', () => changePasswordModal.style.display = 'none');

        // Profile Form Submission
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const formData = {
                        first_name: document.getElementById('editFirstName').value,
                        last_name: document.getElementById('editLastName').value,
                        phone: document.getElementById('editPhone').value,
                        dob: document.getElementById('editDob').value,
                        gender: document.getElementById('editGender').value
                    };
                    
                    const response = await fetch('/user/api/profile', {
                        method: 'PUT',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to update profile');
                    }
                    
                    editProfileModal.style.display = 'none';
                    showAlert('Profile updated successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    console.error('Error updating profile:', error);
                    showAlert(error.message || 'Failed to update profile', 'error');
                }
            });
        }

        // About Form Submission
        if (aboutForm) {
            aboutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const response = await fetch('/user/api/profile', {
                        method: 'PUT',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({
                            about: document.getElementById('aboutTextarea').value
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to update about section');
                    }
                    
                    editAboutModal.style.display = 'none';
                    showAlert('About section updated successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    console.error('Error updating about section:', error);
                    showAlert('Failed to update about section', 'error');
                }
            });
        }

        // Image Upload Modal
        if (profileCameraIcon) {
            profileCameraIcon.addEventListener('click', () => {
                imageUploadModal.style.display = 'flex';
            });
        }

        if (chooseImageBtn) {
            chooseImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                profileImageUpload.click();
            });
        }

        if (profileImageUpload) {
            profileImageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        imagePreview.src = event.target.result;
                        imagePreviewContainer.style.display = 'block';
                        saveImageBtn.disabled = false;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Image Upload Handler
        if (saveImageBtn) {
            saveImageBtn.addEventListener('click', async () => {
                const file = profileImageUpload.files[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('profile_picture', file);
                
                try {
                    const response = await fetch('/user/api/profile/picture', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to update profile picture');
                    }
                    
                    imageUploadModal.style.display = 'none';
                    resetImageUpload();
                    showAlert('Profile picture updated successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    console.error('Error updating profile picture:', error);
                    showAlert(error.message || 'Failed to update profile picture', 'error');
                }
            });
        }

        // Password Change
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                changePasswordModal.style.display = 'flex';
            });
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (newPassword !== confirmPassword) {
                    showAlert('New passwords do not match', 'error');
                    return;
                }
                
                try {
                    const response = await fetch('/user/api/change-password', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({
                            current_password: currentPassword,
                            new_password: newPassword
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to change password');
                    }
                    
                    showAlert('Password changed successfully', 'success');
                    changePasswordModal.style.display = 'none';
                    passwordForm.reset();
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    console.error('Error changing password:', error);
                    showAlert(error.message || 'Failed to change password', 'error');
                }
            });
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (editProfileModal && e.target === editProfileModal) {
                editProfileModal.style.display = 'none';
            }
            if (editAboutModal && e.target === editAboutModal) {
                editAboutModal.style.display = 'none';
            }
            if (imageUploadModal && e.target === imageUploadModal) {
                imageUploadModal.style.display = 'none';
                resetImageUpload();
            }
            if (changePasswordModal && e.target === changePasswordModal) {
                changePasswordModal.style.display = 'none';
            }
        });
    }

    function resetImageUpload() {
        if (profileImageUpload) profileImageUpload.value = '';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
        if (saveImageBtn) saveImageBtn.disabled = true;
    }
});