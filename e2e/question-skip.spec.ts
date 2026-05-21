/**
 * E2E test for question-skip functionality
 *
 * Tests:
 * 1. Skip button is visible during drawing phase
 * 2. Single skip vote shows progress (1/N) but does not change question
 * 3. Majority skip vote replaces the current question
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

async function waitForGameStatus(page: Page, status: string, timeout = 30000): Promise<void> {
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

async function setupGameInDrawingPhase(
  hostPage: Page,
  player1Page: Page,
  player2Page: Page,
  deviceSuffix: string
): Promise<{ roomCode: string; firstQuestion: string }> {
  await hostPage.goto(`${CLIENT_URL}?sharedDeviceId=host-skip-${deviceSuffix}`);
  await hostPage.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });
  const roomCode = await getRoomCode(hostPage);

  await joinPlayer(player1Page, roomCode, `p1-skip-${deviceSuffix}`);
  await joinPlayer(player2Page, roomCode, `p2-skip-${deviceSuffix}`);

  await markReady(player1Page);
  await markReady(player2Page);

  await hostPage.getByRole('button', { name: /Start Game/i }).click();
  await waitForGameStatus(hostPage, 'drawing', 30000);

  // Capture the active question text from the host display
  const questionEl = hostPage.locator('h2').filter({ hasText: /.+/ }).first();
  await expect(questionEl).toBeVisible({ timeout: 5000 });
  const firstQuestion = (await questionEl.textContent()) || '';

  return { roomCode, firstQuestion };
}

test.describe('Question Skip Voting', () => {
  test('skip button is visible to players during drawing phase', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const p1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const host = await hostCtx.newPage();
    const p1 = await p1Ctx.newPage();
    const p2 = await p2Ctx.newPage();

    try {
      await setupGameInDrawingPhase(host, p1, p2, 'visible');

      // Both players should see a "Skip Question?" button
      await expect(p1.getByRole('button', { name: /Skip Question/i })).toBeVisible({ timeout: 5000 });
      await expect(p2.getByRole('button', { name: /Skip Question/i })).toBeVisible({ timeout: 5000 });
    } finally {
      await hostCtx.close();
      await p1Ctx.close();
      await p2Ctx.close();
    }
  });

  test('single skip vote shows progress but does not change question', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const p1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const host = await hostCtx.newPage();
    const p1 = await p1Ctx.newPage();
    const p2 = await p2Ctx.newPage();

    try {
      const { firstQuestion } = await setupGameInDrawingPhase(host, p1, p2, 'single');

      // Player 1 votes to skip
      await p1.getByRole('button', { name: /Skip Question/i }).click();

      // Player 1's button changes to "Voted to Skip" and shows progress
      await expect(p1.getByRole('button', { name: /Voted to Skip/i })).toBeVisible({ timeout: 5000 });

      // Threshold for 2 players is 2 (Math.floor(2/2)+1); 1/2 is not enough — question should remain
      await host.waitForTimeout(1000);
      const stillCurrent = host.locator('h2').filter({ hasText: firstQuestion });
      await expect(stillCurrent).toBeVisible();
    } finally {
      await hostCtx.close();
      await p1Ctx.close();
      await p2Ctx.close();
    }
  });

  test('majority skip vote replaces the current question', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const p1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p2Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const host = await hostCtx.newPage();
    const p1 = await p1Ctx.newPage();
    const p2 = await p2Ctx.newPage();

    try {
      const { firstQuestion } = await setupGameInDrawingPhase(host, p1, p2, 'majority');

      // Both players vote to skip — reaches threshold (2/2)
      await p1.getByRole('button', { name: /Skip Question/i }).click();
      await p2.getByRole('button', { name: /Skip Question/i }).click();

      // Host question text should change to a different question within a few seconds
      await expect(async () => {
        const newQuestion = await host.locator('h2').filter({ hasText: /.+/ }).first().textContent();
        expect(newQuestion).toBeTruthy();
        expect(newQuestion).not.toBe(firstQuestion);
      }).toPass({ timeout: 10000 });
    } finally {
      await hostCtx.close();
      await p1Ctx.close();
      await p2Ctx.close();
    }
  });
});
