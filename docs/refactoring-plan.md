# Doxxy Architectural Refactoring Plan

**Principal Staff Engineer Audit — June 2026**
**Revised: Compressed execution — 3 weeks, not 8**

---

## 0. Constraints

1. **No big-bang rewrites.** Every change is incremental. Structural changes (e.g., deleting `lib/data/`) happen only after all consumers are migrated and E2E tests confirm zero regressions.
2. **Business continuity paramount.** Appointment scheduling and billing must never regress.
3. **Supabase RLS remains the absolute source of truth for tenant isolation.** Application-layer tenant checks are UX hygiene, not security boundaries.
4. **Week 1 starts with safety nets, not with code changes.**

---

## 1. Architectural Diagnosis

### 1.1 Client-Side Supabase Writes (Critical Security Violation)

15 files import `getSupabase()` and query the database directly from the browser. Two perform **writes**:

| File | Operation | Severity |
|---|---|---|
| `hooks/consultation/useConsultationAutoSave.ts:40-50` | `.from('consultations').update()/.insert()/.delete()` | Critical |
| `hooks/consultation/useConsultationCompletion.ts:24-45` | `.from('appointments').update()` + `.rpc('deduct_appointment_credit')` | Critical |
| `hooks/useBillingQueries.ts` | 5-query waterfall for billing context | High |
| `hooks/consultation/useConsultationData.ts:70-104` | 4 parallel queries for consultation context | High |
| `components/BasicProfileEditor.tsx:63` | Profile CRUD | Medium |
| `components/superadmin/ClinicDetailsManagement.tsx:59` | Clinic details | Medium |
| `components/superadmin/ClinicMembersManagement.tsx:19` | Member management | Medium |
| `components/settings/WhatsAppConnection.tsx:51` | WhatsApp config | Medium |
| `components/pharmacy/ProcurementEntrySheet.tsx:49` | Procurement | Medium |
| `hooks/useAppointmentForm.ts:14` | Doctor lookup for appointments | Medium |
| `hooks/useAuth.ts:12` | Auth state queries | Low (auth concern) |
| `hooks/useAuthTokenHandlers.ts:10` | Token refresh | Low (auth concern) |
| `hooks/consultation/useConsultationPermissions.ts:28` | Permission check | Medium |

An attacker who modifies the browser client can bypass any server-side validation. The auto-save path writes to `consultations` and `prescriptions` tables without ever touching a Server Action. The completion path deducts credits from the browser.

### 1.2 Dual Data-Fetching Layers

`lib/data/` and `lib/queries/` both fetch from Supabase with no clear separation boundary. Both contain files with overlapping concerns (`patients.ts`, `doctors.ts`). A new developer has no way to know where to add a query.

### 1.3 `todayStore` is a God Object

`stores/todayStore.ts` (142 lines) couples modal visibility, selected records, form guards, and business logic (`createBill()`, `scheduleAppointment()`, `viewConsultation()`) into a single global mutable state bag. Components access it via `useTodayStore.setState()` directly, bypassing the store's own API.

### 1.4 `revalidatePath` is a Blunt Instrument

Every mutation in `actions/` calls `revalidatePath('/schedule')`. Only payments also revalidates `/clinic/payments`. Clinic staff edits, profile updates, and billing changes leave other pages stale.

### 1.5 Invoice Number Race Condition

`actions/billing.ts:99-106` has a JS fallback that generates invoice numbers using `Date.now() + Math.random()`. The fallback queries the `bills` table without a lock, making the `seq + 1` logic unsafe under concurrent requests. The migration `20260503180915_fix_invoice_number_race_condition.sql` likely added proper locking to the RPC — the JS path bypasses it entirely.

### 1.6 Proxy Exists but Lacks Tenant Validation

`proxy.ts` handles auth (redirects unauthenticated users to `/auth`) but does not validate that the authenticated user belongs to the clinic they're operating on. The codebase relies entirely on Supabase RLS for tenant isolation with no application-layer guard. If an RLS policy is misconfigured (and the migration history shows this has happened), there is no fallback.

### 1.7 Test Coverage is Dangerously Thin

