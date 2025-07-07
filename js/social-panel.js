// Social Panel functionality with fake friends data
export class SocialPanel {
    constructor() {
        this.friends = [
            { id: 1, name: 'RETRO_RACER', online: true, lastSeen: 'Now' },
            { id: 2, name: 'PIXEL_PILOT', online: false, lastSeen: '2 min ago' },
            { id: 3, name: 'NEON_KNIGHT', online: true, lastSeen: 'Now' },
            { id: 4, name: 'CYBER_SPEED', online: false, lastSeen: '5 min ago' },
            { id: 5, name: 'ARCADE_ACE', online: true, lastSeen: 'Now' },
            { id: 6, name: 'GLITCH_GURU', online: false, lastSeen: '1 hour ago' },
            { id: 7, name: 'VOLT_VIPER', online: true, lastSeen: 'Now' },
            { id: 8, name: 'PIXEL_PUNK', online: false, lastSeen: '3 hours ago' }
        ];
        
        this.suggestions = [
            'BOOST_BUDDY',
            'DRIFT_KING',
            'TURBO_TITAN',
            'SPEED_DEMON',
            'RACE_RIOT',
            'NITRO_NINJA',
            'CHROME_CHASER',
            'METAL_MACHINE'
        ];
        
        this.userOnline = true;
        this.dropdownOpen = false;
        this.init();
    }
    
    init() {
        this.renderFriends();
        this.setupEventListeners();
        this.startStatusUpdates();
    }
    
