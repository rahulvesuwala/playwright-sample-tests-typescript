// SCENARIO: all-permutations
// 1000 tests covering ALL 15 possible combinations of the 4 test statuses:
//   pass, fail, flaky, skip
//
// The 15 non-empty subsets of {pass, fail, flaky, skip} are:
//   Single:   [P] [F] [FL] [SK]
//   Pairs:    [P+F] [P+FL] [P+SK] [F+FL] [F+SK] [FL+SK]
//   Triples:  [P+F+FL] [P+F+SK] [P+FL+SK] [F+FL+SK]
//   All four: [P+F+FL+SK]
//
// Each combination gets its own describe() block with ~66 tests, totalling 1000.
// Requires retries >= 1 for flaky tests to surface correctly.
// Layout: 5 shards x 4 workers.
import { test, expect } from '@playwright/test';

// ─── Shared helpers ─────────────────────────────────────────────────────────

const failureModes = [
  (i: number) => expect(i).toBe(i + 1),
  () => { throw new Error('Simulated service error 503'); },
  () => { const o: any = undefined; return o.value.deep; },
  async () => { await Promise.reject(new Error('Async gateway timeout')); },
  (i: number) => expect(['a', 'b']).toContain(`z${i}`),
  (i: number) => expect({ id: i, status: 'ok' }).toEqual({ id: i, status: 'failed' }),
];

const skipReasons = [
  'Feature not yet implemented',
  'Blocked by upstream API',
  'Requires manual setup',
  'Excluded from release scope',
];

function pass(i: number) {
  expect(i + 1).toBeGreaterThan(0);
  expect(true).toBe(true);
}

async function fail(i: number) {
  await failureModes[i % failureModes.length](i);
}

async function flaky(i: number, testInfo: any) {
  if (testInfo.retry === 0) {
    throw new Error(`Flaky on first attempt — test slot ${i}`);
  }
  expect(true).toBe(true);
}

function skip(i: number) {
  test.skip(true, skipReasons[i % skipReasons.length]);
}

// ─── Helper to build N tests for a combination ──────────────────────────────

function buildTests(
  describeLabel: string,
  count: number,
  offset: number,
  kinds: ('pass' | 'fail' | 'flaky' | 'skip')[],
) {
  const w = 4; // fixed width for IDs
  test.describe(describeLabel, () => {
    for (let j = 0; j < count; j++) {
      const kind = kinds[j % kinds.length];
      const id = String(offset + j + 1).padStart(w, '0');
      const label = `[${describeLabel}] #${id} — ${kind}`;

      switch (kind) {
        case 'pass':
          test(label, async () => pass(offset + j));
          break;
        case 'fail':
          test(label, async () => { await fail(offset + j); });
          break;
        case 'flaky':
          test(label, async ({}, testInfo) => { await flaky(offset + j, testInfo); });
          break;
        case 'skip':
          test(label, async () => { skip(offset + j); });
          break;
      }
    }
  });
}

// ─── 15 Combinations × ~66 tests = 990 + 10 bonus on last = 1000 ────────────
// Distribution: 14 groups × 66 = 924, last group gets 76 = 1000 total.

let offset = 0;

// ── Single-status combinations (4) ──────────────────────────────────────────
buildTests('Combo-01 [Pass only]',         66, offset, ['pass']);               offset += 66;
buildTests('Combo-02 [Fail only]',         66, offset, ['fail']);               offset += 66;
buildTests('Combo-03 [Flaky only]',        66, offset, ['flaky']);              offset += 66;
buildTests('Combo-04 [Skip only]',         66, offset, ['skip']);               offset += 66;

// ── Two-status combinations (6) ─────────────────────────────────────────────
buildTests('Combo-05 [Pass + Fail]',       66, offset, ['pass', 'fail']);       offset += 66;
buildTests('Combo-06 [Pass + Flaky]',      66, offset, ['pass', 'flaky']);      offset += 66;
buildTests('Combo-07 [Pass + Skip]',       66, offset, ['pass', 'skip']);       offset += 66;
buildTests('Combo-08 [Fail + Flaky]',      66, offset, ['fail', 'flaky']);      offset += 66;
buildTests('Combo-09 [Fail + Skip]',       66, offset, ['fail', 'skip']);       offset += 66;
buildTests('Combo-10 [Flaky + Skip]',      66, offset, ['flaky', 'skip']);      offset += 66;

// ── Three-status combinations (4) ───────────────────────────────────────────
buildTests('Combo-11 [Pass + Fail + Flaky]',       66, offset, ['pass', 'fail', 'flaky']);       offset += 66;
buildTests('Combo-12 [Pass + Fail + Skip]',        66, offset, ['pass', 'fail', 'skip']);        offset += 66;
buildTests('Combo-13 [Pass + Flaky + Skip]',       66, offset, ['pass', 'flaky', 'skip']);       offset += 66;
buildTests('Combo-14 [Fail + Flaky + Skip]',       66, offset, ['fail', 'flaky', 'skip']);       offset += 66;

// ── All-four combination (1) — gets remaining tests to hit exactly 1000 ─────
buildTests('Combo-15 [Pass + Fail + Flaky + Skip]', 76, offset, ['pass', 'fail', 'flaky', 'skip']); offset += 76;

// Total: 14 × 66 + 76 = 924 + 76 = 1000 ✓
