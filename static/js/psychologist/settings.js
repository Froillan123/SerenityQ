
        // Settings tabs functionality
        const tabs = document.querySelectorAll('.settings-menu li a');
        const sections = document.querySelectorAll('.settings-section');

        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all sections
                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show the selected section
                const sectionId = this.getAttribute('href').substring(1) + '-section';
                document.getElementById(sectionId).style.display = 'block';
            });
        });

        // Avatar upload functionality
        const avatarUpload = document.getElementById('avatar-upload');
        const profileAvatar = document.querySelector('.profile-avatar img');

        avatarUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    profileAvatar.src = event.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        // Form submission
        document.getElementById('profile-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Profile updated successfully!');
            // In a real app, you would send this data to your backend
        });

        document.getElementById('professional-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Professional information updated successfully!');
            // In a real app, you would send this data to your backend
        });

        // Change password button
        document.getElementById('change-password-btn').addEventListener('click', function() {
            const newPassword = prompt('Enter your new password:');
            if (newPassword) {
                alert('Password changed successfully!');
                // In a real app, you would validate and update the password
            }
        });

        // File upload functionality for license
        const licenseUpload = document.getElementById('license-upload');
        const uploadedFiles = document.querySelector('.uploaded-files');

        licenseUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const fileSize = formatFileSize(file.size);
                
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <i class='bx bx-file file-icon'></i>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                    <i class='bx bx-trash file-delete'></i>
                `;
                
                // Add delete functionality
                const deleteBtn = fileItem.querySelector('.file-delete');
                deleteBtn.addEventListener('click', function() {
                    fileItem.remove();
                    licenseUpload.value = '';
                });
                
                uploadedFiles.appendChild(fileItem);
            }
        });

        // Helper function to format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Initialize the page with profile section visible
        document.getElementById('profile-section').style.display = 'block';