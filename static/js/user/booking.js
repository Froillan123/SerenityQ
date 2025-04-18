 // Sample booking data - ordered by upcoming first, then cancelled, then completed
 const bookings = [
    {
        id: 2,
        title: "Cognitive Behavioral Therapy",
        psychologist: "Dr. Michael Chen",
        date: "2023-06-20",
        time: "10:00",
        duration: "60 mins",
        status: "upcoming",
        notes: "Follow-up session"
    },
    {
        id: 5,
        title: "Mindfulness Training",
        psychologist: "Dr. Lisa Park",
        date: "2023-07-05",
        time: "09:00",
        duration: "45 mins",
        status: "upcoming",
        notes: "Introduction to mindfulness"
    },
    {
        id: 6,
        title: "Relationship Counseling",
        psychologist: "Dr. James Wilson",
        date: "2023-07-12",
        time: "15:45",
        duration: "60 mins",
        status: "upcoming",
        notes: "Couples therapy session"
    },
    {
        id: 4,
        title: "Depression Counseling",
        psychologist: "Dr. Robert Garcia",
        date: "2023-04-28",
        time: "11:30",
        duration: "60 mins",
        status: "cancelled",
        notes: "Cancelled due to conflict"
    },
    {
        id: 1,
        title: "Anxiety Management",
        psychologist: "Dr. Sarah Johnson",
        date: "2023-06-15",
        time: "14:30",
        duration: "45 mins",
        status: "completed",
        notes: "Initial consultation for anxiety management"
    },
    {
        id: 3,
        title: "Stress Reduction",
        psychologist: "Dr. Emily Wilson",
        date: "2023-05-10",
        time: "16:15",
        duration: "45 mins",
        status: "completed",
        notes: "Stress management techniques"
    }
];

// DOM elements
const swiperView = document.getElementById('swiperView');
const swiperWrapper = document.getElementById('swiperWrapper');
const tableContainer = document.getElementById('tableContainer');
const tableBody = document.getElementById('tableBody');
const filterButtons = document.querySelectorAll('.filter-btn');
const viewButtons = document.querySelectorAll('.view-btn');
const rescheduleModal = document.getElementById('rescheduleModal');
const cancelModal = document.getElementById('cancelModal');
const feedbackModal = document.getElementById('feedbackModal');
const closeReschedule = document.getElementById('closeReschedule');
const closeCancel = document.getElementById('closeCancel');
const closeFeedback = document.getElementById('closeFeedback');
const rescheduleForm = document.getElementById('rescheduleForm');
const feedbackForm = document.getElementById('feedbackForm');
const stars = document.querySelectorAll('.star');
const ratingValue = document.getElementById('ratingValue');

// Current booking being interacted with
let currentBookingId = null;
let currentFilter = 'all';
let currentView = 'swiper';
let swiper = null;

// Initialize the page
function init() {
    renderAllViews(bookings);
    setupEventListeners();
    initSwiper();
}

// Initialize Swiper with Netflix-style settings
function initSwiper() {
    swiper = new Swiper('.swiper', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: false,
        loop: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 'auto',
                spaceBetween: 15,
            },
            480: {
                slidesPerView: 'auto',
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 'auto',
                spaceBetween: 25,
            },
            1024: {
                slidesPerView: 'auto',
                spaceBetween: 30,
            }
        }
    });
}

// Render all views (swiper, table)
function renderAllViews(bookingsToRender) {
    renderSwiper(bookingsToRender);
    renderTable(bookingsToRender);
    updateViewVisibility();
}

// Render swiper view
function renderSwiper(bookingsToRender) {
    swiperWrapper.innerHTML = '';
    
    if (bookingsToRender.length === 0) {
        swiperWrapper.innerHTML = `
            <div class="swiper-slide" style="width: 100%;">
                ${createEmptyState()}
            </div>
        `;
        return;
    }
    
    bookingsToRender.forEach(booking => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.appendChild(createBookingCard(booking));
        swiperWrapper.appendChild(slide);
    });
    
    if (swiper) {
        swiper.update();
    }
}

// Render table view (max 5 items)
function renderTable(bookingsToRender) {
    tableBody.innerHTML = '';
    
    if (bookingsToRender.length === 0) {
        tableContainer.innerHTML = createEmptyState();
        return;
    }
    
    // Limit to 5 items in table view
    const limitedBookings = bookingsToRender.slice(0, 5);
    
    limitedBookings.forEach(booking => {
        tableBody.appendChild(createTableRow(booking));
    });
}

