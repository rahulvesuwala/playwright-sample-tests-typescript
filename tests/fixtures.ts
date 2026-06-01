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
export const test = base.extend<AppFixtures>({
  allPages: async ({ page }, use) => {
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
  },
});

export { expect } from '@playwright/test';
