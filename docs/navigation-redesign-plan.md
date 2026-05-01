# Navigation & Experience Redesign: "One Patient, One Screen, One Flow"

## Context

The app currently mirrors the database schema in its navigation: Appointments, Patients, Billing, Pharmacy are separate tabs because they're separate tables. But staff and doctors think in terms of patient encounters, not database entities. A single task — "see Mrs. Smith for her 10:30 checkup, start her consult, bill her" — requires bouncing between 3-4 tabs. This redesign collapses the experience into a single patient encounter hub.

**End state:** 2 tabs for staff/doctors (Today, Pharmacy), 3 for superadmins (+ Clinic). Everything about a patient encounter happens on one screen.

## Philosophy

> **"One patient, one screen, one flow."** Tabs represent distinct workflows (patient queue vs. inventory management), not distinct database tables. Once a patient is selected, every action — consult, bill, prescribe, edit — lives in one detail panel. No tab switching, no context loss.

---

## Phase 1: Global State Foundation

**Why:** The Today page has multiple sub-views (queue, billing list, search results, detail panel, modals) that need to share state without prop drilling. React Query handles server state. We need a lightweight UI state store for the "active environment" — which patient is selected, which filter is active, which modal is open. Without this, the component tree becomes a state management nightmare.

### 1.1 Add Zustand

- Install `zustand` (already a dependency? check. If not, `npm install zustand`)
- ~1KB, minimal API, works with React Query via selectors

### 1.2 Create `stores/todayStore.ts`

```
activeFilter: 'queue' | 'billing' | 'all'
searchQuery: string
debouncedSearch: string
selectedPatientId: string | null
activeModal: null | 'consult' | 'bill' | 'appointment' | 'patient-edit'
mobileDetailOpen: boolean
```

Actions: `setFilter`, `setSearchQuery`, `selectPatient`, `openModal`, `closeModal`, `toggleMobileDetail`

### 1.3 Create `hooks/usePatientSearch.ts`

- Wraps the RPC `get_patients_by_clinic` with a `search` parameter
- 300ms debounce via `use-debounce` (already in package.json, v10.0.4)
- Server-side pagination (limit 20)
- Returns: `{ patients, totalCount, isLoading, currentPage, setPage }`
- Stale time: 60s

---

## Phase 2: Navigation Rewrite

### 2.1 Rewrite `config/navigation.ts`

Replace 7 items with 4:

| Label | Path | Icon | Roles | Bottom Nav |
|---|---|---|---|---|
| Today | `/today` | `Calendar` | all | Yes |
| Pharmacy | `/pharmacy` | `Pill` | staff, superadmin | Yes |
| Clinic | `/clinic` | `Building2` | superadmin | Yes |
| Profile | `/profile` | `User` | all | No (hamburger) |

Remove `getBottomNavItems` and `getHamburgerNavItems` — they're thin wrappers. Keep `isActiveLink`.

### 2.2 Update `components/Layout.tsx`

- Add a redirect: `/` → `/today` (currently maps to `/dashboard` in `isActiveLink`)
- Remove dashboard-specific FAB logic

### 2.3 Update `components/AppSidebar.tsx`

- Uses new navItems from config — automatically reflects new nav structure
- Remove old `isActiveLink` special case for `/` → `/dashboard`

### 2.4 Update `components/BottomNav.tsx`

- Uses new navItems — automatically reflects 2-3 item bottom nav

### 2.5 Update `components/MobileNav.tsx`

- Hamburger items become: Profile only (since Dashboard and Settings are gone)
- Clinic switcher stays

### 2.6 Update `components/ui/floating-action-button.tsx` + `fab-utils.tsx`

- Reduce FAB actions to a single item: "New Patient" (walk-in registration)
- Opens patient creation modal on Today page

---

## Phase 3: The "Today" Page

**Constraint:** Page file MUST be <200 lines. All logic extracted to hooks and store.

### 3.1 Create `hooks/useTodayAppointments.ts`

