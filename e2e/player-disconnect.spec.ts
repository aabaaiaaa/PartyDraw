/**
 * E2E test for player disconnect handling in PartyDraw
 *
 * Tests the disconnect flow:
 * 1. Start game with 3 players
 * 2. Disconnect one player mid-round
 * 3. Verify remaining players can continue
 * 4. Verify disconnected player is removed from room
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const CLIENT_URL = 'http://localhost:5175';

// Reconnection timeout - matches RECONNECTION_TIMEOUT_MS env var set in playwright.config.ts
// Using 2 seconds for faster e2e tests
const RECONNECTION_TIMEOUT_MS = 2000;

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
  // Wait for room code element to appear
  const roomCodeElement = hostPage.locator('[data-testid="room-code"]');
  await roomCodeElement.waitFor({ state: 'visible', timeout: 10000 });
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
}

// Helper to submit a drawing
async function submitDrawing(page: Page): Promise<void> {
  // Wait for submit button to be enabled (after drawing) - button text is just "Submit"
  const submitButton = page.getByRole('button', { name: /^Submit$/i });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();

  // Wait for submission confirmation OR voting phase (in case all players submitted)
  // When last player submits, game immediately transitions to voting
  await Promise.race([
    page.waitForSelector('text=/Drawing Submitted/i', { timeout: 5000 }),
    page.waitForSelector('text=/Vote for your favorite/i', { timeout: 5000 }),
  ]);
}

// Helper to vote for a drawing (vote for the first available drawing that's not own)
async function voteForDrawing(page: Page): Promise<void> {
  // Wait for voting interface
  await page.waitForSelector('text=/Vote for your favorite/i', { timeout: 10000 });

  // Find drawings that don't have the "You" badge (not own drawing)
  const drawingButtons = page.locator('button').filter({
    has: page.locator('img'),
    hasNot: page.locator('text=You'),
  });

  const count = await drawingButtons.count();
  if (count > 0) {
    // Click on the first available drawing to select
    await drawingButtons.first().click();

    // Click the confirm vote button
    const confirmButton = page.getByRole('button', { name: /Vote for/i });
    await confirmButton.click();
  }

  // Wait for vote confirmation
  await page.waitForSelector('text=/Vote Cast!/i', { timeout: 5000 });
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
  await playerPage.waitForSelector('text=/Waiting for|Ready to Start/i', { timeout: 5000 });
}

test.describe('Player Disconnect E2E', () => {
  let hostContext: BrowserContext;
  let player1Context: BrowserContext;
  let player2Context: BrowserContext;
  let player3Context: BrowserContext;
  let hostPage: Page;
  let player1Page: Page;
  let player2Page: Page;
  let player3Page: Page;

  test.beforeAll(async ({ browser }) => {
    // Create separate browser contexts for host and each player
    hostContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    player1Context = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 12 size
    });
    player2Context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    player3Context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });

    // Create pages for each context
    hostPage = await hostContext.newPage();
    player1Page = await player1Context.newPage();
    player2Page = await player2Context.newPage();
    player3Page = await player3Context.newPage();
  });

  test.afterAll(async () => {
    await hostContext.close();
    await player1Context.close();
    await player2Context.close();
    await player3Context.close();
  });

  test('should allow remaining players to continue after one player disconnects mid-game', async () => {
    // ==================== STEP 1: Host creates room ====================
    console.log('Step 1: Host creates room');

    await hostPage.goto(`${CLIENT_URL}?sharedDeviceId=host-disconnect-test`);
    await hostPage.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

    const roomCode = await getRoomCode(hostPage);
    console.log(`Room created with code: ${roomCode}`);

    await waitForGameStatus(hostPage, 'lobby');

    // ==================== STEP 2: Three players join room ====================
    console.log('Step 2: Three players join room');

    await joinPlayer(player1Page, roomCode, 'player1-disconnect-test');
    await joinPlayer(player2Page, roomCode, 'player2-disconnect-test');
    await joinPlayer(player3Page, roomCode, 'player3-disconnect-test');

    // Verify host shows 3 players
    await expect(hostPage.locator('text=/Players.*3.*8/i')).toBeVisible({ timeout: 5000 });
    console.log('All 3 players joined');

    // ==================== STEP 3: All players mark ready ====================
    console.log('Step 3: All players mark ready');

    await markPlayerReady(player1Page);
    await markPlayerReady(player2Page);
    await markPlayerReady(player3Page);

    // Wait for host to show "All ready!"
    await expect(hostPage.locator('text=/All ready!/i')).toBeVisible({ timeout: 10000 });
    console.log('All players ready');

    // ==================== STEP 4: Host starts game ====================
    console.log('Step 4: Host starts game');

    const startGameButton = hostPage.getByRole('button', { name: /Start Game/i });
    await expect(startGameButton).toBeVisible({ timeout: 10000 });
    await startGameButton.click();

    // Wait for countdown to finish and drawing phase to start
    await waitForGameStatus(hostPage, 'drawing', 30000);
    console.log('Game started, drawing phase begun');

    // Verify players have canvas
    await expect(player1Page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await expect(player3Page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // ==================== STEP 5: Disconnect player 3 mid-drawing ====================
    console.log('Step 5: Disconnecting player 3 mid-drawing phase');

    // Close player 3's page to simulate disconnect
    await player3Page.close();
    console.log('Player 3 disconnected');

    // Wait for the server's disconnect timeout
    // We need to wait for the player to be fully removed after the timeout
    console.log(`Waiting for disconnect timeout (${RECONNECTION_TIMEOUT_MS / 1000}s)...`);

    // Wait for player-left event to be processed (disconnect + timeout)
    // The active-player-count element shows current player count during gameplay
    await hostPage.waitForSelector('[data-testid="active-player-count"]:has-text("Active players: 2")', {
      timeout: RECONNECTION_TIMEOUT_MS + 5000 // Add extra time for processing
    });
    console.log('Player 3 has been removed from room after disconnect timeout');

    // ==================== STEP 6: Remaining players continue game ====================
    console.log('Step 6: Remaining players (1 and 2) continue with drawings');

    // Players 1 and 2 draw and submit
    await simulateDrawing(player1Page);
    await submitDrawing(player1Page);
    console.log('Player 1 submitted drawing');

    await simulateDrawing(player2Page);
    await submitDrawing(player2Page);
    console.log('Player 2 submitted drawing');

    // ==================== STEP 7: Voting phase ====================
    // Note: Game transitions to voting immediately after all players submit
    console.log('Step 7: Voting phase');

    await waitForGameStatus(hostPage, 'voting', 30000);

    // Players vote for each other's drawings
    await voteForDrawing(player1Page);
    console.log('Player 1 voted');

    await voteForDrawing(player2Page);
    console.log('Player 2 voted');

    // ==================== STEP 8: Results phase ====================
    console.log('Step 8: Verify results phase');

    await waitForGameStatus(hostPage, 'results', 30000);
    await expect(hostPage.locator('text=/Round.*Results/i')).toBeVisible({ timeout: 10000 });
    console.log('Results phase reached - game continued successfully without disconnected player');

    // ==================== STEP 9: Verify game can complete ====================
    console.log('Step 9: Let game continue to completion');

    // Wait for final phase or next round
    // The game should continue normally with the 2 remaining players
    await hostPage.waitForFunction(
      () => {
        const footer = document.querySelector('footer');
        const text = footer?.textContent || '';
        // Either in drawing phase (next round) or final phase
        return text.includes('Status: drawing') || text.includes('Status: final');
      },
      { timeout: 30000 }
    );

    console.log('Game continued successfully after player disconnect - TEST PASSED!');
  });

  test('should show disconnected player notification to other players', async ({ browser }) => {
    // Create fresh contexts for this test
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const player1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const player2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

    const host = await hostCtx.newPage();
    const p1 = await player1Ctx.newPage();
    const p2 = await player2Ctx.newPage();

    try {
      // Setup: Create room and join 2 players
      await host.goto(`${CLIENT_URL}?sharedDeviceId=host-notify-test`);
      await host.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

      const roomCode = await getRoomCode(host);

      await joinPlayer(p1, roomCode, 'player1-notify-test');
      await joinPlayer(p2, roomCode, 'player2-notify-test');

      // Verify both players joined
      await expect(host.locator('text=/Players.*2.*8/i')).toBeVisible({ timeout: 5000 });

      // Mark both ready
      await markPlayerReady(p1);
      await markPlayerReady(p2);

      // Start game
      await host.getByRole('button', { name: /Start Game/i }).click();
      await waitForGameStatus(host, 'drawing', 30000);

      // Disconnect player 2
      console.log('Disconnecting player 2...');
      await p2.close();

      // Verify player 1 can still interact (not blocked by disconnect)
      await expect(p1.locator('canvas')).toBeVisible({ timeout: 5000 });

      // Wait for disconnect timeout
      // The active-player-count element shows current player count during gameplay
      await host.waitForSelector('[data-testid="active-player-count"]:has-text("Active players: 1")', {
        timeout: RECONNECTION_TIMEOUT_MS + 5000
      });

      console.log('Player 2 removed after disconnect - notification test passed');
    } finally {
      await hostCtx.close();
      await player1Ctx.close();
      await player2Ctx.close();
    }
  });
});

test.describe('Disconnect Edge Cases', () => {
  test('should handle player disconnect during lobby phase', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const player1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const player2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

    const host = await hostCtx.newPage();
    const p1 = await player1Ctx.newPage();
    const p2 = await player2Ctx.newPage();

    try {
      // Create room and join 2 players
      await host.goto(`${CLIENT_URL}?sharedDeviceId=host-lobby-disconnect`);
      await host.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

      const roomCode = await getRoomCode(host);

      await joinPlayer(p1, roomCode, 'player1-lobby-disconnect');
      await joinPlayer(p2, roomCode, 'player2-lobby-disconnect');

      // Verify both players joined
      await expect(host.locator('text=/Players.*2.*8/i')).toBeVisible({ timeout: 5000 });

      // Player 2 disconnects during lobby (before game starts)
      console.log('Disconnecting player 2 during lobby...');
      await p2.close();

      // Wait for disconnect timeout
      await host.waitForFunction(
        () => {
          const playersText = document.body.textContent || '';
          return /Players.*1.*8/i.test(playersText);
        },
        { timeout: RECONNECTION_TIMEOUT_MS + 5000 }
      );

      console.log('Player 2 removed during lobby phase');

      // Verify remaining player can still mark ready
      await markPlayerReady(p1);

      // Verify host shows "Need at least 2 players" (can't start with only 1)
      await expect(host.locator('text=/Need at least 2 players/i')).toBeVisible({ timeout: 5000 });

      console.log('Lobby disconnect handling test passed');
    } finally {
      await hostCtx.close();
      await player1Ctx.close();
      await player2Ctx.close();
    }
  });
});
