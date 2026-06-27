import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const isCI = !!process.env.CI;

// Use the GitHub Actions run identifier in CI so all shards share one run,
// and fall back to a date-based id for local runs.
const ciRunId = isCI
  ? `ci-run-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || 1}`
  : `local-run-${new Date().toISOString().split('T')[0]}`;

const config: PlaywrightTestConfig = {
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,

  // SCENARIO api-legit: 1 shard x 4 workers.
  workers: 4,

  timeout: 30 * 1000,

  expect: {
    timeout: 10 * 1000,
  },

  reporter: [
    [
      '@testdino/playwright',
      {
        serverUrl: 'https://stg-analytics.testdino.com',
        token: process.env.TDPW_TOKEN,
        ciRunId,
        debug: false,
        artifacts: false,
      },
    ],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
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
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
};

export default config;