- Refactors `useAppointments.ts` — fetches today's appointments via existing RPC
- Groups by status: In Progress, Waiting, Scheduled, Completed
- Returns `{ queue, isLoading, refetch }`
- Stale time: 30s (same as current)

### 3.2 Create `components/today/TodayPatientList.tsx`

Left panel (1/3 on desktop, full width on mobile). Three modes based on `activeFilter`:

- **Queue mode**: Groups appointments by status with color-coded indicators. Each row shows patient name, time, doctor, status dot.
- **Billing mode**: Patients with outstanding balances, sorted by amount due.
- **All mode**: Universal search results from `usePatientSearch`.

Each row is clickable → sets `selectedPatientId` in store → opens detail panel (push on mobile).

### 3.3 Create `components/today/TodayDetailPanel.tsx`

Right panel (2/3 on desktop, full-width push on mobile). Three sections:

1. **Current Appointment Card** (PRIMARY): Status badge, time, doctor, department, reason. Action buttons: Start Consult, Create Bill, Reschedule, Cancel.
2. **Patient Info Card** (SECONDARY): Name, age, gender, medical ID, contact. Edit button.
3. **History Section** (TERTIARY, collapsed): Past consultations with prescriptions inline, current meds summary. "No prior consultations" empty state.

Accepts `patientId` and `appointment` props. Fetches patient detail + history via existing React Query hooks.

Mobile: Has a "Back to Queue" button at top that sets `mobileDetailOpen: false` in store.

### 3.4 Create `components/today/TodayHeader.tsx`

- Search bar (full-width on mobile, flexible on desktop) with search icon
- Filter tabs: Queue | Billing | All
- "New Patient" button (mobile: hidden, handled by FAB)

### 3.5 Create `app/(app)/today/page.tsx` (<200 lines)

Thin orchestrator. Renders:
```
<TodayHeader />
<div className="flex">  {/* CSS grid for 1/3 + 2/3 split */}
  <TodayPatientList />   {/* w-1/3 on desktop, w-full on mobile when no selection */}
  <TodayDetailPanel />   {/* w-2/3 on desktop, w-full push on mobile */}
</div>
```

Responsive behavior:
- **Desktop (lg+)**: Side-by-side master-detail. Selecting a patient shows detail in right panel.
- **Mobile (<lg)**: Patient list fills screen. Selecting a patient pushes detail panel full-width with "Back to Queue" button. Zustand `mobileDetailOpen` controls this.

Modals (ConsultViewModal, BillingModal, AppointmentModal) render as overlays on top of everything. They're already dynamically imported with Suspense in the current Appointments page — same pattern.

### 3.6 Desktop/Mobile Transition

```
Desktop (lg+):
┌──────────┬─────────────────────────────┐
│  Queue   │  Detail Panel               │
│  (1/3)   │  (2/3)                      │
│          │                             │
│  ⬤ Smith │  ⬤ In Progress · 10:30 AM  │
│  ⬤ Jones │  Dr. Lee · Cardiology      │
│  ⬤ Kim   │  [Start Consult] [Bill]    │
│          │  ─────────────────────      │
│          │  Jane Smith · 32F · MED-001│
│          │  📞 555-0100               │
│          │  ─────────────────────      │
│          │  History [▸]               │
└──────────┴─────────────────────────────┘

Mobile (<lg):
State 1: Queue full-width
┌──────────────────────┐
│ 🔍 Search...         │
│ [Queue] [Billing]    │
│                      │
│ ⬤ Smith · 10:30 AM  │
│ ⬤ Jones · 11:00 AM  │
│ ⬤ Kim · 11:30 AM    │
└──────────────────────┘

State 2: Detail push (after tapping Smith)
┌──────────────────────┐
│ ← Back to Queue      │
│                      │
│ ⬤ In Progress       │
│ Dr. Lee · Cardiology │
│ [Start Consult]      │
│ ─────────────────    │
│ Jane Smith · 32F     │
│ ─────────────────    │
│ History [▸]          │
└──────────────────────┘
```

---

