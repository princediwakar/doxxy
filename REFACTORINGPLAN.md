Complete Schema & Type Management Refactoring Plan

 Current Bloat Analysis

 Problem Files:

 1. src/lib/consultationNotesSchemas.ts (1369 lines) - Massive Zod schemas + field configs
 2. src/components/consultation/types.ts (137 lines) - Duplicate TypeScript interfaces
 3. src/integrations/supabase/types.ts (1745 lines) - Auto-generated Supabase types

 Total Bloat: ~3250 lines with significant duplication

 Comprehensive Solution

 Phase 1: Eliminate Type Duplication (Immediate)

 Target: Reduce ~1500 lines from consultation schemas
 - Use Zod as single source of truth - Remove duplicate TypeScript interfaces
 - Generate types from schemas - z.infer<typeof schema> instead of manual interfaces
 - Expected reduction: ~500+ lines eliminated

 Phase 2: Modular Schema Architecture

 Target: Break down 1369-line monolith
 src/schemas/
 ├── base/           # Shared schemas (consultation, examination, medication)
 ├── specialties/    # One file per specialty (neurology.ts, ophthalmology.ts, etc.)
 ├── generated/      # Auto-generated types from schemas
 └── config/         # Field configurations (auto-generated from schemas)
 - Eliminate manual field configuration arrays
 - Auto-generate UI configs from schemas

 Phase 3: Replace Auto-Generated Supabase Types

 Target: Replace 1745-line file with ~200-line custom types
 - Create /src/types/database.ts - Only used entities (patients, appointments, consultations, clinics, doctors, billing)
 - Domain-specific organization - patients.ts, appointments.ts, etc.
 - 90% reduction in type definitions

 Phase 4: Database Schema Enhancement (Optional)

 - Structured tables instead of JSON storage for specialty data
 - Database-level validation and indexing
 - Better performance and type safety

 Implementation Strategy

 Migration Approach

 1. Backward compatible changes
 2. Incremental migration by specialty/entity
 3. Feature flags for gradual rollout
 4. Test thoroughly after each phase

 Order of Implementation

 1. Phase 1 + Phase 3 (Immediate) - Eliminate duplication + replace Supabase types
 2. Phase 2 (Short-term) - Modular schema architecture
 3. Phase 4 (Long-term) - Database schema enhancement

 Expected Results

 Code Reduction

 - Consultation schemas: 1369 → ~400 lines (70% reduction)
 - Type definitions: 137 → ~50 lines (65% reduction)
 - Supabase types: 1745 → ~200 lines (90% reduction)
 - Total: 3250 → ~650 lines (80% overall reduction)

 Benefits

 - Single source of truth for types
 - Better maintainability with modular architecture
 - Automated configuration from schemas
 - Framework-ready for Next.js 16 + Tailwind 4
 - Improved performance with structured database

 Next Steps

 Ready to implement Phase 1 + Phase 3 immediately - this addresses the most significant bloat without breaking existing
 functionality.