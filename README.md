<div align="center">

# 🛒 Ecommerce Demo Store — Playwright E2E Tests

### Verify every shopper journey, on every run.

*Sign up, search, wishlist, fill the cart, check out, then track and cancel the order — the full Ecommerce flow, exercised end to end and reported to the cloud.*

<br/>

[![Playwright](https://img.shields.io/badge/Playwright-1.55-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Page Object Model](https://img.shields.io/badge/Pattern-Page%20Object%20Model-F2994A)](#-architecture)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/test.yml)
[![Reporting](https://img.shields.io/badge/Reporting-TestDino-7C3AED)](https://testdino.com/)

`Auth` &nbsp;·&nbsp; `Profile` &nbsp;·&nbsp; `Cart` &nbsp;·&nbsp; `Checkout` &nbsp;·&nbsp; `Orders` &nbsp;·&nbsp; `Wishlist` &nbsp;·&nbsp; `Reviews` &nbsp;·&nbsp; `Contact`

**System under test → [storedemo.testdino.com](https://storedemo.testdino.com)**

</div>

---

## 📖 Overview

This repository is an end-to-end UI test suite — built with **Playwright** and
**TypeScript** using the **Page Object Model** — for the **TestDino Ecommerce Demo
Store**. There is no application to build here; the tests drive a hosted demo store and
assert that its critical shopper journeys keep working.

**What it covers**

- 🔐 **Auth** — sign up, sign in, sign out, change password
- 👤 **Profile** — update personal info, add / edit / delete addresses
- 🔎 **Browse** — product search, price-range filter, navbar navigation
- 🛒 **Cart** — add / remove items, change quantities, subtotal & totals
- 💳 **Checkout** — shipping address, Cash on Delivery, order summary, place order
- 📦 **Orders** — view "My Orders", pagination, order details, cancel an order
- ❤️ **Wishlist** — add to wishlist, move to cart, check out
- ⭐ **Reviews** — write, edit, and delete product reviews
- ✉️ **Contact** — submit the Contact Us form

> 🤖 **Working with an AI agent?** Read [`AGENTS.md`](./AGENTS.md) — it documents the
> structure, conventions, commands, env vars, page-object catalog, and gotchas so the
> agent doesn't have to discover anything.

---

## 🧱 Tech stack

| Layer | Choice |
| --- | --- |
| Test runner | Playwright Test `^1.55` |
| Language | TypeScript `^5.9` (ESM, `module: nodenext`) |
| Runtime | Node.js 18+ |
| Design pattern | Page Object Model |
| Config | `dotenv` for credentials / test data |
| Browser | Chromium (Desktop Chrome) |
| CI | GitHub Actions (5-way sharded) |
| Reporting | HTML + JSON + Blob, uploaded to TestDino |

---

## 📂 Project structure

```
pages/                     Page Object Models (one class per page/area)
  ├─ BasePage.ts           Base class: holds `page`, navigateTo(), getPageTitle()
  ├─ AllPages.ts           Aggregator that instantiates every POM
  ├─ LoginPage.ts          Sign in / sign out
  ├─ SignupPage.ts         Create account
  ├─ HomePage.ts           Navbar, hero, price filter, About Us
  ├─ InventoryPage.ts      Product grid: search, add-to-cart, wishlist
  ├─ AllProductsPage.ts    "All Products" listing helpers
  ├─ ProductDetailsPage.ts Product page + review CRUD
  ├─ CartPage.ts           Cart management
  ├─ CheckoutPage.ts       Shipping, payment, order summary, place order
  ├─ OrderDetailsPage.ts   Order confirmation / details
  ├─ OrderPage.ts          "My Orders" list, view & cancel
  ├─ UserPage.ts           Account: personal info, addresses, security
  └─ ContactUsPage.ts      Contact Us form
tests/
  └─ ecommerce.spec.ts     All shopper journeys (20 tests)
.github/workflows/test.yml CI: sharded run → merge → TestDino upload
playwright.config.ts       Playwright configuration
.env.example               Template for required secrets
```

---

## 🚀 Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ and npm

### Install

```sh
npm install                  # dependencies
npm run install:browsers     # download Playwright browsers (one-time)
```

### Configure credentials

The suite logs into the demo store, so it needs real credentials and test data.

```sh
cp .env.example .env
# then edit .env and fill in the values
```

See [`.env.example`](./.env.example) for the full list (`USERNAME`, `PASSWORD`,
`USERNAME1`, `NEW_PASSWORD`, and the `S*` shipping-address vars). `.env` is git-ignored.

---

## 🧪 Running tests

| Command | Description |
| --- | --- |
| `npm test` | Run the full suite (headless, chromium) |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:ui` | Open the Playwright UI / time-travel runner |
| `npm run test:debug` | Step through with the Playwright Inspector |
| `npm run test:report` | Open the last HTML report |
| `npm run codegen` | Record a new test against the demo store |

Run a specific file or a test by name:

```sh
npx playwright test tests/ecommerce.spec.ts
npx playwright test -g "user can login and logout"
```

---

## 🏛 Architecture

Tests use the **Page Object Model**. Every page extends `BasePage`, and a single
`AllPages` aggregator wires them together so specs read like a script:

```ts
const allPages = new AllPages(page);
await allPages.loginPage.login(username, password);
await allPages.inventoryPage.searchProduct('GoPro HERO10 Black');
await allPages.cartPage.clickOnCheckoutButton();
await allPages.checkoutPage.clickOnPlaceOrder();
```

Each Page Object holds a `locators` map plus **getters** (return a `Locator`),
**actions** (`clickX` / `fillX`), and **assertions** (`assertX` / `verifyX`).

> ⚠️ This is a pure-ESM project — **relative imports must use the `.js` extension**
> (e.g. `import AllPages from '../pages/AllPages.js'`) even though the files are `.ts`.
> Details and more conventions live in [`AGENTS.md`](./AGENTS.md).

---

## 📊 Reporting

Playwright is configured with **HTML**, **JSON**, and **Blob** reporters
(`playwright.config.ts`). Open the HTML report locally:

```sh
npm run test:report
```

### Cloud reporting with TestDino

Both the HTML and JSON reporters must stay enabled for [TestDino](https://testdino.com/)
to ingest results. After a run produces `playwright-report/`:

```sh
npx --yes tdpw ./playwright-report --token="YOUR_TESTDINO_API_KEY" --upload-html
```

(`npm run report:upload` runs `tdpw` for you — pass your own `--token`.)

---

## 🔁 Continuous integration

[`.github/workflows/test.yml`](.github/workflows/test.yml) runs the suite on every PR, on
a weekday schedule, and on manual dispatch:

1. **Run** — a 5-way **shard matrix** executes chromium tests in parallel and uploads a
   blob report per shard.
2. **Merge** — all blob reports are merged into one HTML/JSON report
   (`playwright merge-reports`) and uploaded as an artifact.
3. **Report** — the merged report is pushed to TestDino.

---

## 🤝 Contributing

Pull requests and issues are welcome. This is a public repo — you don't need write
access; just **fork → branch → PR**. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the
flow and [`AGENTS.md`](./AGENTS.md) for conventions (POM structure, `.js` import
extensions, `test.step` grouping, and `data-testid` selectors where available).

## 📄 License

Released under the [MIT License](./LICENSE).
