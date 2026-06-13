// SCENARIO: api-mock (large volume)
// 5000 self-contained "API + mock" tests generated programmatically. Each test
// builds a fake REST response, runs it through a small validator, and asserts on
// the result. There is NO real network and NO browser navigation, so every test
// completes in well under a second — the point is sheer VOLUME of results flowing
// into TestDino, with whatever shard x worker layout the config/workflow sets.
//
// The same spec backs two scenario branches that differ only in CI layout:
//   - api-mock-5k-1x40  (1 shard  x 40 workers)
//   - api-mock-5k-4x10  (4 shards x 10 workers)
import { test, expect } from '@playwright/test';

const TOTAL = Number(process.env.MOCK_TEST_COUNT ?? 5000);

// A handful of fake "endpoints", each with a tiny contract we validate. Tests are
// distributed across these so the report shows variety rather than 5000 clones.
type MockEndpoint = {
  name: string;
  build: (i: number) => unknown;
  validate: (body: any) => void;
};

const endpoints: MockEndpoint[] = [
  {
    name: 'GET /products/:id',
    build: (i) => ({ id: i, name: `Product ${i}`, price: (i % 500) + 0.99, inStock: i % 7 !== 0 }),
    validate: (b) => {
      expect(typeof b.id).toBe('number');
      expect(b.name).toMatch(/^Product /);
      expect(b.price).toBeGreaterThan(0);
      expect(typeof b.inStock).toBe('boolean');
    },
  },
  {
    name: 'POST /cart',
    build: (i) => ({ success: true, cartId: `cart_${i}`, items: (i % 5) + 1, total: ((i % 5) + 1) * 9.99 }),
    validate: (b) => {
      expect(b.success).toBe(true);
      expect(b.cartId).toMatch(/^cart_/);
      expect(b.items).toBeGreaterThanOrEqual(1);
      expect(b.total).toBeCloseTo(b.items * 9.99, 2);
    },
  },
  {
    name: 'POST /login',
    build: (i) => ({ success: true, token: `tok_${(i * 2654435761) >>> 0}`, expiresIn: 3600 }),
    validate: (b) => {
      expect(b.success).toBe(true);
      expect(b.token).toMatch(/^tok_\d+$/);
      expect(b.expiresIn).toBe(3600);
    },
  },
  {
    name: 'GET /orders/:id',
    build: (i) => ({ orderId: `ord_${i}`, status: ['pending', 'shipped', 'delivered'][i % 3], lines: (i % 4) + 1 }),
    validate: (b) => {
      expect(b.orderId).toMatch(/^ord_/);
      expect(['pending', 'shipped', 'delivered']).toContain(b.status);
      expect(b.lines).toBeGreaterThanOrEqual(1);
    },
  },
];

// Generate TOTAL tests. Pad the index so the report sorts/reads cleanly.
const width = String(TOTAL).length;
for (let i = 0; i < TOTAL; i++) {
  const ep = endpoints[i % endpoints.length];
  test(`mock #${String(i + 1).padStart(width, '0')} — ${ep.name}`, async () => {
    // Simulate an API response and validate its contract. Synchronous and instant.
    const body = ep.build(i);
    ep.validate(body);

    // A second assertion so each test has >1 expectation, exercising TestDino's
    // per-step rendering at volume.
    expect(JSON.stringify(body).length).toBeGreaterThan(2);
  });
}
