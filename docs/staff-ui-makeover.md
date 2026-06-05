# Staff UI Makeover

## Problem

Staff are forced into the doctor's Schedule page — the same `TodayQueueView` + `TodayDetailPanel` layout designed for doctors working through an "In Progress / Waiting / Completed" queue. Staff don't think in status columns. They think in tasks: who's checking in, who needs a bill, who's overdue for follow-up, who's coming tomorrow.

The current staff view (`TodayDetailPanel.tsx` lines 109-153) shows only `PatientHeader variant="staff"` + `AdministrativeFooter` (bills + past consultations). No upcoming appointments, no follow-up tracking, no quick actions. The `StaffWorkflow` component exists but is unused.

---

## Phase 1: Staff Landing Page

**Goal**: Replace `/schedule` for staff with a purpose-built dashboard that shows everything they need at a glance.

**File**: `app/(app)/schedule/page.tsx` (add staff branch before the existing doctor flow)

### Sections

#### 1. Today's Appointments
- All of today's appointments, sorted by time ascending
- Each row: time, patient name, doctor, type (Walk-in/Digital), status badge
- Quick actions per row: Check In (if Scheduled), Mark Complete (if In Progress), Create Bill
- Empty state: "No appointments today"

#### 2. Upcoming (Next 7 Days)
- Grouped by date, collapsed by default for dates beyond tomorrow
- Tomorrow always expanded
- Each row: time, patient name, doctor, type
- Actions: Reschedule, Cancel

#### 3. Follow-ups Due
- Query: `consultations` WHERE `specialty_data->>'follow_up_date' <= CURRENT_DATE` and no subsequent appointment exists for that patient
- Each row: patient name, doctor, follow-up text (truncated), follow-up date, days overdue badge
- "Schedule" button opens `AppointmentModal` pre-filled with patient + follow-up date
- Empty state: "All follow-ups on track"

### Data Flow (Server Component)
```
page.tsx (Server)
  ├── getAuthenticatedUser()
  ├── getActiveClinic() → clinicId, role
  ├── IF role === 'staff':
  │     ├── getTodayAppointments(clinicId) → today's list
  │     ├── getUpcomingAppointments(clinicId) → next 7 days
  │     ├── getFollowUpsDue(clinicId) → overdue follow-ups
  │     └── return <StaffDashboard today={...} upcoming={...} followUps={...} />
  └── ELSE: existing doctor flow unchanged
```

### New Data Functions (`lib/data/today.ts`)
- `getUpcomingAppointments(clinicId)` — appointments WHERE `date > CURRENT_DATE AND date <= CURRENT_DATE + 7`, sorted by date then time
- `getFollowUpsDue(clinicId)` — consultations with `specialty_data->>'follow_up_date' <= CURRENT_DATE`, LEFT JOIN to find patients without subsequent appointments

### New Component
- `components/schedule/StaffDashboard.tsx` — client component, receives the three datasets as props. Renders the three sections.

---

## Phase 2: Staff Patient Detail Panel

**Goal**: Replace the bare `AdministrativeFooter`-only detail view with a proper staff panel.

**Files**: `components/schedule/TodayDetailPanel.tsx` (staff branch), `components/schedule/StaffWorkflow.tsx` (wire in)

### Layout (top to bottom)
1. **PatientHeader** (variant="staff") — already exists
2. **Follow-up callout** (if `follow_up_date` exists) — blue banner showing follow-up text + date + "Schedule Follow-up" button
3. **Quick actions strip** — horizontal row of buttons: Check In, Mark Complete, Create Bill, Schedule Follow-up
4. **Bills accordion** — already exists in AdministrativeFooter
5. **Previous consultations accordion** — already exists in AdministrativeFooter, add follow_up preview line in amber

### Changes
- Wire `StaffWorkflow` into the staff branch of `TodayDetailPanel` (it already has check-in/complete/bill logic)
- Create `FollowUpCallout` component (from `docs/june-1-follow_up.md` plan)
- Add `follow_up` preview line to consultation history cards in `AdministrativeFooter`

---

## Phase 3: Quick Actions Bar

**Goal**: Always-visible shortcuts for common staff tasks.

- "New Walk-in" — opens `AppointmentModal` with type=Walk-in, status=Scheduled
- "Create Bill" — opens bill creation flow for selected patient or prompts patient search
- "Search Patient" — opens CommandPalette

Placement: fixed bottom bar on mobile, top button strip on desktop.

---

## Implementation Sequence

```
Phase 1: StaffDashboard component → server data functions → page.tsx staff branch
Phase 2: FollowUpCallout → wire StaffWorkflow → AdministrativeFooter follow_up line
Phase 3: Quick actions bar
```

Phase 1 is independent. Phase 2 depends on Phase 1's follow-up data being visible. Phase 3 is standalone.

---

## Files

| Action | File |
|--------|------|
| Create | `components/schedule/StaffDashboard.tsx` |
| Create | `components/schedule/FollowUpCallout.tsx` |
| Modify | `app/(app)/schedule/page.tsx` (add staff branch) |
| Modify | `lib/data/today.ts` (add getUpcomingAppointments, getFollowUpsDue) |
| Modify | `components/schedule/TodayDetailPanel.tsx` (staff branch overhaul) |
| Modify | `components/schedule/AdministrativeFooter.tsx` (follow_up preview) |
| Modify | `components/schedule/StaffWorkflow.tsx` (wire into detail panel) |
