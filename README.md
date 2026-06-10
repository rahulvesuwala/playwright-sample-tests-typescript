<div align="center">

# 🛒 Ecommerce Demo Store, Playwright E2E Tests

### A practical Playwright test suite for a real ecommerce flow.

This repo shows how to test a complete shopper journey with Playwright and TypeScript, from signup and login to cart, checkout, orders, wishlist, reviews, and contact forms.

<br />

![Playwright](https://img.shields.io/badge/Playwright-1.60-45ba4b?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![Pattern](https://img.shields.io/badge/Pattern-Page%20Object%20Model-f59e0b)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088ff?logo=githubactions)
![Reporting](https://img.shields.io/badge/Reporting-TestDino-7c3aed)
![Best Practices](https://img.shields.io/badge/Best%20Practices-TestDino%20Playwright%20Skill-6d28d9)

<br />

`🔐 Auth` · `👤 Profile` · `🛒 Cart` · `💳 Checkout` · `📦 Orders` · `💜 Wishlist` · `⭐ Reviews` · `📩 Contact`

<br />

**Demo site:** [storedemo.testdino.com](https://storedemo.testdino.com)

</div>

---

## 📌 What this repo is

This is a sample Playwright + TypeScript end-to-end test project for the TestDino Ecommerce Demo Store.

It is meant to help developers understand how a real Playwright test suite can be organized. The tests use page objects, shared fixtures, environment variables, CI sharding, Playwright reports, and optional TestDino report uploads.

This is not an ecommerce app. There is no frontend or backend to run here. The tests run against the hosted demo store.

## 👥 Who this is for

This repo is useful if you want to:

* Learn how to structure Playwright tests with TypeScript
* See a clean Page Object Model setup
* Test real ecommerce user flows end to end
* Understand how Playwright reports work
* Run tests locally and in GitHub Actions
* Upload Playwright results to TestDino
* Give AI coding tools clear project instructions through `AGENTS.md`

## ✅ What the tests cover

The test suite covers the main flows a shopper would use in an ecommerce store:

* Sign up for a new account
* Sign in and sign out
* Change password
* Update profile information
* Add, edit, and delete addresses
* Search products
* Filter products by price
* Open product details
* Add products to the cart
* Remove products from the cart
* Update cart quantity
* Place an order
* View order details
* Cancel an order
* Add products to the wishlist
* Move wishlist items to the cart
* Write, edit, and delete product reviews
* Submit the Contact Us form

## 🧰 Tech stack

| Area               | Used in this repo                         |
| ------------------ | ----------------------------------------- |
| Test runner        | Playwright Test                           |
| Language           | TypeScript                                |
| Runtime            | Node.js 18+                               |
| Module system      | ESM                                       |
| Browser            | Chromium                                  |
| Test structure     | Page Object Model + custom fixtures       |
| Environment config | dotenv                                    |
| CI                 | GitHub Actions                            |
| Reports            | Playwright HTML, JSON, and Blob reports   |
| Cloud reporting    | TestDino using `tdpw`                     |
| AI guidance        | `AGENTS.md` and TestDino Playwright Skill |

## 📁 Project structure

```text
.
├── pages/
│   ├── BasePage.ts
│   ├── AllPages.ts
│   ├── LoginPage.ts
│   ├── SignupPage.ts
│   ├── HomePage.ts
│   ├── InventoryPage.ts
│   ├── AllProductsPage.ts
│   ├── ProductDetailsPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── OrderDetailsPage.ts
│   ├── OrderPage.ts
│   ├── UserPage.ts
│   └── ContactUsPage.ts
├── tests/
│   ├── fixtures.ts
│   └── ecommerce.spec.ts
├── .agents/
│   └── skills/
│       └── playwright-skill/
├── .github/
│   └── workflows/
│       └── test.yml
├── .env.example
├── AGENTS.md
├── CONTRIBUTING.md
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## ⚙️ Prerequisites

Before running the tests, make sure you have:

* Node.js 18 or later
* npm

## 🚀 Getting started

Clone the repo:

```bash
git clone https://github.com/testdino-hq/playwright-sample-tests-typescript.git
cd playwright-sample-tests-typescript
```

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npm run install:browsers
```

Create a local environment file:

```bash
cp .env.example .env
```

Then open `.env` and add the required test credentials and test data.

## 🔐 Environment variables

The tests use environment variables for login credentials and checkout address data.

Use `.env.example` as the reference.

| Variable          | What it is used for                              |
| ----------------- | ------------------------------------------------ |
| `USERNAME`        | Main test user email                             |
| `PASSWORD`        | Main test user password                          |
| `USERNAME1`       | Secondary test user email                        |
| `NEW_PASSWORD`    | Password used in password-change tests           |
| `S_FIRST_NAME`    | Shipping first name                              |
| `S_LAST_NAME`     | Shipping last name                               |
| `S_ADDRESS`       | Shipping address                                 |
| `S_COUNTRY`       | Shipping country                                 |
| `S_STATE`         | Shipping state                                   |
| `S_CITY`          | Shipping city                                    |
| `S_ZIP_CODE`      | Shipping ZIP or postal code                      |
| `S_MOBILE_NUMBER` | Shipping phone number                            |
| `TESTDINO_TOKEN`  | Optional token for uploading reports to TestDino |

Do not commit your `.env` file. It may contain private credentials.

## 🧪 Running tests

Run all tests:

```bash
npm test
```

Run tests with the browser visible:

```bash
npm run test:headed
```

Open Playwright UI mode:

```bash
npm run test:ui
```

Debug tests with Playwright Inspector:

```bash
npm run test:debug
```

Open the latest HTML report:

```bash
npm run test:report
```

Generate a new test with Playwright codegen:

```bash
npm run codegen
```

Run a specific spec file:

```bash
npx playwright test tests/ecommerce.spec.ts
```

Run tests by title:

```bash
npx playwright test -g "user can login and logout"
```

## 🏗️ How the test suite is organized

The project uses the Page Object Model.

Page objects are stored in the `pages/` folder. Each page object keeps the locators and actions for one page or feature area. This keeps the test files easier to read and avoids repeating selectors across tests.

`AllPages.ts` creates one typed place to access all page objects. The custom fixture in `tests/fixtures.ts` makes that available inside every test as `allPages`.

Example:

```ts
import { expect, test } from './fixtures.js';

test('shopper can place an order', async ({ allPages }) => {
  await allPages.loginPage.login(process.env.USERNAME!, process.env.PASSWORD!);
  await allPages.inventoryPage.searchProduct('GoPro HERO10 Black');
  await allPages.cartPage.clickOnCheckoutButton();
  await allPages.checkoutPage.clickOnPlaceOrderButton();

  await expect(allPages.orderDetailsPage.orderConfirmationMessage).toBeVisible();
});
```

The test reads like a user journey, while the detailed selectors stay inside the page objects.

## 📦 ESM import note

This project uses native ESM with TypeScript.

For local file imports, use `.js` extensions even when the source file is TypeScript.

Correct:

```ts
import AllPages from '../pages/AllPages.js';
```

Incorrect:

```ts
import AllPages from '../pages/AllPages';
```

This is required because the TypeScript files are compiled to JavaScript before running.

## 📊 Reports

Playwright creates test reports after a run.

This repo is configured to generate:

* HTML report
* JSON report
* Blob report

Open the local HTML report:

```bash
npm run test:report
```

The HTML report is useful when you want to inspect failed tests, screenshots, traces, and step details locally.

## ☁️ Upload reports to TestDino

Uploading to TestDino is optional.

You can run the tests locally without a TestDino token. Use TestDino when you want shared reporting, test history, trend analysis, and better visibility for your team.

Upload a report manually:

```bash
npx tdpw upload ./playwright-report --token="YOUR_TESTDINO_TOKEN" --upload-html
```

Or use the npm script:

```bash
TESTDINO_TOKEN="YOUR_TESTDINO_TOKEN" npm run report:upload
```

In CI, store `TESTDINO_TOKEN` as a GitHub Actions secret.

## 🔁 Continuous integration

This repo includes a GitHub Actions workflow for running the tests in CI.

The workflow is designed for larger Playwright projects. It runs tests in shards, saves the Blob reports, merges them, generates the final report, and uploads the results to TestDino.

Typical CI flow:

1. Install dependencies
2. Install Playwright browsers
3. Run tests in shards
4. Upload Blob reports from each shard
5. Merge reports
6. Generate the final Playwright report
7. Upload results to TestDino

## 🤖 AI agent support

This repo includes `AGENTS.md`.

That file gives AI coding tools clear instructions about the project structure, commands, conventions, imports, fixtures, page objects, and common mistakes.

It is useful when working with tools like:

* Claude Code
* Cursor
* Windsurf
* GitHub Copilot

The repo also includes the TestDino Playwright Skill here:

```text
.agents/skills/playwright-skill/
```

The skill contains Playwright best practices for locators, assertions, fixtures, Page Object Model, CI, debugging, and reporting.

To install the TestDino Playwright Skill in another project:

```bash
npx skills add testdino-hq/playwright-skill
```

## 🧭 Common workflows

### Run the project locally

```bash
npm install
npm run install:browsers
cp .env.example .env
npm test
```

### Debug a failing test

```bash
npm run test:debug
```

Or debug one test by title:

```bash
npx playwright test -g "test title here" --debug
```

### View the latest report

```bash
npm run test:report
```

### Upload a report to TestDino

```bash
TESTDINO_TOKEN="YOUR_TESTDINO_TOKEN" npm run report:upload
```

## 🛠️ Troubleshooting

### Browser is not installed

Run:

```bash
npm run install:browsers
```

If you are running tests in Linux CI, install browser dependencies too:

```bash
npx playwright install --with-deps chromium
```

### Tests fail because credentials are missing

Check that:

* `.env` exists
* Required values are filled in
* The test account exists on the demo store
* The password is correct
* The `.env` file was not accidentally committed or ignored incorrectly

### Tests pass locally but fail in CI

Check that:

* GitHub Actions secrets are configured
* CI has all required environment variables
* The demo store is reachable from GitHub Actions
* Browser dependencies are installed in CI
* Blob reports are being uploaded and merged correctly

### TestDino upload fails

Check that:

* `TESTDINO_TOKEN` is set
* The token is valid
* The Playwright report was generated
* The upload path points to `./playwright-report`
* HTML and JSON reporters are enabled in `playwright.config.ts`

### Import errors mention ESM or missing modules

Check your relative imports.

This project uses ESM, so local imports should include `.js` extensions.

Correct:

```ts
import LoginPage from '../pages/LoginPage.js';
```

Incorrect:

```ts
import LoginPage from '../pages/LoginPage';
```

## 🤝 Contributing

Issues and pull requests are welcome.

Before opening a pull request, run:

```bash
npm test
```

Also review:

* `CONTRIBUTING.md`
* `AGENTS.md`

Keep changes focused. Avoid mixing unrelated refactors with test changes.

## 🔗 Useful links

* TestDino: https://testdino.com
* TestDino app: https://app.testdino.com
* TestDino Playwright Skill: https://github.com/testdino-hq/playwright-skill
* Playwright docs: https://playwright.dev/docs/intro
* Playwright browsers: https://playwright.dev/docs/browsers

## 📄 License

MIT
