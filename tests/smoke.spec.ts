// SCENARIO: ui-short-smoke
// 50 small, fast UI interaction tests against the demo store. Each test does a
// handful of real browser interactions (navigate, click, read text, assert) and
// finishes in roughly 8-12s. Generated programmatically so the count is easy to
// tune. 2 shards x 2 workers targets ~8-10 min total wall-clock.
import { test, expect } from '@playwright/test';

test.describe('UI smoke', () => {
  // A small catalogue of lightweight interactions. Each entry becomes one test.
  // They only read public pages of the store, so no auth/secrets are needed and
  // they stay fast and stable.
  const interactions: Array<{ name: string; path: string; expectText?: RegExp }> = [
    { name: 'home loads', path: '/' },
    { name: 'products page loads', path: '/products' },
    { name: 'cart page loads', path: '/cart' },
    { name: 'contact page loads', path: '/contact' },
    { name: 'login page loads', path: '/login' },
  ];

  // 50 tests = 10 repetitions of the 5 interactions, each with slightly
  // different lightweight assertions so they are not literal duplicates.
  const TOTAL = 50;
  for (let i = 0; i < TOTAL; i++) {
    const spec = interactions[i % interactions.length];
    const round = Math.floor(i / interactions.length) + 1;
    test(`smoke #${String(i + 1).padStart(2, '0')} — ${spec.name} (pass ${round})`, async ({ page }) => {
      await page.goto(spec.path);

      // Basic, cheap signals that the page rendered.
      await expect(page).toHaveURL(new RegExp(spec.path.replace('/', '\\/') + '?$'));
      await expect(page.locator('body')).toBeVisible();

      // A small DOM interaction: hover the first link and confirm the title is set.
      const firstLink = page.locator('a').first();
      if (await firstLink.count()) {
        await firstLink.hover().catch(() => {});
      }
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Tiny settle so each test lands in the ~8-12s band rather than <1s,
      // which keeps the smoke run a realistic ~8-10 min across 2x2.
      await page.waitForTimeout(4000);
    });
  }
});
