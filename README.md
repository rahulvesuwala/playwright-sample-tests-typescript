# 🎭 Playwright Sample Tests — TypeScript

A ready-to-run Playwright test repository with **5000 tests per scenario** covering every possible test result status. Designed to populate [TestDino](https://testdino.com) with realistic CI run data across all report views.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Setup: TestDino Token](#-setup-testdino-token)
- [Scenarios & Workflows](#-scenarios--workflows)
- [How to Run a Workflow](#-how-to-run-a-workflow)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)

---

## ⚡ Quick Start

1. **Fork or clone** this repo
2. **Add your TestDino token** as a GitHub secret (see below)
3. Go to **GitHub → Actions tab**
4. Pick a scenario and click **"Run workflow"**

---

## 🔑 Setup: TestDino Token

> [!IMPORTANT]
> You **must** add your TestDino token as a GitHub secret before running any workflow. Without it, results will NOT appear in TestDino.

### Steps:

1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following secret:

| Secret Name | Value |
|---|---|
| `TESTDINO_TOKEN` | Your TestDino API token |

> Get your token from: [TestDino Dashboard → Settings → API Token](https://testdino.com)

---

## 🧪 Scenarios & Workflows

There are **6 scenarios**, each with its own spec file (1000 tests) and GitHub Actions workflow.

---

### ✅ 1. All Pass

> Every test passes cleanly. Use this to see a 100% green run in TestDino.

| | |
|---|---|
| **Spec file** | `tests/all-pass.spec.ts` |
| **Workflow file** | `.github/workflows/all-pass.yml` |
| **Tests** | 1000 — all pass |
| **Shards × Workers** | 5 shards × 4 workers |
| **Retries needed** | No |

**To run:** Go to Actions → `All Pass — 1000 Tests` → Run workflow

---

### ❌ 2. All Fail

> Every test fails. Uses 8 different failure types (assertion error, thrown error, TypeError, rejected promise, etc.) so TestDino's error-grouping view gets fully exercised.

| | |
|---|---|
| **Spec file** | `tests/all-fail.spec.ts` |
| **Workflow file** | `.github/workflows/all-fail.yml` |
| **Tests** | 1000 — all fail |
| **Shards × Workers** | 5 shards × 4 workers |
| **Retries needed** | No |

> [!NOTE]
> The workflow uses `continue-on-error: true` so the report always uploads even though all tests fail.

**To run:** Go to Actions → `All Fail — 1000 Tests` → Run workflow

---

### 🔄 3. All Flaky

> Every test is flaky — fails on the first attempt and passes on retry. TestDino's flaky-test grouping, retry timelines, and flakiness rate views all get populated.

| | |
|---|---|
| **Spec file** | `tests/all-flaky.spec.ts` |
| **Workflow file** | `.github/workflows/all-flaky.yml` |
| **Tests** | 1000 — all flaky |
| **Shards × Workers** | 5 shards × 4 workers |
| **Retries needed** | **Yes — `--retries=1` is set in the workflow** |

> [!IMPORTANT]
> Retries must be enabled (`--retries=1`) for tests to show as **flaky** instead of **fail** in TestDino. The workflow already handles this.

**To run:** Go to Actions → `All Flaky — 1000 Tests` → Run workflow

---

### ⏭️ 4. All Skipped

> Every test is intentionally skipped with one of 8 distinct skip reasons. Use this to populate TestDino's skipped-test view.

| | |
|---|---|
| **Spec file** | `tests/all-skipped.spec.ts` |
| **Workflow file** | `.github/workflows/all-skipped.yml` |
| **Tests** | 1000 — all skipped |
| **Shards × Workers** | 5 shards × 4 workers |
| **Retries needed** | No |

**To run:** Go to Actions → `All Skipped — 1000 Tests` → Run workflow

---

### 🔀 5. All Permutations / Combinations

> 1000 tests covering **all 15 possible combinations** of the 4 test statuses (pass, fail, flaky, skip). Each combination has its own `describe` block.

| | |
|---|---|
| **Spec file** | `tests/all-permutations.spec.ts` |
| **Workflow file** | `.github/workflows/all-permutations.yml` |
| **Tests** | 1000 — across all 15 combinations |
| **Shards × Workers** | 5 shards × 4 workers |
| **Retries needed** | **Yes — `--retries=1` is set in the workflow** |

**The 15 combinations covered:**

| # | Combination |
|---|---|
| 1 | Pass only |
| 2 | Fail only |
| 3 | Flaky only |
| 4 | Skip only |
| 5 | Pass + Fail |
| 6 | Pass + Flaky |
| 7 | Pass + Skip |
| 8 | Fail + Flaky |
| 9 | Fail + Skip |
| 10 | Flaky + Skip |
| 11 | Pass + Fail + Flaky |
| 12 | Pass + Fail + Skip |
| 13 | Pass + Flaky + Skip |
| 14 | Fail + Flaky + Skip |
| 15 | Pass + Fail + Flaky + Skip |

**To run:** Go to Actions → `All Permutations — 1000 Tests (15 Combinations)` → Run workflow

---

### 🛡️ 6. Regression (UI Full Suite)

> Full UI regression suite covering ecommerce, cart, catalog, and profile actions. Uses real web UI operations on the demo store backend.
> 
> **Screenshots & Traces Enabled:** Because this is a real UI scenario, screenshots, videos, and trace files are automatically captured on failure and uploaded to TestDino.

| | |
|---|---|
| **Spec file** | `tests/regression.spec.ts` |
| **Workflow file** | `.github/workflows/regression.yml` |
| **Tests** | 1000 — E2E UI flows |
| **Shards × Workers** | 10 shards × 5 workers |
| **Traces & Media** | **Yes — automatically uploaded to TestDino on failure** |

> [!TIP]
> If a test in this scenario fails, you can open the TestDino run details, view the failure screenshot, and download or view the Playwright Trace file directly to see exactly what went wrong.

**To run:** Go to Actions → `Regression — UI Full Suite` → Run workflow

---


## ▶️ How to Run a Workflow

### Via GitHub UI (Manual Trigger)

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. Select the workflow you want (e.g., `All Pass — 1000 Tests`)
4. Click **"Run workflow"** → **"Run workflow"** (green button)

### Automatic Triggers

All workflows also trigger automatically on:
- **`push`** — any push to any branch
- **`pull_request`** — when a PR is opened or updated

---

## 📁 Project Structure

```
playwright-sample-tests-typescript/
│
├── tests/
│   ├── all-pass.spec.ts          # 1000 tests — all pass
│   ├── all-fail.spec.ts          # 1000 tests — all fail (8 error types)
│   ├── all-flaky.spec.ts         # 1000 tests — all flaky (fail attempt 0, pass on retry)
│   ├── all-skipped.spec.ts       # 1000 tests — all skipped (8 skip reasons)
│   ├── all-permutations.spec.ts  # 1000 tests — all 15 pass/fail/flaky/skip combos
│   └── regression.spec.ts        # 1000 tests — E2E UI full regression suite
│
├── .github/workflows/
│   ├── all-pass.yml              # Workflow: All Pass
│   ├── all-fail.yml              # Workflow: All Fail
│   ├── all-flaky.yml             # Workflow: All Flaky
│   ├── all-skipped.yml           # Workflow: All Skipped
│   ├── all-permutations.yml      # Workflow: All Permutations
│   └── regression.yml            # Workflow: Regression
│
├── playwright.config.ts          # Playwright config (TestDino reporter included)
├── package.json
└── README.md
```

---

## 💻 Local Development

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm ci
npx playwright install --with-deps
```

### Create `.env` file

```bash
TESTDINO_TOKEN=your_token_here
```

### Run a specific scenario locally

```bash
# All Pass
npx playwright test tests/all-pass.spec.ts --project=chromium --workers=4

# All Fail
npx playwright test tests/all-fail.spec.ts --project=chromium --workers=4

# All Flaky (retries required)
npx playwright test tests/all-flaky.spec.ts --project=chromium --workers=4 --retries=1

# All Skipped
npx playwright test tests/all-skipped.spec.ts --project=chromium --workers=4

# All Permutations (retries required)
npx playwright test tests/all-permutations.spec.ts --project=chromium --workers=4 --retries=1

# Regression (UI Full Suite)
npx playwright test tests/regression.spec.ts --project=chromium --workers=5
```

---

## 📊 TestDino Report Flow

```
Each Shard Run
──────────────
npx playwright test runs
    │
    ├── @testdino/playwright reporter → sends results LIVE to TestDino
    │
    └── blob report uploaded as artifact

After All Shards Complete
──────────────────────────
Reports merged → HTML report uploaded to TestDino
```

> [!TIP]
> Each workflow run creates a unique `TESTDINO_CI_RUN_ID` (`run_id-run_attempt`) so every CI run appears as a separate entry in TestDino, even if you re-run the same workflow.

---

## 🤝 Team Checklist

Before running workflows, make sure:

- [ ] `TESTDINO_TOKEN` secret is added to the repo
- [ ] You have access to the [TestDino dashboard](https://testdino.com)
- [ ] Node.js 20+ is used in local dev
- [ ] `npm ci` has been run locally before running tests
