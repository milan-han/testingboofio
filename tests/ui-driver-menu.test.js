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
  
  updatePlayer(id, updates) {
    const player = this._state.players.find(p => p.id === id);
    if (player) {
      Object.assign(player, updates);
      this._notify('player_updated');
    }
  },
  
  removePlayer(id) {
    const index = this._state.players.findIndex(p => p.id === id);
    if (index !== -1) {
      this._state.players.splice(index, 1);
      this._notify('player_removed');
    }
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

// Mock window.prompt for NPC editor tests
const originalPrompt = global.prompt;

// Helper to load the module after DOM is prepared
async function loadModule() {
  global.RoomState = mockRoomState;
  
  const modulePath = '../js/ui-driver-menu.js';
  delete (await import.meta).require?.cache?.[modulePath];
  
  await import(modulePath);
}

describe('ui-driver-menu team management', () => {
  beforeEach(async () => {
    // Reset mock state
    mockRoomState._state.players = [];
    mockRoomState._subscribers = [];
    
    // Create minimal DOM structure
    document.body.innerHTML = `
      <div class="drivers-title">DRIVERS</div>
      <div class="team-selection-grid">
        <div class="team-section">
          <div class="team-header">TEAM 1</div>
          <div class="team-dropzone" id="team1-zone" data-team="1"></div>
        </div>
        <div class="team-section">
          <div class="team-header">TEAM 2</div>
          <div class="team-dropzone" id="team2-zone" data-team="2"></div>
        </div>
      </div>`;

    await loadModule();
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.RoomState;
    global.prompt = originalPrompt;
  });

  it('creates and adds leave button to drivers title', () => {
    const leaveBtn = document.getElementById('leaveRoomBtn');
    expect(leaveBtn).toBeTruthy();
    expect(leaveBtn.textContent).toBe('LEAVE');
    expect(leaveBtn.style.float).toBe('right');
  });

  it('renders player cards in correct team zones', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false },
      { id: '2', type: 'local', name: 'PLAYER 2', team: 2, ready: false }
    ]);
    
    const team1Zone = document.getElementById('team1-zone');
    const team2Zone = document.getElementById('team2-zone');
    
    expect(team1Zone.children.length).toBe(1);
    expect(team2Zone.children.length).toBe(1);
    expect(team1Zone.children[0].textContent).toBe('PLAYER 1');
    expect(team2Zone.children[0].textContent).toBe('PLAYER 2');
  });

  it('applies ready class to ready players', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: true },
      { id: '2', type: 'local', name: 'PLAYER 2', team: 1, ready: false }
    ]);
    
    const team1Zone = document.getElementById('team1-zone');
    const cards = team1Zone.querySelectorAll('.driver-card');
    
    expect(cards[0].classList.contains('ready')).toBe(true);
    expect(cards[1].classList.contains('ready')).toBe(false);
  });

  it('styles NPC cards with custom color', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'npc', name: 'BOT', team: 1, ready: false, color: '#ff5722' }
    ]);
    
    const team1Zone = document.getElementById('team1-zone');
    const npcCard = team1Zone.querySelector('.driver-card');
    
    expect(npcCard.style.color).toBe('#ff5722');
  });

  it('makes cards draggable', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false }
    ]);
    
    const card = document.querySelector('.driver-card');
    expect(card.draggable).toBe(true);
  });

  it('handles drag start events', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false }
    ]);
    
    const card = document.querySelector('.driver-card');
    const mockDataTransfer = {
      setData: jest.fn()
    };
    
    const dragEvent = new Event('dragstart');
    dragEvent.dataTransfer = mockDataTransfer;
    
    fireEvent(card, dragEvent);
    expect(mockDataTransfer.setData).toHaveBeenCalledWith('playerId', '1');
  });

  it('handles drop events to change team', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false }
    ]);
    
    const team2Zone = document.getElementById('team2-zone');
    const mockDataTransfer = {
      getData: jest.fn().mockReturnValue('1')
    };
    
    const dropEvent = new Event('drop');
    dropEvent.dataTransfer = mockDataTransfer;
    dropEvent.preventDefault = jest.fn();
    
    fireEvent(team2Zone, dropEvent);
    
    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(mockRoomState.updatePlayer).toHaveBeenCalledWith('1', { team: 2 });
  });

  it('handles dragover events on drop zones', () => {
    const team1Zone = document.getElementById('team1-zone');
    const dragoverEvent = new Event('dragover');
    dragoverEvent.preventDefault = jest.fn();
    
    fireEvent(team1Zone, dragoverEvent);
    expect(dragoverEvent.preventDefault).toHaveBeenCalled();
  });

  it('opens NPC editor when NPC card is clicked', () => {
    global.prompt = jest.fn()
      .mockReturnValueOnce('NEW_BOT_NAME')
      .mockReturnValueOnce('#00ff00');
    
    mockRoomState.setPlayers([
      { id: '1', type: 'npc', name: 'BOT', team: 1, ready: false, color: '#ff0000' }
    ]);
    
    const npcCard = document.querySelector('.driver-card');
    fireEvent.click(npcCard);
    
    expect(global.prompt).toHaveBeenCalledWith('NPC Name', 'BOT');
    expect(global.prompt).toHaveBeenCalledWith('NPC Color (hex)', '#ff0000');
    expect(mockRoomState.updatePlayer).toHaveBeenCalledWith('1', {
      name: 'NEW_BOT_NAME',
      color: '#00ff00'
    });
  });

  it('cancels NPC editing when prompt is cancelled', () => {
    global.prompt = jest.fn().mockReturnValue(null);
    
    mockRoomState.setPlayers([
      { id: '1', type: 'npc', name: 'BOT', team: 1, ready: false, color: '#ff0000' }
    ]);
    
    const npcCard = document.querySelector('.driver-card');
    fireEvent.click(npcCard);
    
    expect(global.prompt).toHaveBeenCalledWith('NPC Name', 'BOT');
    expect(mockRoomState.updatePlayer).not.toHaveBeenCalled();
  });

  it('shows tooltip on card hover', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'npc', name: 'BOT', team: 1, ready: false, color: '#ff0000' }
    ]);
    
    const npcCard = document.querySelector('.driver-card');
    fireEvent.mouseEnter(npcCard);
    
    const tooltip = document.getElementById('driverTooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.style.display).toBe('block');
    expect(tooltip.innerHTML).toContain('BOT');
    expect(tooltip.innerHTML).toContain('#ff0000');
  });

  it('hides tooltip on card mouse leave', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false }
    ]);
    
    const card = document.querySelector('.driver-card');
    fireEvent.mouseEnter(card);
    
    let tooltip = document.getElementById('driverTooltip');
    expect(tooltip.style.display).toBe('block');
    
    fireEvent.mouseLeave(card);
    expect(tooltip.style.display).toBe('none');
  });

  it('shows different tooltip content for human players', () => {
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false, username: 'TestUser' }
    ]);
    
    const card = document.querySelector('.driver-card');
    fireEvent.mouseEnter(card);
    
    const tooltip = document.getElementById('driverTooltip');
    expect(tooltip.innerHTML).toContain('TestUser');
    expect(tooltip.innerHTML).toContain('Wins: 0');
  });

  it('handles leave button click', () => {
    // Set up initial state with multiple players
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false },
      { id: '2', type: 'local', name: 'PLAYER 2', team: 2, ready: false },
      { id: '3', type: 'online', name: 'ONLINE_PLAYER', team: 1, ready: false }
    ]);
    
    // Add the panels to DOM for leave button functionality
    document.body.innerHTML += `
      <div id="player-stats-panel" class="hidden"></div>
      <div id="drivers-panel"></div>`;
    
    const leaveBtn = document.getElementById('leaveRoomBtn');
    fireEvent.click(leaveBtn);
    
    // Should remove all non-local players
    expect(mockRoomState.removePlayer).toHaveBeenCalledWith('2');
    expect(mockRoomState.removePlayer).toHaveBeenCalledWith('3');
    
    // Should switch panels
    const statsPanel = document.getElementById('player-stats-panel');
    const driversPanel = document.getElementById('drivers-panel');
    expect(statsPanel.classList.contains('hidden')).toBe(false);
    expect(driversPanel.classList.contains('hidden')).toBe(true);
  });

  it('clears zones before rendering', () => {
    // Initial render
    mockRoomState.setPlayers([
      { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false }
    ]);
    
    const team1Zone = document.getElementById('team1-zone');
    expect(team1Zone.children.length).toBe(1);
    
    // Update to different players
    mockRoomState.setPlayers([
      { id: '2', type: 'local', name: 'PLAYER 2', team: 1, ready: false },
      { id: '3', type: 'local', name: 'PLAYER 3', team: 1, ready: false }
    ]);
    
    expect(team1Zone.children.length).toBe(2);
    expect(team1Zone.children[0].textContent).toBe('PLAYER 2');
    expect(team1Zone.children[1].textContent).toBe('PLAYER 3');
  });

  it('injects ready card CSS styles', () => {
    const styleEl = document.getElementById('readyCardStyle');
    expect(styleEl).toBeTruthy();
    expect(styleEl.tagName).toBe('STYLE');
    expect(styleEl.textContent).toContain('.driver-card.ready');
    expect(styleEl.textContent).toContain('border: 2px solid #4caf50');
  });

  it('handles missing team zones gracefully', async () => {
    // Remove team zones from DOM
    document.body.innerHTML = '<div class="drivers-title">DRIVERS</div>';
    
    // Should not throw when module tries to render
    expect(() => {
      mockRoomState.setPlayers([
        { id: '1', type: 'local', name: 'PLAYER 1', team: 1, ready: false }
      ]);
    }).not.toThrow();
  });
}); 