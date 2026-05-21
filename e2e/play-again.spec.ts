/**
 * E2E test for Play Again flow
 *
 * Verifies that after a full game completes, the host's "Play Again" button
 * resets the room back to lobby and a fresh game can be started without
 * players re-joining.
 */

import { test, expect, Page } from '@playwright/test';

const CLIENT_URL = 'http://localhost:5175';

async function getRoomCode(hostPage: Page): Promise<string> {
  const el = hostPage.locator('[data-testid="room-code"]');
  await el.waitFor({ state: 'visible', timeout: 10000 });
  const code = await el.textContent();
  if (!code || code.length !== 6) throw new Error(`Invalid room code: ${code}`);
  return code;
}

async function waitForGameStatus(page: Page, status: string, timeout = 60000): Promise<void> {
  await page.waitForFunction(
    (expected) => document.querySelector('footer')?.textContent?.includes(`Status: ${expected}`),
    status,
    { timeout }
  );
}

async function joinPlayer(playerPage: Page, roomCode: string, deviceId: string): Promise<void> {
  await playerPage.goto(`${CLIENT_URL}?playerDeviceId=${deviceId}`);
  await playerPage.waitForSelector('text=/Join a Game/i', { timeout: 10000 });
  await playerPage.locator('input[name="roomCode"]').fill(roomCode);
  await playerPage.getByRole('button', { name: /Join Game/i }).click();
  await playerPage.waitForSelector('text=/Choose Your Name/i', { timeout: 10000 });
}

async function markReady(playerPage: Page): Promise<void> {
  await playerPage.getByRole('button', { name: /I'm Ready!/i }).click();
  await playerPage.waitForSelector('text=/Waiting for|Ready to Start/i', { timeout: 10000 });
}

async function simulateDrawing(page: Page): Promise<void> {
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 10000 });
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
}

async function submitDrawing(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^Submit$/i }).click();
  await Promise.race([
    page.waitForSelector('text=/Drawing Submitted/i', { timeout: 5000 }),
    page.waitForSelector('text=/Vote for your favorite/i', { timeout: 5000 }),
  ]);
}

async function voteForDrawing(page: Page): Promise<void> {
  await page.waitForSelector('text=/Vote for your favorite/i', { timeout: 15000 });
  const drawingButtons = page.locator('button').filter({
    has: page.locator('img'),
    hasNot: page.locator('text=You'),
  });
  await drawingButtons.first().click();
  await page.getByRole('button', { name: /Vote for/i }).click();
  await Promise.race([
    page.waitForSelector('text=/Vote Cast!/i', { timeout: 5000 }),
    page.waitForSelector('text=/Results/i', { timeout: 5000 }),
  ]);
}

async function playOneRound(p1: Page, p2: Page): Promise<void> {
  await simulateDrawing(p1);
  await simulateDrawing(p2);
  await submitDrawing(p1);
  await submitDrawing(p2);
  await voteForDrawing(p1);
  await voteForDrawing(p2);
}

test.describe('Play Again Flow', () => {
  test('host can reset room and players can play a fresh game', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const p1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const host = await hostCtx.newPage();
    const p1 = await p1Ctx.newPage();
    const p2 = await p2Ctx.newPage();

    try {
      // ===== First game =====
      await host.goto(`${CLIENT_URL}?sharedDeviceId=host-playagain`);
      await host.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });
      const roomCode = await getRoomCode(host);

      await joinPlayer(p1, roomCode, 'p1-playagain');
      await joinPlayer(p2, roomCode, 'p2-playagain');

      await markReady(p1);
      await markReady(p2);

      await host.getByRole('button', { name: /Start Game/i }).click();
      await waitForGameStatus(host, 'drawing', 30000);

      // Play 3 rounds
      for (let round = 1; round <= 3; round++) {
        await waitForGameStatus(host, 'drawing', 45000);
        await playOneRound(p1, p2);
      }

      // Final leaderboard
      await waitForGameStatus(host, 'final', 30000);
      await expect(host.locator('text=/Wins!/i')).toBeVisible({ timeout: 10000 });
      await expect(p1.locator('text=/Game Over!/i')).toBeVisible({ timeout: 10000 });

      // ===== Click Play Again =====
      const playAgainBtn = host.getByRole('button', { name: /Play Again/i });
      await expect(playAgainBtn).toBeVisible({ timeout: 10000 });
      await playAgainBtn.click();

      // ===== Back in lobby, players still present =====
      await waitForGameStatus(host, 'lobby', 15000);
      await expect(host.locator('text=/Join the Game!/i')).toBeVisible({ timeout: 10000 });
      await expect(host.getByText(/Players.*2.*8/i)).toBeVisible({ timeout: 5000 });

      // Players should be back in name picker / ready state (need to mark ready again)
      await expect(p1.getByRole('button', { name: /I'm Ready!/i })).toBeVisible({ timeout: 10000 });
      await expect(p2.getByRole('button', { name: /I'm Ready!/i })).toBeVisible({ timeout: 10000 });

      // ===== Second game starts cleanly =====
      await markReady(p1);
      await markReady(p2);

      await host.getByRole('button', { name: /Start Game/i }).click();
      await waitForGameStatus(host, 'drawing', 30000);

      // Verify round indicator restarted at round 1
      await expect(host.getByText(/Round 1 of 3/i).first()).toBeVisible({ timeout: 5000 });
    } finally {
      await hostCtx.close();
      await p1Ctx.close();
      await p2Ctx.close();
    }
  });
});
