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
  
  addPlayer(player) {
    const id = `player-${Date.now()}`;
    const newPlayer = {
      id,
      type: 'local',
      name: 'PLAYER',
      color: '#c62828',
      ready: false,
      ...player
    };
    this._state.players.push(newPlayer);
    this._notify('player_added');
    return newPlayer;
  },
  
  // Test helpers
  setPlayers(players) {
    this._state.players = players;
    this._notify('test_update');
  },
  
  get players() {
    return this._state.players;
  }
};

// Helper to load the module after DOM is prepared
async function loadModule() {
  global.RoomState = mockRoomState;
  global.Node = window.Node; // Needed for nodeType checks
  
  const modulePath = '../js/ui-player-cards.js';
  delete (await import.meta).require?.cache?.[modulePath];
  
  await import(modulePath);
}

describe('ui-player-cards display and behavior', () => {
  beforeEach(async () => {
    // Reset mock state
    mockRoomState._state.players = [];
    mockRoomState._subscribers = [];
    
    // Create minimal DOM structure
    document.body.innerHTML = `
      <div id="playerCard" class="player-card hidden">
        <div class="player-card-header">PLAYER 1 </div>
        <div class="player-card-content">
          <div class="player-stats">Stats content</div>
        </div>
      </div>
      <div id="player2Card" class="player-card hidden">
        <div class="player-card-header">PLAYER 2 </div>
        <div class="player-card-content">
          <div class="player-stats">Stats content</div>
        </div>
      </div>`;

    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.RoomState;
    // Don't delete global.Node - it breaks subsequent tests
  });

  it('automatically adds a local player if none exist', () => {
    expect(mockRoomState.players.length).toBe(1);
    expect(mockRoomState.players[0].type).toBe('local');
    expect(mockRoomState.players[0].name).toBe('PLAYER 1');
  });

  it('shows first card when one local player exists', () => {
    const card1 = document.getElementById('playerCard');
    const card2 = document.getElementById('player2Card');
    
    expect(card1.classList.contains('hidden')).toBe(false);
    expect(card2.classList.contains('hidden')).toBe(true);
    expect(document.body.classList.contains('local-mode')).toBe(false);
  });

  it('shows both cards in local-mode when two local players exist', () => {
    mockRoomState.addPlayer({ type: 'local', name: 'PLAYER 2' });
    
    const card1 = document.getElementById('playerCard');
    const card2 = document.getElementById('player2Card');
    
    expect(card1.classList.contains('hidden')).toBe(false);
    expect(card2.classList.contains('hidden')).toBe(false);
    expect(document.body.classList.contains('local-mode')).toBe(true);
  });

  it('stacks cards when two locals and online players exist', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', ready: false },
      { id: '2', type: 'local', name: 'PLAYER 2', ready: false },
      { id: '3', type: 'online', name: 'ONLINE_PLAYER', ready: false }
    ]);
    
    const card1 = document.getElementById('playerCard');
    const card2 = document.getElementById('player2Card');
    
    expect(card1.classList.contains('stacked')).toBe(true);
    expect(card2.classList.contains('stacked')).toBe(true);
    expect(document.body.classList.contains('local-mode')).toBe(false);
    
    // Check stacking positioning
    expect(card1.style.height).toBe('210px'); // compressed height
    expect(card2.style.height).toBe('210px');
    expect(card1.style.bottom).toBe('250px'); // stacked above
    expect(card2.style.bottom).toBe('20px'); // bottom position
  });

  it('updates card header with player name', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'CUSTOM_NAME', ready: false }
    ]);
    
    const header = document.querySelector('#playerCard .player-card-header');
    expect(header.textContent.trim()).toContain('CUSTOM_NAME');
  });

  it('applies ready class when player is ready', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', ready: true }
    ]);
    
    const card1 = document.getElementById('playerCard');
    expect(card1.classList.contains('ready')).toBe(true);
  });

  it('removes ready class when player is not ready', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', ready: false }
    ]);
    
    const card1 = document.getElementById('playerCard');
    expect(card1.classList.contains('ready')).toBe(false);
  });

  it('hides both cards when no local players exist', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'online', name: 'ONLINE_PLAYER', ready: false }
    ]);
    
    const card1 = document.getElementById('playerCard');
    const card2 = document.getElementById('player2Card');
    
    expect(card1.classList.contains('hidden')).toBe(true);
    expect(card2.classList.contains('hidden')).toBe(true);
    expect(document.body.classList.contains('local-mode')).toBe(false);
  });

  it('handles transition from single to dual local players', () => {
    // Start with one local player
    const card1 = document.getElementById('playerCard');
    const card2 = document.getElementById('player2Card');
    
    expect(card1.classList.contains('hidden')).toBe(false);
    expect(card2.classList.contains('hidden')).toBe(true);
    expect(document.body.classList.contains('local-mode')).toBe(false);
    
    // Add second local player
    mockRoomState.addPlayer({ type: 'local', name: 'PLAYER 2' });
    
    expect(card1.classList.contains('hidden')).toBe(false);
    expect(card2.classList.contains('hidden')).toBe(false);
    expect(document.body.classList.contains('local-mode')).toBe(true);
  });

  it('handles transition from dual locals to stacked mode', () => {
    // Start with two local players
    mockRoomState.addPlayer({ type: 'local', name: 'PLAYER 2' });
    
    const card1 = document.getElementById('playerCard');
    const card2 = document.getElementById('player2Card');
    
    expect(document.body.classList.contains('local-mode')).toBe(true);
    expect(card1.classList.contains('stacked')).toBe(false);
    
    // Add online player to trigger stacking
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', ready: false },
      { id: '2', type: 'local', name: 'PLAYER 2', ready: false },
      { id: '3', type: 'online', name: 'ONLINE_PLAYER', ready: false }
    ]);
    
    expect(document.body.classList.contains('local-mode')).toBe(false);
    expect(card1.classList.contains('stacked')).toBe(true);
    expect(card2.classList.contains('stacked')).toBe(true);
  });

  it('resets card styles properly', () => {
    // Set up stacked mode first
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', ready: false },
      { id: '2', type: 'local', name: 'PLAYER 2', ready: false },
      { id: '3', type: 'online', name: 'ONLINE_PLAYER', ready: false }
    ]);
    
    const card1 = document.getElementById('playerCard');
    expect(card1.style.height).toBe('210px');
    expect(card1.classList.contains('stacked')).toBe(true);
    
    // Go back to single local player
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', ready: false }
    ]);
    
    expect(card1.style.height).toBe('');
    expect(card1.style.bottom).toBe('20px');
    expect(card1.classList.contains('stacked')).toBe(false);
  });

  it('ignores NPC players for local mode determination', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', ready: false },
      { id: '2', type: 'npc', name: 'BOT', ready: false }
    ]);
    
    const card1 = document.getElementById('playerCard');
    const card2 = document.getElementById('player2Card');
    
    // Should behave as single local player (NPCs don't count)
    expect(card1.classList.contains('hidden')).toBe(false);
    expect(card2.classList.contains('hidden')).toBe(true);
    expect(document.body.classList.contains('local-mode')).toBe(false);
  });

  it('handles missing card elements gracefully', async () => {
    // Remove cards from DOM
    document.body.innerHTML = '';
    
    // Should not throw when module tries to update cards
    expect(() => {
      mockRoomState.setPlayers([
        { id: '1', type: 'local', name: 'PLAYER 1', ready: false }
      ]);
    }).not.toThrow();
  });

  it('injects ready card CSS styles', () => {
    const styleEl = document.getElementById('readyPlayerCardStyle');
    expect(styleEl).toBeTruthy();
    expect(styleEl.tagName).toBe('STYLE');
    expect(styleEl.textContent).toContain('.player-card.ready');
    expect(styleEl.textContent).toContain('READY');
  });

  it('handles header text node updates correctly', () => {
    // Test the text node update logic when header has mixed content
    const header = document.querySelector('#playerCard .player-card-header');
    header.innerHTML = 'PLAYER 1 <input type="text">';
    
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'NEW_NAME', ready: false }
    ]);
    
    // Should update the text while preserving the input element
    expect(header.innerHTML).toContain('NEW_NAME');
    expect(header.querySelector('input')).toBeTruthy();
  });
}); 