document.addEventListener('DOMContentLoaded', function() {
    // Toggle between conversations and requests
    const toggleRequestBtn = document.getElementById('toggleRequestBtn');
    const closeRequestsBtn = document.getElementById('closeRequestsBtn');
    const activeConversations = document.getElementById('activeConversations');
    const sessionRequests = document.getElementById('sessionRequests');
    
    if (toggleRequestBtn && closeRequestsBtn && activeConversations && sessionRequests) {
        toggleRequestBtn.addEventListener('click', function() {
            activeConversations.style.display = 'none';
            sessionRequests.style.display = 'flex';
        });
        
        closeRequestsBtn.addEventListener('click', function() {
            sessionRequests.style.display = 'none';
            activeConversations.style.display = 'block';
        });
    }
    
    // Chat functionality
    const chatContainer = document.getElementById('chatContainer');
    const emptyChat = document.getElementById('emptyChat');
    const conversations = document.querySelectorAll('.conversation');
    const backToConversations = document.getElementById('backToConversations');
    
    if (conversations.length > 0 && chatContainer && emptyChat && backToConversations) {
        conversations.forEach(conversation => {
            conversation.addEventListener('click', function() {
                chatContainer.classList.add('active');
                emptyChat.style.display = 'none';
                
                // For mobile view
                if (window.innerWidth <= 768) {
                    document.querySelector('.conversations-list').classList.add('hidden');
                }
            });
        });
        
        backToConversations.addEventListener('click', function() {
            document.querySelector('.conversations-list').classList.remove('hidden');
            chatContainer.classList.remove('active');
            emptyChat.style.display = 'flex';
        });
    }
    
    // Video call modal
    const videoCallBtn = document.getElementById('videoCallBtn');
    const videoCallModal = document.getElementById('videoCallModal');
    const closeVideoModal = document.getElementById('closeVideoModal');
    const endVideoCallBtn = document.getElementById('endVideoCallBtn');
    
    if (videoCallBtn && videoCallModal && closeVideoModal && endVideoCallBtn) {
        videoCallBtn.addEventListener('click', function() {
            videoCallModal.classList.add('active');
        });
        
        closeVideoModal.addEventListener('click', function() {
            videoCallModal.classList.remove('active');
        });
        
        endVideoCallBtn.addEventListener('click', function() {
            videoCallModal.classList.remove('active');
        });
    }
    
    // Toggle mute and video
    const muteBtn = document.getElementById('muteBtn');
    const videoToggleBtn = document.getElementById('videoToggleBtn');
    
    if (muteBtn && videoToggleBtn) {
        muteBtn.addEventListener('click', function() {
            this.classList.toggle('muted');
            const icon = this.querySelector('i');
            if (this.classList.contains('muted')) {
                icon.classList.remove('bx-microphone');
                icon.classList.add('bx-microphone-off');
            } else {
                icon.classList.remove('bx-microphone-off');
                icon.classList.add('bx-microphone');
            }
        });
        
        videoToggleBtn.addEventListener('click', function() {
            this.classList.toggle('disabled');
            const icon = this.querySelector('i');
            if (this.classList.contains('disabled')) {
                icon.classList.remove('bx-video');
                icon.classList.add('bx-video-off');
            } else {
                icon.classList.remove('bx-video-off');
                icon.classList.add('bx-video');
            }
        });
    }
    
    // Bottom navbar functionality
    const navMessages = document.getElementById('navMessages');
    const navRequests = document.getElementById('navRequests');
    
    if (navMessages && navRequests) {
        navMessages.addEventListener('click', function() {
            document.querySelector('.conversations-list').classList.remove('hidden');
            if (chatContainer) chatContainer.classList.remove('active');
            if (emptyChat) emptyChat.style.display = 'flex';
            if (sessionRequests) sessionRequests.style.display = 'none';
            if (activeConversations) activeConversations.style.display = 'block';
            
            // Update active state
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
        
        navRequests.addEventListener('click', function() {
            document.querySelector('.conversations-list').classList.remove('hidden');
            if (chatContainer) chatContainer.classList.remove('active');
            if (emptyChat) emptyChat.style.display = 'none';
            if (activeConversations) activeConversations.style.display = 'none';
            if (sessionRequests) sessionRequests.style.display = 'flex';
            
            // Update active state
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    }
    
    // Three dots options modal functionality
    const moreOptionsBtn = document.querySelector('.more-options');
    const optionsModal = document.getElementById('optionsModal');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const endSessionBtn = document.getElementById('endSessionBtn');
    const confirmEndSessionModal = document.getElementById('confirmEndSessionModal');
    const cancelEndSession = document.getElementById('cancelEndSession');
    const confirmEndSession = document.getElementById('confirmEndSession');
    
    if (moreOptionsBtn && optionsModal && minimizeBtn && endSessionBtn && 
        confirmEndSessionModal && cancelEndSession && confirmEndSession) {
        // Toggle options modal
        moreOptionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            optionsModal.style.display = optionsModal.style.display === 'block' ? 'none' : 'block';
        });
        
        // Minimize chat
        minimizeBtn.addEventListener('click', function() {
            optionsModal.style.display = 'none';
            if (chatContainer) chatContainer.classList.remove('active');
            if (emptyChat) emptyChat.style.display = 'flex';
        });
        
        // Show confirm end session modal
        endSessionBtn.addEventListener('click', function() {
            optionsModal.style.display = 'none';
            confirmEndSessionModal.style.display = 'flex';
        });
        
        // Cancel end session
        cancelEndSession.addEventListener('click', function() {
            confirmEndSessionModal.style.display = 'none';
        });
        
        // Confirm end session
        confirmEndSession.addEventListener('click', function() {
            confirmEndSessionModal.style.display = 'none';
            if (chatContainer) chatContainer.classList.remove('active');
            if (emptyChat) emptyChat.style.display = 'flex';
            
            // Here you would typically also send a notification to the patient
            // and update your backend about the session ending
            
            // Show a confirmation message (optional)
            alert('Session has been ended successfully.');
        });
        
        // Close modals when clicking outside
        document.addEventListener('click', function(e) {
            if (optionsModal && !optionsModal.contains(e.target) && e.target !== moreOptionsBtn) {
                optionsModal.style.display = 'none';
            }
        });
    }
    
    // Close modals when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (optionsModal) optionsModal.style.display = 'none';
            if (confirmEndSessionModal) confirmEndSessionModal.style.display = 'none';
            if (videoCallModal) videoCallModal.classList.remove('active');
        }
    });
    
    // For video call modal - make sure it stays on top
    if (videoCallBtn) {
        videoCallBtn.addEventListener('click', function() {
            if (optionsModal) optionsModal.style.display = 'none';
            if (videoCallModal) videoCallModal.classList.add('active');
        });
    }
    
    // Simulate receiving a new message
    setTimeout(() => {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            const newMessage = document.createElement('div');
            newMessage.className = 'message received';
            newMessage.innerHTML = `
                <div class="avatar">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Patient">
                </div>
                <div class="message-content">
                    <p>I was wondering if we could schedule an extra session this week?</p>
                    <span class="message-time">2:50 PM</span>
                </div>
            `;
            messagesContainer.appendChild(newMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 3000);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            const conversationsList = document.querySelector('.conversations-list');
            if (conversationsList) conversationsList.classList.remove('hidden');
        }
    });
});