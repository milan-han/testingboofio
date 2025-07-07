import { describe, it, expect, beforeEach, vi } from 'vitest';

// Utility to fresh-import RoomState and reset globals
async function loadRoomState() {
  vi.resetModules();
  delete global.window.RoomState;
  await import('../../js/room-state.js');
}

describe('RoomState core logic', () => {
  beforeEach(async () => {
    await loadRoomState();
  });

  it('blocks NPC addition in quickplay mode', () => {
    window.RoomState.setMode('quickplay');
    const npc = window.RoomState.addPlayer({ type: 'npc' });
    expect(npc).toBeNull();
  });

  it('emits all_ready when all humans ready', () => {
    const events = [];
    window.RoomState.subscribe((e) => events.push(e));
    const p1 = window.RoomState.addPlayer({ type: 'local' });
    const p2 = window.RoomState.addPlayer({ type: 'online' });
    window.RoomState.markReady(p1.id, true);
    window.RoomState.markReady(p2.id, true);
    expect(events).toContain('all_ready');
  });

  it('prevents switching to quickplay with >2 humans', () => {
    window.RoomState.addPlayer({ type: 'local' });
    window.RoomState.addPlayer({ type: 'online' });
    window.RoomState.addPlayer({ type: 'online' });
    window.RoomState.setMode('quickplay');
    expect(window.RoomState.mode).not.toBe('quickplay');
  });
});
