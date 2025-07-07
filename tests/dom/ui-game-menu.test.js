import { describe, it, expect, beforeEach, vi } from 'vitest';

async function setup() {
  document.body.innerHTML = `
    <div id="gameMenuContainer">
      <div id="quickplay-btn" class="play-option active"></div>
      <div id="customplay-btn" class="play-option"></div>
      <div id="sandbox-panel" class="panel-sandbox hidden"></div>
      <div id="quickplay-options" class="mode-buttons"></div>
      <div id="customplay-options" class="hidden">
        <div class="game-options-row">
          <button class="option-btn active" data-type="timed">timed</button>
          <button class="option-btn" data-type="points">points</button>
        </div>
        <div class="game-options-row" id="time-options">
          <button class="option-btn active" data-time="1">1m</button>
          <button class="option-btn" data-time="5">5m</button>
        </div>
        <div class="game-options-row hidden" id="points-options">
          <button class="option-btn active" data-points="3">3</button>
          <button class="option-btn" data-points="5">5</button>
        </div>
      </div>
      <div id="invite-player-btn"></div>
      <div id="invite-popup" class="hidden">
        <div class="popup-option">NPC</div>
      </div>
      <div id="player-stats-panel"></div>
      <div id="drivers-panel" class="hidden">
        <div id="team1-zone" class="team-dropzone"></div>
        <div id="team2-zone" class="team-dropzone"></div>
      </div>
      <button class="panel-start">PRESS F TO PLAY</button>
    </div>
    <canvas id="game" width="960" height="600"></canvas>`;

  global.initiateCountdown = vi.fn();
  global.currentMode = 'matchmaking';
  global.gameType = 'points';
  global.pointsToWin = 5;
  global.matchTimeMinutes = 5;
  await import('../../js/ui-game-menu.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('ui-game-menu', () => {
  beforeEach(async () => {
    vi.resetModules();
    await setup();
  });

  it('toggles between quickplay and customplay modes', () => {
    const quickBtn = document.getElementById('quickplay-btn');
    const customBtn = document.getElementById('customplay-btn');
    const sandbox = document.getElementById('sandbox-panel');
    const qpOptions = document.getElementById('quickplay-options');
    const cpOptions = document.getElementById('customplay-options');

    // switch to custom
    customBtn.click();
    expect(customBtn.classList.contains('active')).toBe(true);
    expect(quickBtn.classList.contains('active')).toBe(false);
    expect(sandbox.classList.contains('hidden')).toBe(false);
    expect(qpOptions.classList.contains('hidden')).toBe(true);
    expect(cpOptions.classList.contains('hidden')).toBe(false);
    expect(window.currentMode).toBe('npc');

    // back to quickplay
    quickBtn.click();
    expect(quickBtn.classList.contains('active')).toBe(true);
    expect(customBtn.classList.contains('active')).toBe(false);
    expect(sandbox.classList.contains('hidden')).toBe(true);
    expect(qpOptions.classList.contains('hidden')).toBe(false);
    expect(cpOptions.classList.contains('hidden')).toBe(true);
  });

  it('updates custom play settings', () => {
    const customBtn = document.getElementById('customplay-btn');
    customBtn.click();

    // switch type to points
    const pointsTypeBtn = document.querySelector('[data-type="points"]');
    pointsTypeBtn.click();
    expect(window.gameType).toBe('points');
    expect(document.getElementById('points-options').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('time-options').classList.contains('hidden')).toBe(true);

    // choose points amount
    const pointsBtn = document.querySelector('#points-options [data-points="5"]');
    pointsBtn.click();
    expect(window.pointsToWin).toBe(5);

    // switch back to timed
    const timedTypeBtn = document.querySelector('[data-type="timed"]');
    timedTypeBtn.click();
    expect(window.gameType).toBe('timed');
    const timeBtn = document.querySelector('#time-options [data-time="5"]');
    timeBtn.click();
    expect(window.matchTimeMinutes).toBe(5);
  });

  it('starts game and hides menu on start button click', () => {
    const startBtn = document.querySelector('.panel-start');
    startBtn.click();
    expect(document.getElementById('gameMenuContainer').classList.contains('hidden')).toBe(true);
    expect(global.initiateCountdown).toHaveBeenCalled();
  });
});
