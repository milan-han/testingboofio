import { fireEvent } from '@testing-library/dom';

// Helper to (re)load the module after DOM is prepared
async function loadModule() {
  // Clear module cache so each test gets a fresh copy
  const modulePath = '../js/ui-add-player.js';
  delete (await import.meta).require?.cache?.[modulePath]; // Node CJS safeguard
  // Dynamic import ensures code runs after DOM is ready in test
  await import(modulePath);
}

// Mock RoomState for tests that trigger options
const mockRoomState = {
  players: [],
  addPlayer: vi.fn(),
  mode: 'lobby',
  subscribe: vi.fn()
};

describe('ui-add-player popup behaviour', () => {
  beforeEach(async () => {
    // Setup mock RoomState
    global.RoomState = mockRoomState;
    mockRoomState.players = [];
    mockRoomState.addPlayer.mockClear();
    
    // Prepare minimal DOM structure expected by the widget
    document.body.innerHTML = `
      <button id="invite-player-btn">Invite</button>
      <div id="invite-popup" class="hidden">
        <button class="popup-option">LOCAL PLAYER</button>
      </div>
      <div id="player-stats-panel" class="hidden"></div>
      <div id="drivers-panel"></div>`;

    // Dispatch DOMContentLoaded so script initialisers run
    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.RoomState;
  });

  it('changes button label to "ADD PLAYER" on init', () => {
    expect(document.getElementById('invite-player-btn').textContent).toBe('ADD PLAYER');
  });

  it('toggles popup visibility when button clicked', () => {
    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');

    // Initially hidden
    expect(popup.classList.contains('hidden')).toBe(true);

    fireEvent.click(addBtn);
    expect(popup.classList.contains('hidden')).toBe(false);

    fireEvent.click(addBtn);
    expect(popup.classList.contains('hidden')).toBe(true);
  });

  it('hides close button in popover mode', async () => {
    const popup = document.getElementById('invite-popup');
    
    // Add close button to DOM before loading module
    const closeBtn = document.createElement('div');
    closeBtn.id = 'popup-close-btn';
    closeBtn.className = 'popup-close';
    closeBtn.textContent = '+';
    popup.appendChild(closeBtn);

    // Reload module after adding close button
    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Module should hide the close button in popover mode
    expect(closeBtn.style.display).toBe('none');
  });

  it('handles popup option clicks', async () => {
    // Set up DOM with proper options before loading module
    document.body.innerHTML = `
      <button id="invite-player-btn">Invite</button>
      <div id="invite-popup" class="hidden">
        <button class="popup-option">NPC</button>
        <button class="popup-option">LOCAL PLAYER</button>
        <button class="popup-option">ONLINE PLAYER</button>
        <div id="popup-close-btn" class="popup-close">+</div>
      </div>
      <div id="player-stats-panel" class="hidden"></div>
      <div id="drivers-panel"></div>`;

    // Reload module after setting up proper DOM
    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');
    const npcOption = Array.from(popup.querySelectorAll('.popup-option')).find(opt => opt.textContent.trim() === 'NPC');
    const localOption = Array.from(popup.querySelectorAll('.popup-option')).find(opt => opt.textContent.trim() === 'LOCAL PLAYER');

    // Open popup
    fireEvent.click(addBtn);
    expect(popup.classList.contains('hidden')).toBe(false);

    // Click NPC option
    fireEvent.click(npcOption);
    expect(popup.classList.contains('hidden')).toBe(true);

    // Reopen and try local option
    fireEvent.click(addBtn);
    fireEvent.click(localOption);
    expect(popup.classList.contains('hidden')).toBe(true);
  });

  it('closes popup when clicking outside', () => {
    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');

    // Open popup
    fireEvent.click(addBtn);
    expect(popup.classList.contains('hidden')).toBe(false);

    // Click outside popup (on document body)
    fireEvent.click(document.body);
    expect(popup.classList.contains('hidden')).toBe(true);
  });

  it('does not close popup when clicking inside popup content', () => {
    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');
    
    // Add popup content div
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popup.appendChild(popupContent);

    // Open popup
    fireEvent.click(addBtn);
    expect(popup.classList.contains('hidden')).toBe(false);

    // Click inside popup content
    fireEvent.click(popupContent);
    expect(popup.classList.contains('hidden')).toBe(false);
  });

  it('handles missing popup element gracefully', async () => {
    // Remove popup from DOM
    document.getElementById('invite-popup').remove();

    // Reload module
    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const addBtn = document.getElementById('invite-player-btn');
    
    // Should not throw when clicking button
    expect(() => {
      fireEvent.click(addBtn);
    }).not.toThrow();
  });

  it('positions popup relative to button', () => {
    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');

    // Mock getBoundingClientRect for testing
    addBtn.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      bottom: 50
    }));

    // Open popup
    fireEvent.click(addBtn);
    
    // Should position popup below button
    expect(popup.style.left).toBe('100px');
    expect(popup.style.top).toBe('56px'); // bottom + 6px
  });

  it('adds popover class for styling', () => {
    const popup = document.getElementById('invite-popup');
    
    // Module should add popover class for CSS styling
    expect(popup.classList.contains('popover')).toBe(true);
  });
}); 