5 unit test files in `tests/unit/`, covering only 3 action modules and 2 voice utilities. No integration tests. No E2E tests. Playwright is in `devDependencies` but no test files exist.

### 1.8 Zero Observability

`lib/logger.ts` is a thin console wrapper. No error tracking service. If `finalize_encounter` fails silently on the RPC, the first indication is a clinic calling to complain.

---

## 2. Week 1: Security & Stability

**Invariant:** When Week 1 ends, every consultation write goes through exactly one of two server entry points, both eventually delegating to a single `upsertConsultation(data)` function. No client-side code writes to the `consultations`, `prescriptions`, or `appointments` tables. The invoice number generator has exactly one path (the RPC). E2E smoke tests are green.

### Day 0 (immediate): Verify Realtime Prerequisites

Before any code work, verify Supabase Realtime infrastructure exists:

```sql
SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename IN ('appointments', 'bills', 'consultations', 'prescriptions', 'inventory_items', 'procurements', 'payment_transactions');
```

If any of the 7 tables are missing, add them now:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
-- repeat for each missing table
```

### Day 1: Write E2E Smoke Tests

3 Playwright tests as the regression gate. These lock in user-visible behavior, not anti-patterns:

1. **Patient booking flow:** Create patient → book appointment → verify appears in schedule queue
2. **Staff consultation workflow:** Select patient → start consultation → type notes → complete → verify status changes to "Completed"
3. **Billing flow:** Complete appointment → create bill → verify invoice number generated → verify bill appears in patient history

**Files to create:**
- `tests/e2e/smoke/patient-booking.spec.ts`
- `tests/e2e/smoke/consultation-workflow.spec.ts`
- `tests/e2e/smoke/billing-flow.spec.ts`

### Day 2–3: Move Auto-Save + Consolidate Save Paths (Do Once, Not Twice)

**Affected files:** `hooks/consultation/useConsultationAutoSave.ts`, `actions/consultations.ts`, `actions/encounter/complete.ts`

There are currently three paths that write consultation data:
1. `actions/consultations.ts:saveConsultation()` — manual save server action
2. `hooks/consultation/useConsultationAutoSave.ts:saveConsultation()` — client-side auto-save
3. `actions/encounter/complete.ts:submitEncounter()` — AI dictation completion

**Implementation — do all of this in one pass:**

1. Extract a shared `upsertConsultation(data)` function in `actions/consultations.ts` with Zod validation before write
2. Both `saveConsultation()` and `submitEncounter()` call it. The AI dictation path adds `finalize_encounter` RPC after the upsert.
3. `useConsultationAutoSave.ts` becomes a debounced caller (2000ms client-side debounce) of the server action
4. Wire `autoSaveMutation.isPending` to a "Saving..." indicator in the consultation header

### Day 4: Move Consultation Completion to Server Action

**Affected file:** `hooks/consultation/useConsultationCompletion.ts`

The `finalizeAppointment` function calls `supabase.from('appointments').update()` and `supabase.rpc('deduct_appointment_credit')` from the browser.

**Implementation:**
1. Create `completeConsultation(appointmentId, clinicId)` in `actions/consultations.ts`
2. The server action: updates appointment status → deducts credit → calls `revalidatePath`
3. The hook reduces to calling the server action and handling the result for toast display
4. **Idempotency:** Check if the appointment is already "Completed" before deducting credits. A double-click must not double-deduct.

### Day 5: Remove Invoice Number Race Condition

**Affected file:** `actions/billing.ts:63-107`

Remove the JS fallback that uses `Math.random()`. The RPC `generate_invoice_number` must be the only path.

**Implementation:**
1. Audit the RPC in migration `20260503180915_fix_invoice_number_race_condition.sql` — verify it uses `SELECT ... FOR UPDATE` or an advisory lock
2. Delete lines 75-106 (the fallback and last-resort paths)
3. If the RPC fails, return `{ error: 'Failed to generate invoice number. Please try again.' }` — do not silently generate a collision-prone fallback

### Day 6: Add Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

Configure alerting on: failed invoice generation, failed Razorpay verification, failed encounter completion, failed credit deduction.

### Day 7: Broaden `revalidatePath` Coverage

| Action | Current | Add |
|---|---|---|
| `clinic.ts` (updateMember, removeMember) | `/clinic` | `/clinic/staff`, `/clinic/departments` |
| `profile.ts` (all mutations) | `/profile` | `/clinic/staff` (member list shows profile data) |
| `doctors.ts` (all mutations) | `/clinic/staff`, `/profile` | — already correct |
| `patients.ts` (create/update) | `/schedule` | — correct |
| `inventory.ts` (all mutations) | `/pharmacy` | — correct |

### Week 1 Success Criteria

- [ ] `grep -r "getSupabase.*\.from.*\.(insert|update|delete|upsert)" hooks/ components/` returns zero results
- [ ] Invoice number generation has exactly one path. `Math.random()` does not appear in `actions/billing.ts`
- [ ] `upsertConsultation()` is the single write path for consultation data
- [ ] 3 Playwright smoke tests pass
- [ ] Sentry captures server action errors
- [ ] All 7 tables confirmed in `supabase_realtime` publication

---

## 3. Week 2: Data Flow & Realtime

**Prerequisite:** Week 1 invariants satisfied.

**Invariant:** When Week 2 ends, `lib/data/` is deleted. Realtime hooks are wired to all mutating tables. The two waterfall queries are collapsed into single server roundtrips. `todayStore.ts` holds only modal state (under 40 lines).

### Days 1–2: Merge `lib/data/` into `lib/queries/`

**New structure:**
```
lib/queries/
  appointments.ts   ← merge lib/data/today.ts + appointment query parts
  patients.ts       ← merge lib/data/patients.ts + lib/queries/patients.ts
  clinic.ts         ← merge lib/data/clinic.ts + lib/queries/clinic.ts
  doctors.ts        ← merge lib/data/doctors.ts + lib/queries/doctors.ts
  billing.ts        ← from Day 7 consolidation below
  financials.ts     ← merge lib/data/financials.ts
  pharmacy.ts       ← merge lib/data/pharmacy.ts + lib/queries/pharmacy.ts
  profile.ts        ← merge lib/data/profile.ts + lib/queries/profile.ts
  analytics.ts      ← unchanged
  consultation.ts   ← unchanged
