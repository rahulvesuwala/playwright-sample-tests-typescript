// SCENARIO: mixed-pass-fail-flaky
// ~200 tests with a deliberate status distribution so TestDino's failure, flaky,
// skip and error-grouping views all get exercised:
//
//   ~70% pass, ~15% fail, ~10% flaky, ~5% skip
//
// Failures are spread across several ERROR TYPES (assertion, timeout, thrown
// Error, rejected promise, undefined access) so the report shows error variety,
// not 30 copies of the same stack. Flaky tests fail on attempt 0 and pass on
// retry (requires retries >= 1, set in the config), so they surface as "flaky".
//
// Full artifacts (trace/screenshot/video) are enabled in playwright.config.ts so
// failing tests carry attachments for TestDino's artifact viewer.
import { test, expect } from '@playwright/test';

const TOTAL = Number(process.env.MIXED_TEST_COUNT ?? 200);

type Kind = 'pass' | 'fail' | 'flaky' | 'skip';

// Deterministic status assignment by index so the distribution is exact and
// reruns are stable (no Math.random). Pattern repeats every 20 tests:
//   14 pass, 3 fail, 2 flaky, 1 skip  -> 70% / 15% / 10% / 5%.
function kindFor(i: number): Kind {
  const slot = i % 20;
  if (slot < 14) return 'pass';
  if (slot < 17) return 'fail';
  if (slot < 19) return 'flaky';
  return 'skip';
}

// Distinct failure modes, chosen per failing test by index.
const failureModes = [
  // 0: assertion mismatch
  () => expect(2 + 2, 'arithmetic should hold').toBe(5),
  // 1: thrown Error with a message
  () => { throw new Error('Simulated downstream service returned 503'); },
  // 2: undefined property access (TypeError)
  () => { const o: any = undefined; return o.value.deep; },
  // 3: rejected promise / async failure
  async () => { await Promise.reject(new Error('Payment gateway timeout')); },
  // 4: toContain on the wrong collection
  () => expect(['a', 'b', 'c']).toContain('z'),
  // 5: deep-equal object mismatch
  () => expect({ id: 1, status: 'ok' }).toEqual({ id: 1, status: 'failed' }),
];

const width = String(TOTAL).length;

for (let i = 0; i < TOTAL; i++) {
  const kind = kindFor(i);
  const id = String(i + 1).padStart(width, '0');

  switch (kind) {
    case 'pass':
      test(`test #${id} — passes cleanly`, async () => {
        expect(true).toBe(true);
        expect((i * 7) % 3).toBeLessThan(3);
      });
      break;

    case 'fail': {
      const mode = failureModes[i % failureModes.length];
      test(`test #${id} — fails (mode ${i % failureModes.length})`, async ({ page }) => {
        // Visit a real page first so the failure carries a screenshot/video/trace
        // for TestDino's artifact viewer.
        await page.goto('https://storedemo.testdino.com/');
        await mode();
      });
      break;
    }

    case 'flaky':
      test(`test #${id} — flaky (passes on retry)`, async ({ page }, testInfo) => {
        await page.goto('https://storedemo.testdino.com/');
        // Fail on the first attempt, pass on any retry => reported as flaky.
        expect(testInfo.retry, 'flaky: should only pass after a retry').toBeGreaterThan(0);
      });
      break;

    case 'skip':
      test(`test #${id} — skipped`, async () => {
        test.skip(true, 'Intentionally skipped to populate the skipped bucket');
      });
      break;
  }
}
