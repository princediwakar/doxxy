# Plan: Shatter the Consultation God Hook

## Context

`useConsultationForm.ts` is 668 lines — a "god hook" mixing form state, permissions, autosave (Supabase mutations), and consultation completion. It violates the project's hook size limit (200 lines) and mixes form state with database mutations. This refactor decomposes it into three focused hooks, each under 150 lines, with an orchestrator that preserves the existing public API.

## Files to Create

### 1. `hooks/consultation/useConsultationPermissions.ts` (~60 lines)

**Concern**: Who can edit this consultation.

- Input: `{ appointment }`
- Contains: `assignedDoctor` useQuery, `isAssignedDoctor` memo, `canEditConsultation` memo
- Returns: `{ canEditConsultation }`
- Internal deps: `useAuth()`, `getSupabase()`, `useQuery`

### 2. `hooks/consultation/useConsultationAutosave.ts` (~145 lines total: ~75 hook + ~70 helper + isDeepEqual)

**Concern**: Auto-saving form data to Supabase with 2s debounce.

- Module-level: `isDeepEqual()` (moved here, sole consumer), `performAutoSave()` (extracted mutationFn body)
- Input: `{ appointmentId, appointment, form, canEditConsultation, previousValuesRef, isInitializingRef, hasFormInitializedRef }`
- Calls `useWatch` internally to subscribe to form changes
- Contains: `autoSaveMutation` (useMutation wrapping `performAutoSave`), debounced autosave effect, `handleSave` callback
- Returns: `{ autoSaveMutation, handleSave }`
- Toast: sonner (`toast.success`, `toast.error`)
- Owns: `autoSaveTimeoutRef`

### 3. `hooks/consultation/useConsultationCompletion.ts` (~145 lines total: ~100 hook + ~45 helper)

**Concern**: Validating mandatory fields and completing the consultation.

- Module-level: `executeCompletion()` (appointment status update + credit deduction extracted)
- Input: `{ appointmentId, appointment, departmentType, canEditConsultation, form, autoSaveMutation }`
- Contains: `isConsultationCompleted`/`justCompleted` state, completion refs, sync/reset effects, `validateMandatoryFields`, `getMandatoryFieldsStatus`, `handleCompleteConsultation`
- Returns: `{ isConsultationCompleted, justCompleted, handleCompleteConsultation, validateMandatoryFields, getMandatoryFieldsStatus, mandatoryFieldsStatus }`
- Toast: sonner, with `showErrorToast()` for catch blocks

## File to Rewrite

### 4. `hooks/consultation/useConsultationForm.ts` → thin orchestrator (~50 lines)

- Owns: `useForm` with zodResolver, `defaultValues`, form init/reset effects, `previousValuesRef`, `isInitializingRef`, `hasFormInitializedRef`
- Composes the three hooks above
- Returns the identical `UseConsultationFormReturn` interface (backward compatible, page needs zero changes)

## File to Modify

### 5. `hooks/consultation/index.ts` — add 3 new exports

## Wiring

```
useConsultationForm (orchestrator)
  ├── owns form (useForm) + refs
  ├── useConsultationPermissions(appointment)
  │     └── returns canEditConsultation
  ├── useConsultationAutosave(form, canEditConsultation, refs)
  │     └── returns autoSaveMutation, handleSave
  └── useConsultationCompletion(form, canEditConsultation, autoSaveMutation)
        └── returns isConsultationCompleted, justCompleted, handleCompleteConsultation, etc.
```

The completion hook calls `autoSaveMutation.mutateAsync()` for final save before marking complete — the mutation object reference is passed from autosave → orchestrator → completion.

## What Does NOT Change

- `app/(app)/consultation/[appointmentId]/page.tsx` — zero changes (orchestrator preserves interface)
- `ConsultationHeader` — zero changes
- `types/consultation.ts` — zero changes (existing types are sufficient)
- `useConsultationData.ts` — untouched

## Verification

1. TypeScript compilation: `npx tsc --noEmit` — must pass with zero errors
2. The page file imports and destructuring must work unchanged
3. Each new hook file must be under 150 lines (hook body only, not helpers)
4. No `getSupabase()` calls remain in the orchestrator or page
5. All toast calls use sonner (no `@/hooks/use-toast` imports in new files)
6. The barrel export (`index.ts`) exports all hooks
