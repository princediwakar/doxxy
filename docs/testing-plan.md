# Automated Testing Plan for Doxxy

## Context

The app currently has **no functioning automated tests**. Jest config was deleted (commit `fbb6066`), E2E tests are skeleton stubs that don't verify real behavior, and CI doesn't run any tests. We're in the middle of a major refactoring on `spaghetti-optimization` — extracting Supabase calls from components into focused hooks, centralizing query keys, and shrinking pages/components. The worst time to write unit tests is against moving code, so this plan **adapts to the refactoring**: start with what's stable, build outward as the code settles.

## Strategy: Two-Layer Safety Net

| Layer | What it protects | When it catches issues | Resistant to refactoring? |
|---|---|---|---|
| **E2E (Playwright)** | Full user flows: create patient → schedule → consult → bill | Regression after any change | Yes — tests the UI contract, not internals |
| **Unit (Jest + RTL)** | Hook logic: mutation callbacks, query key invalidation, calculations, validation | During development / before commit | No — breaks when hook signatures change |

**Recommended approach given active refactoring**: Build E2E first (survives all internal changes), then add unit tests for hooks once each hook stabilizes.

## Phase 1: Restore Jest Infrastructure (no tests yet, just the runner)

These 3 files were deleted in `fbb6066`. Restore them from git history verbatim, with minor updates for the current setup.

### 1.1 Create `jest.config.cjs`

Same config as the deleted one from commit `9e9d1da`:

```js
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  moduleDirectories: ['node_modules', '.'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/'],
};

module.exports = config;
```

### 1.2 Create `jest.setup.cjs`

Same setup as the deleted one — provides global mocks:

```js
require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Global mocks
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### 1.3 Create `__tests__/test-utils.tsx`

Mock data factories and test wrappers:

- `mockPatient`, `mockAppointment`, `mockBill`, `mockClinic`, `mockUser` factories
- `createTestQueryClient()` with `retry: false` to avoid retry noise in tests
- `renderWithProviders()` wrapping children in `QueryClientProvider`

### 1.4 Verify

Run `npm test` — should report 0 tests found, not a config error.

## Phase 2: E2E Tests — The Refactoring-Safe Safety Net

These tests click through the app in a real browser. They don't care how hooks are structured internally — they verify the user-visible contract. Perfect for an active refactoring branch.

### 2.1 Auth fixture for E2E tests

Create `tests/e2e/fixtures/auth.fixture.ts`:

- Playwright fixture that seeds a Supabase session into localStorage so tests run authenticated
- Uses `page.evaluate()` to inject `sb-<project-ref>-auth-token` into localStorage
- Requires a test user to exist in Supabase (create one if not already present and store credentials in `.env.local`)

### 2.2 Rewrite existing E2E tests with real verification

**`tests/e2e/auth.spec.ts`** — rewrite to verify:

1. Unauthenticated users get redirected from `/dashboard`, `/patients`, `/appointments` to `/auth`
2. Email validation works on the auth page
3. Password reset flow renders correctly

**`tests/e2e/patient-workflow.spec.ts`** → split into focused files:

- **`tests/e2e/patients.spec.ts`** — Create patient → verify appears in list → search → view details → edit → verify update
- **`tests/e2e/appointment-flow.spec.ts`** — Schedule appointment → verify in list → check in → start consultation
- **`tests/e2e/consultation-flow.spec.ts`** — Load consultation → fill mandatory fields → auto-save fires → complete consultation → verify appointment status is "Completed"
- **`tests/e2e/billing-flow.spec.ts`** — Create bill → add service items → verify auto-calc (quantity × rate = amount) → verify subtotal/tax/discount/total display → submit → verify bill appears in list

### 2.3 Reliability patterns for E2E

- Use `data-testid` attributes on key interactive elements (add to components as needed)
- Use `page.waitForResponse()` after mutations instead of `sleep()`:
  ```typescript
  await Promise.all([
    page.waitForResponse(resp =>
      resp.url().includes('/rest/v1/patients') && resp.status() === 201
    ),
    page.getByRole('button', { name: 'Create Patient' }).click(),
  ]);
  ```
- Prefer `page.getByRole()` selectors over CSS class selectors
- Each test creates unique data (timestamp-suffixed names) to avoid parallel run collisions
- Clean up test data in `afterAll` via direct Supabase API calls

## Phase 3: Unit Tests — After Hooks Stabilize

These test the data-access layer. Only write these once a hook's API is settled. The new hooks being created (like `usePatientMutations`, `useConsultationViewData`) follow a clean pattern that's very testable.

### Pattern for hook tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock supabase, useAuth, toast
// Render hook with QueryClientProvider wrapper
// Call mutationFn / queryFn through renderHook result
// Verify: correct supabase calls, toast calls, query invalidation
```

