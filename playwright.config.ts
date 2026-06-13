import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const isCI = !!process.env.CI;

// SCENARIO: mixed-pass-fail-flaky
// ~200 tests with a deliberate pass/fail/flaky/skip mix. retries=1 always so the
// "flaky" tests (fail on attempt 0, pass on retry) surface as flaky both locally
// and in CI. Full artifacts (trace/screenshot/video) are ON so failing tests
// carry attachments for TestDino's artifact viewer.
const config: PlaywrightTestConfig = {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // Retry once so flaky tests pass on attempt 1 and are reported as flaky.
  retries: 1,
  workers: 4,

  timeout: 60 * 1000,
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
    // Full artifacts so failures/flakes carry trace + screenshot + video.
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

export default config;