// Create booking card element for swiper
function createBookingCard(booking) {
    const bookingCard = document.createElement('div');
    bookingCard.className = `booking-card ${booking.status}`;
    bookingCard.dataset.id = booking.id;
    bookingCard.dataset.status = booking.status;
    
    let actionsHTML = '';
    if (booking.status === 'upcoming') {
        actionsHTML = `
            <button class="action-btn reschedule-btn" data-id="${booking.id}">
                <i class="fas fa-calendar-alt"></i> Reschedule
            </button>
            <button class="action-btn cancel-btn" data-id="${booking.id}">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;
    } else if (booking.status === 'completed') {
        actionsHTML = `
            <button class="action-btn feedback-btn" data-id="${booking.id}">
                <i class="fas fa-comment"></i> Feedback
            </button>
        `;
    }
    
    bookingCard.innerHTML = `
        <div class="booking-header">
            <h3 class="booking-title">${booking.title}</h3>
            <span class="booking-status status-${booking.status}">${booking.status}</span>
        </div>
        <div class="booking-details">
            <div class="detail-row">
                <span class="detail-label">Psychologist:</span>
                <span class="detail-value">${booking.psychologist}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formatDate(booking.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${formatTime(booking.time)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${booking.duration}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${booking.notes}</span>
            </div>
        </div>
        <div class="booking-actions">
            ${actionsHTML}
        </div>
    `;
    
    return bookingCard;
}

// Create table row element
function createTableRow(booking) {
    const row = document.createElement('tr');
    row.dataset.id = booking.id;
    row.dataset.status = booking.status;
    
    let actionsHTML = '';
    if (booking.status === 'upcoming') {
        actionsHTML = `
            <div class="table-actions">
                <button class="action-btn reschedule-btn" data-id="${booking.id}">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
                <button class="action-btn cancel-btn" data-id="${booking.id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        `;
    } else if (booking.status === 'completed') {
        actionsHTML = `
            <div class="table-actions">
                <button class="action-btn feedback-btn" data-id="${booking.id}">
                    <i class="fas fa-comment"></i> Feedback
                </button>
            </div>
        `;
    } else {
        actionsHTML = '<div class="table-actions"></div>';
    }
    
    row.innerHTML = `
        <td>
            <strong>${booking.title}</strong><br>
            <small>${booking.notes}</small>
        </td>
        <td>${booking.psychologist}</td>
        <td>
            ${formatDate(booking.date)}<br>
            ${formatTime(booking.time)}
        </td>
        <td>${booking.duration}</td>
        <td><span class="table-status status-${booking.status}">${booking.status}</span></td>
        <td>${actionsHTML}</td>
    `;
    
    return row;
}

// Create empty state
function createEmptyState() {
    return `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="far fa-calendar-check"></i>
            </div>
            <h3 class="empty-text">No bookings found</h3>
            <button class="explore-btn">Explore Psychologists</button>
        </div>
    `;
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Update view visibility based on current view
function updateViewVisibility() {
    swiperView.style.display = currentView === 'swiper' ? 'block' : 'none';
    tableContainer.style.display = currentView === 'table' ? 'block' : 'none';
}

// Filter bookings based on status
function filterBookings(filter) {
    currentFilter = filter;
    let filteredBookings = bookings;
    
    if (filter !== 'all') {
        filteredBookings = bookings.filter(booking => booking.status === filter);
    }
    
    renderAllViews(filteredBookings);
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filter = button.dataset.filter;
            filterBookings(filter);
        });
    });
    
    // View toggle buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentView = button.dataset.view;
            updateViewVisibility();
            
            // If switching to swiper view, update the swiper
            if (currentView === 'swiper' && swiper) {
                swiper.update();
            }
        });
    });
    
    // Modal close buttons
    closeReschedule.addEventListener('click', () => rescheduleModal.style.display = 'none');
    closeCancel.addEventListener('click', () => cancelModal.style.display = 'none');
    closeFeedback.addEventListener('click', () => feedbackModal.style.display = 'none');
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === rescheduleModal) rescheduleModal.style.display = 'none';
        if (e.target === cancelModal) cancelModal.style.display = 'none';
        if (e.target === feedbackModal) feedbackModal.style.display = 'none';
    });
    
    // Event delegation for action buttons
    document.addEventListener('click', (e) => {
        const rescheduleBtn = e.target.closest('.reschedule-btn');
        const cancelBtn = e.target.closest('.cancel-btn');
        const feedbackBtn = e.target.closest('.feedback-btn');
        
        if (rescheduleBtn) {
            currentBookingId = rescheduleBtn.dataset.id;
            rescheduleModal.style.display = 'flex';
        }
        
        if (cancelBtn) {
            currentBookingId = cancelBtn.dataset.id;
            cancelModal.style.display = 'flex';
        }
        
        if (feedbackBtn) {
            currentBookingId = feedbackBtn.dataset.id;
            feedbackModal.style.display = 'flex';
        }
    });
    
    // Cancel modal buttons
    document.getElementById('confirmCancel').addEventListener('click', () => {
        const bookingIndex = bookings.findIndex(b => b.id == currentBookingId);
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'cancelled';
            filterBookings(currentFilter);
            cancelModal.style.display = 'none';
            alert('Appointment cancelled successfully.');
        }
    });
    
    document.getElementById('dismissCancel').addEventListener('click', () => {
        cancelModal.style.display = 'none';
    });
    
    // Reschedule form submission
    rescheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newDate = document.getElementById('rescheduleDate').value;
        const newTime = document.getElementById('rescheduleTime').value;
        
        const bookingIndex = bookings.findIndex(b => b.id == currentBookingId);
        if (bookingIndex !== -1) {
            bookings[bookingIndex].date = newDate;
            bookings[bookingIndex].time = newTime;
            filterBookings(currentFilter);
            rescheduleModal.style.display = 'none';
            alert('Appointment rescheduled successfully.');
        }
    });
    
    // Feedback form submission
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedbackText = document.getElementById('feedbackText').value;
        const rating = ratingValue.value;
        
        const bookingIndex = bookings.findIndex(b => b.id == currentBookingId);
        if (bookingIndex !== -1) {
            bookings[bookingIndex].feedback = feedbackText;
            bookings[bookingIndex].rating = rating;
            filterBookings(currentFilter);
            feedbackModal.style.display = 'none';
            alert('Thank you for your feedback!');
            
            // Reset feedback form
            document.getElementById('feedbackText').value = '';
            ratingValue.value = '0';
            stars.forEach(star => star.classList.remove('active'));
        }
    });
    
    // Star rating
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingValue.value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', init);