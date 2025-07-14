Clinic Management System - Gemini CLI Rules
🏥 Project Overview
Multi-tenant healthcare web app for medical clinicsStack: Vite + React + TypeScript, Tailwind + Shadcn UI, Supabase (RLS + MCP)Critical: Multi-tenancy, RBAC (superadmin/doctor/staff), HIPAA complianceTools: Supabase MCP (DB ops), Playwright MCP (browser testing interactive instead of automated written tests), Context 7 MCP (API docs)


🚨 Security & Multi-Tenancy
Row Level Security (RLS) - ALWAYS ENFORCE
WHERE clinic_id IN (
  SELECT clinic_id FROM clinic_members 
  WHERE user_id = auth.uid()
)

Data Access
// Filter by clinic_id in all queries
const { data } = useQuery({
  queryKey: ['resource', clinic_id],
  queryFn: () => getResource(clinic_id)
});

Input Validation
// Validate clinic_id in forms
const schema = z.object({
  clinic_id: z.string().uuid(),
  // other fields...
});


🎯 Autonomous Operation & Browser Testing
Proceed Autonomously For

Code edits, migrations, types, tests
UI changes, bug fixes, features
Performance optimizations
DB schema changes with validation

🚨 MANDATORY: Browser Testing
RULE: Every change requires Playwright MCP testing

Take before/after snapshots
Check console for errors
Test user flows in browser
Verify multi-tenant isolation
Test responsive design (mobile/tablet/desktop)

Clarify Only When

Unclear requirements or missing context
High-risk operations (e.g., data deletion)
Ambiguous healthcare workflows

Rule: Clear requirements → implement + test. Unclear → ask specific questions.

🎨 Design System
Principles

Trust: Blue palette, clean typography
Clarity: Clear hierarchy, ample spacing
Accessibility: 44px touch targets, WCAG AA
Consistency: Reusable components, tokens

Design Tokens
const typography = {
  title: 'text-2xl font-semibold tracking-tight',
  body: 'text-sm font-normal leading-relaxed'
};

const colors = {
  primary: 'bg-blue-500 text-white',
  error: 'bg-red-50 text-red-600'
};

const spacing = {
  normal: 'space-y-4 gap-4 p-4'
};

Components
// Button
className={cn('px-4 py-2 rounded-lg min-h-[44px]', 'bg-blue-500 hover:bg-blue-600 text-white')}

// Card
className={cn('bg-white rounded-xl shadow-sm border')}

// Input
className={cn('w-full px-3 py-2 border rounded-lg', 'focus:ring-2 focus:ring-blue-500')}


⚡ Quality Pipeline
After Every Change

Analyze Schema
mcp_supabase_list_tables
mcp_supabase_get_relationships table_name


Code Quality
npm run lint
npm run build
npm run test



Browser Testing
pkill -f "vite"
# USER starts: npm run dev
sleep 3 && curl localhost:8080

Navigate to localhost:8080
Take snapshot
Check console errors


Test Checklist

 No new console errors
 Feature works in browser
 Multi-tenant isolation verified
 Responsive design tested
 Error handling confirmed


API Docs (If Needed)
use context 7 to get updated api docs


Quality Gates

 TypeScript compiles
 No console errors
 User flow tested
 Design system applied
 Multi-tenant security verified
 HIPAA compliance maintained




🔧 Technical Standards
Database Flow

Check schema: mcp_supabase_list_tables
Plan migration: Check relationships
Apply changes: mcp_supabase_create_table
Update RLS: mcp_supabase_add_rls_policy
Add indexes: mcp_supabase_create_index
Update code: Modify hooks/components
Browser test: Playwright MCP

TypeScript

Strict mode enabled
No any types
Update types after schema changes

React Query

staleTime: 5 * 60 * 1000
Filter by clinic_id
Use select for optimization
Handle errors

Performance

Use React.memo
Index clinic_id columns
Bundle <500KB
Lazy load non-critical components


📁 File Structure
src/
├── components/ui/        # Shadcn UI
├── components/[feature]/ # Feature components
├── hooks/                # Custom hooks
├── types/                # Type definitions
├── utils/                # Utilities
└── integrations/supabase/
    └── types.ts          # DB types

supabase/
├── migrations/           # DB migrations
└── functions/            # Edge functions


🛠️ Gemini CLI + MCP Workflow
Context Analysis
list tables using supabase mcp
get updated api docs using context7 mcp

Browser Testing
# Baseline
navigate to http://localhost:8080
take snapshot using playwright mcp
check console messages using playwright mcp

# Feature Test
mcp_playwright_browser_click "[data-testid='main-feature']"
mcp_playwright_browser_wait_for_selector ".success-indicator"
mcp_playwright_browser_snapshot

# Multi-Tenant Test
mcp_playwright_browser_click "[data-testid='clinic-switcher']"
mcp_playwright_browser_wait_for_selector "[data-testid='data-isolated']"
mcp_playwright_browser_snapshot


🚨 Common Issues
Multi-Tenant Security
# Check RLS
mcp_supabase_query table_name "clinic_id = 'test-clinic-id'"

# Add RLS
mcp_supabase_add_rls_policy table_name "
  CREATE POLICY clinic_isolation ON table_name
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  )
"

Database Relationships
mcp_supabase_add_column table_name "clinic_id UUID REFERENCES clinics(id)"


🏥 Healthcare Requirements
HIPAA Compliance

No PHI in logs/errors
RLS for all data
Encrypted transmission
Audit trails

RBAC

superadmin: Full control
doctor: Patient records, appointments
staff: Scheduling, basic data

Data Integrity

Cascade deletes
Audit trails
Prevent cross-clinic leaks
Multi-level validation


📝 Documentation
Code
/**
 * Fetch patient records
 * @param clinic_id - Clinic UUID
 * @returns Promise<Patient[]>
 */

Changes
## [YYYY-MM-DD] Feature
- **Purpose**: [Description]
- **Files**: [List]
- **DB Changes**: [List]
- **Testing**: [Results]


✅ Completion Checklist

 Code compiles, tests pass
 No console errors
 Multi-tenant isolation verified
 Responsive design tested
 HIPAA compliance maintained
 Design system applied
 Documentation complete

If any fail → continue until all pass.

🎯 Success Metrics

Performance: Page load <1s, API <500ms, build <30s
Quality: 100% isolation, WCAG AA, zero PHI exposure
UX: Intuitive workflows, clear errors


📞 Emergency Protocols
Security Incident

Apply RLS: mcp_supabase_add_rls_policy
Check exposure: mcp_supabase_query
Test UI: Playwright MCP
Log: Context 7 MCP

Data Issues

Stop processes
Assess: mcp_supabase_query
Test UI: Playwright MCP
Verify recovery
