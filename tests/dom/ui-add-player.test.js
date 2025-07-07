import { describe, it, expect, beforeEach, vi } from 'vitest';

async function setup() {
  document.body.innerHTML = `
    <button id="invite-player-btn"></button>
    <div id="invite-popup" class="hidden">
      <div class="popup-option">NPC</div>
      <div class="popup-option">LOCAL PLAYER</div>
    </div>`;
  await import('../../js/room-state.js');
  await import('../../js/ui-add-player.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('ui-add-player', () => {
  beforeEach(async () => {
    vi.resetModules();
    await setup();
  });

  it('shows popup when button clicked', () => {
    const btn = document.getElementById('invite-player-btn');
    btn.click();
    expect(document.getElementById('invite-popup').classList.contains('hidden')).toBe(false);
  });

  it('hides NPC option in quickplay', () => {
    window.RoomState.setMode('quickplay');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const npcOption = Array.from(document.querySelectorAll('.popup-option')).find(o => o.textContent.trim() === 'NPC');
    expect(npcOption?.style.display).toBe('none');
  });
});
