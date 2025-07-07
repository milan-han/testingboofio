import { fireEvent } from '@testing-library/dom';
import { vi } from 'vitest';
import { SocialPanel } from '../js/social-panel.js';

// Mock global socialPanel instance that would be created by the module
let mockSocialPanel;

// Helper to load the module and create SocialPanel instance
async function loadModule() {
  // Create instance
  mockSocialPanel = new SocialPanel();
  window.socialPanel = mockSocialPanel;
  
  return mockSocialPanel;
}

describe('social-panel friends management', () => {
  beforeEach(async () => {
    // Create comprehensive DOM structure
    document.body.innerHTML = `
      <div class="social-panel" id="socialPanel">
        <div class="social-header">
          <div class="social-title-container">
            <div class="social-title">FRIENDS</div>
            <button class="add-friend-icon-btn" id="addFriendToggleBtn">
              <img src="assets/add_friend_icon.png" alt="Add Friend" />
            </button>
          </div>
          <div class="social-status">
            <div class="status-indicator online" id="userStatus"></div>
            <span class="status-text" id="userStatusText">ONLINE</span>
          </div>
        </div>
        
        <div class="add-friend-dropdown" id="addFriendDropdown">
          <div class="add-friend-input-container">
            <input type="text" class="add-friend-input" id="addFriendInput" placeholder="USERNAME..." maxlength="12">
            <button class="add-friend-btn" id="addFriendBtn">ADD</button>
            <button class="cancel-add-btn" id="cancelAddBtn">✕</button>
          </div>
          <div class="friend-suggestions" id="friendSuggestions"></div>
        </div>
        
        <div class="friends-container">
          <div class="friends-list" id="friendsList"></div>
        </div>
      </div>`;

    await loadModule();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete window.socialPanel;
    mockSocialPanel = null;
  });

  it('initializes with default friends list', () => {
    const friendsList = document.getElementById('friendsList');
    const friendItems = friendsList.querySelectorAll('.friend-item');
    
    expect(friendItems.length).toBe(8);
    expect(friendsList.innerHTML).toContain('RETRO_RACER');
    expect(friendsList.innerHTML).toContain('PIXEL_PILOT');
  });

  it('shows online/offline status indicators correctly', () => {
    const friendsList = document.getElementById('friendsList');
    const onlineIndicators = friendsList.querySelectorAll('.status-indicator.online');
    const offlineIndicators = friendsList.querySelectorAll('.status-indicator.offline');
    
    expect(onlineIndicators.length).toBeGreaterThan(0);
    expect(offlineIndicators.length).toBeGreaterThan(0);
  });

  it('shows invite button only for online friends', () => {
    const friendsList = document.getElementById('friendsList');
    const inviteButtons = friendsList.querySelectorAll('.invite-btn');
    const onlineIndicators = friendsList.querySelectorAll('.status-indicator.online');
    
    expect(inviteButtons.length).toBe(onlineIndicators.length);
  });

  it('toggles add friend dropdown on button click', () => {
    const toggleBtn = document.getElementById('addFriendToggleBtn');
    const dropdown = document.getElementById('addFriendDropdown');
    const socialPanel = document.getElementById('socialPanel');
    
    expect(mockSocialPanel.dropdownOpen).toBe(false);
    expect(dropdown.classList.contains('show')).toBe(false);
    
    mockSocialPanel.toggleAddFriendMode();
    
    expect(mockSocialPanel.dropdownOpen).toBe(true);
    expect(toggleBtn.classList.contains('active')).toBe(true);
    expect(dropdown.classList.contains('show')).toBe(true);
    expect(socialPanel.classList.contains('expanded')).toBe(true);
  });

  it('closes dropdown when toggleAddFriendMode is called again', () => {
    const toggleBtn = document.getElementById('addFriendToggleBtn');
    const dropdown = document.getElementById('addFriendDropdown');
    
    // Open dropdown
    mockSocialPanel.toggleAddFriendMode();
    expect(mockSocialPanel.dropdownOpen).toBe(true);
    
    // Close dropdown
    mockSocialPanel.toggleAddFriendMode();
    expect(mockSocialPanel.dropdownOpen).toBe(false);
    expect(toggleBtn.classList.contains('active')).toBe(false);
    expect(dropdown.classList.contains('show')).toBe(false);
  });

  it('cancels add friend mode properly', () => {
    const toggleBtn = document.getElementById('addFriendToggleBtn');
    const dropdown = document.getElementById('addFriendDropdown');
    const addFriendInput = document.getElementById('addFriendInput');
    const socialPanel = document.getElementById('socialPanel');
    
    // Open dropdown and add some input
    mockSocialPanel.toggleAddFriendMode();
    addFriendInput.value = 'test_user';
    
    mockSocialPanel.cancelAddFriend();
    
    expect(mockSocialPanel.dropdownOpen).toBe(false);
    expect(toggleBtn.classList.contains('active')).toBe(false);
    expect(dropdown.classList.contains('show')).toBe(false);
    expect(socialPanel.classList.contains('expanded')).toBe(false);
    expect(addFriendInput.value).toBe('');
  });

  it('shows suggestions when typing in add friend input', () => {
    const addFriendInput = document.getElementById('addFriendInput');
    const suggestionsContainer = document.getElementById('friendSuggestions');
    
    mockSocialPanel.showSuggestions('BOOST');
    
    expect(suggestionsContainer.innerHTML).toContain('BOOST_BUDDY');
    expect(suggestionsContainer.children.length).toBeGreaterThan(0);
  });

  it('hides suggestions for short queries', () => {
    const suggestionsContainer = document.getElementById('friendSuggestions');
    
    mockSocialPanel.showSuggestions('B');
    
    expect(suggestionsContainer.innerHTML).toBe('');
  });

  it('filters out existing friends from suggestions', () => {
    const suggestionsContainer = document.getElementById('friendSuggestions');
    
    mockSocialPanel.showSuggestions('RETRO');
    
    // Should not show RETRO_RACER since it's already a friend
    expect(suggestionsContainer.innerHTML).not.toContain('RETRO_RACER');
  });

  it('adds friend by name successfully', () => {
    const initialFriendCount = mockSocialPanel.friends.length;
    
    mockSocialPanel.addFriendByName('NEW_FRIEND');
    
    expect(mockSocialPanel.friends.length).toBe(initialFriendCount + 1);
    const newFriend = mockSocialPanel.friends.find(f => f.name === 'NEW_FRIEND');
    expect(newFriend).toBeTruthy();
    expect(newFriend.name).toBe('NEW_FRIEND');
    expect(typeof newFriend.online).toBe('boolean'); // Random online status
  });

  it('prevents adding duplicate friends', () => {
    const initialFriendCount = mockSocialPanel.friends.length;
    
    mockSocialPanel.addFriendByName('RETRO_RACER');
    
    expect(mockSocialPanel.friends.length).toBe(initialFriendCount);
  });

  it('removes friend successfully', () => {
    const initialFriendCount = mockSocialPanel.friends.length;
    const friendToRemove = mockSocialPanel.friends[0];
    
    mockSocialPanel.removeFriend(friendToRemove.id);
    
    expect(mockSocialPanel.friends.length).toBe(initialFriendCount - 1);
    expect(mockSocialPanel.friends.find(f => f.id === friendToRemove.id)).toBeFalsy();
  });

  it('invites friend and shows notification', () => {
    const onlineFriend = mockSocialPanel.friends.find(f => f.online);
    
    const showNotificationSpy = vi.spyOn(mockSocialPanel, 'showNotification');
    
    mockSocialPanel.inviteFriend(onlineFriend.id);
    
    expect(showNotificationSpy).toHaveBeenCalledWith(
      `Game invite sent to ${onlineFriend.name}!`,
      'success'
    );
  });

  it('handles add friend input events', () => {
    const addFriendInput = document.getElementById('addFriendInput');
    
    const showSuggestionsSpy = vi.spyOn(mockSocialPanel, 'showSuggestions');
    
    // Simulate typing
    addFriendInput.value = 'test';
    fireEvent.input(addFriendInput);
    
    expect(showSuggestionsSpy).toHaveBeenCalledWith('test');
  });

  it('handles Enter key to add friend', () => {
    const addFriendInput = document.getElementById('addFriendInput');
    const addFriendSpy = vi.spyOn(mockSocialPanel, 'addFriend');
    
    addFriendInput.value = 'TEST_FRIEND';
    
    const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
    fireEvent(addFriendInput, enterEvent);
    
    expect(addFriendSpy).toHaveBeenCalled();
  });

  it('handles Escape key to cancel add friend', () => {
    const addFriendInput = document.getElementById('addFriendInput');
    const cancelSpy = vi.spyOn(mockSocialPanel, 'cancelAddFriend');
    
    const escapeEvent = new KeyboardEvent('keypress', { key: 'Escape' });
    fireEvent(addFriendInput, escapeEvent);
    
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('adjusts layout when dropdown is expanded', () => {
    // Add some elements that should be affected by layout adjustment
    document.body.innerHTML += `
      <canvas id="game" style="transform: translate(-50%, -65%)"></canvas>
      <div class="player-card"></div>
      <div id="gameMenuContainer"></div>
      <div class="scoreboard"></div>`;
    
    const canvas = document.getElementById('game');
    const playerCard = document.querySelector('.player-card');
    
    mockSocialPanel.adjustLayout(true);
    
    expect(canvas.style.transform).toContain('translate(-50%, -80%)');
    expect(playerCard.style.transform).toBe('translateY(-40px)');
  });

  it('resets layout when dropdown is collapsed', () => {
    document.body.innerHTML += `
      <canvas id="game" style="transform: translate(-50%, -80%)"></canvas>
      <div class="player-card" style="transform: translateY(-40px)"></div>`;
    
    const canvas = document.getElementById('game');
    const playerCard = document.querySelector('.player-card');
    
    mockSocialPanel.adjustLayout(false);
    
    expect(canvas.style.transform).toContain('translate(-50%, -65%)');
    expect(playerCard.style.transform).toBe('translateY(0)');
  });

  it('shows notification with correct styling', () => {
    mockSocialPanel.showNotification('Test message', 'success');
    
    const notification = document.querySelector('.social-notification');
    expect(notification).toBeTruthy();
    expect(notification.textContent).toBe('Test message');
    expect(notification.classList.contains('success')).toBe(true);
  });

  it('auto-hides notification after timeout', (done) => {
    mockSocialPanel.showNotification('Test message', 'info');
    
    const notification = document.querySelector('.social-notification');
    expect(notification).toBeTruthy();
    expect(notification.textContent).toBe('Test message');
    
    // Wait for auto-hide (should be around 3 seconds)
    setTimeout(() => {
      // Notification should be removed from DOM
      const removedNotification = document.querySelector('.social-notification');
      expect(removedNotification).toBeFalsy();
      done();
    }, 3500);
  });

  it('updates user status periodically', () => {
    const userStatusText = document.getElementById('userStatusText');
    const userStatus = document.getElementById('userStatus');
    
    // Mock the status update
    mockSocialPanel.userOnline = false;
    mockSocialPanel.updateUserStatus();
    
    expect(userStatusText.textContent).toBe('OFFLINE');
    expect(userStatus.classList.contains('offline')).toBe(true);
    expect(userStatus.classList.contains('online')).toBe(false);
  });

  it('handles clicking on suggestion to add friend', () => {
    const suggestionsContainer = document.getElementById('friendSuggestions');
    const addFriendSpy = vi.spyOn(mockSocialPanel, 'addFriendByName');
    
    // Show suggestions first
    mockSocialPanel.showSuggestions('BOOST');
    
    // Click on a suggestion
    const suggestion = suggestionsContainer.querySelector('.friend-suggestion');
    if (suggestion) {
      fireEvent.click(suggestion);
      expect(addFriendSpy).toHaveBeenCalled();
    }
  });

  it('closes dropdown when clicking outside', () => {
    const cancelSpy = vi.spyOn(mockSocialPanel, 'cancelAddFriend');
    
    // Open dropdown
    mockSocialPanel.toggleAddFriendMode();
    
    // Click outside the social panel
    fireEvent.click(document.body);
    
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('does not close dropdown when clicking inside social panel', () => {
    const socialPanel = document.getElementById('socialPanel');
    const cancelSpy = vi.spyOn(mockSocialPanel, 'cancelAddFriend');
    
    // Open dropdown
    mockSocialPanel.toggleAddFriendMode();
    
    // Click inside the social panel
    fireEvent.click(socialPanel);
    
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('handles missing DOM elements gracefully', () => {
    // Remove critical elements
    document.getElementById('friendsList').remove();
    
    // Should not throw when trying to render
    expect(() => {
      mockSocialPanel.renderFriends();
    }).not.toThrow();
  });
}); 