### Priority order (write as each hook stabilizes)

| Priority | Hook | Why |
|---|---|---|
| 1 | `usePatientMutations` | Simple, already stable (113 lines), high-impact flow |
| 2 | `useBilling` | Heavy calculation logic (subtotal/discount/tax) — pure arithmetic bugs caught here |
| 3 | `useAppointmentForm` | RPC + fallback pattern worth testing |
| 4 | `useAppointments` | Search, filter, pagination, tab categorization logic |
| 5 | `useConsultationForm` | Complex but in flux — wait until refactoring settles |

### Utility tests (always safe, never change with refactoring)

- **`__tests__/lib/query-keys.test.ts`** — verifies key factory output shapes (catches accidental key changes that break cache invalidation)
- **`__tests__/lib/error-utils.test.ts`** — tests `classifyError`, `getRetryDelay`, `shouldRetryError` (pure functions, no mocking needed)

## Phase 4: CI Integration

Update `.github/workflows/build-validation.yml`:

1. After lint step, add a unit test step:

   ```yaml
   - name: Run unit tests
     run: npm test -- --coverage
   ```

2. Add a separate `e2e` job (depends on build-validation passing):

   ```yaml
   e2e:
     needs: build-validation
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-node@v3
         with: { node-version: '18', cache: 'npm' }
       - run: npm ci
       - run: npx playwright install --with-deps chromium
       - run: npx playwright test --project=chromium
         env:
           NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
           NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
           SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
   ```

### Required GitHub secrets

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for test data setup/teardown)
- `E2E_TEST_USER_EMAIL` and `E2E_TEST_USER_PASSWORD`

## Order of Execution

| # | Task | Estimated Time | Depends On |
|---|---|---|---|
| 1 | Create `jest.config.cjs` | 15 min | Nothing |
| 2 | Create `jest.setup.cjs` | 15 min | Nothing |
| 3 | Create `__tests__/test-utils.tsx` | 30 min | Nothing |
| 4 | Verify `npm test` works (0 tests found) | 5 min | 1, 2, 3 |
| 5 | Build E2E auth fixture | 1.5 hr | Nothing |
| 6 | Rewrite `auth.spec.ts` E2E | 1 hr | 5 |
| 7 | Write `patients.spec.ts` E2E | 1.5 hr | 5 |
| 8 | Write `appointment-flow.spec.ts` E2E | 1.5 hr | 5 |
| 9 | Write `consultation-flow.spec.ts` E2E | 1.5 hr | 5 |
| 10 | Write `billing-flow.spec.ts` E2E | 1.5 hr | 5 |
| 11 | Unit tests for `usePatientMutations` | 1 hr | Hook is stable |
| 12 | Unit tests for `useBilling` calculations | 2 hr | Hook is stable |
| 13 | Remaining hook unit tests | ~5 hr | Each hook stabilizes |
| 14 | CI integration | 45 min | All tests pass locally |

## Maintenance Rules

1. **No test file over 300 lines.** Split by concern. The `useBilling` hook (355 lines) justifies at least 2 test files: one for calculations, one for service item management.
2. **No test depends on another test's side effects.** Each test is independently runnable with its own `beforeEach` setup.
3. **E2E test data is namespaced.** Use timestamp-suffixed names to prevent collisions in parallel runs.
4. **E2E selectors use role-based queries or `data-testid`.** Never use CSS class selectors or nth-child.
5. **Unit tests live in `__tests__/` mirroring source structure.** E2E tests live in `tests/e2e/`.

## Potential Challenges

| Challenge | Mitigation |
|---|---|
| `identity-obj-proxy` not installed (needed for CSS mock) | Install it: `npm i -D identity-obj-proxy` |
| `ts-jest` v29 with Jest v30 compatibility | The deleted config used this exact combo and worked. If it breaks, pin ts-jest to v29 or upgrade to ts-jest v30. |
| `"type": "module"` in package.json vs `.cjs` config | Jest config stays `.cjs`. If test file `import` statements fail, add `extensionsToTreatAsEsm: ['.ts', '.tsx']` to jest config. |
| E2E tests flaky due to network timing | Use `page.waitForResponse()` + generous CI timeouts, not arbitrary `sleep()` calls. |
| Supabase session expires during E2E runs | Refresh the session in `beforeEach` via `page.evaluate()` re-seeding. |
| `useConsultationForm` is 669 lines (2x the CLAUDE.md limit) | Flag for refactoring separately. Test its 3 concerns (permissions, autosave, validation) in 3 separate files. |
