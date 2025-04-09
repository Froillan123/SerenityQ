// Appointment Modal
const appointmentModal = document.getElementById('appointmentModal');
const closeModal = document.getElementById('closeModal');
const modalStartBtn = document.getElementById('modalStartBtn');

// Sample data for appointments
const appointments = [
    {
        id: 1,
        patientName: "Michael Brown",
        patientId: "P-7802",
        condition: "Anxiety Treatment",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        time: "Today, 10:00 AM - 11:00 AM",
        type: "Cognitive Behavioral Therapy",
        status: "Confirmed",
        notes: "Patient prefers to focus on social anxiety this session."
    },
    {
        id: 2,
        patientName: "Jessica Smith",
        patientId: "P-7731",
        condition: "Depression",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg",
        time: "Today, 2:30 PM - 3:30 PM",
        type: "Psychotherapy Session",
        status: "Confirmed",
        notes: "Follow-up on medication effectiveness."
    },
    {
        id: 3,
        patientName: "David Wilson",
        patientId: "P-7698",
        condition: "PTSD",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        time: "Tomorrow, 9:00 AM",
        type: "Trauma Therapy",
        status: "Pending",
        notes: "New patient - initial assessment needed."
    },
    {
        id: 4,
        patientName: "Amanda Lee",
        patientId: "P-7645",
        condition: "Stress Management",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        time: "Apr 09, 11:00 AM",
        type: "Mindfulness Session",
        status: "Confirmed",
        notes: "Continue with relaxation techniques."
    }
];

// Function to open modal with appointment details
function openAppointmentModal(appointmentId) {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
        document.getElementById('modalPatientAvatar').src = appointment.avatar;
        document.getElementById('modalPatientName').textContent = appointment.patientName;
        document.getElementById('modalPatientId').textContent = `ID: ${appointment.patientId}`;
        document.getElementById('modalPatientCondition').textContent = appointment.condition;
        document.getElementById('modalAppointmentTime').textContent = appointment.time;
        document.getElementById('modalAppointmentType').textContent = appointment.type;
        document.getElementById('modalAppointmentStatus').textContent = appointment.status;
        document.getElementById('modalAppointmentNotes').textContent = appointment.notes;

        // Set data attributes for start button
        modalStartBtn.setAttribute('data-patient', appointment.patientName);
        modalStartBtn.setAttribute('data-type', appointment.type);

        appointmentModal.classList.add('active');
    }
}

// Close modal
closeModal.addEventListener('click', function () {
    appointmentModal.classList.remove('active');
});

// Close modal when clicking outside
appointmentModal.addEventListener('click', function (e) {
    if (e.target === appointmentModal) {
        appointmentModal.classList.remove('active');
    }
});

// Start session from modal
modalStartBtn.addEventListener('click', function () {
    const patientName = this.getAttribute('data-patient');
    const sessionType = this.getAttribute('data-type');
    startSession(patientName, sessionType);
});

// Start session from card buttons
document.querySelectorAll('.start-session-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const patientName = this.getAttribute('data-patient');
        const sessionType = this.getAttribute('data-type');
        startSession(patientName, sessionType);
    });
});

// Function to start session (redirect to sessions page)
function startSession(patientName, sessionType) {
    // In a real app, you might pass parameters to the session page
    window.location.href = 'pyschologistSessions.html';
}

// Confirm appointment button
document.querySelectorAll('.confirm-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const card = this.closest('.appointment-card');
        const statusBadge = card.querySelector('.appointment-status');

        // Change to confirmed status
        statusBadge.textContent = 'Confirmed';
        statusBadge.className = 'appointment-status status-confirmed';
        card.className = 'appointment-card upcoming';

        // Change button to start session
        const buttonsContainer = this.closest('.appointment-actions');
        this.remove();
        buttonsContainer.innerHTML += `
                    <button class="action-btn primary-btn start-session-btn" data-patient="David Wilson" data-type="Trauma Therapy">
                        <i class='bx bx-video'></i> Start
                    </button>
                `;

        // Add event listener to new button
        buttonsContainer.querySelector('.start-session-btn').addEventListener('click', function () {
            const patientName = this.getAttribute('data-patient');
            const sessionType = this.getAttribute('data-type');
            startSession(patientName, sessionType);
        });
    });
});