    renderFriends() {
        const friendsList = document.getElementById('friendsList');
        if (!friendsList) return;
        
        friendsList.innerHTML = '';
        
        this.friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = 'friend-item';
            friendElement.innerHTML = `
                <div class="friend-info">
                    <div class="status-indicator ${friend.online ? 'online' : 'offline'}"></div>
                    <span class="friend-name">${friend.name}</span>
                </div>
                <div class="friend-actions">
                    ${friend.online ? '<button class="friend-action-btn invite-btn" onclick="socialPanel.inviteFriend(' + friend.id + ')">INVITE</button>' : ''}
                    <button class="friend-action-btn" onclick="socialPanel.removeFriend(' + friend.id + ')">✕</button>
                </div>
            `;
            friendsList.appendChild(friendElement);
        });
    }
    
    setupEventListeners() {
        const addFriendInput = document.getElementById('addFriendInput');
        
        if (addFriendInput) {
            addFriendInput.addEventListener('input', (e) => {
                this.showSuggestions(e.target.value);
            });
            
            addFriendInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addFriend();
                }
                if (e.key === 'Escape') {
                    this.cancelAddFriend();
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const socialPanel = document.getElementById('socialPanel');
            const toggleBtn = document.getElementById('addFriendToggleBtn');
            
            if (this.dropdownOpen && !socialPanel.contains(e.target) && e.target !== toggleBtn) {
                this.cancelAddFriend();
            }
        });
    }
    
    toggleAddFriendMode() {
        const toggleBtn = document.getElementById('addFriendToggleBtn');
        const dropdown = document.getElementById('addFriendDropdown');
        const addFriendInput = document.getElementById('addFriendInput');
        const socialPanel = document.getElementById('socialPanel');
        
        if (!this.dropdownOpen) {
            // Open dropdown
            this.dropdownOpen = true;
            toggleBtn.classList.add('active');
            dropdown.classList.add('show');
            socialPanel.classList.add('expanded');
            if (addFriendInput) {
                addFriendInput.focus();
            }
            this.adjustLayout(true);
        } else {
            // Close dropdown
            this.cancelAddFriend();
        }
    }
    
    cancelAddFriend() {
        const toggleBtn = document.getElementById('addFriendToggleBtn');
        const dropdown = document.getElementById('addFriendDropdown');
        const addFriendInput = document.getElementById('addFriendInput');
        const socialPanel = document.getElementById('socialPanel');
        
        this.dropdownOpen = false;
        toggleBtn.classList.remove('active');
        dropdown.classList.remove('show');
        socialPanel.classList.remove('expanded');
        if (addFriendInput) {
            addFriendInput.value = '';
        }
        this.hideSuggestions();
        this.adjustLayout(false);
    }
    
    adjustLayout(expanded) {
        const canvas = document.getElementById('game');
        const playerCards = document.querySelectorAll('.player-card');
        const gameMenuContainer = document.getElementById('gameMenuContainer');
        const scoreboard = document.querySelector('.scoreboard');
        const startButton = document.querySelector('.start-game-button');
        
        if (expanded) {
            // Push elements up by 80px when dropdown is open
            if (canvas) {
                const currentTransform = canvas.style.transform;
                const newTransform = currentTransform.replace('translate(-50%, -65%)', 'translate(-50%, -80%)');
                canvas.style.transform = newTransform;
                canvas.style.transition = 'transform 0.3s ease';
            }
            playerCards.forEach(card => {
                card.style.transform = 'translateY(-40px)';
                card.style.transition = 'transform 0.3s ease';
            });
            if (gameMenuContainer) {
                gameMenuContainer.style.transform = 'translateY(-40px)';
                gameMenuContainer.style.transition = 'transform 0.3s ease';
            }
            if (scoreboard) {
                scoreboard.style.transform = 'translateY(-40px)';
                scoreboard.style.transition = 'transform 0.3s ease';
            }
            if (startButton) {
                startButton.style.transform = 'translateY(-40px)';
                startButton.style.transition = 'transform 0.3s ease';
            }
        } else {
            // Reset elements to original position
            if (canvas) {
                const currentTransform = canvas.style.transform;
                const newTransform = currentTransform.replace('translate(-50%, -80%)', 'translate(-50%, -65%)');
                canvas.style.transform = newTransform;
            }
            playerCards.forEach(card => {
                card.style.transform = 'translateY(0)';
            });
            if (gameMenuContainer) {
                gameMenuContainer.style.transform = 'translateY(0)';
            }
            if (scoreboard) {
                scoreboard.style.transform = 'translateY(0)';
            }
            if (startButton) {
                startButton.style.transform = 'translateY(0)';
            }
        }
    }
    
    showSuggestions(query) {
        const suggestionsContainer = document.getElementById('friendSuggestions');
        if (!suggestionsContainer) return;
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const filtered = this.suggestions.filter(name => 
            name.toLowerCase().includes(query.toLowerCase()) &&
            !this.friends.some(friend => friend.name === name)
        );
        
        if (filtered.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        suggestionsContainer.innerHTML = '';
        filtered.slice(0, 4).forEach(name => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.innerHTML = `<span class="suggestion-name">${name}</span>`;
            suggestion.addEventListener('click', () => {
                this.addFriendByName(name);
            });
            suggestionsContainer.appendChild(suggestion);
        });
        
        suggestionsContainer.classList.add('show');
    }
    
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('friendSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('show');
        }
    }
    
    addFriend() {
        const input = document.getElementById('addFriendInput');
        if (!input || !input.value.trim()) return;
        
        const name = input.value.trim().toUpperCase();
        this.addFriendByName(name);
        this.cancelAddFriend(); // Reset the UI
    }
    
    addFriendByName(name) {
        // Check if friend already exists
        if (this.friends.some(friend => friend.name === name)) {
            this.showNotification('Friend already added!', 'error');
            return;
        }
        
        // Add new friend
        const newFriend = {
            id: Date.now(),
            name: name,
            online: Math.random() > 0.5, // Random online status
            lastSeen: 'Just added'
        };
        
        this.friends.unshift(newFriend);
        this.renderFriends();
        this.showNotification(`${name} added as friend!`, 'success');
    }
    
    removeFriend(friendId) {
        const friend = this.friends.find(f => f.id === friendId);
        if (!friend) return;
        
        this.friends = this.friends.filter(f => f.id !== friendId);
        this.renderFriends();
        this.showNotification(`${friend.name} removed`, 'info');
    }
    
    inviteFriend(friendId) {
        const friend = this.friends.find(f => f.id === friendId);
        if (!friend) return;
        
        this.showNotification(`Game invite sent to ${friend.name}!`, 'success');
        
        // Simulate invite response after a delay
        setTimeout(() => {
            if (Math.random() > 0.3) {
                this.showNotification(`${friend.name} joined the game!`, 'success');
            } else {
                this.showNotification(`${friend.name} is busy`, 'info');
            }
        }, 2000 + Math.random() * 3000);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `social-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 320px;
            background: ${type === 'error' ? '#c62828' : type === 'success' ? '#2e7d32' : '#1976d2'};
            color: white;
            padding: 8px 12px;
            font-family: 'Press Start 2P', monospace;
            font-size: 8px;
            border: 2px solid #333;
            box-shadow: 2px 2px 0px #000;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    startStatusUpdates() {
        // Simulate friends coming online/offline
        setInterval(() => {
            if (Math.random() > 0.8) {
                const randomFriend = this.friends[Math.floor(Math.random() * this.friends.length)];
                randomFriend.online = !randomFriend.online;
                randomFriend.lastSeen = randomFriend.online ? 'Now' : '1 min ago';
                this.renderFriends();
            }
        }, 10000); // Update every 10 seconds
        
        // Update user status occasionally
        setInterval(() => {
            if (Math.random() > 0.95) {
                this.userOnline = !this.userOnline;
                this.updateUserStatus();
            }
        }, 30000); // Check every 30 seconds
    }
    
    updateUserStatus() {
        const statusIndicator = document.getElementById('userStatus');
        const statusText = document.getElementById('userStatusText');
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${this.userOnline ? 'online' : 'offline'}`;
        }
        
        if (statusText) {
            statusText.textContent = this.userOnline ? 'ONLINE' : 'OFFLINE';
        }
    }
}

// Initialize social panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.socialPanel = new SocialPanel();
});

// Export helper functions as named exports
export function addFriend() {
    if (window.socialPanel) {
        window.socialPanel.addFriend();
    }
}

export function toggleAddFriendMode() {
    if (window.socialPanel) {
        window.socialPanel.toggleAddFriendMode();
    }
}

export function cancelAddFriend() {
    if (window.socialPanel) {
        window.socialPanel.cancelAddFriend();
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 