## Phase 4: The "Clinic" Tab (Superadmin Only)

**Constraint:** Each sub-page <200 lines. Must not be a junk drawer.

### 4.1 Create `app/(app)/clinic/layout.tsx`

Thin layout with a left sub-navigation (vertical tabs, not a full sidebar). Sub-nav items:
- Analytics
- Financials
- Staff
- Departments
- About
- Payments

Uses a simple vertical link list with active styling. This is a SECONDARY nav within the Clinic tab — it does not touch the global sidebar. Staff tabs (Members/Departments) and Settings tabs (Details/Payments) have been extracted into their own sub-nav items to flatten the hierarchy.

### 4.2 Create sub-pages

**`/clinic/page.tsx`** — Redirects to `/clinic/analytics`

**`/clinic/analytics/page.tsx`** — Migrates the analytics widgets from the current Dashboard page (stats cards, weekly chart). For superadmin only. Keep it focused: today's stats, this week's appointments chart, revenue summary.

**`/clinic/financials/page.tsx`** — Migrates billing reports from `/billing`: monthly revenue, outstanding balances, payment transactions. The existing `useBillingData` hook powers this.

**`/clinic/staff/page.tsx`** — Displays clinic members management. Uses the existing `ClinicMembersManagement` component. The Departments tab has been extracted into its own sub-page at `/clinic/departments`.

**`/clinic/departments/page.tsx`** — Displays clinic departments management. Uses the existing `ClinicDepartmentsManagement` component. Extracted from the former Staff tabs.

**`/clinic/about/page.tsx`** — Clinic details (name, address, timings). Uses the existing `ClinicDetailsManagement` component. Extracted from the former Settings Details tab. The old `/clinic/settings` now redirects here.

**`/clinic/payments/page.tsx`** — Payments and credits management. Uses the existing `PaymentsDashboard` component. Extracted from the former Settings Payments tab.

---

## Phase 5: Delete and Redirect

### 5.1 Delete old pages

Remove these directories:
- `app/(app)/dashboard/`
- `app/(app)/patients/`
- `app/(app)/billing/`
- `app/(app)/settings/`

### 5.2 Add redirects

In `next.config.mjs` or via middleware:
- `/` → `/today`
- `/appointments` → `/today`
- `/dashboard` → `/clinic/analytics` (superadmin) or `/today` (staff/doctor)
- `/patients` → `/today?filter=all`
- `/billing` → `/today?filter=billing`
- `/settings` → `/clinic/about` (superadmin) or `/today` (others)

### 5.3 Update FAB

Remove "New Appointment", "New Bill", "Settings" from FAB actions. Keep only "New Patient" (opens patient creation modal from Today page).

### 5.4 Clean up unused imports

Remove imports of deleted hooks from any remaining files. Check for stale references to `/dashboard`, `/patients`, `/billing`, `/settings` paths.

---

## Phase 6: Edge Cases & Data Integrity

### 6.1 Billing without an appointment

A staff member needs to create a bill for a walk-in patient. The "Billing" filter on Today shows patients with outstanding balances, but the "New Bill" action lives on the patient detail panel. For patients without an appointment, the detail panel still renders — it just shows patient info + billing history without the appointment card section.

### 6.2 Universal search performance

