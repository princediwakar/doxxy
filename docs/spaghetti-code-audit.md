# Spaghetti Code Audit — Doxxy

## Context

A code quality audit of the Doxxy codebase (215 source files, ~43K lines of TypeScript/React) was conducted to identify spaghetti code, architectural issues, and critical areas for improvement. The project is a multi-tenant clinic management platform using Next.js 16 (App Router), TanStack React Query 5, Supabase, and Tailwind CSS.

---

## Findings Summary

### Critical Issues (High Impact, High Effort)

**1. God Hook: `useConsultationForm.ts` (667 lines, 21 hooks)**
- File: `hooks/consultation/useConsultationForm.ts`
- Mixes form state management, autosave, data fetching, business logic (credit deduction), validation, and permission checking all in one hook.
- Should be split into: `useConsultationAutosave`, `useConsultationPermissions`, `useConsultationCompletion` (each ~100-150 lines).

**2. God Component: `ProcurementEntrySheet.tsx` (718 lines)**
- File: `components/pharmacy/ProcurementEntrySheet.tsx`
- Handles file upload, OCR extraction, medicine lookup, batch DB inserts, inventory upserts, and form rendering — all in one component.
- Has 10 direct `getSupabase()` references and 3 empty `.catch(() => ({}))` error swallowers.
- Should be split into a data-access layer (upload, extract, save functions) + a thin presentation component.

**3. Massive Page Components (5 pages over 500 lines)**
- `app/(public)/page.tsx` — 887 lines (landing page)
- `app/(app)/create-clinic/page.tsx` — 650 lines (wizard form)
- `app/(app)/profile/page.tsx` — 572 lines
- `app/(app)/billing/page.tsx` — 537 lines
- `app/(app)/dashboard/page.tsx` — 527 lines
- `app/(app)/patients/[[...slug]]/page.tsx` — 524 lines (14 useStates)
- These mix data fetching, layout, state, and rendering. Pages should be thin orchestrators (50-100 lines max).

**4. Near-Identical Comparison Pages (95% duplicated, 6 files)**
- Files: `app/(public)/comparisons/doxxy-vs-{practo,lybrate,mfine,eka-care,clinicplus}/page.tsx` + `eka-care-alternative/page.tsx`
- 400-520 lines each, ~50 lines of difference per file.
- Should be a single data-driven `ComparisonTemplate` component with config objects.

**5. No Data-Access Abstraction — 23+ Files with Direct Supabase Calls**
- Every page/component that needs data writes `const supabase = getSupabase()` and makes raw `.from()` / `.rpc()` calls.
- Query patterns (clinic_id filtering, pagination, error handling) are duplicated across files.
- Makes testing/mocking nearly impossible and violates separation of concerns.
- Consider a repository layer or at minimum shared query hooks.

**6. Duplicate Type Definitions**
- `Consultation` type defined in both `types/consultation.ts` and `types/patients.ts` with incompatible shapes.
- `PrescriptionMedication` defined in 3 places with different field optionality.
- `ClinicDepartmentWithType` identically defined in both `types/doctor.ts` and `types/consultation.ts`.
- `types/core.ts` had a self-referencing export: `export * as DbTypes from './core'`. (Fixed)

**7. Direct Supabase Type Imports Bypassing Project Type Layer**
6 files import raw `Tables`, `Enums`, or `Json` directly from `@/integrations/supabase/types` instead of using the typed re-exports from `types/core.ts`:

| File | Raw Import | Should Use |
|------|-----------|------------|
| `app/(app)/dashboard/page.tsx` | `Enums<'appointment_status'\|'appointment_type'>` | `AppointmentStatus`, `AppointmentType` |
| `components/role/DoctorDashboard.tsx` | `Enums<'appointment_status'\|'appointment_type'>` | `AppointmentStatus`, `AppointmentType` |
| `components/superadmin/ClinicDetailsManagement.tsx` | `Tables<'clinics'>` | `DbClinic` |
| `components/consultation/consultationPrintUtils.ts` | `Tables<'appointments'\|'clinics'>` | `DbAppointment`, `DbClinic` |
| `hooks/consultation/useConsultationForm.ts` | `Tables<'appointments'\|'consultations'>`, `Json` | `DbAppointment`, `DbConsultationBase`, `DbJson` |
| `types/dashboard.ts` | `Enums<'appointment_status'\|'appointment_type'>` | `AppointmentStatus`, `AppointmentType` |

Additionally, `types/core.ts` needs a general-purpose `DbJson` type added (currently only has a narrowly-scoped `Json` tied to `clinics.operating_hours`).

**8. Dual Toast Systems**
- `sonner` toast used in most hooks, custom shadcn toast used in `useConsultationForm.ts`.
- Different APIs create UX inconsistency and extra bundle size.
- Should standardize on one toast library.

