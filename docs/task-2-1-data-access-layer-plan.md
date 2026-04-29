# Task 2.1: Establish the Data-Access Layer (Supabase)

## Context

The codebase has 39 files calling `getSupabase()` directly. Per CLAUDE.md Rule 5c, **never call `getSupabase()` from a component or page** — all Supabase queries must live in hooks under `hooks/`. This task creates the data-access hooks for appointments, patients, and inventory domains, then migrates all UI components in those domains to use them.

Three domains in scope: **appointments**, **patients**, **inventory/pharmacy**. Other domains (billing, dashboard, profile, doctor onboarding, clinic management, consultations, prescriptions, contact) will be addressed in follow-up tasks.

## Files to Create (7 new files)

| # | File | Purpose | Est. lines |
|---|------|---------|------------|
| 1 | `lib/query-keys.ts` | Typed query key factory, single source of truth for all TanStack Query keys | ~90 |
| 2 | `hooks/usePatients.ts` | Patient list with debounced search + pagination | ~80 |
| 3 | `hooks/usePatientMutations.ts` | Create + update patient mutations with showErrorToast | ~80 |
| 4 | `hooks/usePatientsWithRecords.ts` | Extracted 160-line `fetchPatientsWithMedicalRecords` from patients page | ~170 |
| 5 | `hooks/usePatientAppointments.ts` | Fetch appointments for a specific patient | ~45 |
| 6 | `hooks/useInventory.ts` | Inventory list query + stock update mutation | ~80 |
| 7 | `hooks/useProcurements.ts` | Procurement list query + create-procurement mutation + storage upload + auth token hook | ~170 |

## Files to Modify (8 files)

| # | File | Change |
|---|------|--------|
| 1 | `components/patients/PatientModal.tsx` | Replace inline `useMutation` calls with `usePatientMutations` |
| 2 | `components/patients/PatientDetailsModal.tsx` | Replace inline queries with `usePatientAppointments` |
| 3 | `app/(app)/patients/[[...slug]]/page.tsx` | Replace `fetchPatientsWithMedicalRecords` + `const supabase` with `usePatientsWithRecords` hook |
| 4 | `components/pharmacy/InventoryTab.tsx` | Replace inline `useQuery` + `useMutation` with `useInventory` |
| 5 | `components/pharmacy/ProcurementsHistoryTab.tsx` | Replace inline `useQuery` with `useProcurements` |
| 6 | `components/pharmacy/ProcurementEntrySheet.tsx` | Replace inline Supabase DB ops, storage ops, and `fetchWithAuth` with hook exports |
| 7 | `hooks/useAppointmentForm.ts` | Update query keys to reference the factory |
| 8 | `hooks/useDoctors.ts` | Update query keys to reference the factory |

## Implementation Plan

### Phase 1: Foundation — Query Key Factory

**Create `lib/query-keys.ts`**

A const-asserted, typed object with factory methods for all query keys used across the three domains. Every new hook and modified file references this instead of raw string arrays.

```typescript
export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    byClinic: (clinicId: string) => ['appointments', clinicId] as const,
    byPatient: (patientId: string) => ['patientAppointments', patientId] as const,
  },
  patients: {
    all: ['patients'] as const,
    byClinic: (clinicId: string) => ['patients', clinicId] as const,
    withRecords: (clinicId: string, search: string, page: number) =>
      ['patientsWithMedicalRecords', clinicId, search, page] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    byClinic: (clinicId: string) => ['inventory', clinicId] as const,
  },
  procurements: {
    all: ['procurements'] as const,
    byClinic: (clinicId: string) => ['procurements', clinicId] as const,
  },
  doctors: {
    all: ['doctors'] as const,
    byClinic: (clinicId: string) => ['doctors', clinicId] as const,
    forAppointment: (clinicId: string) => ['doctorsForAppointment', clinicId] as const,
  },
  dashboard: {
    data: (clinicId: string) => ['dashboardData', clinicId] as const,
  },
  medicines: {
    search: (query: string) => ['medicines', query] as const,
    selected: (value: string) => ['selected-medicine', value] as const,
  },
} as const;
```

