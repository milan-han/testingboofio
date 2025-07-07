import { describe, it, expect, beforeEach, vi } from 'vitest';

async function setup() {
  document.body.innerHTML = `
    <div id="playerCard" class="player-card"></div>
    <div id="player2Card" class="player-card"></div>`;
  await import('../../js/room-state.js');
  await import('../../js/ui-player-cards.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('ui-player-cards', () => {
  beforeEach(async () => {
    vi.resetModules();
    await setup();
  });

  it('adds local-mode when two local players and no online', () => {
    window.RoomState.addPlayer({ type: 'local', name: 'A' });
    window.RoomState.addPlayer({ type: 'local', name: 'B' });
    document.dispatchEvent(new Event('player_added'));
    expect(document.body.classList.contains('local-mode')).toBe(true);
  });

  it('stacks cards when online players present', () => {
    window.RoomState.addPlayer({ type: 'local', name: 'A' });
    window.RoomState.addPlayer({ type: 'local', name: 'B' });
    window.RoomState.addPlayer({ type: 'online' });
    document.dispatchEvent(new Event('player_added'));
    expect(document.getElementById('playerCard').classList.contains('stacked')).toBe(true);
  });
});