### Moderate Issues

**9. `any` Types Despite ESLint Error Rule**
- ESLint has `"@typescript-eslint/no-explicit-any": "error"` but `as any` casts exist in 8+ files.
- `InventoryTab.tsx` is the worst offender (6 `any` usages).
- Either enforce the rule or downgrade to `warn`.

**10. Commented-Out ErrorBoundary Wrappers**
- `app/(app)/create-clinic/page.tsx` and `app/(app)/profile/page.tsx` have ErrorBoundary imports and wrappers commented out.
- Means these pages have no error boundary — silent failures in production.

**11. Heavy Console Logging in Production Paths**
- `contexts/AuthContext.tsx` — 17 console.log/warn/error calls (runs on every page load).
- `app/api/procurement/extract/route.ts` — 15 console calls.
- `app/(public)/contact/page.tsx` — 5 console.log calls in production code.

**12. Duplicated RPC Calls Wasting Resources**
- `get_appointments_with_details_by_clinic` fetched independently in 3 hooks with different cache keys.
- Same data loaded 3 times when appointments, billing, and prescriptions are on screen together.

**13. Exposed Internal State Setters in `useClinicData`**
- `useClinicData` returns `setUserClinics`, `setActiveClinicState`, `setHasDoctorProfile` as public API.
- Breaks encapsulation — consumers can mutate internal state unpredictably.

**14. AppointmentsTable Prop Drilling**
- 7 callback props (`onAppointmentClick`, `onCancelAppointment`, etc.) passed through 2 component levels.
- 17 inline `onClick` arrow functions creating new references every render, defeating memoization.

### Additional Issues (Post-Audit Discovery)

**19. Suspense Fallback Spinner Duplicated 10+ Times (Easy Win)**
- The inline spinner div `<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>` is copy-pasted in Suspense fallbacks across 6 pages: `patients/[[...slug]]/page.tsx` (2×), `settings/page.tsx` (4×), `appointments/page.tsx` (2×), `consultation/[appointmentId]/page.tsx`, `dashboard/page.tsx`, `billing/page.tsx`.
- A `<Spinner />` component exists at `components/ui/loading.tsx` but is only imported in 3 files (`Layout.tsx`, `PrivateRoute.tsx`, `complete-profile/page.tsx`).
- **Fix:** Replace all inline spinner divs with `<Spinner />`.

**20. 33 Hooks Missing `staleTime`/`gcTime` (Easy Win)**
- Only 6 hooks configure query options (`useDashboardData`, `useInvoiceNumber`, `usePrefetching`, `useDoctorDashboardData`, `useHasDoctorProfile`, `useClinicDetails`).
- 33 hooks call `useQuery` with no cache configuration, causing unnecessary refetches on every mount/re-focus.
- **Fix:** Audit the top 10 most-frequently-mounted hooks and add appropriate `staleTime` (5 min typical, 0 for real-time data).

**21. `DoctorQuickOnboarding.tsx` Has 11 Direct Supabase Calls (Moderate)**
- File: `components/doctor/DoctorQuickOnboarding.tsx` (398 lines)
- Has its own `const supabase = getSupabase()` at line 24 and makes 11 raw `.from()`/`.rpc()` calls for profiles, doctors, clinic_departments, and clinic_members.
- Violates architectural invariant B (no UI DB calls). This was missed in the initial audit.
- **Fix:** Extract data operations into dedicated hooks (`useDoctorQuickOnboarding` and `useDoctorProfile`).

**22. No Next.js Route-Level `error.tsx` Files (Moderate)**
- Zero `error.tsx` files exist in the `app/` directory. Only 2 pages (profile, create-clinic) wrap content in the React `<ErrorBoundary>` component.
- All other routes have no error boundary — uncaught errors in nested layouts or pages will crash the entire app.
- **Fix:** Add `error.tsx` files to the top-level `app/` layout groups, plus one per major route segment (dashboard, billing, appointments, patients, pharmacy, settings).

**23. Hooks Over Size Limit: `useAuth.ts` (361 lines), `useClinicData.ts` (323 lines) (Moderate)**
- `useAuth.ts` at 361 lines mixes session management, role checking, clinic switching, profile fetching, and sign-out logic.
- `useClinicData.ts` at 323 lines exposes raw `setUserClinics`, `setActiveClinicState`, `setHasDoctorProfile` as public API (already noted in item 13).
- Both violate the 200-line hook invariant in CLAUDE.md.
- **Fix:** Extract sub-hooks: `useSessionListener`, `useClinicSwitcher`, `useProfileSync` from `useAuth`; encapsulate setters in `useClinicData`.

