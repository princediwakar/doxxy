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

### Lower Priority Issues

**15. Duplicated UI Patterns**
- Spinner JSX copy-pasted in 6+ locations (a `Spinner` component already exists at `components/ui/loading.tsx`).
- Dialog footer pattern duplicated 3 times in `ClinicMemberComponents.tsx`.
- Lazy import + Suspense pattern duplicated across 5 pages.
- Metadata blocks duplicated across ~20 public pages.

**16. Hard-Coded Values**
- Base URL `"https://doxxy.neurovisionhospital.com"` hard-coded in 5 files.
- Magic spinner timeout (500ms) in 3 print utility locations.
- Font-family inline styles repeated 4 times in auth components.

**17. Error Handling Gaps**
- `.catch(console.error)` pattern in 2 locations swallows errors silently.
- `catch(() => ({}))` empty catches in `ProcurementEntrySheet.tsx` (3 locations).
- Most catch blocks use `console.error` instead of the centralized `showErrorToast()`.

**18. Other Minor Issues**
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
2. **Split the god hook** (`useConsultationForm.ts`) into focused hooks.
3. **Split `ProcurementEntrySheet.tsx`** into data-access + presentation layers.
4. **Decompose the 6 largest page components** — extract data-fetching hooks, split UI into sub-components.

### Phase 2: Type Safety & Consistency (est. 2-3 days)
5. **Consolidate duplicate types** — merge `Consultation`, `PrescriptionMedication`, `ClinicDepartmentWithType` into single canonical definitions. Add a general-purpose `DbJson` type to `types/core.ts`.
6. **Fix direct Supabase type imports** — replace raw `Tables<>`, `Enums<>`, `Json` imports from `@/integrations/supabase/types` in 6 files with typed re-exports from `types/core.ts`.
7. **Standardize on one toast library** — pick sonner (already used in 7/8 hooks).
8. **Fix `any` types** or downgrade the ESLint rule to `warn`.
9. **Restore ErrorBoundary wrappers** on create-clinic and profile pages.
10. **Guard or remove console.log** in production paths (AuthContext, extract route).

### Phase 3: Data Access & Performance (est. 2-3 days)
11. **Create shared query keys/hooks** for `get_appointments_with_details_by_clinic` to deduplicate RPC calls.
12. **Add a thin repository layer** for the most-duplicated Supabase access patterns (appointments, patients, inventory).
13. **Encapsulate `useClinicData` setters** — expose action methods instead of raw setters.

### Phase 4: Cleanup (est. 1-2 days)
14. **Replace duplicated spinner/suspense patterns** with existing `Spinner` component.
15. **Extract hard-coded values** (base URL, timeouts) into constants.
16. **Fix inline onClick handlers** in `AppointmentsTable` with `useCallback`.
17. **Remove dead code** (commented-out SuccessMetrics, unused imports).
18. **Sync README and configs** with actual architecture.

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
- `contexts/AuthContext.tsx` — guard/remove console.log
- `hooks/useClinicData.ts` — encapsulate setters
- `components/appointments/AppointmentsTable.tsx` — useCallback for handlers

## Verification

- Run `npx tsc --noEmit` to verify no type errors after consolidating types
- Run `npx eslint .` to verify `no-explicit-any` violations are resolved
- Run existing Playwright E2E tests (`npx playwright test`)
- Manual smoke test: navigate through appointment → consultation → billing flow
- Manual smoke test: verify all 6 comparison pages render identically after template extraction
- Manual smoke test: verify pharmacy procurement flow still works after refactoring
- Check bundle size before/after removing duplicate toast library