### Phase 2: Patients Domain

#### 2.1 Create `hooks/usePatientMutations.ts`

Extract the two inline `useMutation` calls from `PatientModal.tsx` (lines 113-150, 152-190):
- `createPatient` — inserts into `patients` table, scoped to `activeClinic.clinic_id`
- `updatePatient` — updates patient by `id`
- Both use `showErrorToast` in `onError`, `queryKeys` for cache invalidation
- Returns `{ createPatient, updatePatient }` (both are `useMutation` results)

#### 2.2 Migrate `components/patients/PatientModal.tsx`

- Remove: `import { getSupabase }` and `const supabase = getSupabase()`
- Remove: inline `createPatientMutation` and `updatePatientMutation` `useMutation` calls
- Add: `import { usePatientMutations } from '@/hooks/usePatientMutations'`
- Use: `const { createPatient, updatePatient } = usePatientMutations()`
- Update `onSubmit` to call `createPatient.mutate(values)` / `updatePatient.mutate(values)`
- The `onPatientCreated` callback from the page still works — it triggers `queryClient.invalidateQueries` from within the component's own callback

#### 2.3 Create `hooks/usePatients.ts`

Extract the patient list + search + pagination logic from the patients page (lines 54-72):
- `useQuery` with query key from factory
- Debounced search (300ms), pagination state (`currentPage`, `itemsPerPage`)
- Returns `{ patients, totalCount, isLoading, error, searchTerm, setSearchTerm, currentPage, setCurrentPage, totalPages }`

#### 2.4 Create `hooks/usePatientsWithRecords.ts`

Extract the `fetchPatientsWithMedicalRecords` async function (lines 39-198 of the patients page) into a hook:
- Fetches all patients, applies search filter + pagination
- Fetches doctors (tries RPC first, falls back to direct select with joins)
- For each patient: fetches consultations + prescriptions, enriches with doctor data
- Filters to completed consultations only
- Returns `{ patientsWithRecords, totalCount, isLoading, error }`

This is the most complex extraction. The function body moves verbatim to avoid regressions.

#### 2.5 Migrate `app/(app)/patients/[[...slug]]/page.tsx`

- Remove: `import { getSupabase }` and `const supabase = getSupabase()`
- Remove: `fetchPatientsWithMedicalRecords` function (lines 39-198)
- Remove: inline `useQuery` call with `queryKey: ["patientsWithMedicalRecords", ...]` (lines 229-245)
- Add: `import { usePatientsWithRecords } from '@/hooks/usePatientsWithRecords'`
- Use: `const { patientsWithRecords, totalCount, isLoading, error } = usePatientsWithRecords(activeClinic?.clinics?.id ?? '', searchTerm, currentPage, itemsPerPage)`
- Update `onPatientCreated` callback to use queryKeys factory

#### 2.6 Create `hooks/usePatientAppointments.ts`

Extract the inline appointment query from `PatientDetailsModal.tsx` (lines 51-74):
- Fetches appointments for a specific patient, joined with doctor name
- Uses `queryKeys.appointments.byPatient(patientId)`
- Returns standard `useQuery` result

#### 2.7 Migrate `components/patients/PatientDetailsModal.tsx`

- Remove: `import { getSupabase }` and `const supabase = getSupabase()`
- Remove: two inline `useQuery` calls (appointments, bills)
- Add: `import { usePatientAppointments } from '@/hooks/usePatientAppointments'`
- Use: `const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments(patient?.id)`
- The bills query is commented out in the UI — leave the query removal as-is

### Phase 3: Inventory / Pharmacy Domain

#### 3.1 Create `hooks/useInventory.ts`

