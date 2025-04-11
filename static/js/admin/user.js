
    // Modal functions
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
  
      function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
      }
  
      // User data (in a real app, this would come from an API)
      let users = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          middleName: "Michael",
          username: "johndoe",
          email: "john@example.com",
          phone: "+1 (555) 123-4567",
          dob: "1990-01-15",
          gender: "Male",
          status: "active",
          regDate: "March 10, 2023",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          middleName: "Elizabeth",
          username: "janesmith",
          email: "jane@example.com",
          phone: "+1 (555) 987-6543",
          dob: "1985-05-22",
          gender: "Female",
          status: "active",
          regDate: "February 15, 2023",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
          id: 3,
          firstName: "Robert",
          lastName: "Johnson",
          middleName: "Lee",
          username: "robjohn",
          email: "robert@example.com",
          phone: "+1 (555) 456-7890",
          dob: "1978-11-30",
          gender: "Male",
          status: "active",
          regDate: "January 5, 2023",
          avatar: "https://randomuser.me/api/portraits/men/75.jpg"
        },
        {
          id: 4,
          firstName: "Emily",
          lastName: "Williams",
          middleName: "Rose",
          username: "emilyw",
          email: "emily@example.com",
          phone: "+1 (555) 789-0123",
          dob: "1992-07-18",
          gender: "Female",
          status: "inactive",
          regDate: "April 20, 2023",
          avatar: "https://randomuser.me/api/portraits/women/65.jpg"
        },
        {
          id: 5,
          firstName: "Michael",
          lastName: "Brown",
          middleName: "James",
          username: "mikebrown",
          email: "michael@example.com",
          phone: "+1 (555) 234-5678",
          dob: "1983-03-10",
          gender: "Male",
          status: "active",
          regDate: "March 1, 2023",
          avatar: "https://randomuser.me/api/portraits/men/22.jpg"
        },
        {
          id: 6,
          firstName: "Sarah",
          lastName: "Davis",
          middleName: "Anne",
          username: "sarahd",
          email: "sarah@example.com",
          phone: "+1 (555) 345-6789",
          dob: "1995-09-25",
          gender: "Female",
          status: "active",
          regDate: "February 28, 2023",
          avatar: "https://randomuser.me/api/portraits/women/33.jpg"
        },
        {
          id: 7,
          firstName: "David",
          lastName: "Miller",
          middleName: "Paul",
          username: "davidm",
          email: "david@example.com",
          phone: "+1 (555) 456-7890",
          dob: "1980-12-05",
          gender: "Male",
          status: "inactive",
          regDate: "January 15, 2023",
          avatar: "https://randomuser.me/api/portraits/men/45.jpg"
        }
      ];
  
      // Pagination variables
      let currentPage = 1;
      const usersPerPage = 5;
  
      // Current user ID for actions
      let currentUserId = null;
  
      // Format date to display
      function formatDate(dateString) {
        if (!dateString) return "Not specified";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
      }
  
      // Display users in table with pagination
      function displayUsers(page) {
        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = '';
  
        const startIndex = (page - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);
  
        paginatedUsers.forEach(user => {
          const row = document.createElement('tr');
          row.setAttribute('data-id', user.id);
          row.innerHTML = `
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="status ${user.status}">${user.status === 'active' ? 'Active' : 'Inactive'}</span></td>
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
        const totalPages = Math.ceil(users.length / usersPerPage);
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
      function viewUserDetails(id) {
        const user = users.find(u => u.id === id);
        if (user) {
          document.getElementById('modalUserName').textContent = `${user.firstName} ${user.lastName}`;
          document.getElementById('modalUserUsername').textContent = user.username;
          document.getElementById('modalUserEmail').textContent = user.email;
          document.getElementById('modalUserFirstName').textContent = user.firstName;
          document.getElementById('modalUserLastName').textContent = user.lastName;
          document.getElementById('modalUserMiddleName').textContent = user.middleName || "Not specified";
          document.getElementById('modalUserPhone').textContent = user.phone || "Not specified";
          document.getElementById('modalUserDob').textContent = formatDate(user.dob);
          document.getElementById('modalUserGender').textContent = user.gender;
          document.getElementById('modalUserRegDate').textContent = user.regDate;
          document.getElementById('modalUserAvatar').src = user.avatar;
          
          // Update status badge
          const statusElement = document.getElementById('modalUserStatus');
          statusElement.innerHTML = `<span class="status ${user.status}">${user.status === 'active' ? 'Active' : 'Inactive'}</span>`;
          
          openModal('userModal');
        }
      }
  
      // Edit user details
      function editUserDetails(id) {
        const user = users.find(u => u.id === id);
        if (user) {
          currentUserId = id;
          document.getElementById('editUserName').textContent = `${user.firstName} ${user.lastName}`;
          document.getElementById('editUserUsername').textContent = user.username;
          document.getElementById('editUserAvatar').src = user.avatar;
          
          // Fill form fields
          document.getElementById('editUserFirstNameInput').value = user.firstName;
          document.getElementById('editUserLastNameInput').value = user.lastName;
          document.getElementById('editUserMiddleNameInput').value = user.middleName || '';
          document.getElementById('editUserUsernameInput').value = user.username;
          document.getElementById('editUserPhoneInput').value = user.phone || '';
          document.getElementById('editUserDobInput').value = user.dob || '';
          document.getElementById('editUserGenderInput').value = user.gender;
          
          openModal('editUserModal');
        }
      }
  
      // Save user changes
      function saveUserChanges() {
        const userIndex = users.findIndex(u => u.id === currentUserId);
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            firstName: document.getElementById('editUserFirstNameInput').value,
            lastName: document.getElementById('editUserLastNameInput').value,
            middleName: document.getElementById('editUserMiddleNameInput').value || null,
            username: document.getElementById('editUserUsernameInput').value,
            phone: document.getElementById('editUserPhoneInput').value || null,
            dob: document.getElementById('editUserDobInput').value || null,
            gender: document.getElementById('editUserGenderInput').value
          };
          
          displayUsers(currentPage);
          closeModal('editUserModal');
          alert('User details updated successfully!');
        }
      }
  
      // Show delete confirmation modal
      function showDeleteModal(id) {
        currentUserId = id;
        openModal('deleteModal');
      }
  
      // Delete user
      function deleteUser() {
        users = users.filter(u => u.id !== currentUserId);
        displayUsers(currentPage);
        closeModal('deleteModal');
        alert('User deleted successfully!');
      }
  
      // Add new user
      function addNewUser() {
        const form = document.getElementById('addUserForm');
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        
        const newUser = {
          id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
          firstName: document.getElementById('addUserFirstName').value,
          lastName: document.getElementById('addUserLastName').value,
          middleName: document.getElementById('addUserMiddleName').value || null,
          username: document.getElementById('addUserUsername').value,
          email: document.getElementById('addUserEmail').value,
          phone: document.getElementById('addUserPhone').value || null,
          dob: document.getElementById('addUserDob').value || null,
          gender: document.getElementById('addUserGender').value,
          status: "active",
          regDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
        };
        
        users.unshift(newUser);
        displayUsers(1); // Go to first page to show new user
        closeModal('addUserModal');
        alert('User added successfully!');
        
        // Reset form
        form.reset();
      }
  
      // Event listeners for pagination
      document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          displayUsers(currentPage);
        }
      });
  
      document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(users.length / usersPerPage);
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