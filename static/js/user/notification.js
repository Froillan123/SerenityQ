        // Simple script to handle notification interactions
        document.addEventListener('DOMContentLoaded', function() {
            // Filter buttons
            const filterButtons = document.querySelectorAll('.filter-button');
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    // In a real app, would filter notifications here
                });
            });

            // Mark all as read
            const markAllRead = document.querySelector('.mark-all-read');
            markAllRead.addEventListener('click', function() {
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
            });

            // Notification item click
            const notificationItems = document.querySelectorAll('.notification-item');
            notificationItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    // Don't trigger if clicking on action button
                    if (!e.target.closest('.notification-action')) {
                        this.classList.remove('unread');
                        // In a real app, would navigate to appointment details
                    }
                });
            });

            // Action buttons
            const actionButtons = document.querySelectorAll('.notification-action');
            actionButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // In a real app, would show options menu
                    console.log('Action button clicked');
                });
            });

            // Load more
            const loadMore = document.querySelector('.load-more');
            loadMore.addEventListener('click', function() {
                // In a real app, would load more notifications
                console.log('Load more clicked');
            });
        });