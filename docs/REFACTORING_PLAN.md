PROMPT: System-Wide Type Architecture Refactor (Hub & Spoke)
Role: Principal TypeScript Architect Mission: Transition the entire codebase from "Fragmented/Local Types" to a "Hub & Spoke" Type Architecture while ensuring zero regressions. Scope: src/components/*, src/hooks/*, src/types/*, and src/lib/*.

Core Philosophy:

Zero Local Definitions: No component (.tsx) should define data interfaces (e.g., interface PatientWithDoctor). These must move to shared type definition files.

Single Source of Truth: No file should import Database['public']['Tables'] directly. They must import standardized wrappers from src/types/core.ts.

Metadata-Driven UI: UI configurations (labels, rows) must live in the Zod Schema, not in separate arrays.

Phase 0: Discovery & Assessment (DO THIS FIRST)
Goal: Build a precise inventory of dependencies before editing. Action:

Map Dependencies: Search for Database['public']. List the top 5 components heavily relying on raw Supabase types.

Inventory Local Types: Scan src/components/consultation and src/components/prescriptions. List files that contain interface or type definitions (excluding simple props).

Identify "God Objects": Check src/types/dashboard.ts or patients.ts. Identify types that should be moved to core.ts.

STOP: Output your findings from Phase 0 and a brief plan for the Consultation/Prescription modules specifically. Wait for my approval to proceed to Phase 1.

Phase 1: The Core Foundation (src/types/core.ts)
Action: Create/Overwrite src/types/core.ts. Logic:

Scan src/integrations/supabase/types.ts.

Export ALL tables found there as Db[PascalCaseName] (e.g., DbPatient, DbClinicDepartment, DbBill).

Export ALL enums found there (e.g., UserRole, AppointmentStatus).

Special Override: For Consultation and Prescription tables, use Omit to remove their Json columns (specialty_data, medications) and replace them with inferred types from the Zod schemas (which will be finalized in Phase 2).

Phase 2: The Schema Engine (Refactor src/lib)
Action: Modernize src/lib/consultationNotesSchemas.ts. Logic:

Create src/lib/schemaUtils.ts containing:

zField helper.

createEyeField factory.

getSectionsFromSchema bridge function (to convert schema metadata into the old array format the UI expects).

Refactor consultationNotesSchemas.ts:

Iterate through every schema definition.

Convert separate config arrays (fieldSections) into direct .describe() metadata on the Zod fields.

Crucial: Export medicationSchema separately so core.ts can use it in Phase 1 if needed.

Cleanup: Delete the legacy configuration arrays once metadata is migrated.

Phase 3: The "Spoke" Migration (Module by Module)
Action: Create feature-specific type files in src/types/ (e.g., superadmin.ts, patients.ts). Heuristic: For each major folder in src/components/:

Scan .tsx files for local interfaces (e.g., interface DepartmentWithStatus).

Extract them to src/types/[module].ts.

Refactor them to extend Db[Entity] from core.ts.

Target Pattern:

TypeScript

// OLD (Inside Component):
interface DepartmentWithStatus extends Database['public']['Tables']['department_types']['Row'] { ... }

// NEW (in src/types/superadmin.ts):
import { DbDepartmentType } from './core';
export interface DepartmentWithStatus extends DbDepartmentType { ... }
Phase 4: Global Cleanup
Action: Final Find & Replace.

Search globally for Database['public']. Replace usage with named imports from src/types/core.ts.

Search for usage of old schema config arrays (specialtyFieldSections). Replace with getSpecialtyFields(schema).

Delete any types.ts files found inside component folders.