The `usePatientSearch` hook MUST:
- Debounce 300ms (use existing `use-debounce` package)
- Server-side paginate (limit 20 results)
- Hit the existing `get_patients_by_clinic` RPC with a search parameter
- Cancel in-flight requests on new input (React Query's `queryKey` change handles this)

### 6.3 Modal state preservation

When a staff member opens Create Bill modal for a patient, then clicks another patient in the queue, the billing modal MUST NOT lose its state. Solution:
- BillingModal is a full-screen overlay (already is via Drawer component)
- Its form state lives in react-hook-form within the modal component
- Clicking another patient in the background does NOT close the modal
- The modal's `handleClose` checks `formState.isDirty` and warns before discarding

### 6.4 Empty states

- **No appointments today**: "No appointments scheduled for today. [New Appointment]" calm empty state
- **No search results**: "No patients found matching '...'"
- **No billing items**: "All bills are settled"
- **No prior consultations**: "This is the patient's first visit" (as specified in the original merge plan)

---

## Verification

1. Navigate to `/` → redirects to `/today`
2. `/today` → shows today's patient queue, grouped by status
3. Click a patient → detail panel shows appointment first, patient info second, collapsed history third
4. Click "Start Consult" → full-screen consultation overlay opens from patient's detail
5. Click "Create Bill" → full-screen billing overlay opens, state preserved if background patient changes
6. Mobile: queue is full-width, tapping patient pushes detail panel with "Back to Queue"
7. First-time patient → "No prior consultations" empty state, appointment still prominent
8. Universal search → type 3+ characters, debounced results appear under "All" filter
9. `/patients` → redirects to `/today?filter=all`
10. `/billing` → redirects to `/today?filter=billing`
11. Bottom nav: 2 items for staff/doctor (Today, Pharmacy), 3 for superadmin (+ Clinic)
12. FAB: Only "New Patient" action
13. `/clinic` → superadmin sees sub-nav with Analytics, Financials, Staff, Departments, About, Payments
14. `/clinic` → staff/doctor redirected to `/today`
15. `/appointments` → redirects to `/today`
16. `/dashboard` → redirects to `/clinic/analytics` (superadmin) or `/today`
17. `/settings` → redirects to `/clinic/about` (superadmin) or `/today`

---

## Files Changed/Created

### New files
- `stores/todayStore.ts` — Zustand store for active environment
- `hooks/usePatientSearch.ts` — Debounced universal patient search
- `hooks/useTodayAppointments.ts` — Refactored today's queue hook
- `components/today/TodayHeader.tsx` — Search bar + filter tabs
- `components/today/TodayPatientList.tsx` — Queue/Billing/Search list
- `components/today/TodayDetailPanel.tsx` — Appointment + patient + history
- `app/(app)/today/page.tsx` — Today page orchestrator
- `app/(app)/clinic/layout.tsx` — Clinic sub-navigation layout
- `app/(app)/clinic/page.tsx` — Redirect to analytics
- `app/(app)/clinic/analytics/page.tsx` — Dashboard widgets
- `app/(app)/clinic/financials/page.tsx` — Billing reports
- `app/(app)/clinic/staff/page.tsx` — Clinic members management
- `app/(app)/clinic/departments/page.tsx` — Clinic departments management
- `app/(app)/clinic/about/page.tsx` — Clinic details/configuration
- `app/(app)/clinic/payments/page.tsx` — Payments and credits management

### Modified files
- `config/navigation.ts` — 7 items → 4 items
- `components/Layout.tsx` — Redirect `/` → `/today`
- `components/AppSidebar.tsx` — Minor: remove dashboard special case
- `components/BottomNav.tsx` — Auto-reflects new nav items
- `components/MobileNav.tsx` — Auto-reflects new nav items
- `components/ui/fab-utils.tsx` — Reduce to "New Patient" only

### Deleted files
- `app/(app)/dashboard/page.tsx` + `error.tsx`
- `app/(app)/patients/[[...slug]]/page.tsx` + `error.tsx`
- `app/(app)/billing/page.tsx` + `error.tsx`
- `app/(app)/settings/page.tsx` + `error.tsx`

### Preserved hooks (reused, not modified)
- `hooks/useAppointments.ts` — Used by Today queue
- `hooks/usePatientsWithRecords.ts` — Used by Today detail panel
- `hooks/useBillingData.ts` — Used by Clinic financials + Today billing filter
- `hooks/useAppointmentActions.ts` — Used by Today detail panel
- `hooks/useDashboardData.ts` — Used by Clinic analytics
- `hooks/useDoctorDashboardData.ts` — Used by Clinic analytics for doctors
- All consultation hooks — Unchanged
- `hooks/useFABAction.ts` — Updated for new FAB
- `hooks/usePrefetching.ts` — Updated for new routes
