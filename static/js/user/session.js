document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
            
            // Reset chat view when switching tabs
            resetChatView();
        });
    });
    
    // Session Card Selection
    const sessionCards = document.querySelectorAll('.session-card');
    const chatPlaceholder = document.querySelector('.chat-placeholder');
    const activeChat = document.querySelector('.active-chat');
    const previousChat = document.querySelector('.previous-chat');
    
    sessionCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            sessionCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Check if it's a current/active session or previous session
            if (this.classList.contains('active-session')) {
                // Show active chat interface
                loadActiveSession(this);
                chatPlaceholder.style.display = 'none';
                activeChat.style.display = 'flex';
                previousChat.style.display = 'none';
            } else if (this.classList.contains('previous-session')) {
                // Show previous chat interface
                loadPreviousSession(this);
                chatPlaceholder.style.display = 'none';
                activeChat.style.display = 'none';
                previousChat.style.display = 'flex';
            }
        });
    });
    
    function loadActiveSession(card) {
        const therapistAvatar = card.querySelector('.therapist-avatar').src;
        const therapistName = card.querySelector('.session-details h3').textContent;
        const sessionMethod = card.querySelector('.session-method').textContent;
        const sessionTimer = card.querySelector('.session-timer span').textContent;
        
        document.getElementById('chatTherapistAvatar').src = therapistAvatar;
        document.getElementById('chatTherapistName').textContent = therapistName;
        document.getElementById('chatSessionMethod').textContent = sessionMethod;
        document.getElementById('chatSessionTimer').textContent = sessionTimer;
        
        // For video call overlay
        document.getElementById('remoteVideoAvatar').src = therapistAvatar;
        document.getElementById('remoteVideoName').textContent = therapistName;
        
        // Load messages for this session
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        // Sample messages
        const messages = [
            { sender: 'therapist', text: 'Hello Sarah, how are you feeling today?', time: '3:00 PM' },
            { sender: 'user', text: 'Hi Dr. Chen, I\'m feeling a bit anxious about my upcoming presentation.', time: '3:02 PM' },
            { sender: 'therapist', text: 'I understand. Let\'s talk through some strategies to manage that anxiety.', time: '3:04 PM' }
        ];
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender === 'user' ? 'sent' : 'received'}`;
            
            messageDiv.innerHTML = `
                <div class="message-content">${msg.text}</div>
                <div class="message-info">${msg.time}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
        });
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function loadPreviousSession(card) {
        const therapistAvatar = card.querySelector('.therapist-avatar').src;
        const therapistName = card.querySelector('.session-details h3').textContent;
        const sessionMethod = card.querySelector('.session-method').textContent;
        const sessionDate = card.querySelector('.session-time').textContent;
        
        document.getElementById('prevTherapistAvatar').src = therapistAvatar;
        document.getElementById('prevTherapistName').textContent = therapistName;
        document.getElementById('prevSessionMethod').textContent = sessionMethod;
        document.getElementById('prevSessionDate').textContent = sessionDate;
        
        // Load previous messages for this session
        const prevChatMessages = document.getElementById('prevChatMessages');
        prevChatMessages.innerHTML = '';
        
        // Sample previous messages
        const prevMessages = [
            { sender: 'therapist', text: 'Welcome back Sarah. How have you been since our last session?', time: 'June 15, 3:00 PM' },
            { sender: 'user', text: 'Thanks Dr. Chen. I\'ve been better at recognizing my anxiety triggers.', time: 'June 15, 3:02 PM' },
            { sender: 'therapist', text: 'That\'s great progress! What strategies have been working for you?', time: 'June 15, 3:04 PM' },
            { sender: 'user', text: 'The breathing exercises have helped, especially before meetings.', time: 'June 15, 3:06 PM' },
            { sender: 'therapist', text: 'I\'m glad to hear that. Let\'s explore some additional techniques today.', time: 'June 15, 3:08 PM' }
        ];
        
        prevMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender === 'user' ? 'sent' : 'received'}`;
            
            messageDiv.innerHTML = `
                <div class="message-content">${msg.text}</div>
                <div class="message-info">${msg.time}</div>
            `;
            
            prevChatMessages.appendChild(messageDiv);
        });
        
        // Scroll to bottom of chat
        prevChatMessages.scrollTop = prevChatMessages.scrollHeight;
    }
    
    function resetChatView() {
        chatPlaceholder.style.display = 'flex';
        activeChat.style.display = 'none';
        previousChat.style.display = 'none';
        
        // Remove active class from all session cards
        sessionCards.forEach(card => card.classList.remove('active'));
        
        // Hide video call if open
        document.getElementById('videoCallContainer').style.display = 'none';
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.style.display = 'block';
    }
    
    // Timer Simulation
    function updateTimer() {
        const timerElements = document.querySelectorAll('.session-timer span');
        let time = 753; // 12 minutes 33 seconds in seconds
        
        setInterval(() => {
            time++;
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timerElements.forEach(el => {
                el.textContent = formattedTime;
            });
        }, 1000);
    }
    
    updateTimer();
    
    // Modal Handling
    const modals = document.querySelectorAll('.modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-btn');
    const requestModal = document.getElementById('requestModal');
    const paymentModal = document.getElementById('paymentModal');
    const paymentSuccessModal = document.getElementById('paymentSuccessModal');
    const sessionEndedModal = document.getElementById('sessionEndedModal');
    
    // Function to open modal
    function openModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Function to close modal
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Close modals when clicking on close button or cancel
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Close modals with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });
        }
    });
    
    // Request Again Button
    const requestAgainBtn = document.getElementById('requestAgainBtn');
    
    requestAgainBtn.addEventListener('click', function() {
        const therapistName = document.getElementById('prevTherapistName').textContent;
        const therapistAvatar = document.getElementById('prevTherapistAvatar').src;
        
        document.getElementById('modalTherapistName').textContent = therapistName;
        document.getElementById('modalTherapistAvatar').src = therapistAvatar;
        
        openModal(requestModal);
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sessionDate').min = today;
    });
    
    // Request Again from Previous Session Card
    const requestBtns = document.querySelectorAll('.request-btn');
    
    requestBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.session-card');
            const therapistName = card.querySelector('h3').textContent;
            const therapistAvatar = card.querySelector('.therapist-avatar').src;
            
            document.getElementById('modalTherapistName').textContent = therapistName;
            document.getElementById('modalTherapistAvatar').src = therapistAvatar;
            
            openModal(requestModal);
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('sessionDate').min = today;
        });
    });
    
    // Session Request Form Submission
    const sessionRequestForm = document.getElementById('sessionRequestForm');
    
    sessionRequestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        closeModal(requestModal);
        showPaymentModal();
    });
    
    function showPaymentModal() {
        // Get selected values
        const therapistName = document.getElementById('modalTherapistName').textContent;
        const sessionType = document.querySelector('input[name="sessionType"]:checked').value;
        const sessionDate = document.getElementById('sessionDate').value;
        const sessionTime = document.getElementById('sessionTime').value;
        const sessionNotes = document.getElementById('sessionNotes').value;
        
        // Format session type
        let typeText = '';
        let price = '';
        switch(sessionType) {
            case 'video':
                typeText = 'Video Call';
                price = '$85.00';
                break;
            case 'voice':
                typeText = 'Voice Call';
                price = '$65.00';
                break;
            case 'chat':
                typeText = 'Chat Session';
                price = '$45.00';
                break;
        }
        
        // Format date
        const dateObj = new Date(sessionDate);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        document.getElementById('paymentTherapist').textContent = therapistName;
        document.getElementById('paymentType').textContent = typeText;
        document.getElementById('paymentDuration').textContent = '60 minutes';
        document.getElementById('paymentDateTime').textContent = `${formattedDate} at ${sessionTime}`;
        document.getElementById('paymentNotes').textContent = sessionNotes || 'None';
        document.querySelector('.amount').textContent = price;
        
        openModal(paymentModal);
    }
    
    // Payment Method Selection
    const methodOptions = document.querySelectorAll('.method-option');
    
    methodOptions.forEach(option => {
        option.addEventListener('click', function() {
            methodOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding payment details
            const method = this.querySelector('input').value;
            document.getElementById('cardDetails').style.display = 
                method === 'card' ? 'block' : 'none';
            document.getElementById('walletDetails').style.display = 
                method !== 'card' ? 'block' : 'none';
        });
    });
    
    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    cardNumberInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\s+/g, '');
        if (value.length > 16) value = value.substr(0, 16);
        
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formattedValue += ' ';
            formattedValue += value[i];
        }
        
        this.value = formattedValue;
    });
    
    // Format expiry date input
    const cardExpiryInput = document.getElementById('cardExpiry');
    cardExpiryInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\D+/g, '');
        if (value.length > 2) {
            value = value.substr(0, 2) + '/' + value.substr(2, 2);
        }
        this.value = value;
    });
    
    // Complete Payment Button
    const completePaymentBtn = document.getElementById('completePaymentBtn');
    
    completePaymentBtn.addEventListener('click', function() {
        closeModal(paymentModal);
        
        // Set current date in success modal
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        document.getElementById('paymentDate').textContent = formattedDate;
        
        openModal(paymentSuccessModal);
    });
    
    // Payment Success OK Button
    const paymentSuccessOkBtn = document.getElementById('paymentSuccessOkBtn');
    
    paymentSuccessOkBtn.addEventListener('click', function() {
        closeModal(paymentSuccessModal);
    });
    
    // Session Ended OK Button
    const sessionEndedOkBtn = document.getElementById('sessionEndedOkBtn');
    
    sessionEndedOkBtn.addEventListener('click', function() {
        closeModal(sessionEndedModal);
    });
    
    // Chat Input Functionality
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendMessageBtn.addEventListener('click', sendMessage);
    
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            const chatMessages = document.getElementById('chatMessages');
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message sent';
            
            messageDiv.innerHTML = `
                <div class="message-content">${messageText}</div>
                <div class="message-info">${timeString}</div>
            `;
            
            chatMessages.appendChild(messageDiv);
            chatInput.value = '';
            
            // Reset textarea height
            chatInput.style.height = 'auto';
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate therapist reply after a delay
            setTimeout(() => {
                const replies = [
                    "I understand how that might make you feel.",
                    "That's an important observation. Can you tell me more?",
                    "Let's explore that feeling together.",
                    "How does that make you feel?",
                    "Thank you for sharing that with me."
                ];
                
                const randomReply = replies[Math.floor(Math.random() * replies.length)];
                
                const replyDiv = document.createElement('div');
                replyDiv.className = 'message received';
                
                replyDiv.innerHTML = `
                    <div class="message-content">${randomReply}</div>
                    <div class="message-info">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                `;
                
                chatMessages.appendChild(replyDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000 + Math.random() * 2000);
        }
    }
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Video Call Functionality
    const videoCallBtn = document.querySelector('.video-call');
    const voiceCallBtn = document.querySelector('.voice-call');
    const endSessionBtn = document.querySelector('.end-session');
    const minimizeBtn = document.querySelector('.minimize-chat');
    const videoCallContainer = document.getElementById('videoCallContainer');
    const chatMessagesContainer = document.getElementById('chatMessages');
    const endCallBtn = document.querySelector('.end-call');
    const toggleVideoBtn = document.querySelector('.toggle-video');
    const toggleMicBtn = document.querySelector('.toggle-mic');
    
    videoCallBtn.addEventListener('click', function() {
        // Show video call container
        videoCallContainer.style.display = 'flex';
        chatMessagesContainer.style.display = 'none';
        
        // Simulate call connection
        setTimeout(() => {
            document.getElementById('remoteVideoStatus').textContent = 'Connected';
            document.querySelector('.video-overlay').style.display = 'none';
            document.getElementById('remoteVideo').style.display = 'block';
        }, 1500);
        
        // Get user media for local video
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(function(stream) {
                    const localVideo = document.getElementById('localVideo');
                    localVideo.srcObject = stream;
                })
                .catch(function(error) {
                    console.error('Error accessing media devices:', error);
                });
        }
    });
    
    voiceCallBtn.addEventListener('click', function() {
        alert('Voice call initiated. This would connect to your therapist in a real application.');
    });
    
    endSessionBtn.addEventListener('click', function() {
        openModal(sessionEndedModal);
        
        // Stop any ongoing video stream
        const localVideo = document.getElementById('localVideo');
        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Reset chat view
        resetChatView();
    });
    
    minimizeBtn.addEventListener('click', function() {
        resetChatView();
    });
    
    endCallBtn.addEventListener('click', function() {
        // Hide video call container
        videoCallContainer.style.display = 'none';
        chatMessagesContainer.style.display = 'block';
        
        // Stop video stream
        const localVideo = document.getElementById('localVideo');
        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
        }
        
        // Reset overlay for next call
        document.getElementById('remoteVideoStatus').textContent = 'Calling...';
        document.querySelector('.video-overlay').style.display = 'flex';
        document.getElementById('remoteVideo').style.display = 'none';
    });
    
    toggleVideoBtn.addEventListener('click', function() {
        const localVideo = document.getElementById('localVideo');
        if (localVideo.srcObject) {
            const videoTrack = localVideo.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.classList.toggle('disabled');
            }
        }
    });
    
    toggleMicBtn.addEventListener('click', function() {
        const localVideo = document.getElementById('localVideo');
        if (localVideo.srcObject) {
            const audioTrack = localVideo.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.classList.toggle('disabled');
            }
        }
    });
});