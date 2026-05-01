# Merge Patients into Appointments

## Context

Staff and doctors bounce between separate pages for one patient. The underlying job is one flow: find patient → see current appointment → act → reference history. This merges `/patients` into `/appointments` so everything happens on one page.

## Information Hierarchy

The detail panel has a clear order of importance:

1. **Current appointment** (PRIMARY) — time, doctor, department, status, reason. Actions for this visit: Start Consult, Create Bill, Reschedule, Cancel.
2. **Patient info** (SECONDARY) — compact: name, age, gender, medical ID, contact. Action: Edit.
3. **History** (TERTIARY, collapsed) — past consultations with prescriptions inline, current meds summary. Reference-only, collapsed by default.

## Detail Panel Design

### With history:
```
┌────────────────────────────────────┐
│ ⬤ In Progress · 10:30 AM          │
│ Dr. Lee · Cardiology              │
│ Reason: Chest pain follow-up      │
│                                    │
│ [Start Consultation]  [Create Bill]│
│ [Reschedule]  [Cancel]            │
├────────────────────────────────────┤
│ Jane Smith · 32F · MED-001         │
│ 📞 555-0100  ✉️ jane@email.com    │
│ [Edit Patient]                    │
├────────────────────────────────────┤
│ History                        [▸]│
│ 5 past consultations              │
│ Current: Metformin, Lisinopril    │
└────────────────────────────────────┘
```

### Empty state (first-time patient):
```
┌────────────────────────────────────┐
│ ⬤ Scheduled · 11:00 AM            │
│ Dr. Park · General Medicine       │
│ Reason: Annual checkup            │
│                                    │
│ [Start Consultation]  [Create Bill]│
│ [Reschedule]  [Cancel]            │
├────────────────────────────────────┤
│ John Doe · 28M · MED-004          │
│ 📞 555-1234  ✉️ john@email.com   │
│ [Edit Patient]                    │
├────────────────────────────────────┤
│ No prior consultations            │
│ This is the patient's first visit.│
└────────────────────────────────────┘
```

Both states keep the current appointment prominent. The empty state is calm and informative.

## Navigation

**Bottom nav (3 items):** Today (was Appointments), Pharmacy, Billing.
**Sidebar:** Same minus Patients.
**Hamburger:** Dashboard, Profile, Settings.

## What Changes

### Step 1: Navigation config
**File:** `config/navigation.ts`
- Remove Patients from `navItems`
- Rename Appointments label to "Today" (path stays `/appointments`)

### Step 2: New hook `useAppointmentDetail`
**File:** `hooks/useAppointmentDetail.ts` (new)
- Combines `useAppointments()` + `usePatientsWithRecords()`
- Owns: selected patient, selected appointment, modal states, search, doctor filter
- Exposes: data + callbacks (selectPatient, startConsult, createBill, editPatient, etc.)
- All Supabase calls live here

### Step 3: Rewrite PatientDetailView
**File:** `components/patients/PatientDetailView.tsx`
- Remove 3 tabs (Consultations, Prescriptions, Timeline)
- Section 1: Current appointment card (status, time, doctor, department, reason, primary actions)
- Section 2: Compact patient info card (name, age, gender, ID, contact, Edit button)
- Section 3: Collapsed history section (expandable), with current meds summary and past consultations list (prescriptions inline)
- Empty state for no prior consultations
- Accepts `appointment` prop for current appointment context

### Step 4: Rebuild Appointments page
**File:** `app/(app)/appointments/page.tsx` — target <200 lines
- Split layout: list (left 1/3) + detail panel (right 2/3)
- Left: search bar, doctor filter, Today|Upcoming tabs, patient list
- Right: PatientDetailView or empty state ("Select a patient")
- Thin orchestrator — all logic in the hook

### Step 5: Redirect and cleanup
- Redirect `/patients` → `/appointments`
- Delete `app/(app)/patients/[[...slug]]/page.tsx`
- Update FAB: remove "New Patient"

## Verification

1. `/appointments` → today's patients list
2. Click patient → detail shows current appointment first, patient info second, collapsed history third
3. First-time patient → "No prior consultations" empty state, appointment still prominent
4. Start Consultation, Create Bill, Reschedule, Cancel — all from the appointment section
5. Edit Patient — from the patient info section
6. Expand history → past consultations with prescriptions inline, current meds summary
7. `/patients` → redirects
8. Bottom nav: 3 items, no Patients