```

All files get `'use server'`. Called from Server Components (directly) or from React Query hooks (via `useQuery`'s `queryFn`). Delete `lib/data/` directory after migration is verified.

### Day 3: Collapse Waterfall Queries (Latency Wins Only)

**Skip single-query components.** Architectural consistency alone is not a valid reason to touch working code in a startup. Only move queries where consolidation measurably reduces latency:

| Client File | Queries | Server Target | Latency win |
|---|---|---|---|
| `hooks/useConsultationData.ts` | 4 parallel queries | `lib/queries/consultation.ts` — single `getConsultationContext()` | 4×200ms → 1×50ms |
| `hooks/useBillingQueries.ts` | 5 queries | `lib/queries/billing.ts` — single `getBillingContext()` | 5×200ms → 1×50ms |

These are the only client→server migrations worth doing right now. The boundary-shifting single queries (profile editor, WhatsApp config, doctor lookup, etc.) are deferred — move them when the component needs a feature change, not before.

**Pattern:**
1. Create server function in `lib/queries/`
2. Replace `getSupabase().from(...)` in the hook with `useQuery({ queryFn: () => serverFunction(...) })`
3. Run E2E smoke tests after each migration
4. Commit atomically per file

### Day 4: Supabase Realtime for Cross-Role Propagation

**The problem:** `revalidatePath` solves server-cache staleness. It does NOT solve cross-role staleness. When a doctor completes a consultation, the front-desk staff still see "In Progress" until they manually refresh. In a clinic, 30 seconds is long enough for a double-booking.

**The architecture — change notification bus, never a data source:**

```
Doctor completes consultation
  → Server Action writes to DB (RLS-enforced)
  → Supabase Realtime broadcasts: "appointments row changed, clinic_id=X"
  → Staff browser receives event
  → React Query invalidates ['schedule', clinicId]
  → Refetch via server function (RLS-enforced, server-side)
  → Staff sees patient move to "Completed" — sub-second propagation
