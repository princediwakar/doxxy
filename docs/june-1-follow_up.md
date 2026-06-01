# Plan: Surface Follow-Up Instructions to Staff Upfront

## Context

`follow_up` is a free-text field inside `consultations.specialty_data` (JSONB). Doctors write instructions like "Come after 3 weeks" or "come in two weeks to review the MRI scans." It will remain free text.

**Current problem:** Staff have to drill 3 clicks deep to see follow-up instructions — expand the Previous Consultations accordion, find the right consultation, click "View Notes", scroll to the Management section. This means follow-ups are routinely missed, and staff can't act on them (schedule a follow-up appointment).

**Goal:** Surface the most recent follow-up instruction prominently in the staff-facing patient detail panel, with a direct CTA to schedule the appointment.

## Data Flow (already in place — no new fetches needed)

`getPatientById()` in `lib/data/today.ts` already fetches consultations with full `specialty_data`. The `patientDetail.consultations` array flows through `TodayDetailView` → `TodayDetailPanel` → staff branch. The data includes `specialty_data.follow_up` — it's just not displayed.

## Implementation

### 1. Create `FollowUpCallout` component

**New file:** `components/schedule/FollowUpCallout.tsx`

- Client component that receives `consultations` array + `onSchedule` callback
- Finds the most recent completed consultation with non-empty `follow_up` in `specialty_data`
- If found, renders a callout banner (blue-border, blue-bg, similar pattern to `DoctorProfilePrompt`) with:
  - The follow_up text displayed as-is (free text, no parsing)
  - A "Schedule Follow-up" button wired to `onSchedule`
- If no follow_up found, renders nothing

### 2. Place it in the staff view branch

**File:** `components/schedule/TodayDetailPanel.tsx` (lines 109-153, the staff branch)

Insert `<FollowUpCallout>` between `<PatientHeader>` and `<AdministrativeFooter>`:

```tsx
{patientDetail?.patient && (
  <PatientHeader ... />
)}
<FollowUpCallout
  consultations={patientDetail?.consultations ?? []}
  onSchedule={() => patientDetail?.patient && scheduleAppointment(patientDetail.patient)}
/>
<AdministrativeFooter ... />
```

The `onSchedule` callback already exists in scope — it calls `scheduleAppointment(patientDetail!.patient!)` which opens the `AppointmentModal`.

### 3. Show truncated follow_up in consultation history cards

**File:** `components/schedule/AdministrativeFooter.tsx` (lines 212-216, where `chief_complaint` preview is shown)

Add a follow_up preview line below the `chief_complaint` preview in each consultation card:

```tsx
{extractSpecialtyField(c as Record<string, unknown>, "follow_up") && (
  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 line-clamp-1">
    Follow-up: {extractSpecialtyField(c as Record<string, unknown>, "follow_up")}
  </p>
)}
```

This makes follow_up visible even when the callout banner isn't showing (e.g., for older consultations beyond the most recent one). Uses amber color to draw attention.

## Files to modify

| File | Change |
|------|--------|
| `components/schedule/FollowUpCallout.tsx` | **New file** — the callout banner component |
| `components/schedule/TodayDetailPanel.tsx` | Insert `<FollowUpCallout>` between header and footer in staff branch |
| `components/schedule/AdministrativeFooter.tsx` | Add follow_up preview line in consultation history cards |

## Verification

1. **Happy path:** Open a patient with a completed consultation that has `follow_up: "Review in 2 weeks"` in `specialty_data`. Verify the blue callout banner appears below the patient header showing the text and a "Schedule Follow-up" button.
2. **No follow_up:** Open a patient whose consultations have no `follow_up`. Verify no banner is shown, no visual glitch.
3. **Schedule CTA:** Click "Schedule Follow-up" — verify the `AppointmentModal` opens with the patient pre-filled.
4. **Consultation history:** Expand the Previous Consultations accordion — verify each card shows the follow_up text in amber when present.
5. **Doctor view unaffected:** Open the same patient as a doctor — verify the `EncounterCanvas` still renders normally (banner only appears in staff branch).
