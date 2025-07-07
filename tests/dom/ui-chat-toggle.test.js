import { describe, it, expect, beforeEach, vi } from 'vitest';

async function setup() {
  document.body.innerHTML = `<div id="chatPanel"></div>`;
  await import('../../js/room-state.js');
  await import('../../js/ui-chat-toggle.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('ui-chat-toggle', () => {
  beforeEach(async () => {
    vi.resetModules();
    await setup();
  });

  it('hides chat when two locals and no online players', () => {
    window.RoomState.addPlayer({ type: 'local' });
    window.RoomState.addPlayer({ type: 'local' });
    document.dispatchEvent(new Event('player_added'));
    expect(document.getElementById('chatPanel').classList.contains('hidden')).toBe(true);
  });

  it('shows chat when an online player is present', () => {
    window.RoomState.addPlayer({ type: 'local' });
    window.RoomState.addPlayer({ type: 'local' });
    window.RoomState.addPlayer({ type: 'online' });
    document.dispatchEvent(new Event('player_added'));
    expect(document.getElementById('chatPanel').classList.contains('hidden')).toBe(false);
  });
});
