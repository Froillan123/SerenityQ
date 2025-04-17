// Utility functions
function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
            toast.remove();
          }, 300);
        }, 3000);
      }
  
function handleApiError(error) {
    console.error('API Error:', error);
    const errorMessage = error.response?.data?.error || 'An error occurred';
    showToast(errorMessage, 'error');
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// API functions
async function fetchPsychologists(page = 1) {
    try {
        const response = await axios.get(`/admin/psychologists/list?page=${page}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
        return null;
    }
}

async function updatePsychologist(id, data) {
    try {
        const response = await axios.put(`/admin/psychologists/${id}/update`, data);
        showToast('Psychologist updated successfully');
        return response.data;
    } catch (error) {
        handleApiError(error);
        return null;
    }
}

async function deletePsychologist(id) {
    try {
        await axios.delete(`/admin/psychologists/${id}/delete`);
        showToast('Psychologist deleted successfully');
        return true;
    } catch (error) {
        handleApiError(error);
        return false;
    }
}

async function updatePsychologistStatus(id, status) {
    try {
        const response = await axios.put(`/admin/psychologists/${id}/status`, status);
        showToast('Status updated successfully');
        return response.data;
    } catch (error) {
        handleApiError(error);
        return null;
    }
}

// UI functions
function renderPsychologistRow(psychologist) {
    return `
        <tr data-id="${psychologist.id}">
            <td>
                <div class="profile-info">
                    <strong>Dr. ${psychologist.first_name} ${psychologist.last_name}</strong>
                </div>
            </td>
            <td>${psychologist.email}</td>
            <td>${psychologist.phone || 'Not provided'}</td>
            <td>
                <span class="status ${psychologist.is_approved ? 'active' : 'inactive'}">
                    ${psychologist.is_approved ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="showEditPsychologistModal(${psychologist.id})">
                        <i class='bx bx-edit'></i> Edit
                    </button>
                    <button class="action-btn view-btn" onclick="viewPsychologistDetails(${psychologist.id})">
                        <i class='bx bx-show'></i> View
                    </button>
                    ${psychologist.is_approved ? 
                        `<button class="action-btn deactivate-btn" onclick="showDeactivateModal(${psychologist.id})">
                            <i class='bx bx-power-off'></i> Deactivate
                        </button>` :
                        `<button class="action-btn delete-btn" onclick="showDeleteModal(${psychologist.id})">
                            <i class='bx bx-trash'></i> Delete
                        </button>`
                    }
                </div>
            </td>
        </tr>
    `;
}

async function loadPsychologists(page = 1) {
    const data = await fetchPsychologists(page);
    if (!data) return;

    const tableBody = document.querySelector('.table-container table tbody');
    tableBody.innerHTML = data.psychologists.map(renderPsychologistRow).join('');
    
    updatePagination(data.current_page, data.pages);
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.querySelector('.pagination');
    let html = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="loadPsychologists(${currentPage - 1})">
            <i class='bx bx-chevron-left'></i> Previous
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="loadPsychologists(${i})">${i}</button>
        `;
    }
    
    html += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="loadPsychologists(${currentPage + 1})">
            Next <i class='bx bx-chevron-right'></i>
        </button>
    `;
    
    pagination.innerHTML = html;
}

// Event handlers
let currentPsychologistId = null;

function showDeleteModal(id) {
    currentPsychologistId = id;
    openModal('deleteModal');
}

function showDeactivateModal(id) {
    currentPsychologistId = id;
    openModal('deactivateModal');
}

async function viewPsychologistDetails(id) {
    try {
        const response = await axios.get(`/admin/psychologists/${id}`);
        const psychologist = response.data;
        
        document.getElementById('modalPsychologistName').textContent = 
            `Dr. ${psychologist.first_name} ${psychologist.last_name}`;
        document.getElementById('modalPsychologistSpecialty').textContent = 
            psychologist.primary_specialty;
        document.getElementById('modalPsychologistEmail').textContent = 
            psychologist.email;
        document.getElementById('modalPsychologistPhone').textContent = 
            psychologist.phone;
        document.getElementById('modalPsychologistLicense').textContent = 
            psychologist.license_number;
        document.getElementById('modalPsychologistExperience').textContent = 
            `${psychologist.years_experience} years`;
        document.getElementById('modalPsychologistBio').textContent = 
            psychologist.bio;

        const avatarElement = document.getElementById('modalPsychologistAvatar');
        avatarElement.src = psychologist.profile_picture || '/static/images/profile.jpg';
        avatarElement.onerror = function() {
            this.src = '/static/images/profile.jpg';
        };

        const statusElement = document.getElementById('modalPsychologistStatus');
        statusElement.innerHTML = `
            <span class="status ${psychologist.is_approved ? 'active' : 'inactive'}">
                ${psychologist.is_approved ? 'Active' : 'Inactive'}
            </span>
        `;

        const specialtiesContainer = document.getElementById('modalPsychologistSpecialties');
        specialtiesContainer.innerHTML = psychologist.specialties
            .map(specialty => `<span class="specialty-badge">${specialty}</span>`)
            .join('');

        openModal('psychologistDetailsModal');
    } catch (error) {
        handleApiError(error);
    }
}

async function showEditPsychologistModal(id) {
    try {
        const response = await axios.get(`/admin/psychologists/${id}`);
        const psychologist = response.data;
        
        // Set form data
        document.getElementById('editFirstName').value = psychologist.first_name;
        document.getElementById('editLastName').value = psychologist.last_name;
        document.getElementById('editEmail').value = psychologist.email;
        document.getElementById('editPhone').value = psychologist.phone;
        document.getElementById('editLicenseNumber').value = psychologist.license_number;
        document.getElementById('editPrimarySpecialty').value = psychologist.primary_specialty;
        document.getElementById('editYearsExperience').value = psychologist.years_experience;
        document.getElementById('editBio').value = psychologist.bio;

        // Set profile picture
        const profilePreview = document.getElementById('editProfilePreview');
        profilePreview.src = psychologist.profile_picture || '/static/images/profile.jpg';
        profilePreview.onerror = function() {
            this.src = '/static/images/profile.jpg';
        };

        // Handle specialties checkboxes
        const specialties = psychologist.specialties || [];
        document.querySelectorAll('input[name="specialties"]').forEach(checkbox => {
            checkbox.checked = specialties.includes(checkbox.value);
        });

        // Set form ID for submission
        document.getElementById('editPsychologistForm').dataset.psychologistId = psychologist.id;

        openModal('editPsychologistModal');
    } catch (error) {
        handleApiError(error);
    }
}

// Handle profile picture preview
document.getElementById('editProfilePicture')?.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editProfilePreview').src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
    }
});

// Handle profile picture upload click
document.querySelector('.profile-preview')?.addEventListener('click', function() {
    document.getElementById('editProfilePicture').click();
});

async function handleUpdatePsychologist(event) {
    event.preventDefault();
    const form = event.target;
    const psychologistId = form.dataset.psychologistId;
    
    const formData = new FormData(form);
    const data = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        primary_specialty: formData.get('primary_specialty'),
        specialties: formData.getAll('specialties'),
        years_experience: parseInt(formData.get('years_experience')),
        bio: formData.get('bio')
    };
    
    const result = await updatePsychologist(psychologistId, data);
    if (result) {
        closeModal('editPsychologistModal');
        loadPsychologists();
    }
}

async function handleDeletePsychologist() {
    if (await deletePsychologist(currentPsychologistId)) {
        closeModal('deleteModal');
        loadPsychologists();
    }
}

async function handleStatusUpdate(status) {
    if (await updatePsychologistStatus(currentPsychologistId, status)) {
        closeModal('deactivateModal');
        loadPsychologists();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPsychologists();
    
    // Add form submit handlers
    document.getElementById('editPsychologistForm')?.addEventListener('submit', handleUpdatePsychologist);
});