# Plan: Remove MedicalCredentialsModal, Keep Only DoctorQuickOnboarding

## Context

The `MedicalCredentialsModal` is a 4-tab, ~500-line form with ~20 fields (Practice, Specialty, License, Education). The user considers it useless bloat. The `DoctorQuickOnboarding` dialog already covers the fields that matter: **name, department, specialization, consultation fee**. The user confirmed these are sufficient.

## What Changes

### 1. Delete `components/doctor/MedicalCredentialsModal.tsx`
The entire 500-line 4-tab modal. No longer needed.

### 2. Delete `hooks/useMedicalCredentials.ts`
Only used by MedicalCredentialsModal. Contains the `updateCredentials` mutation (writes ~20 fields to `doctors` table) and department queries. The department queries are already duplicated in `useDoctorQuickOnboarding.ts`.

### 3. Clean up `types/doctor.ts`
- Remove `MedicalCredentialsModalProps` interface (only used by the deleted modal)
- Remove `Department` type (only used by the deleted modal and the deleted hook)
- Keep `DoctorWithDepartment` (may be useful, and removing unused types is out of scope per CLAUDE.md)

### 4. Clean up `lib/query-keys.ts`
- Remove `doctorDepartment` query key group (only used by the deleted `useMedicalCredentials` hook)

### 5. Simplify `app/(app)/profile/page.tsx`
- Remove `MedicalCredentialsModal` import
- Remove `isMedicalModalOpen` state
- Remove `showPostOnboarding` state and the post-onboarding success banner
- The medical profile card's **edit button** → opens `DoctorQuickOnboarding` instead of `MedicalCredentialsModal`
- The **"Complete Medical Profile"** empty-state button → opens `DoctorQuickOnboarding` instead of `MedicalCredentialsModal`
- Remove the `<MedicalCredentialsModal>` JSX block
- `DoctorQuickOnboarding.onSuccess` → just close modal, refetch, set `localHasDoctorProfile = true` (no banner)

## Files Touched

| File | Action |
|---|---|
| `components/doctor/MedicalCredentialsModal.tsx` | Delete |
| `hooks/useMedicalCredentials.ts` | Delete |
| `types/doctor.ts` | Remove `MedicalCredentialsModalProps` and `Department` |
| `lib/query-keys.ts` | Remove `doctorDepartment` key group |
| `app/(app)/profile/page.tsx` | Remove modal import/state/banner, wire edit/create buttons to DoctorQuickOnboarding |

## Verification

1. `tsc --noEmit` — confirm no type errors from removed imports
2. Open `/profile` as a doctor — verify the "Medical Profile" card edit button opens DoctorQuickOnboarding
3. Click "Complete Medical Profile" from empty state — verify it opens DoctorQuickOnboarding
4. Submit the quick onboarding form — verify it saves and the profile card updates without a post-onboarding banner
5. As superadmin, click "Setup Medical Profile" — verify it still works (already uses DoctorQuickOnboarding)