Extract from `InventoryTab.tsx` (lines 40-76):
- `useQuery` fetching `inventory_items` with medicine join, ordered by expiry
- `useMutation` for updating stock (`updateStock`)
- Both use `queryKeys` factory and `showErrorToast`

#### 3.2 Migrate `components/pharmacy/InventoryTab.tsx`

- Remove: `import { getSupabase }` and `const supabase = getSupabase()`
- Remove: inline `useQuery` and `updateStockMutation` `useMutation`
- Add: `import { useInventory } from '@/hooks/useInventory'`
- Use: `const { inventory, isLoading, updateStock } = useInventory()`
- The `any` types in the component (`useState<any>`, `item.medicines as any`) are pre-existing and out of scope

#### 3.3 Create `hooks/useProcurements.ts`

Extract from `ProcurementsHistoryTab.tsx` (lines 22-37) and `ProcurementEntrySheet.tsx` (lines 196-332, 89-117, 336-347):

Three exports:
1. **`useProcurements()`** — simple list query (select `*` from `procurements`)
2. **`useCreateProcurement()`** — the 130-line multi-step mutation:
   - Phase 1: Insert procurement header
   - Phase 2: Batch-create unmapped medicines via `fetch("/api/medicines", ...)`
   - Phase 3: Insert `procurement_items` + upsert `inventory_items`
   - `onSuccess`: invalidate inventory + procurements
   - `onError`: `showErrorToast`
3. **`useProcurementStorage()`** — upload bill image + return public URL
4. **`useAuthToken()`** — tiny hook returning `supabase.auth.getSession()` access token (replaces `fetchWithAuth` in the sheet)

Note: The AI extraction `fetch("/api/procurement/extract/", ...)` stays in the component — it's a REST API call, not Supabase.

#### 3.4 Migrate `components/pharmacy/ProcurementsHistoryTab.tsx`

- Remove: `import { getSupabase }` and `const supabase = getSupabase()`
- Remove: inline `useQuery`
- Add: `import { useProcurements } from '@/hooks/useProcurements'`
- Use: `const { data: procurements, isLoading } = useProcurements()`

#### 3.5 Migrate `components/pharmacy/ProcurementEntrySheet.tsx`

- Remove: `import { getSupabase }` and `const supabase = getSupabase()`
- Remove: `fetchWithAuth` function (lines 336-347)
- Remove: inline `onSubmit` DB operations (lines 196-332)
- Remove: inline `handleFileUpload` storage ops (lines 89-117)
- Add: imports from `useProcurements` and `useAuthToken`
- The component-level `onSubmit` switches to `createProcurement.mutate(data, { onSuccess: () => { ... } })`
- `handleFileUpload` uses `uploadBillImage(file)` from the hook

### Phase 4: Appointments Domain Gap Filling

#### 4.1 Update `hooks/useAppointmentForm.ts`

Replace inline string query keys with `queryKeys` factory references:
- Line 28: `['patients', activeClinic?.clinic_id]` → `queryKeys.patients.byClinic(activeClinic?.clinic_id ?? '')`
- Line 49: `['doctorsForAppointment', clinicId]` → `queryKeys.doctors.forAppointment(clinicId)`

#### 4.2 Update `hooks/useDoctors.ts`

Replace inline `['doctors', clinicId]` with `queryKeys.doctors.byClinic(clinicId)`.

### Phase 5: Verification

After each migration, verify:

```bash
# 1. No getSupabase import in migrated file
grep "getSupabase" <file-path>
# Expected: no output

# 2. No supabase. calls in the file
grep "supabase\." <file-path>
# Expected: no output (except in hooks/ or contexts/)

# 3. TypeScript compiles
npx tsc --noEmit

# 4. No new `any` types in new hook files
grep ": any" hooks/usePatients.ts hooks/usePatientMutations.ts hooks/useInventory.ts hooks/useProcurements.ts

# 5. Query keys reference the factory
grep "queryKeys\." hooks/usePatients.ts hooks/useInventory.ts hooks/useProcurements.ts

# 6. Error handling uses showErrorToast (mutation onError)
grep "showErrorToast" hooks/usePatientMutations.ts hooks/useInventory.ts hooks/useProcurements.ts

# 7. New hooks under 200 lines
wc -l hooks/usePatients.ts hooks/usePatientMutations.ts hooks/usePatientsWithRecords.ts hooks/usePatientAppointments.ts hooks/useInventory.ts hooks/useProcurements.ts
```

