import { test as base } from '@playwright/test';
import AllPages from '../pages/AllPages.js';

type AppFixtures = {
  /** Page Object Model aggregator, injected fresh into every test. */
  allPages: AllPages;
};

/**
 * Custom test fixtures — following the TestDino Playwright Skill
 * (see .agents/skills/playwright-skill/pom/pom-vs-fixtures-vs-helpers.md).
 *
 * The `allPages` fixture owns the per-test infrastructure lifecycle:
 *   1. Re-attaches the auth token the demo store omits on some API calls
 *      (e.g. POST /api/createOrder, which otherwise 401s with "Token Missing").
 *   2. Navigates to the application root.
 *   3. Provides the Page Object Model aggregator to the test.
 *
 * This replaces a shared module-level variable + `beforeEach`, so each test
 * declares its dependency explicitly via the `{ allPages }` parameter.
 */
// SCENARIO PADDING (ui-slow-realistic):
// When SLOW_PAD_MS is set, each test is padded by a randomized delay so real
// UI tests land in a 2-5 min band. Deterministic per-test via a hash of the
// title (no Math.random) so reruns are stable. Min/max come from the env so the
// same fixtures file works for other scenarios with no padding by default.
const SLOW_PAD_MIN = Number(process.env.SLOW_PAD_MIN_MS ?? 0);
const SLOW_PAD_MAX = Number(process.env.SLOW_PAD_MAX_MS ?? 0);

function titleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const test = base.extend<AppFixtures>({
  allPages: async ({ page }, use, testInfo) => {
    await page.route('**/storedemo-api.testdino.com/**', async (route) => {
      const headers = route.request().headers();
      if (!headers['authorization']) {
        const token = await page
          .evaluate(() => localStorage.getItem('user_access_token'))
          .catch(() => null);
        if (token) headers['authorization'] = `Bearer ${token}`;
      }
      await route.continue({ headers });
    });

    await page.goto('/');
    await use(new AllPages(page));

    if (SLOW_PAD_MAX > 0) {
      const span = Math.max(0, SLOW_PAD_MAX - SLOW_PAD_MIN);
      const pad = SLOW_PAD_MIN + (titleHash(testInfo.title) % (span + 1));
      await page.waitForTimeout(pad);
    }
  },
});

export { expect } from '@playwright/test';
