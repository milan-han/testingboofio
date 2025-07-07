import { describe, it, expect, beforeEach, vi } from 'vitest';

async function setup() {
  document.body.innerHTML = `
  <div id="team1-zone"></div>
  <div id="team2-zone"></div>
  <div class="drivers-title"></div>`;
  await import('../../js/room-state.js');
  await import('../../js/ui-driver-menu.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('ui-driver-menu', () => {
  beforeEach(async () => {
    vi.resetModules();
    await setup();
  });

  it('renders driver cards in correct team zones', () => {
    const p1 = window.RoomState.addPlayer({ type: 'local', team: 1 });
    const p2 = window.RoomState.addPlayer({ type: 'npc', team: 2 });
    document.dispatchEvent(new Event('player_added'));
    expect(document.querySelector('#team1-zone .driver-card')).toBeTruthy();
    expect(document.querySelector('#team2-zone .driver-card')).toBeTruthy();
  });
});
