
        const navLinks = document.getElementById('navLinks');
        
        
        // Chatbot functionality
        const chatbotToggle = document.getElementById('chatbotToggle');
        const chatbotContainer = document.getElementById('chatbotContainer');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotMessages = document.getElementById('chatbotMessages');
        const chatbotInput = document.getElementById('chatbotInput');
        const chatbotSend = document.getElementById('chatbotSend');
        
        chatbotToggle.addEventListener('click', () => {
            chatbotContainer.classList.toggle('show');
        });
        
        chatbotClose.addEventListener('click', () => {
            chatbotContainer.classList.remove('show');
        });
        
        chatbotSend.addEventListener('click', sendMessage);
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        function sendMessage() {
            const message = chatbotInput.value.trim();
            if (message) {
                // Add user message
                const userMessage = document.createElement('div');
                userMessage.className = 'message user-message';
                userMessage.textContent = message;
                chatbotMessages.appendChild(userMessage);
                
                // Clear input
                chatbotInput.value = '';
                
                // Scroll to bottom
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                
                // Simulate bot response after a delay
                setTimeout(() => {
                    const responses = [
                        "I understand. How does that make you feel?",
                        "That's interesting. Tell me more about that.",
                        "Have you tried the breathing exercises we discussed last time?",
                        "I can schedule an appointment with your therapist if you'd like.",
                        "Remember to practice self-care. Would you like me to suggest some activities?",
                        "I notice you've been consistent with your journaling. That's great progress!",
                        "How about trying a 5-minute mindfulness exercise? I can guide you through it."
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    
                    const botMessage = document.createElement('div');
                    botMessage.className = 'message bot-message';
                    botMessage.textContent = randomResponse;
                    chatbotMessages.appendChild(botMessage);
                    
                    // Scroll to bottom
                    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                }, 1000);
            }
        }
        
        // Mood Chart
        const moodCtx = document.getElementById('moodChart').getContext('2d');
        const moodChart = new Chart(moodCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Mood Level',
                    data: [65, 59, 70, 72, 75, 80],
                    backgroundColor: 'rgba(93, 95, 239, 0.1)',
                    borderColor: 'rgba(93, 95, 239, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: 'rgba(93, 95, 239, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            weight: 'bold'
                        },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw + '/100';
                                return label;
                            }
                        }
                    }
                }
            }
        });
        
        // Session Type Chart
        const sessionCtx = document.getElementById('sessionChart').getContext('2d');
        const sessionChart = new Chart(sessionCtx, {
            type: 'doughnut',
            data: {
                labels: ['CBT', 'Mindfulness', 'Evaluation', 'Support'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: [
                        'rgba(93, 95, 239, 0.8)',
                        'rgba(255, 214, 102, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 126, 95, 0.8)'
                    ],
                    borderColor: [
                        'rgba(93, 95, 239, 1)',
                        'rgba(255, 214, 102, 1)',
                        'rgba(76, 175, 80, 1)',
                        'rgba(255, 126, 95, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
        
        // Animate progress bars on page load
        document.addEventListener('DOMContentLoaded', function() {
            const progressBars = document.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        });