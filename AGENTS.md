# AGENTS.md

Operating guide for AI coding agents (and humans) working in this repository.
Read this first — everything you need to navigate, run, and extend the suite is here, so you should not have to grep around to get oriented.

> This is a **test automation** repo, not an application. The app under test is a
> hosted Ecommerce demo store. There is no local app to build or boot.

---

## 1. What this project is

End-to-end (E2E) UI test suite for the **TestDino Ecommerce Demo Store**.

| | |
| --- | --- |
| **System under test** | `https://storedemo.testdino.com` (configured as `baseURL`) |
| **Test runner** | [Playwright Test](https://playwright.dev/) (`@playwright/test` `^1.55`) |
| **Language** | TypeScript `^5.9` (ESM, `"type": "module"`) |
| **Pattern** | Page Object Model (POM) |
| **Browser project** | `chromium` only (see `playwright.config.ts`) |
| **CI** | GitHub Actions, 5-way sharded, daily + on PR |
| **Cloud reporting** | [TestDino](https://testdino.com/) via `tdpw` |

The store is a typical shopping app: sign up / sign in, browse products, search &
filter, wishlist, cart, checkout (Cash on Delivery), place / view / cancel orders,
manage profile & addresses, write / edit / delete reviews, and a Contact Us form.

---

## 2. Quick start

```sh
npm install                  # install dependencies
npm run install:browsers     # one-time: download Playwright browsers
cp .env.example .env         # then fill in real credentials (see §5)
npm test                     # run the whole suite (headless, chromium)
```

## 3. Commands (defined in package.json)

| Command | What it does |
| --- | --- |
| `npm test` | Run all tests headless (chromium) |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:ui` | Open the Playwright UI / time-travel runner |
| `npm run test:debug` | Run with the Playwright Inspector (step debugging) |
| `npm run test:chromium` | Run only the `chromium` project (explicit) |
| `npm run test:report` | Open the last HTML report |
| `npm run codegen` | Launch `playwright codegen` against the demo store |
| `npm run install:browsers` | `playwright install --with-deps` |
| `npm run merge-reports` | Merge sharded blob reports (used in CI) |
| `npm run report:upload` | Upload `playwright-report/` to TestDino (`tdpw`, needs a `--token`) |

Run a single test file or test:

```sh
npx playwright test tests/ecommerce.spec.ts
npx playwright test -g "user can login and logout"
```

---

## 4. Directory map

```
.
├── pages/                     # Page Object Models (one class per page/area)
│   ├── BasePage.ts            # base class: holds `page`, navigateTo(), getPageTitle()
│   ├── AllPages.ts            # aggregator: instantiates every POM (used by tests)
│   ├── LoginPage.ts           # sign in / sign out, user-profile icon, signup link
│   ├── SignupPage.ts          # create account form
│   ├── HomePage.ts            # navbar, hero "Shop Now", price-range filter, About Us
│   ├── InventoryPage.ts       # product grid: search, add-to-cart, wishlist, continue shopping
│   ├── AllProductsPage.ts     # "All Products" listing: nth-product helpers, wishlist counts
│   ├── ProductDetailsPage.ts  # product page: add to cart, reviews & additional-info tabs, review CRUD
│   ├── CartPage.ts            # cart: quantities, subtotal/total, remove item, checkout
│   ├── CheckoutPage.ts        # checkout: shipping address, payment (COD), order summary, place order
│   ├── OrderDetailsPage.ts    # post-order confirmation / order details screen
│   ├── OrderPage.ts           # "My Orders": list, pagination, view details, cancel order
│   ├── UserPage.ts            # account: personal info, addresses CRUD, security/password
│   └── ContactUsPage.ts       # Contact Us form + success
├── tests/
│   └── ecommerce.spec.ts      # the single spec file — all journeys live here (see §8)
├── .github/workflows/test.yml # CI: sharded run + merge + TestDino upload
├── playwright.config.ts       # config (see §7)
├── tsconfig.json              # strict, ESM, module: nodenext
├── .env.example               # template for required secrets (copy to .env)
└── package.json               # scripts + deps
```

---

## 5. Environment variables

Tests read credentials and test data from `process.env` (loaded by `dotenv` at the
top of the spec). **Tests will fail without a populated `.env`.** Copy `.env.example`
to `.env` and fill it in.

| Variable | Used for |
| --- | --- |
| `USERNAME` / `PASSWORD` | Primary login account (most tests) |
| `USERNAME1` | Secondary account for the change-password test |
| `NEW_PASSWORD` | Temporary password in the change-password test |
| `SFIRST_NAME`, `SCITY`, `SSTATE`, `SSTREET_ADD`, `SZIP_CODE`, `SCOUNTRY` | Shipping address for the multi-order journey |

> ⚠️ **Heads-up (known mismatch):** the CI workflow (`.github/workflows/test.yml`)
> currently writes `FIRST_NAME`, `CITY`, `STATE`, `COUNTRY`, `ZIP_CODE`, `STREET_NAME`
> into `.env`, but the tests read the `S`-prefixed names above (and `USERNAME1`).
> If you touch CI env or the shipping-address test, reconcile these names.

---

## 6. Architecture & conventions

### Page Object Model
- Every page/area is a class in `pages/` that **extends `BasePage`** (which stores
  the `page: Page` and offers `navigateTo`, `getPageTitle`).
- `AllPages` is the single aggregator. Tests never `new` a page object directly —
  they do `const allPages = new AllPages(page)` in `beforeEach`, then call
  `allPages.loginPage.login(...)`, `allPages.cartPage.clickOnCheckoutButton()`, etc.
- Each POM holds a `locators` object (string selectors) and three kinds of methods:
  - **getters** → return a `Locator` (e.g. `getCheckoutButton()`),
  - **actions** → `clickX` / `fillX` / `searchX` (perform interactions),
  - **assertions** → `assertX` / `verifyX` (wrap `expect(...)`).

### Selector strategy (in order of preference observed)
1. `data-testid` / `data-test` attributes (preferred, used widely) — e.g. `[data-testid="add-to-cart-button"]`.
2. Text-based XPath — e.g. `//button[text()='Shop Now']`, `//h1[text()='All Products']`.
3. SVG-path XPath for icon-only buttons — e.g. the user-profile and add-to-cart icons.
   These are brittle; prefer a `data-testid` if the app exposes one.

### TypeScript / ESM rules — READ THIS
- The project is **pure ESM** (`"type": "module"`, `module: "nodenext"`).
- **Relative imports MUST use the `.js` extension**, even though the files are `.ts`.
  ✅ `import AllPages from '../pages/AllPages.js';`
  ❌ `import AllPages from '../pages/AllPages';`  (will fail to resolve)
- `tsconfig.json` is `strict` with `verbatimModuleSyntax` — import types with
  `import type { Page } from '@playwright/test'`.

### Adding a new Page Object
1. Create `pages/MyThingPage.ts` extending `BasePage`, with a `locators` object and
   getter/action/assertion methods. Mirror an existing page (e.g. `ContactUsPage.ts`).
2. Register it in `pages/AllPages.ts`: add the import (with `.js`), the field, and the
   `new MyThingPage(page)` line in the constructor.
3. Use it from tests via `allPages.myThingPage.<method>()`.

### Adding a new test
- Add it to `tests/ecommerce.spec.ts` (or a new `tests/*.spec.ts` — `testDir` is `tests/`).
- Use `test.step(...)` to group multi-stage journeys (this is the existing convention).
- Generate fresh accounts with ``const email = `test+${Date.now()}@test.com` `` to keep
  registration tests idempotent.

---

## 7. playwright.config.ts notes

- `testDir: ./tests`, `fullyParallel: true`, `timeout: 60s`.
- On CI: `forbidOnly`, `retries: 1`, `workers: 1`. Locally: `retries: 0`.
- `baseURL: https://storedemo.testdino.com/` → tests use `page.goto('/')` and relative paths.
- `use`: `headless: true`, `trace: on-first-retry`, `screenshot: only-on-failure`, `video: retain-on-failure`.
- **Reporters:** `html` (→ `playwright-report/`), `blob` (→ `blob-report/`, for shard
  merging), and `json` (→ `playwright-report/report.json`). The HTML **and** JSON
  reporters must both stay enabled for TestDino to ingest results.
- Only one `projects` entry: `chromium` (Desktop Chrome).

---

## 8. Test catalog (`tests/ecommerce.spec.ts`)

Shared helpers in the spec: `login()`, `login1()` (uses `USERNAME1`), `logout()`.
`beforeEach` builds `AllPages` and navigates to `/`.

1. Verify that user can login and logout successfully
2. Verify that user can update personal information
3. Verify that User Can Add, Edit, and Delete Addresses after Logging In
4. Verify that user can change password successfully (and reverts it back)
5. Verify that the New User is able to add Addresses in the Address section
6. Verify that User Can Complete the Journey from Login to Order Placement
7. Verify user can place and cancel an order
8. Verify that a New User Can Complete the Journey from Registration to a Single Order Placement
9. Verify that user can add product to cart before logging in and complete order after logging in
10. Verify that user can filter products by price range
11. Verify if user can add product to wishlist, move it to cart and check out
12. Verify new user views and cancels an order in my orders
13. Verify That a New User Can Complete the Journey from Registration to Multiple Order Placement
14. Verify that the new user can Sign Up, Log In, and Navigate to the Home Page
15. Verify that user can fill the Contact Us page successfully
16. Verify that user can submit a product review
17. Verify that user can edit and delete a product review
18. Verify that user can purchase multiple quantities in a single order
19. Verify that all the navbar links work properly
20. Verify that user can delete a selected product from the cart

---

## 9. CI/CD (`.github/workflows/test.yml`)

- Triggers: every PR, a weekday cron (`30 3 * * 1-5`), and manual `workflow_dispatch`.
- `run-tests` job: matrix of 5 shards, each runs
  `npx playwright test --project=chromium --reporter=blob --shard=<i>/5` and uploads a
  `blob-report-<i>` artifact.
- `merge-reports` job: downloads all blob reports, runs
  `npx playwright merge-reports --config=playwright.config.ts ./all-blob-reports`,
  uploads the combined `Playwright Test Report`, then uploads to TestDino via `tdpw`.
- Secrets the workflow expects: `USERNAME`, `PASSWORD`, `NEW_PASSWORD`, and address vars
  (see the env mismatch note in §5).

---

## 10. Gotchas / things that bite

- **`.js` import extensions are mandatory** (see §6). This is the most common mistake.
- **`.env` is required** — a missing/empty `.env` makes login (and almost everything) fail.
- **Icon locators are SVG-path XPath** and break if the app's icons change; prefer `data-testid`.
- **Hard waits exist** (`page.waitForTimeout(...)` in `login`, `logout`, `signup`). Avoid
  adding more; prefer web-first assertions (`expect(locator).toBeVisible()`).
- **`HomePage` exposes `adjustPriceRangeSlider` (lower-case `a`)**, but the price-filter
  test calls `AdjustPriceRangeSlider` (upper-case `A`). If you work on the filter test,
  fix the casing on one side.
- **Do not commit secrets** — only `.env.example` belongs in git.