// Initialize Calendar
document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: false,
        height: 'auto',
        events: [
            {
                id: 1,
                title: 'Michael Brown - CBT',
                start: new Date(),
                extendedProps: {
                    status: 'confirmed'
                }
            },
            {
                id: 2,
                title: 'Jessica Smith - Therapy',
                start: new Date(),
                extendedProps: {
                    status: 'confirmed'
                }
            },
            {
                id: 3,
                title: 'David Wilson - Trauma',
                start: new Date(new Date().setDate(new Date().getDate() + 1)),
                extendedProps: {
                    status: 'pending'
                }
            },
            {
                id: 4,
                title: 'Amanda Lee - Mindfulness',
                start: new Date(new Date().setDate(new Date().getDate() + 5)),
                extendedProps: {
                    status: 'confirmed'
                }
            }
        ],
        eventClick: function (info) {
            // Open modal when event is clicked
            openAppointmentModal(parseInt(info.event.id));
            info.jsEvent.preventDefault();
        },
        eventContent: function (arg) {
            let statusDot = '';
            if (arg.event.extendedProps.status === 'confirmed') {
                statusDot = '<div style="background-color: #4CAF50; width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 5px;"></div>';
            } else if (arg.event.extendedProps.status === 'pending') {
                statusDot = '<div style="background-color: #FFD166; width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 5px;"></div>';
            }

            return {
                html: statusDot + arg.event.title
            };
        },
        eventClassNames: function (arg) {
            // Add custom classes based on event status
            if (arg.event.extendedProps.status === 'confirmed') {
                return ['confirmed-event'];
            } else if (arg.event.extendedProps.status === 'pending') {
                return ['pending-event'];
            }
            return [];
        }
    });

    calendar.render();

    // Calendar Navigation
    document.getElementById('prevMonth').addEventListener('click', function () {
        calendar.prev();
    });

    document.getElementById('nextMonth').addEventListener('click', function () {
        calendar.next();
    });

    document.getElementById('todayBtn').addEventListener('click', function () {
        calendar.today();
    });

    // Filter Appointments
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.textContent.toLowerCase();
            filterAppointments(filter);
        });
    });

    function filterAppointments(filter) {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const appointmentCards = document.querySelectorAll('.appointment-card');

        appointmentCards.forEach(card => {
            const timeElement = card.querySelector('.appointment-time');
            const timeText = timeElement.textContent.toLowerCase();

            let showCard = true;

            if (filter === 'today') {
                showCard = timeText.includes('today');
            } else if (filter === 'this week') {
                // This is a simplified check - in a real app you'd parse dates
                showCard = timeText.includes('today') ||
                    timeText.includes('tomorrow') ||
                    timeText.includes('mon') ||
                    timeText.includes('tue') ||
                    timeText.includes('wed') ||
                    timeText.includes('thu') ||
                    timeText.includes('fri') ||
                    timeText.includes('sat') ||
                    timeText.includes('sun');
            }

            if (filter !== 'all' && !showCard) {
                card.style.display = 'none';
            } else {
                card.style.display = 'block';
            }
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const appointmentCards = document.querySelectorAll('.appointment-card');

        appointmentCards.forEach(card => {
            const patientName = card.querySelector('.patient-info h4').textContent.toLowerCase();
            const patientId = card.querySelector('.patient-info p').textContent.toLowerCase();
            const appointmentType = card.querySelector('.appointment-type').textContent.toLowerCase();

            if (patientName.includes(searchTerm) ||
                patientId.includes(searchTerm) ||
                appointmentType.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Reschedule button functionality
    document.querySelectorAll('.reschedule-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // In a real app, this would open a rescheduling modal
            alert('Reschedule functionality would open a date/time picker here.');
        });
    });

    // Message button functionality
    document.querySelectorAll('.action-btn.secondary-btn').forEach(btn => {
        if (btn.querySelector('.bx-chat')) {
            btn.addEventListener('click', function () {
                // In a real app, this would open a messaging interface
                alert('Messaging functionality would open a chat interface here.');
            });
        }
    });

    // Modal message button
    document.getElementById('modalMessageBtn').addEventListener('click', function () {
        alert('Messaging functionality would open a chat interface here.');
    });
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnHamburger = toggleSidebar.contains(event.target);

    if (!isClickInsideSidebar && !isClickOnHamburger && window.innerWidth <= 992) {
        sidebar.classList.remove('active');
    }
});

// Handle window resize
window.addEventListener('resize', function () {
    if (window.innerWidth > 992) {
        sidebar.classList.remove('active');
    }
});