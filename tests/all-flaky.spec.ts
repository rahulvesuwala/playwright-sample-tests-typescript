// SCENARIO: all-flaky
// 1000 tests — every single test is flaky.
// Each test FAILS on attempt 0 and PASSES on retry (attempt >= 1).
// Requires retries >= 1 in playwright.config.ts (set via --retries=1 in the YML).
// Purpose: populate TestDino's "flaky" bucket with 1000 entries so the
// flaky-test grouping, retry timelines, and flakiness rate views all get exercised.
// Layout: 5 shards x 4 workers.
import { test, expect } from '@playwright/test';

const TOTAL = 1000;
const width = String(TOTAL).length;

// Distinct flaky patterns — all fail on first attempt, pass on retry.
// Rotated across the 1000 tests so flaky error messages look varied in the report.
const flakyPatterns = [
  (testInfo: any, i: number) => {
    expect(testInfo.retry, `test #${i + 1}: must be retried to pass`).toBeGreaterThan(0);
  },
  (testInfo: any, i: number) => {
    if (testInfo.retry === 0) throw new Error(`Flaky failure on first attempt (test #${i + 1})`);
    expect(true).toBe(true);
  },
  (testInfo: any, i: number) => {
    if (testInfo.retry === 0) {
      expect(i, `intermittent mismatch on test #${i + 1}`).toBe(i + 999);
    } else {
      expect(true).toBe(true);
    }
  },
  (testInfo: any, i: number) => {
    if (testInfo.retry === 0) {
      throw new Error(`Transient network error on test #${i + 1} — retry should pass`);
    }
    expect(true).toBe(true);
  },
  (testInfo: any, i: number) => {
    if (testInfo.retry === 0) {
      expect(['a', 'b', 'c'], `flaky toContain #${i + 1}`).toContain('z');
    } else {
      expect(true).toBe(true);
    }
  },
];

for (let i = 0; i < TOTAL; i++) {
  const id = String(i + 1).padStart(width, '0');
  const pattern = flakyPatterns[i % flakyPatterns.length];

  test(`all-flaky #${id} — flaky (fails attempt 0, passes on retry, pattern ${(i % flakyPatterns.length) + 1})`, async ({}, testInfo) => {
    await pattern(testInfo, i);
  });
}
