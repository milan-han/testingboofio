import { test, expect } from '@playwright/test';

test.describe('LocalBoof.io UI Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load completely
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.game-logo', { timeout: 10000 });
  });

  test('should display main game interface correctly', async ({ page }) => {
    // Check that key UI elements are visible
    await expect(page.locator('.game-logo')).toBeVisible();
    await expect(page.locator('.login-btn')).toBeVisible();
    await expect(page.locator('.chat-panel')).toBeVisible();
    await expect(page.locator('.social-panel')).toBeVisible();
    await expect(page.locator('.game-menu-container')).toBeVisible();
    
    // Check that the initial play button is visible
    await expect(page.locator('text=PRESS F TO PLAY')).toBeVisible();
  });

  test('should handle add player workflow', async ({ page }) => {
    // Click the invite player button
    await page.click('#invite-player-btn');
    
    // Verify popup opens
    await expect(page.locator('#invite-popup')).not.toHaveClass(/hidden/);
    
    // Click NPC option
    await page.click('text=NPC');
    
    // Verify popup closes
    await expect(page.locator('#invite-popup')).toHaveClass(/hidden/);
    
    // Verify drivers panel shows up (indicating new player was added)
    await expect(page.locator('#drivers-panel')).toBeVisible();
  });

  test('should handle local player addition', async ({ page }) => {
    // Click invite player button
    await page.click('#invite-player-btn');
    
    // Click LOCAL PLAYER option
    await page.click('text=LOCAL PLAYER');
    
    // Check that player cards are now visible
    await expect(page.locator('#playerCard')).not.toHaveClass(/hidden/);
    
    // Check that local-mode class is applied to body when 2 local players
    await page.click('#invite-player-btn');
    await page.click('text=LOCAL PLAYER');
    
    await expect(page.locator('body')).toHaveClass(/local-mode/);
  });

  test('should handle chat panel visibility based on player types', async ({ page }) => {
    const chatPanel = page.locator('#chatPanel');
    
    // Initially chat should be visible
    await expect(chatPanel).not.toHaveClass(/hidden/);
    
    // Add a second local player
    await page.click('#invite-player-btn');
    await page.click('text=LOCAL PLAYER');
    
    // Chat should now be hidden (2 local players, no online)
    await expect(chatPanel).toHaveClass(/hidden/);
  });

  test('should handle game mode switching', async ({ page }) => {
    // Check initial quickplay mode
    await expect(page.locator('#quickplay-btn')).toHaveClass(/active/);
    
    // Switch to custom play
    await page.click('#customplay-btn');
    await expect(page.locator('#customplay-btn')).toHaveClass(/active/);
    await expect(page.locator('#quickplay-btn')).not.toHaveClass(/active/);
    
    // Verify custom options appear
    await expect(page.locator('#customplay-options')).toBeVisible();
  });

  test('should handle team assignments in drivers panel', async ({ page }) => {
    // Add an NPC to get to drivers panel
    await page.click('#invite-player-btn');
    await page.click('text=NPC');
    
    // Verify drivers panel is visible
    await expect(page.locator('#drivers-panel')).not.toHaveClass(/hidden/);
    
    // Check that team zones exist
    await expect(page.locator('#team1-zone')).toBeVisible();
    await expect(page.locator('#team2-zone')).toBeVisible();
    
    // Check that driver cards are present
    await expect(page.locator('.driver-card')).toHaveCount(2); // USER + NPC
  });

  test('should handle social panel friend interactions', async ({ page }) => {
    const socialPanel = page.locator('#socialPanel');
    const addFriendBtn = page.locator('#addFriendToggleBtn');
    const dropdown = page.locator('#addFriendDropdown');
    
    // Click add friend button
    await addFriendBtn.click();
    
    // Verify dropdown opens
    await expect(dropdown).toHaveClass(/show/);
    await expect(socialPanel).toHaveClass(/expanded/);
    
    // Type in friend input
    const friendInput = page.locator('#addFriendInput');
    await friendInput.fill('TEST_FRIEND');
    
    // Press Enter to add friend
    await friendInput.press('Enter');
    
    // Verify dropdown closes
    await expect(dropdown).not.toHaveClass(/show/);
  });

  test('should handle countdown and game start', async ({ page }) => {
    // Press F key to start countdown
    await page.keyboard.press('KeyF');
    
    // Verify countdown overlay appears
    await expect(page.locator('#countdownOverlay')).not.toHaveClass(/hidden/);
    await expect(page.locator('#countdownNumber')).toBeVisible();
    
    // Wait for countdown to complete (should hide the overlay)
    await page.waitForTimeout(4000);
    await expect(page.locator('#countdownOverlay')).toHaveClass(/hidden/);
  });

  test('should handle pause menu', async ({ page }) => {
    // Start the game first
    await page.keyboard.press('KeyF');
    await page.waitForTimeout(4000); // Wait for countdown
    
    // Press Escape to pause
    await page.keyboard.press('Escape');
    
    // Verify pause menu appears
    await expect(page.locator('#pauseOverlay')).not.toHaveClass(/hidden/);
    await expect(page.locator('text=GAME PAUSED')).toBeVisible();
    
    // Test resume button
    await page.click('#resumeBtn');
    await expect(page.locator('#pauseOverlay')).toHaveClass(/hidden/);
  });

  test('should handle responsive layout adjustments', async ({ page }) => {
    // Test different viewport sizes
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('.game-logo')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.game-logo')).toBeVisible();
    
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(page.locator('.game-logo')).toBeVisible();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test chat activation with '/' key
    await page.keyboard.press('Slash');
    const chatInput = page.locator('#chatInput');
    await expect(chatInput).toBeVisible();
    
    // Test escape to close chat
    await page.keyboard.press('Escape');
    await expect(chatInput).not.toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test clicking on elements that might not exist
    const nonExistentButton = page.locator('#non-existent-button');
    await expect(nonExistentButton).toHaveCount(0);
    
    // Test that the game doesn't crash when clicking empty areas
    await page.click('body', { position: { x: 100, y: 100 } });
    await expect(page.locator('.game-logo')).toBeVisible();
  });

  test('should handle complete game flow', async ({ page }) => {
    // 1. Add players
    await page.click('#invite-player-btn');
    await page.click('text=NPC');
    
    // 2. Verify we're in drivers panel
    await expect(page.locator('#drivers-panel')).not.toHaveClass(/hidden/);
    
    // 3. Start countdown
    await page.keyboard.press('KeyF');
    await expect(page.locator('#countdownOverlay')).not.toHaveClass(/hidden/);
    
    // 4. Wait for game to start
    await page.waitForTimeout(4000);
    
    // 5. Test pause/resume
    await page.keyboard.press('Escape');
    await expect(page.locator('#pauseOverlay')).not.toHaveClass(/hidden/);
    
    // 6. Return to menu
    await page.click('#backToMenuBtn');
    await expect(page.locator('.game-menu-container')).toBeVisible();
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check that interactive elements are keyboard accessible
    await page.keyboard.press('Tab');
    
    // Check for proper ARIA labels and roles
    const inviteBtn = page.locator('#invite-player-btn');
    await expect(inviteBtn).toHaveAttribute('aria-haspopup');
    
    // Test focus management
    await inviteBtn.focus();
    await expect(inviteBtn).toBeFocused();
  });

  test('should handle network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    // Game should still be functional
    await expect(page.locator('.game-logo')).toBeVisible();
    await page.click('#invite-player-btn');
    await expect(page.locator('#invite-popup')).not.toHaveClass(/hidden/);
  });
}); 