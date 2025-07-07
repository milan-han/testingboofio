import { fireEvent } from '@testing-library/dom';

// Mock RoomState for testing
const mockRoomState = {
  _state: {
    players: []
  },
  _subscribers: [],
  
  getState() {
    return { ...this._state };
  },
  
  subscribe(fn) {
    this._subscribers.push(fn);
    return () => {
      const idx = this._subscribers.indexOf(fn);
      if (idx !== -1) this._subscribers.splice(idx, 1);
    };
  },
  
  _notify(event) {
    this._subscribers.forEach(fn => fn(event, this.getState()));
  },
  
  // Test helpers
  setPlayers(players) {
    this._state.players = players;
    this._notify('test_update');
  }
};

// Helper to load the module after DOM is prepared
async function loadModule() {
  // Set up global RoomState before loading module
  global.RoomState = mockRoomState;
  
  // Clear module cache
  const modulePath = '../js/ui-chat-toggle.js';
  delete (await import.meta).require?.cache?.[modulePath];
  
  // Load the module
  await import(modulePath);
}

describe('ui-chat-toggle visibility logic', () => {
  beforeEach(async () => {
    // Reset mock state
    mockRoomState._state.players = [];
    mockRoomState._subscribers = [];
    
    // Create minimal DOM structure
    document.body.innerHTML = `
      <div id="chatPanel" class="chat-panel">
        <div class="chat-header">LOBBY CHAT</div>
        <div class="chat-messages">
          <div class="chat-message system">Welcome to Car Ball!</div>
        </div>
      </div>`;

    // Load the module which will set up event listeners
    await loadModule();
    
    // Trigger DOMContentLoaded to initialize the module
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.RoomState;
  });

  it('shows chat when no players exist', () => {
    const chatPanel = document.getElementById('chatPanel');
    expect(chatPanel.classList.contains('hidden')).toBe(false);
  });

  it('shows chat with one local player', () => {
    const chatPanel = document.getElementById('chatPanel');
    
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1' }
    ]);
    
    expect(chatPanel.classList.contains('hidden')).toBe(false);
  });

  it('shows chat with one online player', () => {
    const chatPanel = document.getElementById('chatPanel');
    
    mockRoomState.setPlayers([
      { id: '1', type: 'online', name: 'ONLINE_PLAYER' }
    ]);
    
    expect(chatPanel.classList.contains('hidden')).toBe(false);
  });

  it('shows chat with mix of local and online players', () => {
    const chatPanel = document.getElementById('chatPanel');
    
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1' },
      { id: '2', type: 'online', name: 'ONLINE_PLAYER' }
    ]);
    
    expect(chatPanel.classList.contains('hidden')).toBe(false);
  });

  it('hides chat when two or more local players and no online players', () => {
    const chatPanel = document.getElementById('chatPanel');
    
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1' },
      { id: '2', type: 'local', name: 'PLAYER 2' }
    ]);
    
    expect(chatPanel.classList.contains('hidden')).toBe(true);
  });

  it('hides chat with three local players and no online players', () => {
    const chatPanel = document.getElementById('chatPanel');
    
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1' },
      { id: '2', type: 'local', name: 'PLAYER 2' },
      { id: '3', type: 'local', name: 'PLAYER 3' }
    ]);
    
    expect(chatPanel.classList.contains('hidden')).toBe(true);
  });

  it('shows chat again when online player joins two local players', () => {
    const chatPanel = document.getElementById('chatPanel');
    
    // Start with two locals (chat hidden)
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1' },
      { id: '2', type: 'local', name: 'PLAYER 2' }
    ]);
    
    expect(chatPanel.classList.contains('hidden')).toBe(true);
    
    // Add online player (chat should show)
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1' },
      { id: '2', type: 'local', name: 'PLAYER 2' },
      { id: '3', type: 'online', name: 'ONLINE_PLAYER' }
    ]);
    
    expect(chatPanel.classList.contains('hidden')).toBe(false);
  });

  it('ignores NPC players when determining chat visibility', () => {
    const chatPanel = document.getElementById('chatPanel');
    
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1' },
      { id: '2', type: 'local', name: 'PLAYER 2' },
      { id: '3', type: 'npc', name: 'BOT' }
    ]);
    
    // Should still hide because NPCs don't count as "online" players
    expect(chatPanel.classList.contains('hidden')).toBe(true);
  });

  it('handles missing chat panel gracefully', async () => {
    // Remove chat panel from DOM
    document.body.innerHTML = '';
    
    // Reload module - should not throw error
    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Should not throw when updating state
    expect(() => {
      mockRoomState.setPlayers([
        { id: '1', type: 'local', name: 'PLAYER 1' }
      ]);
    }).not.toThrow();
  });

  it('handles missing RoomState gracefully', async () => {
    delete global.RoomState;
    
    // Should not throw when DOMContentLoaded fires without RoomState
    expect(() => {
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }).not.toThrow();
  });
}); 