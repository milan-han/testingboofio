import { describe, it, expect, beforeEach, vi } from 'vitest';

async function setup() {
  document.body.innerHTML = `
    <div id="socialPanel" class="social-panel">
      <button id="addFriendToggleBtn"></button>
      <div id="addFriendDropdown" class="add-friend-dropdown"></div>
    </div>
  `;
  await import('../../js/social-panel.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('social-panel', () => {
  beforeEach(async () => {
    vi.resetModules();
    await setup();
  });

  it('opens dropdown when toggle clicked', () => {
    const { toggleAddFriendMode } = require('../../js/social-panel.js');
    toggleAddFriendMode();
    expect(document.getElementById('addFriendDropdown').classList.contains('show')).toBe(true);
  });
});
