# 🎭 Playwright Automation Portfolio

[![Playwright Tests CI](https://img.shields.io/badge/Playwright%20Tests-CI-2088FF?logo=githubactions&logoColor=white)](https://github.com/maksym-nyrka/playwright-portfolio/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-v1.63.0-45ba4b?logo=playwright)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)

An enterprise-grade end-to-end test automation portfolio built with **Playwright** and **TypeScript**, targeting the [Practice Software Testing (Toolshop v5)](https://practicesoftwaretesting.com) Angular Single Page Application and its backend REST API.

---

## 🌟 Key Architecture & Features

- **Page Object Model (POM) & Component Architecture**: Modular, maintainable abstractions for full pages (`HomePage`, `LoginPage`, `ProductPage`, `CartPage`, `CheckoutPage`, `ContactPage`) and reusable components (`NavBarComponent`).
- **Custom Fixture Injection**: Strongly-typed custom fixtures (`fixtures/pages.fixture.ts` and `fixtures/auth.fixture.ts`) eliminating repetitive instantiations.
- **Playwright Project Dependencies (Auth Setup)**: Automated pre-authentication via a dedicated `setup` project that generates and refreshes `.auth/customer.json` and `.auth/admin.json` storage states without manual overhead.
- **API Testing & Typed Client**: Full REST API coverage wrapping Playwright's `APIRequestContext` with typed interfaces, covering products, carts, orders, and authentication.
- **Network Interception & Mocking**: Demonstrates request routing, 500 error resilience testing, mock data injection, third-party analytics blocking, and offline replay via **Golden HAR**.
- **Visual Regression Testing**: Pixel-diff comparison using `expect(page).toHaveScreenshot()` with dynamic content masking (prices, stock status).
- **Advanced Capabilities**: Multi-tab synchronization, popup handling, file downloads into isolated test directories, and W3C Navigation Timing performance audits.
- **CI/CD Integration**: Fully configured GitHub Actions workflow running tests in headless mode and uploading HTML reports and traces on every push and PR.

---

## 📂 Project Structure

```
playwright-portfolio/
├── .auth/                          # Pre-authenticated browser sessions (auto-generated)
│   ├── customer.json
│   └── admin.json
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions CI pipeline
├── fixtures/                       # Custom Playwright test fixtures
│   ├── auth.fixture.ts             # Worker-scoped & test-scoped API fixtures
│   └── pages.fixture.ts            # Page Object Model fixture bindings
├── for_ai_agents/                  # AI agent guidelines & architectural context
│   ├── README.md                   # Agent system instructions & standards
│   └── TEST_PLAN.md                # Complete test plan & roadmap
├── mocks/                          # Mock recordings & Golden HAR files
│   ├── search.har
│   └── [HAR payload files]
├── pages/                          # Page Object Models
│   ├── BasePage.ts                 # Shared POM base class
│   ├── NavBarComponent.ts          # Navigation bar component model
│   ├── HomePage.ts                 # Catalog, search, filters & sort
│   ├── ProductPage.ts              # Product detail & add to cart
│   ├── CartPage.ts                 # Shopping cart review
│   ├── CheckoutPage.ts             # Multi-step checkout wizard
│   ├── ContactPage.ts              # Contact form & file attachment
│   └── LoginPage.ts                # Authentication page
├── tests/                          # Test suites
│   ├── global.setup.ts             # Project Dependency auth setup
│   ├── api/                        # REST API tests (auth, products, cart, orders)
│   ├── performance/                # W3C navigation timing & network load tests
│   └── ui/                         # UI, visual regression, mocking, auth & workflows
├── utils/                          # Utilities & Helpers
│   ├── api-client.ts               # Typed REST API client
│   └── test-data.ts                # Synthetic test data factories
├── playwright.config.ts            # Playwright Test configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Project dependencies & scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v9 or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/maksym-nyrka/playwright-portfolio.git
cd playwright-portfolio
npm install
```

Install Playwright browser binaries:
```bash
npx playwright install chromium --with-deps
```

### 3. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Default credentials for the demo sandbox are pre-configured:
```env
BASE_URL=https://practicesoftwaretesting.com
CUSTOMER_EMAIL=customer@practicesoftwaretesting.com
CUSTOMER_PASSWORD=welcome01
ADMIN_EMAIL=admin@practicesoftwaretesting.com
ADMIN_PASSWORD=welcome01
```

---

## 🧪 Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all test suites headlessly across configured projects |
| `npm run test:ui` | Open Playwright's interactive UI Mode (time travel, DOM inspection) |
| `npm run test:headed` | Run tests in headed browser with 1 worker |
| `npx playwright test --project=setup` | Run only the auth setup to refresh session files |
| `npx playwright test tests/ui/` | Run UI customer journey, visual, and mock tests |
| `npx playwright test tests/api/` | Run REST API test suites |
| `npx playwright test tests/performance/` | Run performance and load metric tests |
| `npx playwright test tests/ui/*visual* --update-snapshots` | Update visual regression baselines |
| `npm run report` | Open the generated HTML test report |

---

## 📊 Modules & Coverage

### 1. Authentication (`tests/ui/login.spec.ts`)
- Parameterized negative tests for invalid, missing, and malformed credentials.
- HTML5 client-side constraint validation (`aria-invalid` assertions).
- Pre-authenticated session reuse via `test.use({ storageState: '.auth/customer.json' })`.
- Session restoration verification and sign-out flows.

### 2. UI Customer Journeys (`tests/ui/`)
- **Search & Filters**: Category checkboxes, brand filters, eco-friendly badges, price sliders, sorting, pagination, and multi-product comparison.
- **Product Detail**: Quantity adjustments, out-of-stock badge assertions, favorites management.
- **Cart & Checkout**: Adding items, line quantity updates, item removals, guest vs authenticated multi-step checkout.
- **Contact Form**: Multi-field validation and file attachment uploads via `setInputFiles()`.

### 3. REST API Testing (`tests/api/`)
- Strongly typed HTTP client with automatic auth headers.
- Product catalog retrieval, search queries, schema assertions, and admin product creation.
- Cart lifecycle: creation, item additions, quantity modifications, and item deletion.
- Invoices & order history queries with authenticated bearer tokens.

### 4. Network Interception & HAR Replay (`tests/ui/intercept.spec.ts`, `tests/ui/mock-responses.spec.ts`, `tests/ui/har-replay.spec.ts`)
- Captures and asserts HTTP `QUERY` search requests and payloads.
- Intercepts requests using `page.route()` to test 500 internal server error fallbacks and empty search states.
- Blocks third-party tracking/analytics scripts without breaking page functionality.
- **Offline Golden HAR Replay**: Records network sessions and replays them offline using `page.routeFromHAR()`.

### 5. Visual Regression (`tests/ui/*.visual.spec.ts`)
- Baseline snapshot comparisons for homepage and product detail views.
- Dynamic element masking (prices, live inventory, rotating content) to prevent flaky diffs.
- Component-level snapshots (e.g., CO₂ rating badges).

### 6. Advanced Playwright Features (`tests/ui/multi-tab.spec.ts`, `tests/ui/downloads.spec.ts`, `tests/performance/performance.spec.ts`)
- **Multi-Tab**: Session state propagation across multiple tabs in a single `BrowserContext` and popup handling.
- **Downloads**: Verifying filename suggestions, saving streams to isolated test directories, and asserting file contents.
- **Performance**: Automated audits using W3C Navigation Timing API (`loadEventEnd`, `startTime`) and network request profiling.

---

## 🛠️ Continuous Integration (CI/CD)

The project includes a ready-to-run GitHub Actions workflow ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)) that:
1. Checks out the code and sets up Node.js with dependency caching.
2. Runs TypeScript type checking (`npx tsc --noEmit`).
3. Starts an isolated Toolshop stack with Docker (`docker-compose.ci.yml` and `scripts/start-toolshop.sh`).
4. Executes the UI, API, and performance suites against `http://localhost:4200` with automatic retries and trace recordings on failure.
5. Archives and publishes the Playwright HTML Report as a downloadable artifact.

CI uses a local Toolshop instance because GitHub-hosted runner IPs are challenged by Cloudflare before the live demo loads. Local runs still default to `https://practicesoftwaretesting.com`; set `BASE_URL=http://localhost:4200` and `API_BASE_URL=http://localhost:8091` to point them at the local stack.

The local stack runs the current `latest` Toolshop images. The UI sends product searches with the HTTP `QUERY` method, which PHP's built-in server (`php -S` / `artisan serve`) answers with `501 Not Implemented`. The API therefore runs under `php-fpm` behind nginx (`docker/nginx.conf`), which passes `QUERY`, its headers and its JSON body through to Laravel unchanged.

Visual regression specs run in CI against the local Toolshop stack using the committed Linux baselines (`*-chromium-linux.png`); the macOS baselines (`*-chromium-darwin.png`) remain for local runs against the live demo.
