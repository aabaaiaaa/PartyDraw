/**
 * Playwright E2E test configuration for PartyDraw
 *
 * Tests the full game flow with:
 * - Host screen (shared display)
 * - Multiple player screens (phone devices)
 * - Real-time Socket.IO communication
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Tests share server state, run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid port conflicts
  reporter: 'html',

  // Global timeout for full game flow tests (3 rounds can take a while)
  timeout: 180000, // 3 minutes per test

  // Expect timeout for assertions
  expect: {
    timeout: 15000, // 15 seconds for individual assertions
  },

  use: {
    // Base URL for the client
    baseURL: 'http://localhost:5175',

    // Capture traces for debugging failed tests
    trace: 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',

    // Video recording for debugging
    video: 'on-first-retry',
  },

  // Use desktop Chrome for host and mobile Chrome for players
  projects: [
    {
      name: 'host',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'player',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  // Start server and client before running tests
  webServer: [
    {
      // Server process - use shorter reconnection timeout for faster tests
      command: 'npm run dev --workspace=server',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        ...process.env,
        RECONNECTION_TIMEOUT_MS: '2000', // 2 seconds for e2e tests instead of 10
      },
    },
    {
      // Client process
      command: 'npm run dev --workspace=client',
      port: 5175,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
