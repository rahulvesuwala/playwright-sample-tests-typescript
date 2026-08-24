import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const isCI = !!process.env.CI;

// Server URL: reads from env so staging/prod can be switched via workflow_dispatch input.
// Staging:    https://stg-reporter.testdino.com
// Production: https://reporter.testdino.com
const serverUrl =
  process.env.TESTDINO_SERVER_URL || 'https://stg-reporter.testdino.com';

// Use GitHub Actions Run ID in CI
// Local runs will create a date-based run ID
const ciRunId =
  process.env.TESTDINO_CI_RUN_ID ||
  (isCI
    ? `ci-run-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || 1}`
    : `local-run-${new Date().toISOString().split('T')[0]}`);

const config: PlaywrightTestConfig = {
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,

  timeout: 60 * 1000,

  expect: {
    timeout: 10 * 1000,
  },

  reporter: [
    [
      '@testdino/playwright',
      {
        serverUrl: serverUrl,
        token: process.env.TESTDINO_TOKEN,
        ciRunId,
        debug: false,
        artifacts: false,
      },
    ],
    ['blob', { outputDir: 'blob-report' }],
    ['json', { outputFile: './playwright-report/report.json' }],
  ],

  use: {
    baseURL: 'https://storedemo.testdino.com/products',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
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