**24. Inconsistent Print Font Families (Easy Win)**
- `consultationPrintUtils.ts` line 101 uses system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto...`).
- `billingPrintUtils.ts` line 90 uses `'Inter', sans-serif`.
- Print outputs will look inconsistent between consultation and billing.
- **Fix:** Standardize both print utilities to use the same font stack.

**25. `app/api/medicines/route.ts` Missing Zod Input Validation (Moderate)**
- Only API route without `.safeParse()` or `.parse()` input validation.
- All other API routes validate input — this one accepts raw body without schema checks.
- **Fix:** Add a Zod schema for the medicines search/upsert request body.

**26. Inconsistent Lazy Import Pattern (Easy Win)**
- Components using named exports (`ConsultationViewModal`, `BillingModal`, `PaymentsDashboard`) require the brittle `.then(module => ({ default: module.Foo }))` workaround for `React.lazy()`.
- This pattern appears in 4 files (`appointments/page.tsx`, `settings/page.tsx`, `patients/[[...slug]]/page.tsx`).
- **Fix:** Either add wrapper default-export files or use Next.js `dynamic()` which handles named exports natively.

**27. Sparse E2E Test Coverage (Moderate)**
- Only 2 E2E test files: `tests/e2e/auth.spec.ts` and `tests/e2e/patient-workflow.spec.ts`.
- No tests for billing flow, pharmacy procurement, dashboard, appointment management, or settings.
- **Fix:** Add smoke tests for the 3 most critical flows: appointment → consultation → billing, pharmacy procurement, and clinic settings.

**28. `create-clinic/page.tsx` Still Has Direct `getSupabase()` (Moderate)**
- Line 35: `const supabase = getSupabase()` with a direct Supabase call at line 157 (`supabase.from('profiles').insert()`).
- Violates architectural invariant B. Was reported as having this fixed in commit `4dcc594` but one call remains.

### Lower Priority Issues

**29. Duplicated UI Patterns**
- Dialog footer pattern duplicated 3 times in `ClinicMemberComponents.tsx`.
- Metadata blocks duplicated across ~20 public pages.

**30. Hard-Coded Values**
- Base URL `"https://doxxy.neurovisionhospital.com"` hard-coded in 5 files.
- Magic spinner timeout (500ms) in 3 print utility locations.
- Font-family inline styles repeated 4 times in auth components.

**31. Error Handling Gaps**
- Most catch blocks use `console.error` instead of the centralized `showErrorToast()`.

**32. Other Minor Issues**
- README references `src/` directory and Vite (project uses Next.js with no `src/`).
- `components.json` references `src/index.css` and `bun` (should be `app/globals.css` and `npm`).
- `next.config.mjs` has `ignoreBuildErrors: true`, suppressing TypeScript errors.
- React polyfill workarounds (`lib/react-polyfill.ts`, `lib/ssr-polyfill.ts`) suggest unresolved bundling issues.
- Unused `useRouter` import in billing page.
- `SuccessMetrics` component commented out in landing page.

---

## Recommended Approach

### Phase 1: Critical Structural Fixes (est. 3-4 days)
1. **Extract shared comparison template** — biggest ROI. Replace 6 files (~2,600 lines) with 1 component + 6 config objects (~400 lines total).
2. ~~**Split the god hook** (`useConsultationForm.ts`) into focused hooks.~~ ✅ Done
3. ~~**Split `ProcurementEntrySheet.tsx`** into data-access + presentation layers.~~ ✅ Done
4. **Decompose the 6 largest page components** — extract data-fetching hooks, split UI into sub-components. (Partially done — billing, dashboard, patients, profile reduced. Landing page, create-clinic, comparison pages remain.)

### Phase 2: Type Safety & Consistency (est. 2-3 days)
5. ~~**Consolidate duplicate types** — merge `Consultation`, `PrescriptionMedication`, `ClinicDepartmentWithType` into single canonical definitions.~~ ✅ Done
6. ~~**Fix direct Supabase type imports** — replace raw `Tables<>`, `Enums<>`, `Json` imports.~~ ✅ Done
7. ~~**Standardize on one toast library** — sonner.~~ ✅ Done
8. **Fix remaining `any` types** — 2 `as any` casts remain in `lib/error-utils.ts`.
9. ~~**Restore ErrorBoundary wrappers** on create-clinic and profile pages.~~ ✅ Done
10. ~~**Guard or remove console.log** in production paths.~~ ✅ Done

### Phase 3: Data Access & Performance (est. 2-3 days)
11. ~~**Create shared query keys/hooks** for `get_appointments_with_details_by_clinic`.~~ ✅ Done
12. ~~**Add a thin repository layer** for the most-duplicated Supabase access patterns.~~ ✅ Done (hooks extracted)
13. **Encapsulate `useClinicData` setters** — expose action methods instead of raw setters. (Setters still exposed.)

### Phase 4: Easy Wins (est. 1-2 days) — NEW FINDINGS
14. **Replace Suspense fallback spinner divs** with existing `<Spinner />` component (10+ locations across 6 pages).
15. **Add `staleTime`/`gcTime`** to the 10 most-frequently-mounted hooks that currently lack cache configuration (33 hooks have none).
16. **Standardize print font families** — `consultationPrintUtils.ts` uses system font stack, `billingPrintUtils.ts` uses 'Inter'.
17. **Fix inconsistent lazy import patterns** — replace `.then(module => ({ default: module.Foo }))` workarounds with `next/dynamic` (4 files).
18. **Add Zod validation** to `app/api/medicines/route.ts` — only API route without input validation.
19. **Add `error.tsx` files** for route-level error boundaries — zero exist in the `app/` directory.

### Phase 5: Cleanup (est. 1-2 days)
20. **Extract `DoctorQuickOnboarding.tsx` Supabase calls** (11 direct calls) into dedicated hooks.
21. **Remove direct `getSupabase()` call** remaining in `create-clinic/page.tsx` line 35.
22. **Split `useAuth.ts` (361 lines) and `useClinicData.ts` (323 lines)** to meet 200-line hook limit.
23. **Extract hard-coded values** (base URL, timeouts) into constants.
24. **Fix inline onClick handlers** in `AppointmentsTable` with `useCallback`.
25. **Remove dead code** (commented-out SuccessMetrics, unused imports).
26. **Sync README and configs** with actual architecture.
27. **Add E2E smoke tests** for billing, pharmacy, and dashboard flows.

---

## Key Files to Modify

- `hooks/consultation/useConsultationForm.ts` — split into focused hooks
- `components/pharmacy/ProcurementEntrySheet.tsx` — data-access + UI split
- `app/(public)/comparisons/*/page.tsx` — replace with template + configs
- `app/(public)/page.tsx` — decompose landing page sections
- `app/(app)/patients/[[...slug]]/page.tsx` — extract hooks and sub-components
- `app/(app)/dashboard/page.tsx` — extract role-specific sections
- `app/(app)/billing/page.tsx` — extract data fetching and modal management
- `app/(app)/create-clinic/page.tsx` — extract wizard steps, restore error boundary
- `app/(app)/profile/page.tsx` — extract modals, restore error boundary
- `types/consultation.ts`, `types/patients.ts`, `types/prescriptions.ts`, `types/doctor.ts` — consolidate duplicates
- `types/core.ts` — add `DbJson` type, fix self-referencing export
- `app/(app)/dashboard/page.tsx` — replace `Enums<>` with `AppointmentStatus`/`AppointmentType`
- `components/role/DoctorDashboard.tsx` — replace `Enums<>` with named types
- `components/superadmin/ClinicDetailsManagement.tsx` — replace `Tables<>` with `DbClinic`
- `components/consultation/consultationPrintUtils.ts` — replace `Tables<>` with `DbAppointment`/`DbClinic`
- `hooks/consultation/useConsultationForm.ts` — replace `Tables<>`/`Json` with `Db*` types
- `types/dashboard.ts` — replace `Enums<>` with named types
- `hooks/useClinicData.ts` — encapsulate setters
- `components/appointments/AppointmentsTable.tsx` — useCallback for handlers
- `components/doctor/DoctorQuickOnboarding.tsx` — extract 11 Supabase calls into hooks
- `hooks/useAuth.ts` — split into focused sub-hooks (361 lines)
- `app/api/medicines/route.ts` — add Zod input validation
- `components/consultation/consultationPrintUtils.ts` — standardize print font with billing
- `components/billing/billingPrintUtils.ts` — standardize print font with consultation
- `app/(app)/**/page.tsx` (6 pages) — replace inline spinner divs in Suspense fallbacks with `<Spinner />`
- `app/` (all routes) — add Next.js `error.tsx` files for route-level error boundaries
- `hooks/use*.ts` (33 files) — add staleTime/gcTime to useQuery calls
- `tests/e2e/` — add smoke tests for billing, pharmacy, dashboard

## Verification

- Run `npx tsc --noEmit` to verify no type errors after consolidating types
- Run `npx eslint .` to verify `no-explicit-any` violations are resolved (2 remaining in error-utils.ts)
- Run existing Playwright E2E tests (`npx playwright test`)
- Manual smoke test: navigate through appointment → consultation → billing flow
- Manual smoke test: verify all 6 comparison pages render identically after template extraction
- Manual smoke test: verify pharmacy procurement flow still works after refactoring
- Verify all Suspense fallbacks render the consistent `<Spinner />` component
- Verify print output uses consistent font across consultation and billing
- Verify medicines API returns 400 for invalid request bodies after Zod validation added
