# Execution Plan: Atomic UHID System (9-Character Standard)

## Context

`medical_id` on `patients` is a free-text optional field. Rename it to `uhid`, make it auto-generated at INSERT time inside the server action (not on the client), lock it read-only everywhere, and add a `UNIQUE(clinic_id, uhid)` constraint.

Format: 9-character string — `{clinic initial}{2-digit year}{6-digit sequential}`. Example: `N26000001`.

Pattern: generation happens atomically inside `createPatient` — no client-side fetching, no regenerate button, no modal-open pre-generation.

## 1. Database Migrations (With Data Sanitization)

**Migration 1:** `supabase/migrations/20260601000001_rename_medical_id_to_uhid.sql`
Sanitize legacy data before applying the constraint. Empty strings must become NULL to avoid unique_violation crashes.

```sql
ALTER TABLE patients RENAME COLUMN medical_id TO uhid;

-- Sanitize: Convert empty/whitespace strings to true NULL to avoid UNIQUE constraint violations
UPDATE patients SET uhid = NULL WHERE trim(uhid) = '';

-- Apply constraint
ALTER TABLE patients ADD CONSTRAINT patients_uhid_clinic_key UNIQUE (clinic_id, uhid);
```

**Migration 2:** `supabase/migrations/20260601000002_add_generate_uhid_rpc.sql`
Format: `{clinic initial}{2-digit year}{6-digit sequential}`. Example: `N26000001`.

```sql
CREATE OR REPLACE FUNCTION generate_uhid(clinic_id_arg uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  clinic_initial text;
  year_suffix text;
  latest_uhid text;
  next_seq int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('uhid_gen_' || clinic_id_arg::text));

  SELECT UPPER(LEFT(name, 1)) INTO clinic_initial
  FROM clinics WHERE id = clinic_id_arg;

  IF clinic_initial IS NULL THEN
    clinic_initial := 'C';
  END IF;

  year_suffix := TO_CHAR(EXTRACT(YEAR FROM NOW()) % 100, 'FM00');

  -- Strict 9-character match
  SELECT uhid INTO latest_uhid
  FROM patients
  WHERE clinic_id = clinic_id_arg
    AND uhid LIKE clinic_initial || year_suffix || '______'
  ORDER BY uhid DESC
  LIMIT 1;

  IF latest_uhid IS NULL THEN
    next_seq := 1;
  ELSE
    next_seq := CAST(RIGHT(latest_uhid, 6) AS int) + 1;
  END IF;

  RETURN clinic_initial || year_suffix || LPAD(next_seq::text, 6, '0');
END;
$$;
```

## 2. Server Actions (The Security Perimeter)

**Modify:** `actions/patients.ts`
Implement the private generator and strictly protect both `CREATE` and `UPDATE` mutations.

```typescript
// 1. Private Generator (Do not export)
async function generateUhid(clinicId: string): Promise<string> {
  const supabase = await createServerSupabase();

  try {
    const { data, error } = await supabase.rpc('generate_uhid', {
      clinic_id_arg: clinicId,
    });
    if (!error && data) return data as string;
  } catch { /* fall through */ }

  try {
    const { data: latestPatient } = await supabase
      .from('patients')
      .select('uhid')
      .eq('clinic_id', clinicId)
      .order('uhid', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPatient?.uhid && latestPatient.uhid.length >= 9) {
      const seq = parseInt(latestPatient.uhid.slice(-6), 10) + 1;
      const prefix = latestPatient.uhid.slice(0, -6);
      return prefix + String(seq).padStart(6, '0');
    }
  } catch { /* fall through */ }

  const clinic = await supabase.from('clinics').select('name').eq('id', clinicId).single();
  const clinicInitial = (clinic.data?.name?.charAt(0) || 'C').toUpperCase();
  const yearShort = new Date().getFullYear() % 100;
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  return `${clinicInitial}${String(yearShort).padStart(2, '0')}${random}`;
}

// 2. Create Mutation (Injects UHID)
export async function createPatient(data: Omit<DbPatientInsert, 'uhid'> & { clinic_id: string }) {
  const supabase = await createServerSupabase();
  const uhid = await generateUhid(data.clinic_id);

  const { data: patient, error } = await supabase
    .from('patients')
    .insert({ ...data, uhid })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/schedule');
  return { success: true, data: patient };
}

// 3. Update Mutation (Protects UHID)
export async function updatePatient(id: string, data: Partial<DbPatientUpdate>) {
  const supabase = await createServerSupabase();

  // CRITICAL: Strip uhid from incoming payload to prevent accidental overwrites
  const { uhid, ...safeUpdateData } = data as any;

  const { data: patient, error } = await supabase
    .from('patients')
    .update(safeUpdateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/schedule');
  return { success: true, data: patient };
}
```

## 3. UI & Schema Lockdown

**Modify:** `components/patients/PatientModal.tsx`

- **Zod Schema:** Remove `uhid` entirely. The client never validates or sends it.
- **Form Field:** Hardcode to `disabled={true}`.
- If `!patient` (Create): Show placeholder `"Auto-generated on save"`.
- If `patient` (Edit): Show `patient.uhid`.
- **Cleanup:** Delete the `generateUhid` import, the `isLoadingUhid` state, and the "Regenerate" button.

## 4. RPC Updates (Third Migration Required)

**Migration 3:** `supabase/migrations/20260601000003_update_rpcs_for_uhid.sql`

The `get_patients_by_clinic`, `get_doctor_dashboard_data`, and `get_patient_details` RPCs reference `p.medical_id` in their `RETURNS TABLE` signatures. After the column rename, these functions error on call. A third migration `DROP`s and re-`CREATE`s them with `uhid` instead. 

## 5. Global Typographical Updates

Run `tsc --noEmit` after generating the new Supabase types. Rename `medical_id` to `uhid` across the codebase.

| Target | Modification |
| --- | --- |
| `integrations/supabase/types.ts` | Auto-generated via CLI |
| UI Components (14 files) | Update property access (`.medical_id` → `.uhid`) and label text ("Medical ID" → "UHID") |
| RPCs | Update `get_patients_by_clinic` and `get_doctor_dashboard_data` to select `uhid` |
| Zod/Types | Update `types/dashboard.ts` and `lib/error-utils.ts` |

## What Does NOT Change

- All 14 display locations keep showing the UHID — just with the new column name and label.
- Existing patients with garbage `medical_id` values keep them (migrated to `uhid` column). UI handles null/legacy values gracefully.

## Verification

1. Apply both migrations
2. Regenerate types
3. `tsc --noEmit` — zero errors
4. Create a new patient — UHID appears as `D26000001` after save
5. Create a second — `D26000002`
6. Open create modal, cancel — no UHID burned
7. Edit existing patient — UHID is read-only, cannot be changed
8. UHID displays in: PatientChart, patient selects, billing modal, consultation PDF
