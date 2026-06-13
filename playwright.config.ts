import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const isCI = !!process.env.CI;

// SCENARIO: ui-slow-realistic
// Real UI tests, deliberately padded to 2-5 min each so a 2-shard x 2-worker
// run lands around ~30 min total. Padding is applied in tests/fixtures.ts via
// the SLOW_PAD_MS env var so the test bodies stay untouched.
const config: PlaywrightTestConfig = {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // 2 workers per shard (per scenario spec).
  workers: 2,

  // Per-test timeout raised to 6 min to accommodate the 2-5 min padded tests.
  timeout: 6 * 60 * 1000,
  expect: { timeout: 10 * 1000 },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['blob', { outputDir: 'blob-report' }],
    ['json', { outputFile: './playwright-report/report.json' }],
  ],

  use: {
    baseURL: 'https://storedemo.testdino.com/',
    headless: true,
    actionTimeout: 30 * 1000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

export default config;
