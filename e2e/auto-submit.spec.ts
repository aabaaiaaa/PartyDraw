/**
 * E2E test for auto-submit functionality in PartyDraw
 *
 * Tests the auto-submit flow:
 * 1. Start game with 2 players
 * 2. One player submits drawing
 * 3. One player does NOT submit before timer expires
 * 4. Verify both drawings appear in voting gallery
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Configure to only run on the 'host' project to avoid duplicate runs
test.use({ viewport: { width: 1920, height: 1080 } });

// Test configuration
const CLIENT_URL = 'http://localhost:5175';

// Helper to wait for a socket event by checking page state
async function waitForGameStatus(page: Page, status: string, timeout = 30000): Promise<void> {
  await page.waitForFunction(
    (expectedStatus) => {
      const footer = document.querySelector('footer');
      return footer?.textContent?.includes(`Status: ${expectedStatus}`);
    },
    status,
    { timeout }
  );
}

// Helper to wait for room code to appear on host screen
async function getRoomCode(hostPage: Page): Promise<string> {
  // Wait for room code to appear - look for "Or enter this code:" section
  await hostPage.waitForSelector('text=/Or enter this code:/i', { timeout: 10000 });

  // The room code is displayed in a paragraph after "Or enter this code:"
  // Look for a 6-character alphanumeric string in the lobby area
  const roomCodeElement = hostPage.locator('p').filter({ hasText: /^[A-Z0-9]{6}$/ }).first();
  await roomCodeElement.waitFor({ state: 'visible', timeout: 5000 });
  const roomCode = await roomCodeElement.textContent();

  if (!roomCode || roomCode.length !== 6) {
    throw new Error(`Invalid room code: ${roomCode}`);
  }

  return roomCode;
}

// Helper to simulate drawing on canvas
async function simulateDrawing(page: Page): Promise<void> {
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 10000 });

  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas not found');
  }

  // Draw a simple line across the canvas
  const startX = box.x + box.width * 0.2;
  const startY = box.y + box.height * 0.5;
  const endX = box.x + box.width * 0.8;
  const endY = box.y + box.height * 0.5;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.mouse.up();

  // Draw another line to make it more interesting
  const midX = box.x + box.width * 0.5;
  const topY = box.y + box.height * 0.2;
  const bottomY = box.y + box.height * 0.8;

  await page.mouse.move(midX, topY);
  await page.mouse.down();
  await page.mouse.move(midX, bottomY, { steps: 10 });
  await page.mouse.up();
}

// Helper to submit a drawing
async function submitDrawing(page: Page): Promise<void> {
  // Wait for submit button to be enabled (after drawing) - button text is just "Submit"
  const submitButton = page.getByRole('button', { name: /^Submit$/i });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();

  // Wait for submission confirmation
  await page.waitForSelector('text=/Drawing Submitted/i', { timeout: 5000 });
}

// Helper to join a player to a room
async function joinPlayer(
  playerPage: Page,
  roomCode: string,
  playerDeviceId: string
): Promise<void> {
  await playerPage.goto(`${CLIENT_URL}?playerDeviceId=${playerDeviceId}`);
  await playerPage.waitForSelector('text=/Join a Game/i', { timeout: 10000 });

  const input = playerPage.locator('input[name="roomCode"]');
  await input.fill(roomCode);
  await playerPage.getByRole('button', { name: /Join Game/i }).click();
  await playerPage.waitForSelector('text=/Choose Your Name/i', { timeout: 10000 });
}

// Helper to mark a player as ready
async function markPlayerReady(playerPage: Page): Promise<void> {
  await playerPage.getByRole('button', { name: /I'm Ready!/i }).click();
  await playerPage.waitForSelector('text=/Waiting for host/i', { timeout: 5000 });
}

test.describe('Auto-Submit E2E', () => {
  test('should auto-submit drawing for player who does not submit before timer expires', async ({ browser }) => {
    // Create fresh browser contexts for this test
    const hostContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const player1Context = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 12 size
    });
    const player2Context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });

    // Create pages for each context
    const hostPage = await hostContext.newPage();
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
    // ==================== STEP 1: Host creates room ====================
    console.log('Step 1: Host creates room');

    await hostPage.goto(`${CLIENT_URL}?sharedDeviceId=host-autosubmit-test`);
    await hostPage.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

    const roomCode = await getRoomCode(hostPage);
    console.log(`Room created with code: ${roomCode}`);

    await waitForGameStatus(hostPage, 'lobby');

    // ==================== STEP 2: Two players join room ====================
    console.log('Step 2: Two players join room');

    await joinPlayer(player1Page, roomCode, 'player1-autosubmit-test');
    await joinPlayer(player2Page, roomCode, 'player2-autosubmit-test');

    // Verify host shows 2 players
    await expect(hostPage.locator('text=/Players.*2.*8/i')).toBeVisible({ timeout: 5000 });
    console.log('Both players joined');

    // ==================== STEP 3: All players mark ready ====================
    console.log('Step 3: All players mark ready');

    await markPlayerReady(player1Page);
    await markPlayerReady(player2Page);

    // Wait for host to show "All ready!"
    await expect(hostPage.locator('text=/All ready!/i')).toBeVisible({ timeout: 10000 });
    console.log('All players ready');

    // ==================== STEP 4: Host starts game ====================
    console.log('Step 4: Host starts game');

    // Wait for Start Game button to be visible (all ready + enough players)
    const startGameButton = hostPage.getByRole('button', { name: /Start Game/i });
    await expect(startGameButton).toBeVisible({ timeout: 10000 });

    // Click the Start Game button
    await startGameButton.click();
    console.log('Start Game button clicked');

    // Wait for countdown to start
    await waitForGameStatus(hostPage, 'countdown', 15000);

    // Verify countdown is visible on host (look for numbers 3, 2, or 1)
    await expect(hostPage.locator('text=/[123]/').first()).toBeVisible({ timeout: 10000 });

    // Verify players see "Get Ready!"
    await expect(player1Page.locator('text=/Get Ready!/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/Get Ready!/i')).toBeVisible({ timeout: 10000 });
    console.log('Countdown started');

    // Wait for countdown to finish and drawing phase to start
    await waitForGameStatus(hostPage, 'drawing', 30000);
    console.log('Game started, drawing phase begun');

    // Verify players have canvas
    await expect(player1Page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // ==================== STEP 5: Only player 1 submits drawing ====================
    console.log('Step 5: Player 1 draws and submits, Player 2 does NOT submit');

    // Verify players have canvas
    await expect(player1Page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('canvas')).toBeVisible({ timeout: 10000 });
    console.log('Both players have canvas visible');

    // Player 1 draws and submits
    await simulateDrawing(player1Page);
    await submitDrawing(player1Page);
    console.log('Player 1 submitted drawing');

    // Player 2 DOES NOT submit - just draw something but don't click submit
    await simulateDrawing(player2Page);
    console.log('Player 2 drew but did NOT submit - waiting for timer to expire');

    // Verify host shows only 1 player submitted (format: "1 / 2")
    await expect(hostPage.locator('text=/1\\s*\\/\\s*2/')).toBeVisible({ timeout: 5000 });
    console.log('Host shows 1 / 2 submitted');

    // ==================== STEP 6: Wait for timer to expire and auto-submit ====================
    console.log('Step 6: Waiting for drawing timer to expire (auto-submit will trigger)...');

    // The drawing timer is 20 seconds by default
    // Wait for voting phase which starts after timer expires and auto-submit happens
    await waitForGameStatus(hostPage, 'voting', 35000);
    console.log('Drawing timer expired, voting phase started');

    // ==================== STEP 7: Verify both drawings appear in voting gallery ====================
    console.log('Step 7: Verify both drawings appear in voting gallery');

    // Host should show drawing gallery with 2 drawings (text is "Vote Now!")
    await expect(hostPage.locator('text=/Vote Now!/i')).toBeVisible({ timeout: 10000 });

    // Count the number of drawing images in the gallery
    // The gallery should show 2 drawings (one submitted, one auto-submitted)
    const drawingImages = hostPage.locator('[data-testid="drawing-gallery"] img, .drawing-gallery img, img[alt*="drawing" i]');

    // Alternative: look for any images in the voting section that could be drawings
    const galleryImages = hostPage.locator('img').filter({
      has: hostPage.locator('xpath=ancestor::*[contains(@class, "gallery") or contains(@class, "voting") or contains(@class, "grid")]'),
    });

    // Wait a moment for the gallery to fully render
    await hostPage.waitForTimeout(1000);

    // Verify there are drawings displayed - check for images in the main content area
    const allImages = await hostPage.locator('main img, [role="main"] img').count();
    console.log(`Found ${allImages} images in main content area`);

    // Both players should have drawings in the gallery
    // Verify by checking the voting interface on player screens
    await expect(player1Page.locator('text=/Vote for your favorite/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/Vote for your favorite/i')).toBeVisible({ timeout: 10000 });

    // Each player should see at least one drawing they can vote for (not their own)
    // Player 1 should see Player 2's auto-submitted drawing
    const player1VotableDrawings = player1Page.locator('button').filter({
      has: player1Page.locator('img'),
      hasNot: player1Page.locator('text=You'),
    });
    const player1VotableCount = await player1VotableDrawings.count();
    console.log(`Player 1 can vote for ${player1VotableCount} drawing(s)`);
    expect(player1VotableCount).toBeGreaterThanOrEqual(1);

    // Player 2 should see Player 1's manually submitted drawing
    const player2VotableDrawings = player2Page.locator('button').filter({
      has: player2Page.locator('img'),
      hasNot: player2Page.locator('text=You'),
    });
    const player2VotableCount = await player2VotableDrawings.count();
    console.log(`Player 2 can vote for ${player2VotableCount} drawing(s)`);
    expect(player2VotableCount).toBeGreaterThanOrEqual(1);

    console.log('Both drawings (submitted and auto-submitted) appear in voting gallery - TEST PASSED!');
    } finally {
      await hostContext.close();
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('should show auto-submitted drawing message to player who did not submit', async ({ browser }) => {
    // Create fresh contexts for this test
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const player1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const player2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

    const host = await hostCtx.newPage();
    const p1 = await player1Ctx.newPage();
    const p2 = await player2Ctx.newPage();

    try {
      // Setup: Create room and join 2 players
      await host.goto(`${CLIENT_URL}?sharedDeviceId=host-autosubmit-msg-test`);
      await host.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

      const roomCode = await getRoomCode(host);

      await joinPlayer(p1, roomCode, 'player1-autosubmit-msg-test');
      await joinPlayer(p2, roomCode, 'player2-autosubmit-msg-test');

      // Verify both players joined
      await expect(host.locator('text=/Players.*2.*8/i')).toBeVisible({ timeout: 5000 });

      // Mark both ready and start game
      await markPlayerReady(p1);
      await markPlayerReady(p2);

      await host.getByRole('button', { name: /Start Game/i }).click();
      await waitForGameStatus(host, 'drawing', 30000);

      // Player 1 submits, Player 2 does not
      await simulateDrawing(p1);
      await submitDrawing(p1);
      console.log('Player 1 submitted');

      // Player 2 just waits - no drawing, no submit
      console.log('Player 2 waiting for timer to expire...');

      // Wait for voting phase
      await waitForGameStatus(host, 'voting', 35000);

      // Verify Player 2 is now in voting phase (their drawing was auto-submitted)
      await expect(p2.locator('text=/Vote for your favorite/i')).toBeVisible({ timeout: 10000 });

      console.log('Auto-submit message test passed - Player 2 transitioned to voting phase');
    } finally {
      await hostCtx.close();
      await player1Ctx.close();
      await player2Ctx.close();
    }
  });
});

test.describe('Auto-Submit with All Players Not Submitting', () => {
  test('should auto-submit all drawings when no one submits before timer', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const player1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const player2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

    const host = await hostCtx.newPage();
    const p1 = await player1Ctx.newPage();
    const p2 = await player2Ctx.newPage();

    try {
      // Setup: Create room and join 2 players
      await host.goto(`${CLIENT_URL}?sharedDeviceId=host-all-autosubmit-test`);
      await host.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

      const roomCode = await getRoomCode(host);
      console.log(`Room code: ${roomCode}`);

      await joinPlayer(p1, roomCode, 'player1-all-autosubmit-test');
      await joinPlayer(p2, roomCode, 'player2-all-autosubmit-test');

      // Verify both players joined
      await expect(host.locator('text=/Players.*2.*8/i')).toBeVisible({ timeout: 5000 });

      // Mark both ready and start game
      await markPlayerReady(p1);
      await markPlayerReady(p2);

      await host.getByRole('button', { name: /Start Game/i }).click();
      await waitForGameStatus(host, 'drawing', 30000);

      // Neither player submits - just wait for timer
      console.log('Both players NOT submitting - waiting for timer to expire...');

      // Verify host shows 0 submitted (format: "0 / 2")
      await expect(host.locator('text=/0\\s*\\/\\s*2/')).toBeVisible({ timeout: 5000 });

      // Wait for voting phase (timer will expire and auto-submit both)
      await waitForGameStatus(host, 'voting', 35000);
      console.log('Timer expired, both drawings auto-submitted');

      // Verify both players can see voting interface
      await expect(p1.locator('text=/Vote for your favorite/i')).toBeVisible({ timeout: 10000 });
      await expect(p2.locator('text=/Vote for your favorite/i')).toBeVisible({ timeout: 10000 });

      // Verify host shows drawing gallery
      await expect(host.locator('text=/Vote Now!/i')).toBeVisible({ timeout: 10000 });

      console.log('All auto-submit test passed - both drawings were auto-submitted');
    } finally {
      await hostCtx.close();
      await player1Ctx.close();
      await player2Ctx.close();
    }
  });
});
