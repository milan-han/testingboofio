/* ================================
 *  Chat Utilities
 * ================================*/

/**
 * Chat utilities for managing chat messages and styling
 */
class ChatUtils {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        if (!this.chatMessages) {
            console.warn('Chat messages element not found');
        }
    }
    
    /**
     * Add a chat message to the chat panel
     * @param {string} type - Message type ('self', 'friend', 'system', etc.)
     * @param {string} message - Message content
     */
    addMessage(type, message) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        // Split at first ':' to separate name from message
        const idx = message.indexOf(':');
        let nameText = message;
        let msgText = '';
        
        if (idx !== -1) {
            nameText = message.slice(0, idx + 1);
            msgText = message.slice(idx + 1);
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = nameText;
        nameSpan.style.fontWeight = 'bold';
        
        const contentSpan = document.createElement('span');
        contentSpan.textContent = msgText;
        contentSpan.style.fontWeight = 'normal';
        
        // Apply dynamic player colors for name and message display
        this.applyMessageStyling(type, nameSpan, contentSpan, messageDiv);
        
        messageDiv.appendChild(nameSpan);
        messageDiv.appendChild(contentSpan);
        this.chatMessages.appendChild(messageDiv);
        
        // Auto-scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Apply styling to chat message based on type
     * @param {string} type - Message type
     * @param {HTMLElement} nameSpan - Name span element
     * @param {HTMLElement} contentSpan - Content span element
     * @param {HTMLElement} messageDiv - Message container div
     */
    applyMessageStyling(type, nameSpan, contentSpan, messageDiv) {
        if (type === 'self') {
            // Player 1 (self) colors
            const p1Color = this.getCSSProperty('--player1-color') || '#c62828';
            const p1Accent = this.getCSSProperty('--player1-accent') || '#ff5252';
            
            nameSpan.style.color = p1Color;
            contentSpan.style.color = p1Accent;
            messageDiv.style.backgroundColor = this.hexToRgba(p1Color, 0.1);
            
        } else if (type === 'friend') {
            // Player 2 (friend) colors
            const p2Color = this.getCSSProperty('--player2-color') || '#2962ff';
            const p2Accent = this.getCSSProperty('--player2-accent') || '#448aff';
            
            nameSpan.style.color = p2Color;
            contentSpan.style.color = p2Accent;
            messageDiv.style.backgroundColor = this.hexToRgba(p2Color, 0.1);
            
        } else if (type === 'system') {
            // System message styling
            nameSpan.style.color = '#888';
            contentSpan.style.color = '#aaa';
            messageDiv.style.backgroundColor = 'rgba(136, 136, 136, 0.1)';
        }
    }
    
    /**
     * Get CSS custom property value
     * @param {string} property - CSS property name
     * @returns {string} Property value
     */
    getCSSProperty(property) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(property)
            .trim();
    }
    
    /**
     * Convert hex color to rgba (uses utility if available)
     * @param {string} hex - Hex color string
     * @param {number} alpha - Alpha value
     * @returns {string} RGBA color string
     */
    hexToRgba(hex, alpha = 0.3) {
        // Use UtilHelpers if available, otherwise implement locally
        if (window.UtilHelpers && window.UtilHelpers.hexToRgba) {
            return window.UtilHelpers.hexToRgba(hex, alpha);
        }
        
        // Fallback implementation
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
    
    /**
     * Clear all chat messages
     */
    clearMessages() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
    }
    
    /**
     * Get message count
     * @returns {number} Number of messages
     */
    getMessageCount() {
        return this.chatMessages ? this.chatMessages.children.length : 0;
    }
    
    /**
     * Add system message (convenience method)
     * @param {string} message - System message content
     */
    addSystemMessage(message) {
        this.addMessage('system', `System: ${message}`);
    }
    
    /**
     * Add player message (convenience method)
     * @param {string} playerName - Player name
     * @param {string} message - Message content
     * @param {boolean} isSelf - Whether this is the current player
     */
    addPlayerMessage(playerName, message, isSelf = false) {
        const type = isSelf ? 'self' : 'friend';
        this.addMessage(type, `${playerName}: ${message}`);
    }
}

// Create global instance
const chatUtils = new ChatUtils();

// Export for global access (IIFE pattern for compatibility)
window.ChatUtils = chatUtils;

// Provide backward compatibility for existing code
window.addChatMessage = (type, message) => chatUtils.addMessage(type, message); 