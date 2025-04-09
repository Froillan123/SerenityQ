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
    const workInfo = document.getElementById('workInfo');
    const educationInfo = document.getElementById('educationInfo');
    const locationInfo = document.getElementById('locationInfo');
    const hometownInfo = document.getElementById('hometownInfo');
    const relationshipInfo = document.getElementById('relationshipInfo');
    const tabContents = document.querySelectorAll('.tab-content');
    const profileTabs = document.querySelectorAll('.profile-tab');
    const addPaymentMethodBtn = document.getElementById('addPaymentMethod');
    const paymentMethodModal = document.getElementById('paymentMethodModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const cancelPayment = document.getElementById('cancelPayment');
    const paymentForm = document.getElementById('paymentForm');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');

    // Profile data
    let profileData = {
        name: "John Doe",
        work: "ABC Company",
        education: "XYZ University",
        location: "New York, USA",
        hometown: "Chicago, Illinois",
        relationship: "Single",
        about: aboutText.textContent,
        profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
    };

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
    editProfileBtn.addEventListener('click', () => {
        // Populate form with current data
        document.getElementById('editName').value = profileData.name;
        document.getElementById('editWork').value = profileData.work;
        document.getElementById('editEducation').value = profileData.education;
        document.getElementById('editLocation').value = profileData.location;
        document.getElementById('editHometown').value = profileData.hometown;
        document.getElementById('editRelationship').value = profileData.relationship;
        
        editProfileModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });

    cancelEdit.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Update profile data
        profileData.name = document.getElementById('editName').value;
        profileData.work = document.getElementById('editWork').value;
        profileData.education = document.getElementById('editEducation').value;
        profileData.location = document.getElementById('editLocation').value;
        profileData.hometown = document.getElementById('editHometown').value;
        profileData.relationship = document.getElementById('editRelationship').value;
        
        // Update UI
        profileName.textContent = profileData.name;
        workInfo.textContent = `Works at ${profileData.work}`;
        educationInfo.textContent = `Studied at ${profileData.education}`;
        locationInfo.textContent = `Lives in ${profileData.location}`;
        hometownInfo.textContent = `From ${profileData.hometown}`;
        relationshipInfo.textContent = profileData.relationship;
        
        editProfileModal.style.display = 'none';
        alert('Profile updated successfully!');
    });

    // Edit About Modal
    editAboutBtn.addEventListener('click', () => {
        document.getElementById('aboutTextarea').value = profileData.about;
        editAboutModal.style.display = 'flex';
    });

    closeAboutModal.addEventListener('click', () => {
        editAboutModal.style.display = 'none';
    });

    cancelAboutEdit.addEventListener('click', () => {
        editAboutModal.style.display = 'none';
    });

    aboutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        profileData.about = document.getElementById('aboutTextarea').value;
        aboutText.textContent = profileData.about;
        editAboutModal.style.display = 'none';
        alert('About section updated successfully!');
    });

    // Image Upload Modal
    profileCameraIcon.addEventListener('click', () => {
        imageUploadModal.style.display = 'flex';
    });

    closeImageModal.addEventListener('click', () => {
        imageUploadModal.style.display = 'none';
        resetImageUpload();
    });

    cancelImageUpload.addEventListener('click', () => {
        imageUploadModal.style.display = 'none';
        resetImageUpload();
    });

    chooseImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        profileImageUpload.click();
    });

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

    saveImageBtn.addEventListener('click', () => {
        const profilePic = document.querySelector('.profile-pic img');
        profilePic.src = imagePreview.src;
        profileData.profileImage = imagePreview.src;
        imageUploadModal.style.display = 'none';
        resetImageUpload();
        alert('Profile picture updated successfully!');
    });

    function resetImageUpload() {
        profileImageUpload.value = '';
        imagePreviewContainer.style.display = 'none';
        saveImageBtn.disabled = true;
    }

    // Appointment functionality
    viewAllAppointments.addEventListener('click', () => {
        alert('Redirecting to all appointments page...');
        // In a real app, this would navigate to appointments page
    });

    appointmentItems.forEach(item => {
        item.addEventListener('click', () => {
            const appointmentId = item.getAttribute('data-appointment-id');
            alert(`Viewing details for appointment #${appointmentId}`);
            // In a real app, this would show appointment details
        });
    });

    // Payment Method Modal
    addPaymentMethodBtn.addEventListener('click', () => {
        paymentMethodModal.style.display = 'flex';
    });

    closePaymentModal.addEventListener('click', () => {
        paymentMethodModal.style.display = 'none';
    });

    cancelPayment.addEventListener('click', () => {
        paymentMethodModal.style.display = 'none';
    });

    // Payment option selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Hide all payment forms
            paymentForms.forEach(form => form.style.display = 'none');
            
            // Show the corresponding payment form
            const paymentType = option.getAttribute('data-type');
            document.getElementById(`${paymentType}-form`).style.display = 'block';
        });
    });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get selected payment method
        const selectedOption = document.querySelector('.payment-option.active');
        const paymentType = selectedOption.getAttribute('data-type');
        
        // In a real app, this would process the payment method
        alert(`Adding ${paymentType} payment method...`);
        
        paymentMethodModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
        if (e.target === editAboutModal) {
            editAboutModal.style.display = 'none';
        }
        if (e.target === imageUploadModal) {
            imageUploadModal.style.display = 'none';
            resetImageUpload();
        }
        if (e.target === paymentMethodModal) {
            paymentMethodModal.style.display = 'none';
        }
    });
});