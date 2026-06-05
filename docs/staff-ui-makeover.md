# Staff UI Makeover

## Problem

Staff are forced into the doctor's Schedule page — the same `TodayQueueView` + `TodayDetailPanel` layout designed for doctors working through an "In Progress / Waiting / Completed" queue. Staff don't think in status columns. They think in tasks: who's checking in, who needs a bill, who's coming tomorrow.

The current staff view (`TodayDetailPanel.tsx` lines 109-153) shows only `PatientHeader variant="staff"` + `AdministrativeFooter` (bills + past consultations). No upcoming appointments, no quick actions. The `StaffWorkflow` component exists but is unused.

**Core insight:** When a doctor sets `follow_up_date`, that is an explicit intent to bring the patient back. Asking staff to manually read the field and schedule an appointment is unnecessary indirection. The system should create the appointment automatically.

---

## Phase 0: Auto-Create Follow-Up Appointments (prerequisite)

**Goal**: When a consultation is saved with `follow_up_date`, automatically create a Scheduled appointment for that patient + doctor at the first open 15-min slot after 9 AM on that date. When the date is changed, reschedule. When removed, cancel.

This makes "Follow-ups Due" as a staff concept disappear — there's nothing to chase because the appointment already exists.

### Database Change

```sql
ALTER TABLE appointments ADD COLUMN follow_up_consultation_id uuid
  REFERENCES consultations(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX idx_appointments_follow_up_consultation
  ON appointments (follow_up_consultation_id)
  WHERE follow_up_consultation_id IS NOT NULL;
```

The unique index enforces one appointment per consultation. `ON DELETE SET NULL` handles consultation deletion.

### Server Action Logic (`actions/consultations.ts`)

The existing consultation upsert action gains a post-save step:

```
upsertConsultation(consultationData):
  1. Upsert consultation (existing logic)
  2. Extract follow_up_date from specialty_data
  3. Resolve doctor_id from consultation
  4. IF follow_up_date AND doctor_id:
       a. Check for existing appointment WHERE follow_up_consultation_id = consultation.id
       b. IF existing appointment exists:
            - IF its date != follow_up_date → reschedule to new date, first 9 AM slot
            - IF its date == follow_up_date → no-op
       c. IF no existing appointment:
            - Check if patient already has an appointment on that date (any source)
            - IF yes → skip (don't create duplicate)
            - IF no → create appointment:
                patient_id, doctor_id, clinic_id,
                date = follow_up_date,
                time = first open 15-min slot after 9 AM,
                type = 'Walk-in',
                status = 'Scheduled',
                follow_up_consultation_id = consultation.id
     ELSE IF no follow_up_date AND existing linked appointment:
       - Cancel the linked appointment (status = 'Cancelled')
```

### Slot Finding

- Query existing appointments for that doctor on that date
- Start at 09:00, check each 15-min slot until one is free
- `generateTimeSlots()` already exists in `components/appointments/appointment.utils.ts`
- Server-side equivalent needed in `lib/data/appointments.ts`

### Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| follow_up_date set, no existing appointment | Create at first 9 AM+ slot |
| follow_up_date changed to a different date | Reschedule linked appointment |
| follow_up_date unchanged | No-op |
| follow_up_date cleared/removed | Cancel linked appointment |
| Doctor not assigned to consultation | Skip (can't schedule without doctor) |
| Date is today or in the past | Still create (retrospective docs; staff can adjust) |
| 9 AM slot taken | Find next available 15-min slot |
| Staff manually created appointment for same patient+date | Skip (existing appointment found) |
| Consultation deleted | Linked appointment left intact (ON DELETE SET NULL) |

### Staff Dashboard Impact

No "Follow-ups Due" section needed. Follow-up appointments are just regular appointments with `follow_up_consultation_id` set. They appear in Today's Appointments and Upcoming naturally, with a small "Follow-up" badge for context.

---

## Phase 1: Staff Landing Page

**Goal**: Replace `/schedule` for staff with a purpose-built dashboard.

**File**: `app/(app)/schedule/page.tsx` (add staff branch before the existing doctor flow)

### Sections

#### 1. Today's Appointments
- All of today's appointments, sorted by time ascending
- Each row: time, patient name, doctor, type, status badge, follow-up badge (if `follow_up_consultation_id` is set)
- Quick actions: Check In (if Scheduled), Mark Complete (if In Progress), Create Bill
- Empty state: "No appointments today"

#### 2. Upcoming (Next 7 Days)
- Grouped by date, collapsed for dates beyond tomorrow
- Tomorrow always expanded
- Each row: time, patient name, doctor, type, follow-up badge
- Actions: Reschedule, Cancel

### Data Flow (Server Component)

```
page.tsx (Server)
  ├── getAuthenticatedUser()
  ├── getActiveClinic() → clinicId, role
  ├── IF role === 'staff':
  │     ├── getTodayAppointments(clinicId)
  │     ├── getUpcomingAppointments(clinicId) → next 7 days
  │     └── return <StaffDashboard today={...} upcoming={...} />
  └── ELSE: existing doctor flow unchanged
```

### New Data Functions (`lib/data/today.ts`)
- `getUpcomingAppointments(clinicId)` — appointments WHERE `date > CURRENT_DATE AND date <= CURRENT_DATE + 7`, sorted by date then time

### New Component
- `components/schedule/StaffDashboard.tsx` — client component, receives today + upcoming as props

---

## Phase 2: Staff Patient Detail Panel

**Goal**: Replace the bare `AdministrativeFooter`-only detail view with a proper staff panel.

**Files**: `components/schedule/TodayDetailPanel.tsx` (staff branch), `components/schedule/StaffWorkflow.tsx` (wire in)

### Layout (top to bottom)
1. **PatientHeader** (variant="staff") — already exists
2. **Follow-up callout** (if `follow_up_date` exists) — blue banner showing follow-up text + date. If a linked appointment exists, show "Appointment: Jun 20, 9:00 AM" with "Reschedule" button. If no linked appointment (edge case), show "Schedule" button.
3. **Quick actions strip** — Check In, Mark Complete, Create Bill
4. **Bills accordion** — already exists in AdministrativeFooter
5. **Previous consultations accordion** — add `follow_up` preview line in amber

### Changes
- Wire `StaffWorkflow` into the staff branch (it already has check-in/complete/bill logic)
- Create `FollowUpCallout` component
- Add `follow_up` preview line to consultation history cards in `AdministrativeFooter`

---

## Phase 3: Quick Actions Bar

- "New Walk-in" — opens `AppointmentModal` with type=Walk-in
- "Create Bill" — opens bill creation flow
- "Search Patient" — opens CommandPalette

Fixed bottom bar on mobile, top button strip on desktop.

---

## Implementation Sequence

```
Phase 0: DB migration → slot-finding helper → auto-create logic in Server Action
Phase 1: getUpcomingAppointments → StaffDashboard → page.tsx staff branch
Phase 2: FollowUpCallout → wire StaffWorkflow → AdministrativeFooter follow_up line
Phase 3: Quick actions bar
```

Phase 0 is the foundation — it eliminates the follow-up scheduling gap entirely. Phase 1 builds the staff dashboard on top. Phase 2 upgrades the detail panel. Phase 3 is convenience polish.

---

## Files

| Action | File |
|--------|------|
| Create | `supabase/migrations/202606XX_follow_up_appointment.sql` |
| Create | `lib/data/appointments.ts` (slot-finding helper) |
| Modify | `actions/consultations.ts` (auto-create/reschedule/cancel logic) |
| Create | `components/schedule/StaffDashboard.tsx` |
| Create | `components/schedule/FollowUpCallout.tsx` |
| Modify | `app/(app)/schedule/page.tsx` (staff branch) |
| Modify | `lib/data/today.ts` (getUpcomingAppointments) |
| Modify | `components/schedule/TodayDetailPanel.tsx` (staff branch overhaul) |
| Modify | `components/schedule/AdministrativeFooter.tsx` (follow_up preview) |
| Modify | `components/schedule/StaffWorkflow.tsx` (wire into detail panel) |
| Modify | `types/core.ts` (follow_up_consultation_id on DbAppointment) |
