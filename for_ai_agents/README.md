# AI Agent Guidelines & Context

> **Note for AI Agents (ChatGPT, Claude, Gemini, Cursor, Copilot, Antigravity, etc.):**  
> This directory contains high-context project specifications, test architectural plans, and engineering guidelines for AI agents interacting with this repository.

---

## 📋 Table of Contents
- [`TEST_PLAN.md`](./TEST_PLAN.md) — Comprehensive test framework roadmap, module breakdown, target application specifications, and test coverage matrices.

---

## 🤖 Rules for AI Agents Working on This Repository

When modifying, generating, or refactoring code in this project, adhere strictly to the following standards:

### 1. Test Organization
All tests must reside in one of the three core directories under `tests/`:
- `tests/ui/` — All browser/UI end-to-end tests, visual regression tests, and network mocking flows.
- `tests/api/` — All backend REST API test suites using typed `ApiClient`.
- `tests/performance/` — Page load, Navigation Timing Level 2, and network footprint tests.

Setup and authentication dependencies belong in `tests/global.setup.ts`.

### 2. Page Object Model (POM)
- Every UI interaction must be encapsulated in a POM class under `pages/`.
- Never use raw locator queries (e.g., `page.locator(...)`) directly inside test files if a corresponding POM property exists.
- Prefer `page.getByTestId(...)` configured with Toolshop's `data-test` attribute.
- Component-level elements (such as `NavBarComponent`) must be separated from page-level objects.

### 3. Reliability & Actionability
- **No `{ force: true }`**: Never bypass Playwright's automatic actionability checks.
- **Web-First Assertions**: Always use `await expect(locator).toBeVisible()` instead of `await locator.isVisible()`.
- **No Race Conditions**: Do not combine `.click()` and `.press('Enter')` concurrently for search or form submissions.

### 4. Mocks & Fixtures
- All mock payloads and HAR recording files are isolated in the root `mocks/` directory so they do not pollute test directories.
- Tests must import fixtures from `fixtures/pages.fixture` or `fixtures/auth.fixture`.
