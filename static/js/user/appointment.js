        // Simple script for calendar navigation (for prototype only)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // In a real implementation, this would update the calendar
                alert('Calendar navigation would update the displayed month in a real implementation');
            });
        });

        // Today button functionality
        document.querySelector('.btn-outline').addEventListener('click', () => {
            // Scroll to today's date
            const currentDay = document.querySelector('.current-day');
            currentDay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Highlight current day temporarily
            currentDay.style.backgroundColor = 'var(--accent)';
            setTimeout(() => {
                currentDay.style.backgroundColor = 'var(--primary)';
            }, 1000);
        });

        document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const newAppointmentModal = document.getElementById('newAppointmentModal');
    const rescheduleModal = document.getElementById('rescheduleModal');
    const cancelModal = document.getElementById('cancelModal');
    const confirmationModal = document.getElementById('confirmationModal');
    
    // Buttons to open modals
    const newAppointmentBtn = document.querySelector('.page-header .btn-primary');
    const rescheduleBtns = document.querySelectorAll('.appointment-actions .btn-outline');
    const cancelBtns = document.querySelectorAll('.appointment-actions .btn-danger');
    
    // Buttons inside modals
    const cancelNewAppointment = document.getElementById('cancelNewAppointment');
    const confirmNewAppointment = document.getElementById('confirmNewAppointment');
    const cancelReschedule = document.getElementById('cancelReschedule');
    const confirmReschedule = document.getElementById('confirmReschedule');
    const cancelCancel = document.getElementById('cancelCancel');
    const confirmCancel = document.getElementById('confirmCancel');
    const closeConfirmation = document.getElementById('closeConfirmation');
    
    // Close buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Open New Appointment Modal
    newAppointmentBtn.addEventListener('click', function() {
        newAppointmentModal.style.display = 'block';
    });
    
    // Open Reschedule Modal
    rescheduleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const appointmentItem = this.closest('.appointment-item');
            const time = appointmentItem.querySelector('.appointment-time span').textContent;
            const therapist = appointmentItem.querySelector('.therapist-name').textContent;
            
            document.getElementById('currentAppointmentTime').textContent = time.split(',')[1].trim();
            document.getElementById('currentTherapistName').textContent = therapist;
            
            rescheduleModal.style.display = 'block';
        });
    });
    
    // Open Cancel Modal
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const appointmentItem = this.closest('.appointment-item');
            const time = appointmentItem.querySelector('.appointment-time span').textContent;
            const therapist = appointmentItem.querySelector('.therapist-name').textContent;
            
            document.getElementById('cancelAppointmentTime').textContent = time;
            document.getElementById('cancelTherapistName').textContent = therapist;
            
            cancelModal.style.display = 'block';
        });
    });
    
    // Close modals when clicking on X
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // New Appointment Modal Buttons
    cancelNewAppointment.addEventListener('click', function() {
        newAppointmentModal.style.display = 'none';
    });
    
    confirmNewAppointment.addEventListener('click', function() {
        const therapist = document.getElementById('therapistSelect').value;
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const type = document.getElementById('sessionType').value;
        
        if (!therapist || !date || !time) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Format the date for display
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Format the time for display
        const timeParts = time.split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const formattedTime = hours + ':' + minutes + ' ' + ampm;
        
        // Get therapist name
        const therapistSelect = document.getElementById('therapistSelect');
        const therapistName = therapistSelect.options[therapistSelect.selectedIndex].text.split(' - ')[0];
        
        // Set confirmation message
        document.getElementById('confirmationTitle').textContent = 'Appointment Booked!';
        document.getElementById('confirmationMessage').textContent = 
            `Your appointment with ${therapistName} has been confirmed for ${formattedDate} at ${formattedTime}.`;
        
        // Set confirmation details
        const details = document.getElementById('confirmationDetails');
        details.innerHTML = `
            <p><strong>Therapist:</strong> ${therapistName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Session Type:</strong> ${type === 'video' ? 'Video Call' : type === 'phone' ? 'Phone Call' : 'In-Person'}</p>
        `;
        
        // Close new appointment modal and show confirmation
        newAppointmentModal.style.display = 'none';
        confirmationModal.style.display = 'block';
        
        // Reset form
        document.getElementById('therapistSelect').value = '';
        document.getElementById('appointmentDate').value = '';
        document.getElementById('appointmentTime').value = '';
        document.getElementById('sessionType').value = 'video';
        document.getElementById('sessionNotes').value = '';
    });
    
    // Reschedule Modal Buttons
    cancelReschedule.addEventListener('click', function() {
        rescheduleModal.style.display = 'none';
    });
    
    confirmReschedule.addEventListener('click', function() {
        const date = document.getElementById('rescheduleDate').value;
        const time = document.getElementById('rescheduleTime').value;
        
        if (!date || !time) {
            alert('Please select both date and time');
            return;
        }
        
        // Format the date for display
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Format the time for display
        const timeParts = time.split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedTime = hours + ':' + minutes + ' ' + ampm;
        
        const therapistName = document.getElementById('currentTherapistName').textContent;
        
        // Set confirmation message
        document.getElementById('confirmationTitle').textContent = 'Appointment Rescheduled!';
        document.getElementById('confirmationMessage').textContent = 
            `Your appointment with ${therapistName} has been rescheduled to ${formattedDate} at ${formattedTime}.`;
        
        // Set confirmation details
        const details = document.getElementById('confirmationDetails');
        details.innerHTML = `
            <p><strong>Therapist:</strong> ${therapistName}</p>
            <p><strong>New Date:</strong> ${formattedDate}</p>
            <p><strong>New Time:</strong> ${formattedTime}</p>
            ${document.getElementById('rescheduleReason').value ? 
                `<p><strong>Reason:</strong> ${document.getElementById('rescheduleReason').value}</p>` : ''}
        `;
        
        // Close reschedule modal and show confirmation
        rescheduleModal.style.display = 'none';
        confirmationModal.style.display = 'block';
        
        // Reset form
        document.getElementById('rescheduleDate').value = '';
        document.getElementById('rescheduleTime').value = '';
        document.getElementById('rescheduleReason').value = '';
    });
    
    // Cancel Modal Buttons
    cancelCancel.addEventListener('click', function() {
        cancelModal.style.display = 'none';
    });
    
    confirmCancel.addEventListener('click', function() {
        const reason = document.getElementById('cancelReason').value;
        
        if (!reason) {
            alert('Please select a cancellation reason');
            return;
        }
        
        const appointmentTime = document.getElementById('cancelAppointmentTime').textContent;
        const therapistName = document.getElementById('cancelTherapistName').textContent;
        
        // Set confirmation message
        document.getElementById('confirmationTitle').textContent = 'Appointment Cancelled';
        document.getElementById('confirmationMessage').textContent = 
            `Your appointment with ${therapistName} on ${appointmentTime} has been cancelled.`;
        
        // Set confirmation details
        const details = document.getElementById('confirmationDetails');
        details.innerHTML = `
            <p><strong>Therapist:</strong> ${therapistName}</p>
            <p><strong>Original Time:</strong> ${appointmentTime}</p>
            <p><strong>Reason:</strong> ${document.getElementById('cancelReason').options[document.getElementById('cancelReason').selectedIndex].text}</p>
            ${document.getElementById('cancelDetails').value ? 
                `<p><strong>Details:</strong> ${document.getElementById('cancelDetails').value}</p>` : ''}
            <p class="text-warning"><i class="fas fa-exclamation-circle"></i> Remember our cancellation policy</p>
        `;
        
        // Close cancel modal and show confirmation
        cancelModal.style.display = 'none';
        confirmationModal.style.display = 'block';
        
        // Reset form
        document.getElementById('cancelReason').value = '';
        document.getElementById('cancelDetails').value = '';
    });
    
    // Close Confirmation Modal
    closeConfirmation.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
        // In a real app, you might want to refresh the appointment list here
    });
    
    // Set minimum date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    document.getElementById('rescheduleDate').min = today;
});