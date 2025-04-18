// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Custom Alert and Confirm Functions
function showAlert(title, message, type = 'info') {
  const modal = document.getElementById('customAlertModal');
  const header = document.getElementById('alertModalHeader');
  const titleEl = document.getElementById('alertModalTitle');
  const messageEl = document.getElementById('alertModalMessage');
  
  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Set style based on type
  header.className = 'modal-header';
  header.classList.add(type);
  
  openModal('customAlertModal');
}

// Pagination variables
let currentPage = 1;
const usersPerPage = 5;
let totalUsers = 0;
let totalPages = 1;

// Current user ID for actions
let currentUserId = null;

// Format date to display
function formatDate(dateString) {
  if (!dateString) return "Not specified";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Fetch users from API
async function fetchUsers(page = 1) {
  try {
      const response = await fetch(`/admin/api/users?page=${page}&per_page=${usersPerPage}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Please try again.');
      return { users: [], total: 0, pages: 1, current_page: 1 };
  }
}

// Display users in table with pagination
async function displayUsers(page) {
  const tableBody = document.getElementById('userTableBody');
  tableBody.innerHTML = '<tr><td colspan="5">Loading users...</td></tr>';
  
  const data = await fetchUsers(page);
  currentPage = data.current_page;
  totalUsers = data.total;
  totalPages = data.pages;
  
  tableBody.innerHTML = '';
  
  if (data.users.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
      return;
  }
  
  data.users.forEach(user => {
      const row = document.createElement('tr');
      row.setAttribute('data-id', user.id);
      row.innerHTML = `
          <td>${user.first_name} ${user.last_name}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td><span class="status ${user.is_verified ? 'active' : 'inactive'}">${user.is_verified ? 'Active' : 'Inactive'}</span></td>
          <td>
              <div class="action-btns">
                  <button class="action-btn view-btn" onclick="viewUserDetails(${user.id})">View</button>
                  <button class="action-btn edit-btn" onclick="editUserDetails(${user.id})">Edit</button>
                  <button class="action-btn delete-btn" onclick="showDeleteModal(${user.id})">Delete</button>
              </div>
          </td>
      `;
      tableBody.appendChild(row);
  });
  
  // Update pagination controls
  updatePaginationControls();
}

// Update pagination controls
function updatePaginationControls() {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageNumbers = document.getElementById('pageNumbers');
  
  // Update previous button
  prevBtn.disabled = currentPage === 1;
  
  // Update next button
  nextBtn.disabled = currentPage === totalPages;
  
  // Update page numbers
  pageNumbers.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = i;
      if (i === currentPage) {
          pageBtn.classList.add('active');
      }
      pageBtn.addEventListener('click', () => {
          currentPage = i;
          displayUsers(currentPage);
      });
      pageNumbers.appendChild(pageBtn);
  }
}

// View user details
async function viewUserDetails(id) {
  try {
      const response = await fetch(`/admin/api/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const user = await response.json();
      
      document.getElementById('modalUserName').textContent = `${user.first_name} ${user.last_name}`;
      document.getElementById('modalUserUsername').textContent = user.username;
      document.getElementById('modalUserEmail').textContent = user.email;
      document.getElementById('modalUserFirstName').textContent = user.first_name;
      document.getElementById('modalUserLastName').textContent = user.last_name;
      document.getElementById('modalUserPhone').textContent = user.phone || "Not specified";
      document.getElementById('modalUserDob').textContent = formatDate(user.dob);
      document.getElementById('modalUserGender').textContent = user.gender || "Not specified";
      document.getElementById('modalUserRegDate').textContent = user.created_at;
      document.getElementById('modalUserAvatar').src = user.profile_picture;
      
      // Update status badge
      const statusElement = document.getElementById('modalUserStatus');
      statusElement.innerHTML = `<span class="status ${user.is_verified ? 'active' : 'inactive'}">${user.is_verified ? 'Active' : 'Inactive'}</span>`;
      
      openModal('userModal');
  } catch (error) {
      console.error('Error viewing user:', error);
      alert('Failed to load user details. Please try again.');
  }
}

// Edit user details
async function editUserDetails(id) {
  try {
      const response = await fetch(`/admin/api/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const user = await response.json();
      currentUserId = id;
      
      document.getElementById('editUserName').textContent = `${user.first_name} ${user.last_name}`;
      document.getElementById('editUserUsername').textContent = user.username;
      document.getElementById('editUserAvatar').src = user.profile_picture;
      
      // Fill form fields
      document.getElementById('editUserFirstNameInput').value = user.first_name;
      document.getElementById('editUserLastNameInput').value = user.last_name;
      document.getElementById('editUserUsernameInput').value = user.username;
      document.getElementById('editUserPhoneInput').value = user.phone || '';
      document.getElementById('editUserDobInput').value = user.dob || '';
      document.getElementById('editUserGenderInput').value = user.gender || 'Prefer not to say';
      
      openModal('editUserModal');
  } catch (error) {
      console.error('Error editing user:', error);
      alert('Failed to load user details for editing. Please try again.');
  }
}

// Save user changes
async function saveUserChanges() {
  try {
      const userData = {
          first_name: document.getElementById('editUserFirstNameInput').value,
          last_name: document.getElementById('editUserLastNameInput').value,
          username: document.getElementById('editUserUsernameInput').value,
          phone: document.getElementById('editUserPhoneInput').value || null,
          dob: document.getElementById('editUserDobInput').value || null,
          gender: document.getElementById('editUserGenderInput').value
      };
      
      const response = await fetch(`/admin/api/users/${currentUserId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
      }
      
      displayUsers(currentPage);
      closeModal('editUserModal');
      alert('User details updated successfully!');
  } catch (error) {
      console.error('Error saving user:', error);
      alert(error.message || 'Failed to update user. Please try again.');
  }
}

// Show delete confirmation modal
function showDeleteModal(id) {
  currentUserId = id;
  openModal('deleteModal');
}

// Delete user
async function deleteUser() {
  try {
      const response = await fetch(`/admin/api/users/${currentUserId}`, {
          method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      
      // If we're on the last page with only one user, go to previous page
      if (currentPage > 1 && totalUsers % usersPerPage === 1) {
          currentPage--;
      }
      
      displayUsers(currentPage);
      closeModal('deleteModal');
      alert('User deleted successfully!');
  } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
  }
}

// Add new user
async function addNewUser() {
  const form = document.getElementById('addUserForm');
  if (!form.checkValidity()) {
      form.reportValidity();
      return;
  }
  
  try {
      const userData = {
          first_name: document.getElementById('addUserFirstName').value,
          last_name: document.getElementById('addUserLastName').value,
          username: document.getElementById('addUserUsername').value,
          email: document.getElementById('addUserEmail').value,
          password: document.getElementById('addUserPassword').value,
          phone: document.getElementById('addUserPhone').value || null,
          dob: document.getElementById('addUserDob').value || null,
          gender: document.getElementById('addUserGender').value
      };
      
      const response = await fetch('/admin/api/users', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
          throw new Error(responseData.error || 'Failed to add user');
      }
      
      // Reset form
      form.reset();
      
      // Refresh user list and go to first page
      currentPage = 1;
      displayUsers(currentPage);
      closeModal('addUserModal');
      
      // Show success message with new user details
      alert(`User added successfully!\nName: ${responseData.first_name} ${responseData.last_name}\nEmail: ${responseData.email}`);
  } catch (error) {
      console.error('Error adding user:', error);
      alert(error.message || 'Failed to add user. Please try again.');
  }
}

// Event listeners for pagination
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
      currentPage--;
      displayUsers(currentPage);
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage < totalPages) {
      currentPage++;
      displayUsers(currentPage);
  }
});

// Event listener for add user button
document.getElementById('addUserBtn').addEventListener('click', () => {
  openModal('addUserModal');
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  displayUsers(currentPage);
});