### Implementation Order (Dependency Graph)

```
Step 1:  lib/query-keys.ts                    [NEW]   No dependencies
Step 2:  hooks/usePatientMutations.ts         [NEW]   Depends on Step 1
Step 3:  hooks/usePatients.ts                 [NEW]   Depends on Step 1
Step 4:  hooks/usePatientsWithRecords.ts      [NEW]   Depends on Steps 1, 3
Step 5:  hooks/usePatientAppointments.ts      [NEW]   Depends on Step 1
Step 6:  hooks/useInventory.ts                [NEW]   Depends on Step 1
Step 7:  hooks/useProcurements.ts             [NEW]   Depends on Step 1
Step 8:  Migrate PatientModal.tsx                      Depends on Step 2
Step 9:  Migrate PatientDetailsModal.tsx               Depends on Step 5
Step 10: Migrate patients/[[...slug]]/page.tsx         Depends on Step 4
Step 11: Migrate InventoryTab.tsx                      Depends on Step 6
Step 12: Migrate ProcurementsHistoryTab.tsx            Depends on Step 7
Step 13: Migrate ProcurementEntrySheet.tsx             Depends on Step 7
Step 14: Update useAppointmentForm.ts query keys       Depends on Step 1
Step 15: Update useDoctors.ts query keys               Depends on Step 1
```

### Domains NOT addressed (follow-up tasks)

These 19 files still call `getSupabase()` but are outside the three domains:
- **Billing**: `app/(app)/billing/page.tsx`
- **Dashboard**: `app/(app)/dashboard/page.tsx`, `components/role/DoctorDashboard.tsx`
- **Profile/Auth**: `components/BasicProfileEditor.tsx`, `app/(app)/complete-profile/page.tsx`, `app/(app)/profile/page.tsx`, `app/(app)/create-clinic/page.tsx`
- **Doctor**: `components/doctor/DoctorQuickOnboarding.tsx`, `components/doctor/MedicalCredentialsModal.tsx`, `lib/doctor-utils.ts`
- **Clinic management**: `components/superadmin/ClinicDepartmentsManagement.tsx`, `components/superadmin/ClinicDetailsManagement.tsx`, `components/superadmin/useClinicMembers.ts`
- **Consultations**: `components/consultation/ConsultationPreviewModal.tsx`, `components/consultation/ConsultationViewModal.tsx`
- **Prescriptions**: `components/prescriptions/PrescriptionViewModal.tsx`
- **Misc**: `app/(public)/contact/page.tsx`, `components/ui/medicine-combobox.tsx`, `lib/invitation-utils.ts`
- **Infrastructure (allowed)**: `contexts/AuthContext.tsx`

### Risk Notes

1. **`fetchPatientsWithMedicalRecords` is 160 lines**: The extraction carries regression risk. Mitigation: move the function body verbatim into the hook, test the patients page thoroughly after migration.

2. **`ProcurementEntrySheet` intertwines Supabase, REST API, and form state**: The extraction must be surgical. Mitigation: only extract Supabase calls; leave REST calls (`/api/procurement/extract/`, `/api/medicines`) and form state in the component.

3. **`useAppointments.ts` is already 318 lines (exceeds 200-line limit)**: Per the risk mitigation, I create `usePatientAppointments` as a separate file rather than bloating the existing hook further.

4. **Pre-existing `any` types in components**: `InventoryTab.tsx` uses `useState<any>` and `as any` casts. These are out of scope — the task is about the data-access layer, not fixing pre-existing type issues.
