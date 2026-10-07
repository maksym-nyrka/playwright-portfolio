# Playwright Portfolio — Test Framework Plan

> **Target:** [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (Toolshop v5)  
> **API:** [api.practicesoftwaretesting.com](https://api.practicesoftwaretesting.com/api/documentation)  
> **Stack:** Playwright · TypeScript · Node.js v25

---

## Project Structure (Final)

```
playwright-portfolio/
│
├── .auth/                          # Saved auth sessions (gitignored)
│   ├── customer.json
│   └── admin.json
│
├── pages/                          # Page Object Model
│   ├── BasePage.ts                 ✅ done
│   ├── NavBarComponent.ts          ✅ done
│   ├── LoginPage.ts                ✅ done
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── ContactPage.ts
│   └── AccountPage.ts
│
├── fixtures/                       # Custom test fixtures
│   ├── pages.fixture.ts            ✅ done
│   └── auth.fixture.ts             (worker-scoped API auth token)
│
├── tests/
│   ├── global.setup.ts             ✅ done
│   │
│   ├── auth/
│   │   └── login.spec.ts           ✅ done (Module 1)
│   │
│   ├── ui/                         # Module 2 — UI flows ✅ done
│   │   ├── search.spec.ts
│   │   ├── product.spec.ts
│   │   ├── cart.spec.ts
│   │   ├── checkout.spec.ts
│   │   └── contact.spec.ts
│   │
│   ├── api/                        # Module 3 — API testing
│   │   ├── auth.api.spec.ts
│   │   ├── products.api.spec.ts
│   │   ├── cart.api.spec.ts
│   │   └── orders.api.spec.ts
│   │
│   ├── mocks/                      # Module 4 — Network interception
│   │   ├── intercept.spec.ts
│   │   ├── mock-responses.spec.ts
│   │   └── har-replay.spec.ts
│   │
│   ├── visual/                     # Module 5 — Visual regression
│   │   ├── homepage.visual.spec.ts
│   │   └── product.visual.spec.ts
│   │
│   ├── accessibility/              # Module 6 — Accessibility
│   │   └── a11y.spec.ts
│   │
│   └── advanced/                   # Module 7 — Advanced Playwright
│       ├── multi-tab.spec.ts
│       ├── downloads.spec.ts
│       └── performance.spec.ts
│
├── utils/
│   ├── api-client.ts               # Typed API helper wrapping request context
│   └── test-data.ts                # Test data factory (fake data generators)
│
├── .env                            ✅ done
├── .gitignore                      ✅ done
├── playwright.config.ts            ✅ done
├── tsconfig.json                   ✅ done
└── TEST_PLAN.md                    ✅ this file
```

---

## Modules

### ✅ Module 1 — Authentication (done)
**File:** `tests/auth/login.spec.ts`

| Feature | Demonstrated |
|---|---|
| Page Object Model | `LoginPage`, `NavBarComponent` |
| Component-level POM | `NavBarComponent` |
| Custom fixtures | `loginPage`, `navBar` injected automatically |
| `globalSetup` | Pre-authenticates both roles once |
| `storageState` | Saves and restores login sessions |
| `test.describe` + `test.use()` | Per-group auth state |
| Parameterised tests | `for...of` over credential scenarios |
| Soft assertions | `expect.soft()` |
| `aria-invalid` attribute assertion | Angular HTML5 validation |

---

### ✅ Module 2 — UI Flows (done)
**Files:** `tests/ui/`

#### 2a. Search & Filters — `search.spec.ts`
- Search by keyword → assert products visible
- Search returns no results → assert empty state
- Filter by category (sidebar)
- Filter by brand
- Filter by price range (slider)
- Sort by price ascending/descending
- Paginate through results (`pagination-next`, `pagination-prev`)
- `eco-friendly-filter` checkbox
- Compare products (`compare-btn`)

**Playwright features:**
- `page.waitForResponse()` — wait for search API call to settle before asserting
- `locator.filter()` — chain filters on product cards
- `expect(locator).toHaveCount()` — assert result counts

#### 2b. Product Detail — `product.spec.ts`
- Navigate to product from search results
- Add to cart
- Add to favourites (requires auth → uses `storageState`)
- Out-of-stock badge visible for unavailable products
- CO₂ rating badge displayed
- Related products section

**Playwright features:**
- `page.waitForRequest()` — intercept add-to-cart API call
- `expect(locator).toContainText()` / `toHaveText()`

#### 2c. Cart — `cart.spec.ts`
- Add product to cart via UI
- Update item quantity
- Remove item
- Proceed to checkout button
- Cart persists across page navigation (SPA state)

**Playwright features:**
- Chained locator actions
- `expect(locator).toHaveValue()` for quantity input

#### 2d. Checkout — `checkout.spec.ts`
- Full checkout flow (logged in customer):
  - Step 1: Cart review
  - Step 2: Sign in / already signed in
  - Step 3: Billing address
  - Step 4: Payment method
  - Step 5: Confirm order
- Validation errors on missing required fields
- Test as guest vs authenticated

**Playwright features:**
- Multi-step form with `page.waitForURL()` between steps
- `storageState` to skip login step
- `test.step()` — named logical steps in trace viewer

#### 2e. Contact Form — `contact.spec.ts`
- Submit valid contact message
- File attachment upload (`data-test="attachment"`)
- Required field validation

**Playwright features:**
- `page.setInputFiles()` — file upload
- Waiting for success toast/notification

---

### ✅ Module 3 — API Testing (done)
**Files:** `tests/api/`  
**API Base:** `https://api.practicesoftwaretesting.com`  
**Swagger:** `/api/documentation`

#### Resources covered (from OpenAPI spec):

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /users/login` · `POST /users/register` |
| **Users** | `GET /users/me` · `PUT /users/{id}` · `GET /users` (admin) |
| **Products** | `GET /products` · `GET /products/{id}` · `GET /products/search` · `POST /products` (admin) |
| **Categories** | `GET /categories` · `GET /categories/{id}` |
| **Brands** | `GET /brands` · `POST /brands` · `PUT /brands/{id}` · `DELETE /brands/{id}` (admin) |
| **Cart** | `POST /carts` · `GET /carts/{id}` · `POST /carts/{id}/items` · `PUT /carts/{id}/items/{itemId}` · `DELETE /carts/{id}/items/{itemId}` |
| **Orders/Invoices** | `GET /invoices` · `GET /invoices/{id}` · `POST /invoices` (checkout) |
| **Favourites** | `GET /favourites` · `POST /favourites` · `DELETE /favourites/{id}` |

#### Test scenarios:

**`auth.api.spec.ts`**
- Login → receive JWT token
- Login with bad credentials → 401
- Register new user → 201
- Register duplicate email → 409

**`products.api.spec.ts`**
- GET all products → 200, array response
- GET product by ID → validate response schema
- Search products → query params work correctly
- POST product (admin auth) → 201
- POST product (no auth) → 401
- GET product that doesn't exist → 404

**`cart.api.spec.ts`**
- Create cart → get cart ID
- Add item to cart → verify quantity
- Update item quantity → verify updated
- Remove item → verify cart is empty
- Full cart → checkout flow (API only, no UI)

**`orders.api.spec.ts`**
- Get order history (customer)
- Get specific invoice
- Verify order appears after checkout

**Playwright features:**
- `request` context (API testing without browser)
- `APIRequestContext` with auth token in headers
- Worker-scoped `auth.fixture.ts` — get token once per worker
- JSON schema validation with `expect(response).toBeOK()`
- Chaining API calls (create → use ID → assert)

---

### ✅ Module 4 — Network Interception & Mocking (done)
**Files:** `tests/mocks/`

#### 4a. `intercept.spec.ts`
- Intercept product search API call and assert request params
- `page.waitForRequest()` to verify correct API call is made when user searches
- `page.waitForResponse()` to assert response is 200 before checking UI

#### 4b. `mock-responses.spec.ts`
- Mock `GET /products` to return custom product data → UI shows mocked product
- Mock API to return error 500 → assert UI shows error state / graceful fallback
- Mock `GET /products` to return empty array → assert "no results" message appears
- Block third-party analytics scripts (`page.route()` with abort) → page still loads

**Playwright features:**
- `page.route(url, handler)` — intercept and modify/mock responses
- `route.fulfill({ json: {...} })` — return fake JSON response
- `route.abort()` — block third-party requests
- `route.continue()` — passthrough with modifications

#### 4c. `har-replay.spec.ts`
- Record a product search session to HAR file
- Replay the HAR to run tests fully offline

**Playwright features:**
- `recordHar` / `routeFromHAR()` — HAR recording and replay

---

### 🔲 Module 5 — Visual Regression
**Files:** `tests/visual/`

#### `homepage.visual.spec.ts`
- Screenshot homepage → compare on re-run
- Mask dynamic regions (prices, live activity widget)
- Snapshot product card component

#### `product.visual.spec.ts`
- Screenshot product detail page
- Snapshot the CO₂ badge component
- Compare in multiple viewports (desktop vs mobile)

**Playwright features:**
- `expect(page).toHaveScreenshot()` — pixel diff
- `mask` option for dynamic content
- `maxDiffPixels` / `threshold` tuning
- `--update-snapshots` flag workflow

---

### 🔲 Module 6 — Accessibility
**Files:** `tests/accessibility/`

- Run axe-core accessibility audit on homepage (`@axe-core/playwright`)
- Run audit on product page
- Check keyboard navigation: Tab through nav, forms
- Verify all images have `alt` text
- Verify form labels are associated with inputs
- Check colour contrast of key UI elements

**Playwright features:**
- `@axe-core/playwright` integration
- `page.keyboard.press('Tab')` — keyboard navigation
- `expect(locator).toBeFocused()` — focus assertions

---

### ✅ Module 7 — Advanced Playwright Features (done)
**Files:** `tests/advanced/`

#### 7a. `multi-tab.spec.ts`
- Open product comparison in a new tab (`context.newPage()`)
- Share cookies between tabs (same `BrowserContext`)
- Assert both tabs show correct state
- Handle popups using `page.waitForEvent('popup')`

**Playwright features:**
- `context.newPage()` — multi-tab
- `page.waitForEvent('popup')` — handle popups

#### 7b. `downloads.spec.ts`
- Download invoice PDF from account page
- Assert file downloaded and has correct content-type
- Assert filename matches expected pattern

**Playwright features:**
- `page.waitForEvent('download')` — download handling
- `download.path()` / `download.suggestedFilename()` / `download.saveAs()`

#### 7c. `performance.spec.ts`
- Measure Time to Interactive using `performance.timing`
- Assert homepage LCP under threshold
- Check network requests count on product search

**Playwright features:**
- `page.evaluate()` — run JS in browser context
- `page.on('request')` / `page.on('response')` — request counting

---

## Playwright Features Coverage Matrix

| Feature | Module |
|---|---|
| Page Object Model | 1, 2 |
| Component POM | 1, 2 |
| Custom `test` fixtures | 1, 2, 3 |
| Worker-scoped fixtures | 3 |
| `globalSetup` / `globalTeardown` | 1 |
| `storageState` (save & restore sessions) | 1, 2 |
| `test.describe` / `test.use()` | 1, 2, 3 |
| Parameterised tests | 1, 2 |
| Soft assertions `expect.soft()` | 1, 2 |
| `test.step()` | 2d |
| `page.waitForRequest()` | 2b, 4a |
| `page.waitForResponse()` | 2a, 4a |
| `page.route()` — intercept & mock | 4b |
| `route.fulfill()` — fake responses | 4b |
| `route.abort()` — block requests | 4b |
| HAR recording & replay | 4c |
| `page.setInputFiles()` — file upload | 2e |
| `request` context — API testing | 3 |
| `expect(response).toBeOK()` | 3 |
| `toHaveScreenshot()` — visual diff | 5 |
| `@axe-core/playwright` — a11y | 6 |
| `context.newPage()` — multi-tab | 7a |
| `page.waitForEvent('popup')` | 7a |
| `page.waitForEvent('download')` | 7b |
| `page.evaluate()` — JS in browser | 7c |
| Mobile viewport projects | all |
| Cross-browser (Chrome, Firefox, Safari) | all |
| Trace viewer | all (on retry) |
| Screenshots on failure | all |
| Video on failure | all |
| HTML reporter | all |
| CI/CD (GitHub Actions) | final step |

---

## Build Order

```
✅ Module 1 — Auth (done)
🔲 Module 2 — UI Flows
🔲 Module 3 — API Testing
🔲 Module 4 — Network Mocking
🔲 Module 5 — Visual Regression
🔲 Module 6 — Accessibility
🔲 Module 7 — Advanced Features
🔲 Final    — GitHub Actions CI + README
```

---

## User Roles

| Role | Email | Password | Scope |
|---|---|---|---|
| Customer | `customer@practicesoftwaretesting.com` | `welcome01` | Browse, cart, checkout, favourites |
| Admin | `admin@practicesoftwaretesting.com` | `welcome01` | Manage products, brands, users, orders |
| Guest | — | — | Browse only, no cart persistence |

---

## Notes & Interview Talking Points

- **`data-test` vs `data-testid`**: The site uses `data-test`, not the Playwright default `data-testid`. Always inspect the real DOM; configure `testIdAttribute` in `playwright.config.ts`.
- **Angular SPA + `networkidle`**: Angular's zone.js polling prevents `networkidle` from ever resolving. Use `domcontentloaded` or wait for specific elements instead.
- **`globalSetup` doesn't inherit config**: It's a plain Node script. Never use `getByTestId()` there — use raw CSS `[data-test="..."]` selectors.
- **`storageState` for speed**: Avoids re-login in every test, keeping the suite fast and the login feature tested in isolation.
- **Worker vs test fixtures**: Use worker scope for expensive setup (API token, DB connection); use test scope for per-test isolation (page objects, fresh state).
