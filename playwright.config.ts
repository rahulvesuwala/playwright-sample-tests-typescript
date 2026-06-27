// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  snapshotDir: './__screenshots__',  // ✅ Baseline image storage
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 1, // Enable retries for flaky test behavior
  workers: isCI ? 5 : 5,

  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  // reporter: [
  //   ['html', {
  //     outputFolder: 'playwright-report',
  //     open: 'never'
  //   }],
  //   ['blob', { outputDir: 'blob-report' }], // Blob reporter for merging
  //   ['json', { outputFile: './playwright-report/report.json' }],
  //   // ['@testdino/playwright', { token: process.env.TESTDINO_TOKEN }],
  // ],

    // Add this in playwright.config.js|ts|mjs
  // reporter: [
  //   ['html', { outputDir: './playwright-report' }],
  //   ['json', { outputFile: './playwright-report/report.json' }],
  // ],

  reporter: [
    ['@testdino/playwright', {
      serverUrl: 'https://stg-analytics.testdino.com',
      token: 'td_api_57b9a51546f5b6207b47a469716d5bec8910c0830e3649cdb120887fb415baf7',
      // ciRunId,
      debug: false,
      artifacts: false
    }]
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
      use: { ...devices['Desktop Chrome'] },
    },
  ],
