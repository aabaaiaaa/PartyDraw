/**
 * E2E test for full PartyDraw game flow
 *
 * Tests the complete game cycle using TestBoardBed-style testing:
 * 1. Host creates room
 * 2. 2 players join the room
 * 3. All players mark ready
 * 4. Game starts (3-2-1 countdown)
 * 5. Players submit drawings
 * 6. Players vote on drawings
 * 7. Results are shown
 * 8. Repeat for 3 rounds
 * 9. Final leaderboard displays winner
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

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
  // Wait for room code to appear in the UI
  await hostPage.waitForSelector('text=/[A-Z0-9]{6}/', { timeout: 10000 });

  // Extract the room code from the header or lobby display
  const roomCodeElement = await hostPage.locator('.text-4xl.font-bold.tracking-\\[0\\.3em\\]').first();
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
  // Wait for submit button to be enabled (after drawing)
  const submitButton = page.getByRole('button', { name: /submit drawing/i });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();

  // Wait for submission confirmation
  await page.waitForSelector('text=/Drawing Submitted/i', { timeout: 5000 });
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

// Helper to wait for a specific round
async function waitForRound(page: Page, round: number, timeout = 30000): Promise<void> {
  await page.waitForFunction(
    (expectedRound) => {
      const footer = document.querySelector('footer');
      return footer?.textContent?.includes(`Round ${expectedRound}/`);
    },
    round,
    { timeout }
  );
}

test.describe('Full Game Flow E2E', () => {
  let hostContext: BrowserContext;
  let player1Context: BrowserContext;
  let player2Context: BrowserContext;
  let hostPage: Page;
  let player1Page: Page;
  let player2Page: Page;

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

    // Create pages for each context
    hostPage = await hostContext.newPage();
    player1Page = await player1Context.newPage();
    player2Page = await player2Context.newPage();
  });

  test.afterAll(async () => {
    await hostContext.close();
    await player1Context.close();
    await player2Context.close();
  });

  test('should complete full 3-round game with host and 2 players', async () => {
    // ==================== STEP 1: Host creates room ====================
    console.log('Step 1: Host creates room');

    // Navigate host to the host screen with sharedDeviceId parameter
    await hostPage.goto(`${CLIENT_URL}?sharedDeviceId=host1`);

    // Wait for room to be created and room code to appear
    await hostPage.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

    // Get the room code from the host screen
    const roomCode = await getRoomCode(hostPage);
    console.log(`Room created with code: ${roomCode}`);

    // Verify host is in lobby status
    await waitForGameStatus(hostPage, 'lobby');

    // ==================== STEP 2: Players join room ====================
    console.log('Step 2: Players join room');

    // Navigate players to player screens
    await player1Page.goto(`${CLIENT_URL}?playerDeviceId=player1`);
    await player2Page.goto(`${CLIENT_URL}?playerDeviceId=player2`);

    // Wait for join screens to load
    await player1Page.waitForSelector('text=/Join a Game/i', { timeout: 10000 });
    await player2Page.waitForSelector('text=/Join a Game/i', { timeout: 10000 });

    // Player 1 enters room code and joins
    const player1Input = player1Page.locator('input[name="roomCode"]');
    await player1Input.fill(roomCode);
    await player1Page.getByRole('button', { name: /Join Game/i }).click();

    // Wait for player 1 to be in name picker
    await player1Page.waitForSelector('text=/Choose Your Name/i', { timeout: 10000 });

    // Player 2 enters room code and joins
    const player2Input = player2Page.locator('input[name="roomCode"]');
    await player2Input.fill(roomCode);
    await player2Page.getByRole('button', { name: /Join Game/i }).click();

    // Wait for player 2 to be in name picker
    await player2Page.waitForSelector('text=/Choose Your Name/i', { timeout: 10000 });

    // Verify host shows both players in lobby
    await expect(hostPage.locator('text=/Players.*2.*8/i')).toBeVisible({ timeout: 5000 });
    console.log('Both players joined');

    // ==================== STEP 3: All players mark ready ====================
    console.log('Step 3: All players mark ready');

    // Player 1 marks ready
    await player1Page.getByRole('button', { name: /I'm Ready!/i }).click();
    await player1Page.waitForSelector('text=/Waiting for host/i', { timeout: 5000 });

    // Player 2 marks ready
    await player2Page.getByRole('button', { name: /I'm Ready!/i }).click();
    await player2Page.waitForSelector('text=/Waiting for host/i', { timeout: 5000 });

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

    // Verify countdown is visible on host
    await expect(hostPage.locator('text=/[3-1]/').first()).toBeVisible({ timeout: 10000 });

    // Verify players see "Get Ready!"
    await expect(player1Page.locator('text=/Get Ready!/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/Get Ready!/i')).toBeVisible({ timeout: 10000 });
    console.log('Countdown started');

    // ==================== GAME LOOP: 3 Rounds ====================
    for (let round = 1; round <= 3; round++) {
      console.log(`\n========== Round ${round} ==========`);

      // ==================== DRAWING PHASE ====================
      console.log(`Round ${round}: Drawing phase`);

      // Wait for drawing phase to start
      await waitForGameStatus(hostPage, 'drawing', 30000);

      // Verify question is displayed on host
      await expect(hostPage.locator('text=/Draw:/i')).toBeVisible({ timeout: 5000 });

      // Verify players have canvas
      await expect(player1Page.locator('canvas')).toBeVisible({ timeout: 10000 });
      await expect(player2Page.locator('canvas')).toBeVisible({ timeout: 10000 });

      // Both players draw and submit
      console.log(`Round ${round}: Players drawing...`);

      // Player 1 draws and submits
      await simulateDrawing(player1Page);
      await submitDrawing(player1Page);
      console.log(`Round ${round}: Player 1 submitted drawing`);

      // Player 2 draws and submits
      await simulateDrawing(player2Page);
      await submitDrawing(player2Page);
      console.log(`Round ${round}: Player 2 submitted drawing`);

      // Verify host shows all submitted
      await expect(hostPage.locator('text=/2.*2.*submitted/i')).toBeVisible({ timeout: 10000 });

      // ==================== VOTING PHASE ====================
      console.log(`Round ${round}: Voting phase`);

      // Wait for voting phase
      await waitForGameStatus(hostPage, 'voting', 30000);

      // Verify host shows drawing gallery
      await expect(hostPage.locator('text=/Cast your votes!/i')).toBeVisible({ timeout: 10000 });

      // Players vote for each other's drawings
      console.log(`Round ${round}: Players voting...`);

      await voteForDrawing(player1Page);
      console.log(`Round ${round}: Player 1 voted`);

      await voteForDrawing(player2Page);
      console.log(`Round ${round}: Player 2 voted`);

      // ==================== RESULTS PHASE ====================
      console.log(`Round ${round}: Results phase`);

      // Wait for results phase
      await waitForGameStatus(hostPage, 'results', 30000);

      // Verify host shows round results
      await expect(hostPage.locator('text=/Round.*Results/i')).toBeVisible({ timeout: 10000 });

      // Verify players see score display
      await expect(player1Page.locator('text=/Round.*Results/i')).toBeVisible({ timeout: 10000 });
      await expect(player2Page.locator('text=/Round.*Results/i')).toBeVisible({ timeout: 10000 });

      console.log(`Round ${round}: Results displayed`);

      // Wait for next round or final (results phase lasts ~5 seconds)
      if (round < 3) {
        // Wait for next round's countdown/drawing to begin
        console.log(`Waiting for round ${round + 1} to start...`);
        await waitForRound(hostPage, round + 1, 30000);
      }
    }

    // ==================== FINAL LEADERBOARD ====================
    console.log('\n========== Final Leaderboard ==========');

    // Wait for final phase
    await waitForGameStatus(hostPage, 'final', 30000);

    // Verify host shows final leaderboard
    await expect(hostPage.locator('text=/Final Results!/i')).toBeVisible({ timeout: 10000 });

    // Verify winner is announced
    await expect(hostPage.locator('text=/wins!/i')).toBeVisible({ timeout: 10000 });

    // Verify podium medals are shown
    await expect(hostPage.locator('text=🥇')).toBeVisible({ timeout: 5000 });
    await expect(hostPage.locator('text=🥈')).toBeVisible({ timeout: 5000 });

    // Verify "Play Again" button is present
    await expect(hostPage.getByRole('button', { name: /Play Again/i })).toBeVisible({ timeout: 10000 });

    // Verify players see final standings
    await expect(player1Page.locator('text=/Game Over!/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/Game Over!/i')).toBeVisible({ timeout: 10000 });

    console.log('Final leaderboard displayed - TEST PASSED!');
  });
});

test.describe('Game Start Requirements', () => {
  let hostContext: BrowserContext;
  let player1Context: BrowserContext;
  let hostPage: Page;
  let player1Page: Page;

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    player1Context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });

    hostPage = await hostContext.newPage();
    player1Page = await player1Context.newPage();
  });

  test.afterAll(async () => {
    await hostContext.close();
    await player1Context.close();
  });

  test('should require at least 2 players to start', async () => {
    // Host creates room
    await hostPage.goto(`${CLIENT_URL}?sharedDeviceId=host2`);
    await hostPage.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });

    const roomCode = await getRoomCode(hostPage);

    // Only 1 player joins
    await player1Page.goto(`${CLIENT_URL}?playerDeviceId=player1`);
    await player1Page.waitForSelector('text=/Join a Game/i', { timeout: 10000 });

    const player1Input = player1Page.locator('input[name="roomCode"]');
    await player1Input.fill(roomCode);
    await player1Page.getByRole('button', { name: /Join Game/i }).click();
    await player1Page.waitForSelector('text=/Choose Your Name/i', { timeout: 10000 });

    // Player marks ready
    await player1Page.getByRole('button', { name: /I'm Ready!/i }).click();

    // Verify host shows "Need at least 2 players" message (no Start Game button)
    await expect(hostPage.locator('text=/Need at least 2 players/i')).toBeVisible({ timeout: 5000 });

    // Verify Start Game button is not visible
    const startGameButton = hostPage.getByRole('button', { name: /Start Game/i });
    await expect(startGameButton).not.toBeVisible();
  });
});
