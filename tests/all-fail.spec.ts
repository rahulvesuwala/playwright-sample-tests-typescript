// SCENARIO: all-fail
// 1000 tests — every single test fails.
// Purpose: populate TestDino with a 100% red run to exercise failure grouping,
// error-type variety, stack traces, and the "all fail" report view.
// Failures rotate across 8 distinct error types so the report shows variety.
// Layout: 5 shards x 4 workers.
import { test, expect } from '@playwright/test';

const TOTAL = 1000;
const width = String(TOTAL).length;

// 8 distinct failure modes so the error-grouping view shows real variety.
type FailMode = { label: string; fn: (i: number) => void | Promise<void> };

const failureModes: FailMode[] = [
  {
    label: 'assertion-mismatch',
    fn: (i) => expect(i, `expected ${i} to equal ${i + 1}`).toBe(i + 1),
  },
  {
    label: 'thrown-error',
    fn: () => { throw new Error('Simulated downstream service returned 503'); },
  },
  {
    label: 'undefined-access',
    fn: () => { const o: any = undefined; return o.value.deep; },
  },
  {
    label: 'rejected-promise',
    fn: async () => { await Promise.reject(new Error('Payment gateway timeout')); },
  },
  {
    label: 'toContain-wrong-value',
    fn: (i) => expect(['a', 'b', 'c'], `index ${i}`).toContain('z'),
  },
  {
    label: 'deep-equal-mismatch',
    fn: (i) => expect({ id: i, status: 'ok' }).toEqual({ id: i, status: 'failed' }),
  },
  {
    label: 'toBeGreaterThan-fail',
    fn: (i) => expect(i, `${i} should be > ${i + 100}`).toBeGreaterThan(i + 100),
  },
  {
    label: 'toHaveLength-mismatch',
    fn: (i) => expect(`item-${i}`).toHaveLength(0),
  },
];

for (let i = 0; i < TOTAL; i++) {
  const id = String(i + 1).padStart(width, '0');
  const mode = failureModes[i % failureModes.length]!;

  test(`all-fail #${id} — fails [${mode.label}]`, async () => {
    await mode.fn(i);
  });
}
