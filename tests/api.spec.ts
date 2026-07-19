// SCENARIO: api-legit
// A small set of *real* API tests against the demo store backend
// (https://storedemo-api.testdino.com/api). These make genuine HTTP calls and
// assert on real responses — no mocking. Fast (1-5s each). 1 shard x 4 workers.
//
// Endpoints exercised (verified against the live API):
//   POST /login    — 200 on valid creds, 401 on wrong creds, 400 on empty body
//   POST /register — structured JSON error on invalid/duplicate input
import { test, expect, request } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const API_BASE = 'https://storedemo-api.testdino.com/api';

test.describe('Auth API — /login', () => {
  test('rejects an empty body with 400 and a helpful message', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/fill all the details/i);
  });

  test('rejects wrong credentials with 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { email: 'definitely-not-a-user@example.com', password: 'wrong-pass' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe('string');
  });

  test('rejects a missing password field', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { email: 'someone@example.com' },
    });
    expect([400, 401]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('returns JSON content-type on auth errors', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, { data: {} });
    expect(res.headers()['content-type']).toContain('application/json');
  });

  // Runs only when real credentials are present (CI secrets / local .env).
  // Skips cleanly otherwise so the suite stays green without secrets.
  test('accepts valid credentials and returns an access token', async ({ request }) => {
    const email = process.env.USERNAME;
    const password = process.env.PASSWORD;
    test.skip(!email || !password, 'USERNAME/PASSWORD not configured');

    const res = await request.post(`${API_BASE}/login`, {
      data: { email, password },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    // The store returns a token used as a Bearer on subsequent calls.
    const token = body.token ?? body.access_token ?? body.user_access_token;
    expect(token, 'login response should carry an access token').toBeTruthy();
  });
});

test.describe('Auth API — /register', () => {
  test('rejects an empty registration with a structured error', async ({ request }) => {
    const res = await request.post(`${API_BASE}/register`, { data: {} });
    // The live API returns 500 with a JSON error envelope for invalid input.
    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe('string');
  });

  test('rejects a malformed email', async ({ request }) => {
    const res = await request.post(`${API_BASE}/register`, {
      data: { firstName: 'A', lastName: 'B', email: 'not-an-email', password: 'x' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

test.describe('API — reachability & contract', () => {
  test('unknown route returns 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/this-route-does-not-exist`);
    expect(res.status()).toBe(404);
  });

  test('login endpoint rejects GET (method not allowed / not found)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/login`);
    expect([404, 405]).toContain(res.status());
  });

  test('API responds within a reasonable time budget', async ({ request }) => {
    const started = Date.now();
    await request.post(`${API_BASE}/login`, { data: {} });
    const elapsed = Date.now() - started;
    expect(elapsed, 'login error path should respond quickly').toBeLessThan(10_000);
  });
});
