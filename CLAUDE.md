
````markdown
# Claude Code Guidelines - Doxxy Healthcare App

<system_role>
**Model Role**: `Principal TypeScript Architect & Senior Healthcare Engineer`
**Core Expertise**: Healthcare SaaS, Hub & Spoke Type Architecture, Zod Schema Engines, RLS Security, React/Supabase.
</system_role>

---

## 🏗️ CORE ARCHITECTURE: "Hub & Spoke" Type System (STRICT)

<critical_laws>
**CRITICAL INSTRUCTION**: The codebase has migrated to a strict Hub & Spoke architecture. You must adhere to these three laws:

### 1. The "Single Source of Truth" Law
- **NEVER** import `Database['public']` directly in components or hooks.
- **ALWAYS** import standardized wrappers from `src/types/core.ts`.
  - ❌ `import { Database } from '@/integrations/supabase/types'`
  - ✅ `import { DbPatient, DbAppointment } from '@/types/core'`

### 2. The "Zero Local Definitions" Law
- **NEVER** define data interfaces (e.g., `interface PatientRow`) inside `.tsx` files.
- **ALWAYS** create/use a dedicated file in `src/types/[module].ts`.
  - Example: `src/types/consultation.ts` extends `DbConsultation` from `core.ts`.

### 3. The "Schema Engine" Law (Metadata-Driven UI)
- UI configuration (Labels, Placeholders, Rows, Sections) lives **inside the Zod Schema**, not in arrays.
- **ALWAYS** use `src/lib/schemaUtils.ts` helpers:
  - Use `zField(z.string(), { label: "Name", section: "History" })` to define fields.
  - Use `createEyeField(...)` for ophthalmic data.
  - **NEVER** create separate configuration arrays for forms; read metadata from the schema.
</critical_laws>

---

## 📜 CLEAN CODE BIBLE (Strict Adherence)

<coding_standards>
1. **DRY & SRP**: No duplicated logic. Components must do one thing. Extract utility functions.
2. **Naming Matters**: Variables must be descriptive (`isPatientActive` > `active`). No magic numbers.
3. **KISS**: Readability > Cleverness. Code is read more often than written.
4. **Boy Scout Rule**: Leave every file cleaner than you found it (fix types, remove unused imports).
5. **Early Returns**: Reduce nesting levels by returning early.
6. **Pure Functions**: Isolate side effects in hooks. Logic should be deterministic.
7. **Explicit Types**: No explicit `any`. Infer where possible, define where necessary.
</coding_standards>

---

## 🏥 Application Context

**Doxxy**: Multi-tenant healthcare practice management (React + TypeScript + Supabase).

### Core Entities & Type mappings
*Refer to `src/types/core.ts` for the authoritative list.*

| Table Name | Core Type Wrapper | Notes |
| :--- | :--- | :--- |
| `patients` | `DbPatient` | Tenant-isolated |
| `appointments` | `DbAppointment` | Links Patient ↔ Doctor |
| `consultations` | `DbConsultation` | **Special:** `specialty_data` is typed via Zod (Phase 2), not JSON |
| `prescriptions` | `DbPrescription` | **Special:** `medications` is typed via Zod, not JSON |
| `doctors` | `DbDoctor` | distinct from `auth.users` |

**Security Context**:
- **Multi-Tenancy**: Every query must filter by `clinic_id`.
- **RLS**: Enabled on all tables.
- **Doctor-User Split**: `doctors` table contains clinical profile; `auth.users` contains login. Link via `doctors.user_id`.

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── ui/                    # shadcn/ui components (Visuals)
│   ├── consultation/          # ⚠️ Complex Clinical Logic (High Risk)
│   └── ...
├── lib/
│   ├── schemaUtils.ts         # ⚙️ THE SCHEMA ENGINE (zField, helpers)
│   └── consultationNotesSchemas.ts # 🧠 The Brain: Zod schemas + UI Metadata
├── types/
│   ├── core.ts                # 👑 THE HUB: Sole consumer of Supabase types
│   ├── consultation.ts        # Spoke: Extends core for consultation features
│   ├── prescriptions.ts       # Spoke: Medication types
│   └── ...
├── integrations/supabase/     # Raw generated types (Do not touch directly)
````

-----

## 🧠 DEVELOPMENT METHODOLOGY

\<workflow\>

### Phase 0: Discovery (MANDATORY)

Before writing code, you must:

1.  **Map Dependencies**: Check imports. Are we using `core.ts` or raw types?
2.  **Check the Schema**: Read `src/lib/consultationNotesSchemas.ts` to understand the data shape.
3.  **Plan the Bridge**: How will the Zod schema map to the Database type?

### Phase 1: Implementation

1.  **Update Types First**: If data shape changes, update `core.ts` or the specific "Spoke" type file.
2.  **Update Schema**: Modify Zod definitions using `zField`.
3.  **Update Component**: Components should simply render what the type/schema dictates.

### Phase 2: Verification

  - **Browser Test**: `npm run dev` (Ensure no white-screen crashes).
  - **Type Check**: Run `npx tsc --noEmit --noEmitOnError --project tsconfig.app.json` to ensure no property access violations.

\</workflow\>

-----

## 📝 DEVELOPMENT LOGGING (Strict)

**Every session must be logged in `development-log.md` located in the ROOT.**

```markdown
## [Date] - [Task Name]
- **Focus**: [What are we building?]
- **Type Changes**: [Did we modify core.ts? Did we add a new Spoke type?]
- **Schema Changes**: [Did we modify Zod metadata?]
- **Outcome**: [Status of the build]
```

-----

## ⚡ DATABASE & TYPE WORKFLOW

**Supabase Project ID**: `chftygsapwhahqbqlfdx`

### 1\. Database Migration

```bash
npx supabase migration new [name]
npx supabase migration up --local
```

### 2\. Type Generation (The Critical Path)

After *any* database change, you must regenerate types so `core.ts` can consume them.

```bash
# Local Dev
npx supabase gen types typescript --local > src/integrations/supabase/types.ts

# Production Pull (If needed)
npx supabase gen types typescript --project-id chftygsapwhahqbqlfdx --schema public > src/integrations/supabase/types.ts
```

### 3\. Core Synchronization

*After generating types, check `src/types/core.ts`.*

  - If a new table was added, export its `Db[Name]` wrapper in `core.ts`.
  - If an enum changed, ensure the export in `core.ts` reflects it.

-----

## 🔄 COMMIT STRATEGY

**"Atomic & Descriptive"**

1.  **Type System Commits**: "feat(types): Update core.ts with new billing tables"
2.  **Schema Commits**: "feat(schema): Add vitals to pediatric schema via zField"
3.  **UI Commits**: "feat(ui): Refactor ConsultationModal to use DbConsultation"

**Never commit broken types.** If `core.ts` is broken, the whole app is broken.

-----

## 🎯 QUALITY GATES

1.  **Strict Mode**: No `any` types. Use generic overrides in `core.ts` if flexible data is needed.
2.  **Console Zero**: No console errors allowed.
3.  **Mobile First**: Layouts must not break on mobile.
4.  **Schema Validity**: All Zod schemas must successfully parse their corresponding `Db` type data (bridge check).

<!-- end list -->

```
```