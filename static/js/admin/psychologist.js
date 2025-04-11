  
      // Modal functions
      function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
  
      function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
      }
  
      // Psychologist data (in a real app, this would come from an API)
      const psychologists = [
        {
          id: 1,
          name: "Dr. Alice Rivera",
          specialty: "Cognitive Behavioral Therapy",
          email: "alice@serenityq.com",
          phone: "+1 (555) 123-4567",
          license: "PSY-1234567",
          experience: "8 years",
          rate: "$150/hour",
          specialties: ["Anxiety", "Depression", "Stress Management"],
          bio: "Dr. Alice Rivera is a licensed clinical psychologist with over 8 years of experience in treating anxiety, depression, and stress-related disorders. She specializes in cognitive behavioral therapy and mindfulness-based approaches.",
          lastActive: "2 days ago",
          patients: "142",
          status: "active",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
          id: 2,
          name: "Dr. John Lin",
          specialty: "Mindfulness & Stress Relief",
          email: "john@serenityq.com",
          phone: "+1 (555) 987-6543",
          license: "PSY-7654321",
          experience: "6 years",
          rate: "$135/hour",
          specialties: ["Stress", "Trauma", "Mindfulness"],
          bio: "Dr. John Lin specializes in mindfulness-based stress reduction and trauma therapy. With 6 years of clinical experience, he has helped hundreds of clients manage stress and recover from traumatic experiences.",
          lastActive: "1 day ago",
          patients: "98",
          status: "active",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
          id: 3,
          name: "Dr. Maria Gonzalez",
          specialty: "Child Psychology",
          email: "maria@serenityq.com",
          phone: "+1 (555) 456-7890",
          license: "PSY-9876543",
          experience: "10 years",
          rate: "$175/hour",
          specialties: ["Child Development", "ADHD", "Autism"],
          bio: "Dr. Maria Gonzalez has dedicated her career to helping children and adolescents with developmental challenges. She is particularly skilled in working with ADHD and autism spectrum disorders.",
          lastActive: "Today",
          patients: "210",
          status: "active",
          avatar: "https://randomuser.me/api/portraits/women/65.jpg"
        },
        {
          id: 4,
          name: "Dr. Robert Chen",
          specialty: "Marriage Counseling",
          email: "robert@serenityq.com",
          phone: "+1 (555) 789-0123",
          license: "PSY-5678901",
          experience: "12 years",
          rate: "$160/hour",
          specialties: ["Relationships", "Family Therapy", "Couples Counseling"],
          bio: "Dr. Robert Chen is a relationship expert with over 12 years of experience helping couples and families improve their communication and resolve conflicts.",
          lastActive: "3 months ago",
          patients: "185",
          status: "inactive",
          avatar: "https://randomuser.me/api/portraits/men/75.jpg"
        },
        {
          id: 5,
          name: "Dr. Sarah Johnson",
          specialty: "Clinical Psychology",
          email: "sarah@serenityq.com",
          phone: "+1 (555) 234-5678",
          license: "PSY-3456789",
          experience: "9 years",
          rate: "$155/hour",
          specialties: ["Depression", "PTSD", "Anxiety Disorders"],
          bio: "Dr. Sarah Johnson specializes in treating mood disorders and trauma-related conditions. She uses evidence-based approaches to help clients recover and thrive.",
          lastActive: "1 week ago",
          patients: "176",
          status: "active",
          avatar: "https://randomuser.me/api/portraits/women/33.jpg"
        }
      ];
  
      // Current psychologist ID for actions
      let currentPsychologistId = null;
  
  
          // View psychologist details
          function viewPsychologistDetails(id) {
        const psychologist = psychologists.find(p => p.id === id);
        if (psychologist) {
          document.getElementById('modalPsychologistName').textContent = psychologist.name;
          document.getElementById('modalPsychologistSpecialty').textContent = psychologist.specialty;
          document.getElementById('modalPsychologistEmail').textContent = psychologist.email;
          document.getElementById('modalPsychologistPhone').textContent = psychologist.phone;
          document.getElementById('modalPsychologistLicense').textContent = psychologist.license;
          document.getElementById('modalPsychologistExperience').textContent = psychologist.experience;
          document.getElementById('modalPsychologistRate').textContent = psychologist.rate;
          document.getElementById('modalPsychologistBio').textContent = psychologist.bio;
          document.getElementById('modalPsychologistLastActive').textContent = psychologist.lastActive;
          document.getElementById('modalPsychologistPatients').textContent = psychologist.patients;
          
          // Update status
          const statusElement = document.getElementById('modalPsychologistStatus');
          statusElement.innerHTML = '';
          const statusSpan = document.createElement('span');
          statusSpan.className = `status ${psychologist.status}`;
          statusSpan.textContent = psychologist.status === 'active' ? 'Active' : 'Inactive';
          statusElement.appendChild(statusSpan);
          
          // Update specialties
          const specialtiesContainer = document.getElementById('modalPsychologistSpecialties');
          specialtiesContainer.innerHTML = '';
          psychologist.specialties.forEach(specialty => {
            const badge = document.createElement('span');
            badge.className = 'specialty-badge';
            badge.textContent = specialty;
            specialtiesContainer.appendChild(badge);
          });
          
          // Update avatar
          const avatar = document.querySelector('#psychologistModal .profile-avatar');
          avatar.src = psychologist.avatar;
          
          openModal('psychologistModal');
        }
      }
  
      // Show deactivate modal
      function showDeactivateModal(id) {
        currentPsychologistId = id;
        openModal('deactivateModal');
      }
  
      // Show delete modal
      function showDeleteModal(id) {
        currentPsychologistId = id;
        openModal('deleteModal');
      }
  
      // Deactivate psychologist
      function deactivatePsychologist() {
        if (currentPsychologistId) {
          // In a real app, you would make an API call here
          const psychologist = psychologists.find(p => p.id === currentPsychologistId);
          if (psychologist) {
            psychologist.status = 'inactive';
            
            // Update the table row
            updatePsychologistRow(psychologist);
            
            // Show success message
            showToast('Psychologist deactivated successfully', 'success');
          }
        }
        closeModal('deactivateModal');
      }
  
      // Delete psychologist
      function deletePsychologist() {
        if (currentPsychologistId) {
          // In a real app, you would make an API call here
          const index = psychologists.findIndex(p => p.id === currentPsychologistId);
          if (index !== -1) {
            psychologists.splice(index, 1);
            
            // Remove the row from the table
            const table = document.querySelector('.table-container table tbody');
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              if (row.getAttribute('data-id') == currentPsychologistId) {
                row.remove();
              }
            });
            
            // Show success message
            showToast('Psychologist deleted successfully', 'success');
          }
        }
        closeModal('deleteModal');
      }
  
      // Update psychologist row in table
      function updatePsychologistRow(psychologist) {
        const table = document.querySelector('.table-container table tbody');
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
          if (row.getAttribute('data-id') == psychologist.id) {
            // Update status
            const statusCell = row.querySelector('.status');
            statusCell.className = `status ${psychologist.status}`;
            statusCell.textContent = psychologist.status === 'active' ? 'Active' : 'Inactive';
            
            // Update action buttons
            const actionBtns = row.querySelector('.action-btns');
            actionBtns.innerHTML = '';
            
            if (psychologist.status === 'active') {
              actionBtns.innerHTML = `
                <button class="action-btn view-btn" onclick="viewPsychologistDetails(${psychologist.id})">View</button>
                <button class="action-btn deactivate-btn" onclick="showDeactivateModal(${psychologist.id})">Deactivate</button>
              `;
            } else {
              actionBtns.innerHTML = `
                <button class="action-btn view-btn" onclick="viewPsychologistDetails(${psychologist.id})">View</button>
                <button class="action-btn delete-btn" onclick="showDeleteModal(${psychologist.id})">Delete</button>
              `;
            }
          }
        });
      }
  
      // Show toast notification
      function showToast(message, type) {
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
  
      // Add psychologist button click handler
      document.getElementById('addPsychologistBtn').addEventListener('click', function() {
        openModal('addPsychologistModal');
      });
  
      // Add psychologist form submission
      function addPsychologist() {
        const form = document.getElementById('addPsychologistForm');
        const inputs = form.querySelectorAll('input, select');
        let isValid = true;
        
        // Simple validation
        inputs.forEach(input => {
          if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--error)';
          } else {
            input.style.borderColor = '';
          }
        });
        
        if (!isValid) {
          showToast('Please fill all required fields', 'error');
          return;
        }
        
        // In a real app, you would send this data to the server
        const newId = psychologists.length > 0 ? Math.max(...psychologists.map(p => p.id)) + 1 : 1;
        
        const newPsychologist = {
          id: newId,
          name: `Dr. ${inputs[0].value.trim()} ${inputs[1].value.trim()}`,
          specialty: inputs[3].options[inputs[3].selectedIndex].text,
          email: inputs[2].value.trim(),
          phone: "+1 (555) 000-0000", // Default phone
          license: inputs[4].value.trim(),
          experience: "0 years", // Default experience
          rate: "$120/hour", // Default rate
          specialties: ["General Counseling"], // Default specialties
          bio: "New psychologist joining our team.", // Default bio
          lastActive: "Never", // Default last active
          patients: "0", // Default patients
          status: "active",
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
        };
        
        psychologists.push(newPsychologist);
        
        // Add to table
        const tableBody = document.querySelector('.table-container table tbody');
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', newId);
        newRow.innerHTML = `
          <td>
            <div class="profile-info">
              <strong>${newPsychologist.name}</strong>
              <small>${newPsychologist.specialty}</small>
            </div>
          </td>
          <td>${newPsychologist.specialties.join(', ')}</td>
          <td>${newPsychologist.email}</td>
          <td><span class="status active">Active</span></td>
          <td>
            <div class="action-btns">
              <button class="action-btn view-btn" onclick="viewPsychologistDetails(${newId})">View</button>
              <button class="action-btn deactivate-btn" onclick="showDeactivateModal(${newId})">Deactivate</button>
            </div>
          </td>
        `;
        tableBody.appendChild(newRow);
        
        // Reset form
        form.reset();
        closeModal('addPsychologistModal');
        showToast('Psychologist added successfully', 'success');
      }
  
      // Initialize table rows with data attributes
      document.addEventListener('DOMContentLoaded', function() {
        const tableBody = document.querySelector('.table-container table tbody');
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
          if (index < psychologists.length) {
            row.setAttribute('data-id', psychologists[index].id);
          }
        });
      });
  
      // Add some CSS for toast notifications
      const toastCSS = document.createElement('style');
      toastCSS.textContent = `
        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: var(--dark);
          color: white;
          padding: 15px 25px;
          border-radius: 5px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          transform: translateY(100px);
          opacity: 0;
          transition: all 0.3s ease;
          z-index: 1000;
        }
        
        .toast.show {
          transform: translateY(0);
          opacity: 1;
        }
        
        .toast-success {
          background-color: var(--success);
        }
        
        .toast-error {
          background-color: var(--error);
        }
      `;
      document.head.appendChild(toastCSS);