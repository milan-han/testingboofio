import { fireEvent } from '@testing-library/dom';

// Helper to (re)load the module after DOM is prepared
async function loadModule() {
  // Clear module cache so each test gets a fresh copy
  const modulePath = '../js/ui-add-player.js';
  delete (await import.meta).require?.cache?.[modulePath]; // Node CJS safeguard
  // Dynamic import ensures code runs after DOM is ready in test
  await import(modulePath);
}

describe('ui-add-player popup behaviour', () => {
  beforeEach(async () => {
    // Prepare minimal DOM structure expected by the widget
    document.body.innerHTML = `
      <button id="invite-player-btn">Invite</button>
      <div id="invite-popup" class="hidden">
        <button class="popup-option">LOCAL PLAYER</button>
      </div>`;

    // Dispatch DOMContentLoaded so script initialisers run
    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    document.body.innerHTML = '';
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

  it('closes popup when clicking close button', () => {
    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');
    
    // Add close button to DOM
    const closeBtn = document.createElement('div');
    closeBtn.id = 'popup-close-btn';
    closeBtn.className = 'popup-close';
    closeBtn.textContent = '+';
    popup.appendChild(closeBtn);

    // Open popup
    fireEvent.click(addBtn);
    expect(popup.classList.contains('hidden')).toBe(false);

    // Close popup via close button
    fireEvent.click(closeBtn);
    expect(popup.classList.contains('hidden')).toBe(true);
  });

  it('handles popup option clicks', () => {
    const popup = document.getElementById('invite-popup');
    
    // Add NPC and online player options
    popup.innerHTML = `
      <button class="popup-option" data-type="npc">NPC</button>
      <button class="popup-option" data-type="local">LOCAL PLAYER</button>
      <button class="popup-option" data-type="online">ONLINE PLAYER</button>
      <div id="popup-close-btn" class="popup-close">+</div>`;

    const addBtn = document.getElementById('invite-player-btn');
    const npcOption = popup.querySelector('[data-type="npc"]');
    const localOption = popup.querySelector('[data-type="local"]');

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

  it('handles keyboard navigation', () => {
    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');

    // Test Enter key on button
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    fireEvent(addBtn, enterEvent);
    expect(popup.classList.contains('hidden')).toBe(false);

    // Test Escape key to close popup
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    fireEvent(document, escapeEvent);
    expect(popup.classList.contains('hidden')).toBe(true);
  });

  it('maintains accessibility attributes', () => {
    const addBtn = document.getElementById('invite-player-btn');
    const popup = document.getElementById('invite-popup');

    // Button should have proper accessibility attributes
    expect(addBtn.getAttribute('aria-expanded')).toBe('false');
    expect(addBtn.getAttribute('aria-haspopup')).toBe('true');

    // Open popup
    fireEvent.click(addBtn);
    expect(addBtn.getAttribute('aria-expanded')).toBe('true');

    // Close popup
    fireEvent.click(addBtn);
    expect(addBtn.getAttribute('aria-expanded')).toBe('false');
  });
}); 