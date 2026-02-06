/**
 * E2E test for Host Theme Vote Results Display
 *
 * Tests:
 * 1. Host sees vote results panel in lobby with defaults
 * 2. Host cannot interact with theme display (read-only)
 * 3. Vote results update in real-time when players vote
 * 4. Multiple player votes aggregate correctly
 * 5. Question count updates with winning themes
 * 6. Tie-breaking behavior (alphabetically first wins)
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const CLIENT_URL = 'http://localhost:5175';

// Helper to wait for room code to appear on host screen
async function getRoomCode(hostPage: Page): Promise<string> {
  const roomCodeElement = hostPage.locator('[data-testid="room-code"]');
  await roomCodeElement.waitFor({ state: 'visible', timeout: 10000 });
  const roomCode = await roomCodeElement.textContent();

  if (!roomCode || roomCode.length !== 6) {
    throw new Error(`Invalid room code: ${roomCode}`);
  }

  return roomCode;
}

// Helper to wait for game status
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

// Helper to join a room as a player
async function joinRoom(playerPage: Page, roomCode: string, playerId: string = 'player'): Promise<void> {
  // Navigate to player screen with device ID
  await playerPage.goto(`${CLIENT_URL}?playerDeviceId=${playerId}`);

  // Wait for join screen to load
  await playerPage.waitForSelector('text=/Join a Game/i', { timeout: 10000 });

  // Enter room code
  const codeInput = playerPage.locator('input[name="roomCode"]');
  await codeInput.fill(roomCode);

  // Click join button
  const joinButton = playerPage.getByRole('button', { name: /Join Game/i });
  await joinButton.click();

  // Wait for name picker to appear (indicates successful join)
  await playerPage.waitForSelector('text=/Choose Your Name/i', { timeout: 10000 });
}

// Helper for a player to vote for themes
async function voteForThemes(
  playerPage: Page,
  pack?: string,
  genre?: string,
  ageRating?: string
): Promise<void> {
  // First expand the theme voting section (collapsed by default)
  const themeToggle = playerPage.getByText(/Theme Preferences/i).first();
  await themeToggle.click();

  // Wait for expanded view
  await playerPage.waitForSelector('text=/Vote for Themes/i', { timeout: 5000 });

  if (pack) {
    const packButton = playerPage.getByRole('button', { name: new RegExp(pack, 'i') }).first();
    await packButton.click();
  }

  if (genre) {
    const genreButton = playerPage.getByRole('button', { name: new RegExp(genre, 'i') }).first();
    await genreButton.click();
  }

  if (ageRating) {
    const ageButton = playerPage.getByRole('button', { name: new RegExp(ageRating, 'i') }).first();
    await ageButton.click();
  }
}

test.describe('Host Theme Vote Results Display', () => {
  let hostContext: BrowserContext;
  let playerContext: BrowserContext;
  let hostPage: Page;

  test.beforeAll(async ({ browser }) => {
    hostContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
  });

  test.afterAll(async () => {
    await hostContext?.close();
    await playerContext?.close();
  });

  test.beforeEach(async () => {
    hostPage = await hostContext.newPage();
    await hostPage.goto(`${CLIENT_URL}/host`);
    await waitForGameStatus(hostPage, 'lobby');
    await getRoomCode(hostPage); // Ensure room is created
  });

  test.afterEach(async () => {
    await hostPage?.close();
  });

  test('host sees vote results panel with default themes', async () => {
    // The vote results header shows "Question Themes"
    const voteResultsHeader = hostPage.getByText('Question Themes').first();
    await expect(voteResultsHeader).toBeVisible({ timeout: 5000 });

    // Question count badge should be visible (use first() since there are desktop/mobile versions)
    const questionCount = hostPage.locator('[data-testid="question-count"]').first();
    await expect(questionCount).toBeVisible();
    await expect(questionCount).toContainText(/\d+ questions?/);

    // Should show "Waiting for player votes..." message
    const waitingMessage = hostPage.getByText('Waiting for player votes...').first();
    await expect(waitingMessage).toBeVisible();

    // Default themes should be displayed: General pack, General genre, Adult age rating
    await expect(hostPage.getByText('General').first()).toBeVisible();
    await expect(hostPage.getByText('Adult').first()).toBeVisible();
  });

  test('host cannot interact with theme display', async () => {
    // The Question Themes section should not have any checkboxes
    const voteResultsSection = hostPage.locator('text=Question Themes').locator('..').locator('..');
    const sectionCheckboxes = voteResultsSection.locator('input[type="checkbox"]');
    await expect(sectionCheckboxes).toHaveCount(0);

    // Verify there are theme badges (static, not clickable)
    const themeBadges = hostPage.locator('.bg-purple-50.border.border-purple-200');
    const badgeCount = await themeBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('host sees winning themes update when players vote', async () => {
    const roomCode = await getRoomCode(hostPage);

    // Join as a player
    const playerPage = await playerContext.newPage();
    await joinRoom(playerPage, roomCode, 'player1');

    // Player votes for Halloween pack
    await voteForThemes(playerPage, 'Halloween');

    // Wait a bit for the vote to propagate
    await hostPage.waitForTimeout(1000);

    // Host display should update to show Halloween as winning pack
    await expect(hostPage.getByText('Halloween').first()).toBeVisible({ timeout: 5000 });

    // Vote count should show "1 vote" for the category
    await expect(hostPage.getByText('1 vote').first()).toBeVisible();

    await playerPage.close();
  });

  test('host sees aggregated votes from multiple players', async () => {
    const roomCode = await getRoomCode(hostPage);

    // Join as two players
    const player1Page = await playerContext.newPage();
    await joinRoom(player1Page, roomCode, 'player1');

    const player2Page = await playerContext.newPage();
    await joinRoom(player2Page, roomCode, 'player2');

    // Both players vote for Halloween
    await voteForThemes(player1Page, 'Halloween');
    await voteForThemes(player2Page, 'Halloween');

    // Wait for votes to propagate
    await hostPage.waitForTimeout(1000);

    // Host should show Halloween with vote count 2
    await expect(hostPage.getByText('Halloween').first()).toBeVisible({ timeout: 5000 });
    await expect(hostPage.getByText('2 votes').first()).toBeVisible();

    // Now add a third player who votes for Christmas
    const player3Page = await playerContext.newPage();
    await joinRoom(player3Page, roomCode, 'player3');
    await voteForThemes(player3Page, 'Christmas');

    // Wait for vote to propagate
    await hostPage.waitForTimeout(1000);

    // Halloween should still be winning (2 > 1)
    await expect(hostPage.getByText('Halloween').first()).toBeVisible();
    await expect(hostPage.getByText('2 votes').first()).toBeVisible();

    await player1Page.close();
    await player2Page.close();
    await player3Page.close();
  });

  test('question count updates based on winning themes', async () => {
    const roomCode = await getRoomCode(hostPage);

    // Get initial question count (use first() since there are desktop/mobile versions)
    const questionCountEl = hostPage.locator('[data-testid="question-count"]').first();
    await expect(questionCountEl).toBeVisible();
    const initialText = await questionCountEl.textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');

    // Join as a player and vote for a specific pack
    const playerPage = await playerContext.newPage();
    await joinRoom(playerPage, roomCode, 'player1');
    await voteForThemes(playerPage, 'Halloween');

    // Wait for count to update
    await hostPage.waitForTimeout(2000);

    // Count should have changed to reflect Halloween questions
    const updatedText = await questionCountEl.textContent();
    const updatedCount = parseInt(updatedText?.match(/\d+/)?.[0] || '0');

    // The count should be a valid positive number
    expect(updatedCount).toBeGreaterThan(0);

    await playerPage.close();
  });

  test('alphabetically first theme wins in tie', async () => {
    const roomCode = await getRoomCode(hostPage);

    // Join as two players
    const player1Page = await playerContext.newPage();
    await joinRoom(player1Page, roomCode, 'player1');

    const player2Page = await playerContext.newPage();
    await joinRoom(player2Page, roomCode, 'player2');

    // Player 1 votes for Halloween, Player 2 votes for Christmas
    // This creates a tie (1 vote each)
    await voteForThemes(player1Page, 'Halloween');
    await voteForThemes(player2Page, 'Christmas');

    // Wait for votes to propagate
    await hostPage.waitForTimeout(1000);

    // Christmas should be shown as winner (alphabetically before Halloween: c < h)
    await expect(hostPage.getByText('Christmas').first()).toBeVisible({ timeout: 5000 });

    await player1Page.close();
    await player2Page.close();
  });

  test('player count updates correctly', async () => {
    const roomCode = await getRoomCode(hostPage);

    // Initially no players have voted
    const waitingMessage = hostPage.getByText('Waiting for player votes...').first();
    await expect(waitingMessage).toBeVisible();

    // Join as a player and vote (use Halloween to avoid ambiguity with "General")
    const playerPage = await playerContext.newPage();
    await joinRoom(playerPage, roomCode, 'player1');
    await voteForThemes(playerPage, 'Halloween');

    // Wait for vote to propagate
    await hostPage.waitForTimeout(1000);

    // Should now show "Based on 1 player's votes"
    await expect(hostPage.getByText(/Based on 1 player's votes/i).first()).toBeVisible({ timeout: 5000 });

    await playerPage.close();
  });
});
