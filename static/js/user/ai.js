document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyList = document.getElementById('historyList');
    const menuToggle = document.getElementById('menuToggle');
    const navbar = document.getElementById('navbar');
    const therapistModal = document.getElementById('therapistModal');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');
    const chatHistory = document.getElementById('chatHistory');
    const chatArea = document.getElementById('chatArea');
    
    // Conversation state
    let currentChatId = Date.now();
    let conversationState = {
        step: 1, // 1: initial, 2: symptoms, 3: preferences, 4: price range, 5: show results
        symptoms: '',
        preferences: '',
        priceRange: ''
    };
    
    // Sample therapist data
    const therapists = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            specialty: "Clinical Psychologist",
            rating: 4.7,
            reviews: 128,
            price: 120,
            image: "https://randomuser.me/api/portraits/women/65.jpg",
            about: "Specializes in anxiety and depression with 10+ years experience. Dr. Johnson uses a combination of cognitive behavioral therapy and mindfulness techniques to help clients manage their symptoms and improve their quality of life.",
            specialties: ["Anxiety", "Depression", "Stress Management", "Relationship Issues"],
            languages: ["English", "Spanish"],
            experience: "10 years",
            approach: "Cognitive Behavioral Therapy, Mindfulness-Based"
        },
        {
            id: 2,
            name: "Dr. Michael Chen",
            specialty: "Cognitive Behavioral Therapist",
            rating: 4.9,
            reviews: 95,
            price: 150,
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            about: "Expert in CBT for anxiety disorders and workplace stress. Dr. Chen has helped numerous clients overcome phobias, OCD, and work-related stress through evidence-based techniques.",
            specialties: ["Anxiety Disorders", "OCD", "Mindfulness", "Workplace Stress"],
            languages: ["English", "Mandarin"],
            experience: "8 years",
            approach: "Cognitive Behavioral Therapy, Exposure Therapy"
        },
        {
            id: 3,
            name: "Dr. Emily Wilson",
            specialty: "Child Psychologist",
            rating: 4.5,
            reviews: 76,
            price: 90,
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            about: "Dedicated to helping children and adolescents with emotional challenges. Dr. Wilson creates a safe, playful environment for young clients to express themselves and develop coping skills.",
            specialties: ["Child Psychology", "ADHD", "Family Therapy", "Adolescent Issues"],
            languages: ["English"],
            experience: "6 years",
            approach: "Play Therapy, Family Systems Therapy"
        },
        {
            id: 4,
            name: "Dr. Robert Garcia",
            specialty: "Trauma Specialist",
            rating: 4.8,
            reviews: 112,
            price: 180,
            image: "https://randomuser.me/api/portraits/men/45.jpg",
            about: "Specializes in trauma recovery and PTSD treatment. Dr. Garcia uses EMDR and other trauma-focused therapies to help clients process and heal from traumatic experiences.",
            specialties: ["PTSD", "Trauma Recovery", "EMDR", "Grief Counseling"],
            languages: ["English", "Spanish"],
            experience: "12 years",
            approach: "EMDR, Trauma-Focused CBT"
        },
        {
            id: 5,
            name: "Dr. Priya Patel",
            specialty: "Couples Therapist",
            rating: 4.6,
            reviews: 89,
            price: 140,
            image: "https://randomuser.me/api/portraits/women/68.jpg",
            about: "Helps couples improve communication and resolve conflicts. Dr. Patel uses evidence-based approaches to help partners understand each other better and strengthen their relationships.",
            specialties: ["Couples Therapy", "Marriage Counseling", "Communication Skills", "Family Conflict"],
            languages: ["English", "Hindi"],
            experience: "9 years",
            approach: "Gottman Method, Emotionally Focused Therapy"
        }
    ];
    
    // Initialize with a default chat
    addToHistory(currentChatId, "New Chat");
    
    
    // Close modal
    modalClose.addEventListener('click', function() {
        therapistModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    therapistModal.addEventListener('click', function(e) {
        if (e.target === therapistModal) {
            therapistModal.classList.remove('active');
        }
    });
    
    // Send message function
    function sendMessage() {
        const message = userMessageInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addMessage(message, 'user');
        userMessageInput.value = '';
        adjustTextareaHeight();
        
        // Process user input based on conversation state
        processAIResponse(message);
    }
    
    // Process AI response based on conversation state
    function processAIResponse(userMessage) {
        // Check for "next" or "another" to find another therapist
        if ((userMessage.toLowerCase().includes('next') || 
             userMessage.toLowerCase().includes('another')) && 
            conversationState.step === 4) {
            setTimeout(() => {
                showTherapistResults();
            }, 800);
            return;
        }
        
        switch(conversationState.step) {
            case 1: // Initial symptoms
                conversationState.symptoms = userMessage;
                conversationState.step = 2;
                setTimeout(() => {
                    addMessage("Thank you for sharing. What specific preferences do you have for your therapist? (e.g., gender, therapy approach, experience level)", 'ai');
                }, 800);
                break;
                
            case 2: // Preferences
                conversationState.preferences = userMessage;
                conversationState.step = 3;
                setTimeout(() => {
                    addMessage("What is your preferred price range per session? (e.g., $50-$100, $100-$150, $150+)", 'ai');
                }, 800);
                break;
                
            case 3: // Price range
                conversationState.priceRange = userMessage;
                conversationState.step = 4;
                setTimeout(() => {
                    addMessage("Great! I'll now search for psychologists that match your needs...", 'ai');
                    setTimeout(showTherapistResults, 1500);
                }, 800);
                break;
                
            case 4: // After showing results
                setTimeout(() => {
                    addMessage("Would you like me to find another psychologist or do you have any other questions?", 'ai');
                }, 800);
                break;
                
            default:
                setTimeout(() => {
                    addMessage("I'm not sure how to respond to that. Could you please rephrase?", 'ai');
                }, 800);
        }
    }
    
    // Show therapist results
    function showTherapistResults() {
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.innerHTML = `
            <div class="message-content">
                <div class="loading">
                    <div class="loader"></div>
                    <span>Searching for therapists...</span>
                </div>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate API delay
        setTimeout(() => {
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            
            // Filter therapists based on user preferences (simplified for demo)
            const filteredTherapists = therapists.filter(therapist => {
                return therapist.price <= getMaxPrice(conversationState.priceRange);
            });
            
            if (filteredTherapists.length === 0) {
                addMessage("No therapists found matching your criteria. Try adjusting your preferences.", 'ai');
                return;
            }
            
            // Pick one random therapist from filtered list
            const selectedTherapist = filteredTherapists[Math.floor(Math.random() * filteredTherapists.length)];
            
            // Add therapist card to chat
            const therapistCard = document.createElement('div');
            therapistCard.className = 'therapist-card';
            therapistCard.innerHTML = `
                <div class="therapist-avatar">
                    <img src="${selectedTherapist.image}" alt="${selectedTherapist.name}">
                </div>
                <div class="therapist-info">
                    <h4>${selectedTherapist.name}</h4>
                    <div class="specialty">${selectedTherapist.specialty}</div>
                    <div class="rating">
                        ${generateStars(selectedTherapist.rating)}
                        <span>${selectedTherapist.rating} (${selectedTherapist.reviews} reviews)</span>
                    </div>
                    <div class="price">$${selectedTherapist.price} per session</div>
                </div>
            `;
            
            // Add click event to view therapist details
            therapistCard.addEventListener('click', function() {
                showTherapistModal(selectedTherapist);
            });
            
            // Create AI message container
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.innerHTML = `
                <p>Here's a psychologist I found that matches your needs:</p>
                <div class="therapist-cards"></div>
                <p>Click on the profile to view details and book a session.</p>
            `;
            
            messageContent.querySelector('.therapist-cards').appendChild(therapistCard);
            aiMessage.appendChild(messageContent);
            chatMessages.appendChild(aiMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
    }
    
    // Show therapist modal with details
    function showTherapistModal(therapist) {
        modalBody.innerHTML = `
            <div class="therapist-profile">
                <img src="${therapist.image}" alt="${therapist.name}" class="therapist-profile-img">
                <div class="therapist-profile-info">
                    <h3>${therapist.name}</h3>
                    <div class="therapist-profile-specialty">${therapist.specialty}</div>
                    <div class="therapist-profile-rating">
                        ${generateStars(therapist.rating)}
                        <span>${therapist.rating} (${therapist.reviews} reviews)</span>
                    </div>
                    <div class="therapist-profile-price">$${therapist.price} per session</div>
                </div>
            </div>
            
            <div class="therapist-profile-about">
                <h4>About</h4>
                <p>${therapist.about}</p>
            </div>
            
            <div class="therapist-details">
                <h4>Details</h4>
                <p><strong>Experience:</strong> ${therapist.experience}</p>
                <p><strong>Therapeutic Approach:</strong> ${therapist.approach}</p>
                <p><strong>Languages:</strong> ${therapist.languages.join(', ')}</p>
            </div>
            
            <div class="therapist-specialties">
                <h4>Specialties</h4>
                <div class="specialty-badges">
                    ${therapist.specialties.map(spec => `<span class="specialty-badge">${spec}</span>`).join('')}
                </div>
            </div>
            
            <div class="booking-section" id="bookingSection">
                <div class="booking-steps">
                    <div class="step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-label">Schedule</div>
                    </div>
                    <div class="step" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-label">Payment</div>
                    </div>
                    <div class="step" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-label">Confirm</div>
                    </div>
                </div>
                
                <div class="step-content active" data-step="1">
                    <form id="bookingForm">
                        <div class="form-group">
                            <label for="sessionDate">Session Date</label>
                            <input type="date" id="sessionDate" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="sessionTime">Session Time</label>
                            <select id="sessionTime" class="form-control" required>
                                <option value="">Select a time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="sessionType">Session Type</label>
                            <select id="sessionType" class="form-control" required>
                                <option value="video">Video Call</option>
                                <option value="phone">Phone Call</option>
                                <option value="in-person">In-Person</option>
                            </select>
                        </div>
                        
                        <div class="step-navigation">
                            <button type="button" class="btn btn-outline" disabled>Back</button>
                            <button type="button" class="btn btn-primary next-step">Next</button>
                        </div>
                    </form>
                </div>
                
                <div class="step-content" data-step="2">
                    <div class="form-group">
                        <label>Payment Method</label>
                        <div class="payment-methods">
                            <div class="payment-method" data-method="credit">
                                <i class="fab fa-cc-visa"></i>
                                <div class="payment-method-info">
                                    <h5>Credit Card</h5>
                                    <p>Visa, Mastercard</p>
                                </div>
                            </div>
                            <div class="payment-method" data-method="paypal">
                                <i class="fab fa-paypal"></i>
                                <div class="payment-method-info">
                                    <h5>PayPal</h5>
                                    <p>Secure payments</p>
                                </div>
                            </div>
                            <div class="payment-method" data-method="gcash">
                                <i class="fas fa-mobile-alt"></i>
                                <div class="payment-method-info">
                                    <h5>GCash</h5>
                                    <p>Mobile payments</p>
                                </div>
                            </div>
                            <div class="payment-method" data-method="maya">
                                <i class="fas fa-wallet"></i>
                                <div class="payment-method-info">
                                    <h5>Maya</h5>
                                    <p>Digital wallet</p>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" id="paymentMethod" value="credit">
                    </div>
                    
                    <div class="step-navigation">
                        <button type="button" class="btn btn-outline prev-step">Back</button>
                        <button type="button" class="btn btn-primary next-step">Next</button>
                    </div>
                </div>
                
                <div class="step-content" data-step="3">
                    <div class="booking-summary">
                        <h4>Booking Summary</h4>
                        <div class="summary-item">
                            <span>Therapist:</span>
                            <strong>${therapist.name}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Date & Time:</span>
                            <strong id="summaryDateTime">Not selected</strong>
                        </div>
                        <div class="summary-item">
                            <span>Session Type:</span>
                            <strong id="summarySessionType">Video Call</strong>
                        </div>
                        <div class="summary-item">
                            <span>Payment Method:</span>
                            <strong id="summaryPaymentMethod">Credit Card</strong>
                        </div>
                        <div class="summary-item total">
                            <span>Total:</span>
                            <strong>$${therapist.price}</strong>
                        </div>
                    </div>
                    
                    <div class="step-navigation">
                        <button type="button" class="btn btn-outline prev-step">Back</button>
                        <button type="button" class="btn btn-primary confirm-booking">Confirm Booking</button>
                    </div>
                </div>
            </div>
        `;
        
        // Set minimum date to tomorrow
        const dateInput = document.getElementById('sessionDate');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                paymentMethods.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('paymentMethod').value = this.dataset.method;
                document.getElementById('summaryPaymentMethod').textContent = 
                    this.querySelector('h5').textContent;
            });
        });
        
        // Set first payment method as active by default
        paymentMethods[0].classList.add('active');
        
        // Step navigation
        const nextButtons = document.querySelectorAll('.next-step');
        const prevButtons = document.querySelectorAll('.prev-step');
        const steps = document.querySelectorAll('.step');
        const stepContents = document.querySelectorAll('.step-content');
        
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentStep = this.closest('.step-content').dataset.step;
                const nextStep = parseInt(currentStep) + 1;
                
                // Update summary for step 3
                if (nextStep === 3) {
                    const date = document.getElementById('sessionDate').value;
                    const time = document.getElementById('sessionTime').value;
                    const sessionType = document.getElementById('sessionType').value;
                    
                    if (date && time) {
                        const dateObj = new Date(`${date}T${time}`);
                        document.getElementById('summaryDateTime').textContent = 
                            dateObj.toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                    }
                    
                    document.getElementById('summarySessionType').textContent = 
                        document.getElementById('sessionType').options[
                            document.getElementById('sessionType').selectedIndex
                        ].text;
                }
                
                navigateToStep(nextStep);
            });
        });
        
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentStep = this.closest('.step-content').dataset.step;
                const prevStep = parseInt(currentStep) - 1;
                navigateToStep(prevStep);
            });
        });
        
        // Confirm booking
        document.querySelector('.confirm-booking')?.addEventListener('click', function() {
            completeBooking(therapist);
        });
        
        // Show modal
        therapistModal.classList.add('active');
        
        function navigateToStep(step) {
            // Update steps
            steps.forEach(stepEl => {
                const stepNum = parseInt(stepEl.dataset.step);
                if (stepNum < step) {
                    stepEl.classList.remove('active');
                    stepEl.classList.add('completed');
                } else if (stepNum === step) {
                    stepEl.classList.add('active');
                    stepEl.classList.remove('completed');
                } else {
                    stepEl.classList.remove('active', 'completed');
                }
            });
            
            // Update content
            stepContents.forEach(content => {
                if (content.dataset.step == step) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }
    }
    
    // Complete booking process
    function completeBooking(therapist) {
        const bookingSection = document.getElementById('bookingSection');
        bookingSection.innerHTML = `
            <div class="booking-success">
                <i class="fas fa-check-circle"></i>
                <h3>Booking Confirmed!</h3>
                <p>Your session with ${therapist.name} has been successfully booked.</p>
                <p>We've sent the details to your email.</p>
                <button class="btn btn-outline" id="closeModal">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        
        document.getElementById('closeModal').addEventListener('click', function() {
            therapistModal.classList.remove('active');
            
            // Add confirmation message to chat
            addMessage(`I've booked a session with ${therapist.name} for you!`, 'ai');
        });
    }
    
    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<p>${text}</p>`;
        
        // Add timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        contentDiv.innerHTML += `<div class="message-time">${timeString}</div>`;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add chat to history
    function addToHistory(id, previewText) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.chatId = id;
        historyItem.innerHTML = `
            <i class="fas fa-comment"></i>
            <span class="history-item-text">${previewText}</span>
        `;
        
        historyItem.addEventListener('click', function() {
            // In a real app, this would load the chat history
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        historyList.insertBefore(historyItem, historyList.firstChild);
    }
    
    // Create new chat
    function createNewChat() {
        currentChatId = Date.now();
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <p>Hello! I'm SerenityQ AI. I can help you find the perfect psychologist based on your needs. What symptoms or concerns would you like to discuss?</p>
                    <div class="message-time">Just now</div>
                </div>
            </div>
        `;
        
        conversationState = {
            step: 1,
            symptoms: '',
            preferences: '',
            priceRange: ''
        };
        
        addToHistory(currentChatId, "New Chat");
    }
    
    // Helper function to generate star rating
    function generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    // Helper function to get max price from range
    function getMaxPrice(range) {
        if (!range) return 200; // default
        if (range.includes('+')) return 9999;
        const matches = range.match(/\$?(\d+)/g);
        if (matches && matches.length > 1) return parseInt(matches[1]);
        return 200; // default
    }
    
    // Adjust textarea height based on content
    function adjustTextareaHeight() {
        userMessageInput.style.height = 'auto';
        userMessageInput.style.height = (userMessageInput.scrollHeight) + 'px';
    }
    
    // Event listeners
    sendMessageBtn.addEventListener('click', sendMessage);
    newChatBtn.addEventListener('click', createNewChat);
    
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    userMessageInput.addEventListener('input', adjustTextareaHeight);
    
    // Initialize textarea height
    adjustTextareaHeight();
});