// SCENARIO: all-skipped
// 1000 tests — every single test is skipped.
// Purpose: populate TestDino's "skipped" bucket with 1000 entries so the
// skip-reason grouping and skipped-test views get fully exercised.
// Skips rotate across 8 different reasons so the report shows variety.
// Layout: 5 shards x 4 workers.
import { test } from '@playwright/test';

const TOTAL = 1000;
const width = String(TOTAL).length;

// 8 distinct skip reasons — rotated across all 1000 tests.
const skipReasons = [
  'Feature not yet implemented in this environment',
  'Dependency service unavailable in CI',
  'Flaky on this platform — tracked in issue #42',
  'Requires manual setup outside CI scope',
  'Blocked by upstream team — pending API contract',
  'Test data not seeded for this run',
  'Excluded from this release scope by product decision',
  'Known intermittent failure — skipped pending root-cause fix',
];

for (let i = 0; i < TOTAL; i++) {
  const id = String(i + 1).padStart(width, '0');
  const reason = skipReasons[i % skipReasons.length];

  test(`all-skipped #${id} — skipped (reason: ${(i % skipReasons.length) + 1})`, async () => {
    test.skip(true, reason);
  });
}
