document.addEventListener('DOMContentLoaded', function() {
    // Generate therapist data (500 therapists)
    const therapists = generateTherapists(500);
    
    // Initialize Swiper
    const therapistSwiper = new Swiper('.therapistSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
            }
        }
    });

    // Render therapists
    renderTherapists(therapists);

    // Filter therapists
    document.getElementById('specialtyFilter').addEventListener('change', filterTherapists);
    document.getElementById('availabilityFilter').addEventListener('change', filterTherapists);
    document.getElementById('experienceFilter').addEventListener('change', filterTherapists);

    // Modal functionality
    const therapistModal = document.getElementById('therapistModal');
    const bookingModal = document.getElementById('bookingModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const bookSessionBtn = document.getElementById('bookSessionBtn');
    const cancelBookingBtn = document.getElementById('cancelBookingBtn');
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    let currentTherapist = null;

    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            therapistModal.style.display = 'none';
            bookingModal.style.display = 'none';
        });
    });

    closeModalBtn.addEventListener('click', function() {
        therapistModal.style.display = 'none';
    });

    cancelBookingBtn.addEventListener('click', function() {
        bookingModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === therapistModal) {
            therapistModal.style.display = 'none';
        }
        if (event.target === bookingModal) {
            bookingModal.style.display = 'none';
        }
    });

    // Date change handler for booking modal
    document.getElementById('sessionDate')?.addEventListener('change', function() {
        const date = this.value;
        const timeSelect = document.getElementById('sessionTime');
        
        // Clear previous options
        timeSelect.innerHTML = '<option value="">-- Select a time slot --</option>';
        
        if (date && currentTherapist) {
            // In a real app, you would fetch available times from your backend
            // Here we're just using the therapist's general availability
            currentTherapist.availability.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            });
        }
    });

    // Confirm booking
    confirmBookingBtn.addEventListener('click', function() {
        const date = document.getElementById('sessionDate').value;
        const time = document.getElementById('sessionTime').value;
        const notes = document.getElementById('sessionNotes').value;
        
        if (!date || !time) {
            alert('Please select both date and time for your session.');
            return;
        }
        
        // Here you would typically send this data to your backend
        alert(`Booking confirmed with ${currentTherapist.name} on ${date} at ${time}. We've sent a confirmation to your email.`);
        
        // Reset form and close modal
        document.getElementById('sessionDate').value = '';
        document.getElementById('sessionTime').value = '';
        document.getElementById('sessionNotes').value = '';
        bookingModal.style.display = 'none';
    });

    // Therapist card click handlers are added in renderTherapists function

    // Helper functions
    function renderTherapists(therapists) {
        const container = document.getElementById('therapistContainer');
        container.innerHTML = '';
        
        therapists.forEach(therapist => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            
            slide.innerHTML = `
                <div class="therapist-card">
                    <img src="${therapist.img}" alt="${therapist.name}" class="therapist-img">
                    <h3 class="therapist-name">${therapist.name}</h3>
                    <p class="therapist-specialty">${therapist.specialty}</p>
                    <span class="therapist-status ${getStatusClass(therapist.status)}">${therapist.status}</span>
                    <div class="action-buttons">
                        <button class="btn btn-secondary view-btn" data-id="${therapist.id}">View Profile</button>
                        <button class="btn btn-primary book-btn" data-id="${therapist.id}">Book Now</button>
                    </div>
                </div>
            `;
            
            container.appendChild(slide);
        });
        
        // Add event listeners to the new buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function() {
                const therapistId = parseInt(this.getAttribute('data-id'));
                currentTherapist = therapists.find(t => t.id === therapistId);
                openTherapistModal(currentTherapist);
            });
        });
        
        document.querySelectorAll('.book-btn').forEach(button => {
            button.addEventListener('click', function() {
                const therapistId = parseInt(this.getAttribute('data-id'));
                currentTherapist = therapists.find(t => t.id === therapistId);
                openBookingModal(currentTherapist);
            });
        });
        
        // Update Swiper after adding new slides
        therapistSwiper.update();
    }
    
    function openTherapistModal(therapist) {
        document.getElementById('modalTherapistImg').src = therapist.img;
        document.getElementById('modalTherapistName').textContent = therapist.name;
        document.getElementById('modalTherapistSpecialty').textContent = therapist.specialty;
        document.getElementById('modalTherapistAbout').textContent = therapist.about;
        document.getElementById('modalTherapistExperience').textContent = therapist.experience;
        document.getElementById('modalTherapistRating').textContent = therapist.rating;
        
        // Set status
        const statusElement = document.getElementById('modalTherapistStatus');
        statusElement.textContent = therapist.status;
        statusElement.className = 'therapist-status ' + getStatusClass(therapist.status);
        
        // Set specializations
        const specializationsContainer = document.getElementById('modalTherapistSpecializations');
        specializationsContainer.innerHTML = '';
        therapist.specializations.forEach(spec => {
            const span = document.createElement('span');
            span.className = 'specialization';
            span.textContent = spec;
            specializationsContainer.appendChild(span);
        });
        
        // Set availability
        const availabilityContainer = document.getElementById('modalTherapistAvailability');
        availabilityContainer.innerHTML = '';
        therapist.availability.forEach(slot => {
            const div = document.createElement('div');
            div.className = 'slot';
            div.textContent = slot;
            availabilityContainer.appendChild(div);
        });
        
        // Set reviews
        const reviewsContainer = document.getElementById('modalTherapistReviews');
        reviewsContainer.innerHTML = '';
        therapist.reviews.forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'review';
            
            const header = document.createElement('div');
            header.className = 'review-header';
            
            const author = document.createElement('span');
            author.className = 'review-author';
            author.textContent = review.author;
            
            const rating = document.createElement('span');
            rating.className = 'review-rating';
            rating.textContent = review.rating;
            
            header.appendChild(author);
            header.appendChild(rating);
            
            const date = document.createElement('div');
            date.className = 'review-date';
            date.textContent = review.date;
            
            const content = document.createElement('div');
            content.className = 'review-content';
            content.textContent = review.content;
            
            reviewDiv.appendChild(header);
            reviewDiv.appendChild(date);
            reviewDiv.appendChild(content);
            
            reviewsContainer.appendChild(reviewDiv);
        });
        
        therapistModal.style.display = 'block';
    }
    
    function openBookingModal(therapist) {
        document.getElementById('bookingTherapistName').textContent = therapist.name;
        bookingModal.style.display = 'block';
    }
    
    function filterTherapists() {
        const specialtyFilter = document.getElementById('specialtyFilter').value;
        const availabilityFilter = document.getElementById('availabilityFilter').value;
        const experienceFilter = document.getElementById('experienceFilter').value;
        
        let filtered = [...therapists];
        
        if (specialtyFilter) {
            filtered = filtered.filter(t => t.specialtyKey === specialtyFilter);
        }
        
        if (availabilityFilter) {
            if (availabilityFilter === 'online') {
                filtered = filtered.filter(t => t.status === 'Online');
            } else if (availabilityFilter === 'today') {
                filtered = filtered.filter(t => t.availableToday);
            } else if (availabilityFilter === 'week') {
                filtered = filtered.filter(t => t.availableThisWeek);
            }
        }
        
        if (experienceFilter) {
            const minExperience = parseInt(experienceFilter);
            filtered = filtered.filter(t => parseInt(t.experience) >= minExperience);
        }
        
        renderTherapists(filtered);
    }
    
    function getStatusClass(status) {
        return status === 'Online' ? 'status-online' : 
               status === 'In Session' ? 'status-busy' : 'status-offline';
    }
    
    function generateTherapists(count) {
        const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Oliver', 
                           'Charlotte', 'Elijah', 'Amelia', 'Benjamin', 'Mia', 'Lucas', 'Harper', 'Mason', 'Evelyn', 'Logan',
                           'Abigail', 'Alexander', 'Emily', 'Ethan', 'Elizabeth', 'Jacob', 'Mila', 'Michael', 'Ella', 'Daniel',
                           'Avery', 'Henry', 'Sofia', 'Jackson', 'Camila', 'Sebastian', 'Aria', 'Aiden', 'Scarlett', 'Matthew',
                           'Victoria', 'Samuel', 'Madison', 'David', 'Luna', 'Joseph', 'Grace', 'Carter', 'Chloe', 'Owen', 'Penelope'];
        
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                          'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                          'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
                          'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
                          'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
        
        const specialties = [
            {name: 'Clinical Psychologist', key: 'clinical'},
            {name: 'Counseling Psychologist', key: 'counseling'},
            {name: 'School Psychologist', key: 'school'},
            {name: 'Health Psychologist', key: 'health'},
            {name: 'Child/Adolescent Psychologist', key: 'child'},
            {name: 'Neuropsychologist', key: 'neuro'},
            {name: 'Forensic Psychologist', key: 'forensic'},
            {name: 'Industrial-Organizational Psychologist', key: 'io'}
        ];
        
        const specializations = {
            clinical: ['Anxiety Disorders', 'Depression', 'Bipolar Disorder', 'Schizophrenia', 'Personality Disorders'],
            counseling: ['Life Transitions', 'Relationship Issues', 'Grief Counseling', 'Career Counseling', 'Stress Management'],
            school: ['Learning Disabilities', 'ADHD', 'Autism Spectrum', 'Behavioral Issues', 'Educational Assessments'],
            health: ['Chronic Illness', 'Pain Management', 'Health Behavior Change', 'Psychosomatic Disorders', 'Rehabilitation'],
            child: ['Childhood Anxiety', 'Behavioral Disorders', 'Developmental Disorders', 'Parenting Support', 'School Refusal'],
            neuro: ['Brain Injury', 'Dementia', 'Cognitive Disorders', 'Memory Problems', 'Stroke Recovery'],
            forensic: ['Criminal Behavior', 'Competency Evaluations', 'Child Custody', 'Violence Risk Assessment', 'Trauma'],
            io: ['Workplace Stress', 'Leadership Development', 'Team Building', 'Organizational Change', 'Career Development']
        };
        
        const statuses = ['Online', 'In Session', 'Offline'];
        
        const therapists = [];
        
        for (let i = 1; i <= count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `Dr. ${firstName} ${lastName}`;
            const gender = Math.random() > 0.5 ? 'women' : 'men';
            const img = `https://randomuser.me/api/portraits/${gender}/${Math.floor(Math.random() * 100)}.jpg`;
            
            const specialty = specialties[Math.floor(Math.random() * specialties.length)];
            const experience = Math.floor(Math.random() * 25) + 1;
            const rating = (4 + Math.random()).toFixed(1);
            const reviewCount = Math.floor(Math.random() * 200) + 10;
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const availableToday = Math.random() > 0.3;
            const availableThisWeek = Math.random() > 0.1;
            
            // Generate availability slots
            const availability = [];
            const baseHour = 9 + Math.floor(Math.random() * 4); // Start between 9am-12pm
            const slotCount = 3 + Math.floor(Math.random() * 4); // 3-6 slots
            
            for (let j = 0; j < slotCount; j++) {
                const hour = baseHour + (j * 2);
                if (hour < 18) { // Don't go past 6pm
                    const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                    availability.push(time);
                }
            }
            
            // Generate reviews
            const reviews = [];
            const reviewCountToShow = Math.min(3, Math.floor(Math.random() * 5) + 1);
            const reviewAuthors = ['Patient', 'Anonymous', 'Client', 'Parent of Patient', 'Family Member'];
            
            for (let j = 0; j < reviewCountToShow; j++) {
                const stars = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
                const author = `${reviewAuthors[Math.floor(Math.random() * reviewAuthors.length)]}`;
                const monthsAgo = Math.floor(Math.random() * 12) + 1;
                const content = [
                    'Very professional and caring approach.',
                    'Made me feel comfortable from the first session.',
                    'Has helped me tremendously with my issues.',
                    'Knowledgeable and patient with my child.',
                    'Provided excellent tools to manage my condition.',
                    'Would highly recommend to anyone seeking help.',
                    'The best therapist I\'ve ever worked with.'
                ][Math.floor(Math.random() * 7)];
                
                reviews.push({
                    author: author,
                    rating: '★'.repeat(stars),
                    date: `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`,
                    content: content
                });
            }
            
            therapists.push({
                id: i,
                name: name,
                img: img,
                specialty: specialty.name,
                specialtyKey: specialty.key,
                experience: `${experience} year${experience > 1 ? 's' : ''}`,
                rating: `${rating} ★ (${reviewCount} reviews)`,
                status: status,
                availableToday: availableToday,
                availableThisWeek: availableThisWeek,
                about: `${name} is a ${specialty.name.toLowerCase()} with ${experience} years of experience specializing in ${specializations[specialty.key][0].toLowerCase()} and ${specializations[specialty.key][1].toLowerCase()}. ${gender === 'women' ? 'She' : 'He'} takes a ${['compassionate', 'evidence-based', 'holistic', 'client-centered', 'integrative'][Math.floor(Math.random() * 5)]} approach to therapy.`,
                specializations: specializations[specialty.key],
                availability: availability,
                reviews: reviews
            });
        }
        
        return therapists;
    }
});