```

Create `hooks/useRealtimeSubscription.ts`:

```typescript
"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";

interface RealtimeConfig {
  table: string;
  clinicId: string;
  queryKeys: unknown[][];
}

export function useRealtimeSubscription({
  table,
  clinicId,
  queryKeys,
}: RealtimeConfig) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!clinicId) return;

    const supabase = getSupabase();

    const channel = supabase
      .channel(`realtime:${table}:${clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          for (const key of queryKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.error(`Realtime subscription failed for ${table}:`, err);
          // Fall back to staleTime-based refetching — degraded but functional
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, clinicId, queryKeys, queryClient]);
}
```

**Call sites must memoize `queryKeys`** to avoid resubscribing on every render:

```typescript
const queryKeys = useMemo(() => [['schedule', clinicId]], [clinicId]);
useRealtimeSubscription({ table: 'appointments', clinicId: clinicId!, queryKeys });
```

**Wiring points:**

| Page | Tables to subscribe | Query keys to invalidate |
|---|---|---|
| `TodayPageClient` (schedule) | `appointments`, `consultations`, `bills` | `['schedule', clinicId]`, `['patient', patientId, 'bills']`, `['consultation-data', appointmentId, clinicId]` |
| `BillingModal` | `bills` | `['bills', clinicId, month]` |
| `PharmacyPageClient` | `inventory_items`, `procurements` | `['pharmacy_inventory', clinicId]`, `['pharmacy_procurements', clinicId]` |
| `PaymentsDashboard` | `payment_transactions` | `['billingStats', clinicId, month]`, `['financials', clinicId]` |

Each page subscribes only to the tables it renders. No global subscription.

**What this replaces:**

| Before | After |
|---|---|
| `staleTime: 30_000` polling interval | Push-based: refetch only on actual change |
| `router.refresh()` after mutations | Automatic invalidation when other users mutate |
| Staff manually refreshing the schedule | Sub-second propagation from doctor to staff |

Keep `staleTime` values as a fallback (network resilience), but lower schedule to `staleTime: 5 * 60 * 1000` since realtime handles the fast path.

### Day 5: Decompose `todayStore.ts`

**1. URL state — already handled:**
- `selectedAppointment` → `searchParams.get('appointment')`
- Action handlers (`action=new-patient`, `action=view-consult`) → already in URL. Keep.

**2. Modal state — narrow Zustand store (`useTodayModalStore`):**
- `activeModal` → keep in Zustand (transient UI state)
- `appointmentModalOpen` → keep in Zustand (transient UI state)
- `appointmentModalPatient` → pass via modal component props, not store
- `mobileDetailOpen` → `useState` in `TodayPageClient`

**3. UI transient state — local `useState`:**
- `dirtyFormGuard` → `useState` in `BillingModal`
- `shakeTrigger` → `useState` in the component that needs it

**4. Business logic — component-level callbacks:**
- `createBill()` → callback in the component, calls server action
- `scheduleAppointment()` → callback, calls server action
- `viewConsultation()` → callback, sets URL params
- `selectAppointment()` → callback, updates URL searchParams

**After decomposition, the store should be ~30 lines:**
```typescript
interface TodayModalState {
  activeModal: ActiveModal;
  appointmentModalOpen: boolean;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  setAppointmentModalOpen: (open: boolean) => void;
}
```

Remove `useTodayStore.setState()` calls from `TodayPageClient.tsx:136`.

### Week 2 Success Criteria

- [ ] `lib/data/` directory no longer exists; all queries in `lib/queries/`
- [ ] `hooks/useConsultationData.ts` and `hooks/useBillingQueries.ts` are thin `useQuery` wrappers calling server functions
- [ ] Realtime hooks wired to schedule, billing, pharmacy, and payments pages
- [ ] `todayStore.ts` is under 40 lines, holds only modal state
- [ ] E2E smoke tests still green

---

## 4. Week 3: Cleanup & Ship

**Prerequisite:** Week 2 invariants satisfied.

**Invariant:** When Week 3 ends, every mutation revalidates all dependent pages. Tenant validation runs at the layout level. `tsc --noEmit` passes with `no-explicit-any` enabled. No further refactoring is scheduled.

### Day 1: Add Tenant Validation

Application-layer tenant checks are UX hygiene — they prevent users from seeing broken pages for clinics they don't belong to. They are NOT a security boundary. Supabase RLS is the security boundary.

**Approach: Layout-level guard.** In `app/(app)/layout.tsx`, `getActiveClinic(userId)` already resolves the user's clinic membership. Extend it:

1. Add `validateClinicAccess(userId, targetClinicId)` in `lib/auth-server.ts` — returns boolean
2. Call it in `app/(app)/layout.tsx` after existing profile/clinic checks
3. If access is denied, redirect to their first available clinic

Runs once per navigation (not per sub-resource). Do NOT add DB queries to `proxy.ts`.

### Day 2–3: Type Safety Hardening

- Replace `Record<string, unknown>` casts in the consultation chain with Zod-inferred types
- Remove the `as any` in `actions/encounter/complete.ts:43` — regenerate Supabase types after the `finalize_encounter` RPC is properly in the type definitions
- Run `npx supabase gen types typescript` to update `integrations/supabase/types.ts`
- Add `@typescript-eslint/no-explicit-any` to CI lint rules

### Day 4: Buffer & Verification

- Run full E2E smoke test suite 3 times consecutively (catch flakiness)
- Manual smoke test: booking → consultation → completion → billing on staging
- Verify Sentry dashboard is receiving errors
- Verify realtime propagation works end-to-end (open two browser windows, complete consultation in one, verify the other updates within 1 second)

### Day 5: Stop

No more refactoring. Go back to building features that sell.

### Week 3 Success Criteria

- [ ] Unauthenticated users blocked at proxy. Authenticated users without clinic membership blocked at layout
- [ ] `tsc --noEmit` passes with `no-explicit-any` rule enabled
- [ ] E2E smoke tests green (3 consecutive runs)
- [ ] Realtime propagation verified manually (two-browser test)
- [ ] Sentry dashboard shows errors with clinic context

---

## 5. Loading State & Optimistic UI Strategy

### 5.1 SSR Prefetch → React Query `initialData`

Server Component prefetches data and passes it as props. Client Component seeds React Query cache. User sees instant data from SSR. React Query refetches in background.

### 5.2 Single Server Functions Replace Query Waterfalls

Instead of 5 sequential client→Supabase queries, one server function runs all queries in parallel. 5×200ms client→Supabase roundtrips become 1×50ms client→Vercel + 5×10ms Vercel→Supabase. ~800ms → ~120ms.

### 5.3 No Optimistic UI on Multi-User Surfaces

The schedule queue is inherently multi-user. If Doctor A completes a consultation and we use optimistic UI, three systems touch the cache simultaneously:
1. `onMutate` optimistic update (Doctor A's browser)
2. `revalidatePath` in the server action (invalidates RSC tree)
3. Realtime invalidation (Staff B's browser)

Step 2 overwrites step 1. The patient card snaps to "Completed," then back to "In Progress" as RSC rehydration overwrites the cache, then settles on "Completed." **This flicker is worse than a loading spinner.**

Instead, use mutation pending state on the trigger element:

```typescript
const completeConsultation = useMutation({
  mutationFn: (appointmentId: string) => completeConsultationAction(appointmentId),
  onSuccess: () => {
    toast.success('Consultation completed');
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to complete consultation');
  },
});

<Button
  onClick={() => completeConsultation.mutate(appointmentId)}
  disabled={completeConsultation.isPending}
>
  {completeConsultation.isPending ? <Spinner /> : 'Complete Consultation'}
</Button>
```

The user sees a spinner for ~500ms, then the patient card moves to Completed via realtime propagation. Both the mutating user and observing users converge on server truth via the same mechanism.

**Where optimistic UI IS safe:** Single-user operations — form auto-save (Saving... indicator on consultation notes), draft creation, profile edits. These have no `revalidatePath` racing against them.

**Never optimistically show server-generated data** (invoice numbers). Use pending state.

---

## 6. Execution Order Dependency Graph

```
Day 0: Verify Realtime publication tables exist
     ↓
Week 1 Day 1: E2E smoke tests (baseline user flows)
     ↓
Week 1 Days 2-7: Server Actions + consolidate save paths + kill invoice race + Sentry + revalidatePath
     ↓
Week 2 Days 1-2: Merge lib/data into lib/queries
     ↓
Week 2 Day 3: Collapse waterfall queries (useConsultationData, useBillingQueries)
     ↓
Week 2 Day 4: Supabase Realtime subscription hooks
     ↓
Week 2 Day 5: Decompose todayStore
     ↓
Week 3 Days 1-3: Tenant validation + type hardening
     ↓
Week 3 Day 4: Buffer & verification
     ↓
Week 3 Day 5: STOP. Ship features.
```

**Rules:**
- Day 0 must pass before Week 1 Day 1 starts (can't test realtime propagation if publications don't exist).
- No Week 2 work begins until Week 1 invariants are satisfied.
- No Week 3 work begins until Week 2 invariants are satisfied.
- E2E tests must stay green through every commit.

---

## 7. The "Do Not Touch" List

| Area | Reason |
|---|---|
| **Supabase RLS policies** | 80+ migrations of iteration got them right. The risk of breaking tenant isolation outweighs any cleanup value. |
| **`integrations/supabase/`** (client.ts, server.ts, types.ts) | Foundation layer. Zero ROI on refactoring Supabase SDK wrappers. |
| **`components/ui/*`** (shadcn components) | Upstream-controlled. Do not fork. |
| **`components/consultation/ConsultationFormField.tsx`** | 300 lines of complex field rendering. Works correctly. Risk/reward ratio is terrible. |
| **`lib/voice/*`** (1,722 lines) | Voice pipeline (crypto, IndexedDB, streaming, Sarvam batch). Complex, moderately tested, client-heavy — but isolated with clear boundaries. Dynamic import (`next/dynamic` with `ssr: false`) is acceptable as a bundling optimization if needed. |
| **Edge functions** (`supabase/functions/`) | Deno runtime, separate deploy, working fine. |
| **Public marketing pages** (`app/(public)/`) | 40+ SEO-optimized pages. Stable. High traffic. |
| **WhatsApp integration** (`lib/whatsapp.ts`, `app/api/webhooks/whatsapp/`, `app/api/whatsapp/`) | External Meta API dependency. Fragile. Do not touch unless Meta changes their API. |
| **PWA / service worker** | Stable. Low ROI. |
| **`components/landing/`** | Marketing components. A/B tested. Stable. |
| **Medicine autocomplete** (`medicine-combobox.tsx`, medicines search) | Solved problem. Fuzzy search is DB-optimized. |
| **`components/consultation/ConsultationPDF.tsx`** | Already reworked. 464 lines. Verified correct as of June 2026. |
| **`ConsultationPreviewModal.tsx`** | Download/print/WhatsApp paths unified. Verified correct. |

---

## 8. What Was Cut (And Why)

| Cut item | Reason |
|---|---|
| **Integration tests with seed DB** | Playwright E2E smoke tests are sufficient safety net for a startup. Come back when you have dedicated QA or SOC2 requirements. |
| **`pgaudit` audit logging** | Premature unless you're undergoing HIPAA/SOC2 compliance audits this month. |
| **Custom structured JSON logging** | Sentry covers error observability. Console logs are fine for the rest. |
| **Migration squash / clean lineage** | Cosmetic. The migration history works. Don't touch it. |
| **Bundle analysis / dynamic import of voice module** | Not blocking anything. Do when performance data shows it's a problem. |
| **Boundary-shifting single queries** (profile editor, WhatsApp config, doctor lookup, etc.) | Architectural consistency alone is not a valid reason to touch working code. Move them when the component needs a feature change. |
| **CI pipeline for E2E tests** | Run them locally before merges. Add CI when the team grows beyond solo founder. |
