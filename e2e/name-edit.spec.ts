/**
 * E2E test for in-lobby player name editing
 *
 * Tests:
 * - Player can type a custom name and have it persist
 * - "Generate New Name" picks a different name each click
 * - Host's player list reflects the renamed player
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

async function joinPlayer(playerPage: Page, roomCode: string, deviceId: string): Promise<void> {
  await playerPage.goto(`${CLIENT_URL}?playerDeviceId=${deviceId}`);
  await playerPage.waitForSelector('text=/Join a Game/i', { timeout: 10000 });
  await playerPage.locator('input[name="roomCode"]').fill(roomCode);
  await playerPage.getByRole('button', { name: /Join Game/i }).click();
  await playerPage.waitForSelector('text=/Choose Your Name/i', { timeout: 10000 });
}

test.describe('Player Name Editing', () => {
  test('player can type a custom name and host sees it', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const p1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const host = await hostCtx.newPage();
    const p1 = await p1Ctx.newPage();

    try {
      await host.goto(`${CLIENT_URL}?sharedDeviceId=host-name-edit-custom`);
      await host.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });
      const roomCode = await getRoomCode(host);

      await joinPlayer(p1, roomCode, 'p1-name-edit-custom');

      const customName = 'Sir Sketches A Lot';

      // Click the auto-generated name button to enter edit mode
      await p1.getByRole('button', { name: /Click to edit name/i }).click();
      const input = p1.getByRole('textbox', { name: /Custom name input/i });
      await expect(input).toBeVisible({ timeout: 5000 });
      await input.fill(customName);
      await input.press('Enter');

      // The display reverts to a button showing the new name
      await expect(p1.getByRole('button', { name: /Click to edit name/i })).toContainText(
        customName,
        { timeout: 5000 }
      );

      // Host's player list should contain the custom name (element may be off-screen
      // in a scrollable list, so check for attachment rather than visibility).
      await expect(host.getByText(customName).first()).toBeAttached({ timeout: 5000 });
    } finally {
      await hostCtx.close();
      await p1Ctx.close();
    }
  });

  test('"Generate New Name" produces a different name', async ({ browser }) => {
    const hostCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const p1Ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const host = await hostCtx.newPage();
    const p1 = await p1Ctx.newPage();

    try {
      await host.goto(`${CLIENT_URL}?sharedDeviceId=host-name-edit-regen`);
      await host.waitForSelector('text=/Join the Game!/i', { timeout: 15000 });
      const roomCode = await getRoomCode(host);

      await joinPlayer(p1, roomCode, 'p1-name-edit-regen');

      const editBtn = p1.getByRole('button', { name: /Click to edit name/i });
      const initialName = await editBtn.textContent();
      expect(initialName).toBeTruthy();

      // Click "Generate New Name" and verify the displayed name changes.
      // The generator can occasionally produce the same name; allow up to 5
      // attempts before failing.
      const generateBtn = p1.getByRole('button', { name: /Generate New Name/i });
      let changedTo = initialName;
      for (let i = 0; i < 5 && changedTo === initialName; i++) {
        await generateBtn.click();
        // Wait briefly for the new name to render
        await p1.waitForTimeout(150);
        changedTo = await editBtn.textContent();
      }
      expect(changedTo).not.toBe(initialName);
    } finally {
      await hostCtx.close();
      await p1Ctx.close();
    }
  });
});
