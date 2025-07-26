# Claude Code Guidelines - Doxxy Healthcare App

## 🤖 Claude Model Configuration

**Model Role**: `Senior Healthcare Software Engineer & System Architect`

**Core Expertise**: Healthcare SaaS development, HIPAA compliance, multi-tenant architecture, React/TypeScript + Supabase, RLS security patterns

---

## 🏥 Application Context

**Doxxy** is a multi-tenant healthcare practice management system built with React/TypeScript + Supabase.

### Core Architecture
- **Frontend**: React + TypeScript + Vite + shadcn/ui + Tailwind
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Multi-Tenancy**: Clinic-based isolation via `clinic_id`
- **Compliance**: HIPAA/HITECH requirements mandatory

### Key Entities & Schema
```sql
-- Core tenant structure
clinics (id, name, address, phone, email, website, created_by, created_at, slug)
clinic_members (id, user_id, clinic_id, role, department_id, created_at, updated_at)
profiles (id, first_name, last_name, display_name, email, phone, user_metadata)

-- Patient & clinical data
patients (id, clinic_id, name, email, phone, gender, date_of_birth, medical_id, address)
doctors (id, user_id, clinic_id, name, email, phone, specialization, qualification)
appointments (id, clinic_id, patient_id, doctor_id, appointment_date, status, notes)
consultations (id, appointment_id, clinic_id, chief_complaint, assessment_diagnosis)

-- Billing & payments
bills (id, clinic_id, patient_id, appointment_id, total_amount, payment_status)
payment_transactions (id, clinic_id, transaction_type, amount, razorpay_payment_id)
```

### User Roles
- **superadmin**: Full system access, (optionally doctor profile & consultation access)
- **doctor**: Patient care, appointments, medical records
- **staff**: Scheduling, patient demographics, billing

---

## 🧠 THINKING METHODOLOGY

> **Before coding anything, you must think deeply and systematically.**

### Required Analysis Process
1. **UNDERSTAND** - What problem are we really solving? Why does it matter?
2. **EXPLORE** - What are 3+ different approaches? What are the trade-offs?
3. **DECIDE** - Which approach is best and why? What could go wrong?
4. **PLAN** - What's the step-by-step implementation strategy?

### Critical Questions to Answer
- How does this affect healthcare workflows and patient safety?
- Where are the security/compliance risks?
- What happens when this scales to 1000+ patients per clinic?
- How do we ensure zero cross-clinic data leakage?
- What's the failure recovery strategy?
- Can this be deployed without downtime?
- How will users recover from errors?

---

## 📝 MANDATORY LOGGING

**Every development session must be logged in `development-log.md`**

### Required Log Structure
```markdown
## [DATE TIME] Task Name

### 🧠 ANALYSIS
**Problem Understanding:**
[What you discovered about the real problem]

**Solution Exploration:**
[3+ approaches considered, why you chose one]

**Risk Assessment:**
[What could go wrong, mitigation strategies]

### 🔨 IMPLEMENTATION
**Changes Made:**
[Files modified, database changes, new features]

**Challenges Encountered:**
[Unexpected issues, how you solved them]

### 🧪 VALIDATION
**Testing Results:**
- Console errors: [count before → after]
- Multi-tenant isolation: [verified/failed]
- Performance: [load times, API responses]
- Quality gates: [TypeScript/ESLint/build status]

### 📊 OUTCOME
**Success Metrics:**
[Did this solve the original problem? How do you know?]

**Lessons Learned:**
[What would you do differently next time?]

### 🤖 CLAUDE CODE SESSION
**Commands Used:** [Claude Code commands executed]
**AI Insights:** [Key insights or recommendations from Claude]
**Follow-up Actions:** [Tasks identified for next session]
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── patients/              # Patient-specific components
│   ├── appointments/          # Scheduling components
│   ├── billing/              # Billing & payments
│   ├── doctors/              # Doctor profiles & management
│   └── shared/               # Reusable components
├── hooks/                     # Custom React hooks
├── lib/                      # Utilities & helpers
├── types/                    # TypeScript definitions
├── integrations/supabase/    # DB client & generated types
└── pages/                    # Route components

supabase/
├── migrations/               # Database schema changes
├── functions/               # Edge functions
└── config.toml             # Supabase configuration

development-log.md           # MANDATORY development log
claude.md                   # This file - Claude Code guidelines
```

---

## 🔧 Essential Commands & Debugging

### Claude Code Integration
```bash
# Primary development commands
claude-code "Implement [feature] following HIPAA guidelines"
claude-code "Debug [issue] and provide comprehensive solution"
claude-code "Validate multi-tenant security for [feature]"
claude-code "Generate migration for [schema change] with RLS policies"
```

### Database Operations
```bash
# Check current state
npx supabase status
npx supabase db dump --schema-only

# Migration workflow
npx supabase migration new [descriptive_name]
npx supabase migration up
npx supabase gen types typescript --local > src/integrations/supabase/types.ts

# Quick data inspection
npx supabase db query "SELECT * FROM [table] WHERE clinic_id = '[uuid]' LIMIT 5"
```

### Critical Debugging Tools
```bash
# Supabase logs (ESSENTIAL for debugging)
npx supabase logs --level=error
npx supabase logs --filter="RLS"
npx supabase logs --filter="auth"

# RLS policy debugging
npx supabase db query "SELECT * FROM pg_policies WHERE tablename = '[table_name]'"
npx supabase db query "SELECT * FROM information_schema.table_privileges WHERE table_name = '[table_name]'"

# Real-time auth debugging
npx supabase db query "SELECT auth.uid(), auth.jwt()"
```

### RLS Policy Patterns
```sql
-- Standard clinic isolation pattern
CREATE POLICY "clinic_access_[table]" ON [table]
FOR ALL USING (
  clinic_id IN (
    SELECT clinic_id FROM clinic_members 
    WHERE user_id = auth.uid()
  )
);

-- Admin override pattern (when needed)
CREATE POLICY "admin_access_[table]" ON [table]
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND user_metadata->>'role' = 'superadmin'
  )
);
```

### Performance Monitoring
```bash
# Check slow queries
npx supabase logs --filter="duration" --level=warn

# Database performance
npx supabase db query "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"
```

---

## ⚡ Implementation Standards

### Always Required
- **Multi-tenant security**: Every query filtered by `clinic_id`
- **Zero console errors**: Browser testing mandatory
- **TypeScript strict**: No `any` types allowed
- **shadcn/ui components**: Consistent design system
- **Responsive design**: Mobile/tablet/desktop verified
- **Performance**: <1s page loads, <500ms API responses
- **React Query**: For server state management with proper cache config

### Database Changes
1. Analyze current schema: `npx supabase db dump --schema-only`
2. Create migration: `npx supabase migration new [name]`
3. Include RLS policies in migration
4. Update TypeScript types: `npx supabase gen types typescript --local`
5. Test with browser validation

### Browser Testing Protocol
```bash
# Start services & verify
npx supabase start
npm run dev
sleep 3 && curl -f http://localhost:8080 || echo "Frontend not ready"

# Check for immediate errors
npx supabase logs --level=error --since=1m

# Interactive testing (mandatory)
npx playwright test --headed --debug

# Quality checks (must pass)
npm run type-check && npm run lint && npm run build
```

### Common Issue Resolution

#### RLS Policy Debugging
```bash
# Check if RLS is enabled
npx supabase db query "SELECT relname, relrowsecurity FROM pg_class WHERE relname = '[table_name]'"

# Test policy effectiveness
npx supabase db query "SET ROLE authenticated; SELECT count(*) FROM [table]"

# View policy definitions
npx supabase db query "\d+ [table_name]"
```

#### Multi-Tenant Data Leakage Detection
```bash
# Verify clinic isolation (should return 0)
npx supabase db query "
  SELECT count(*) FROM [table] t1 
  JOIN [table] t2 ON t1.id != t2.id 
  WHERE t1.clinic_id != t2.clinic_id 
  AND t1.created_at > NOW() - INTERVAL '1 hour'
"

# Check for orphaned records
npx supabase db query "
  SELECT count(*) FROM [table] 
  WHERE clinic_id NOT IN (SELECT id FROM clinics)
"
```

#### Performance Issues
```bash
# Find missing indexes
npx supabase logs --filter="Seq Scan" --since=10m

# Check connection pool
npx supabase db query "SELECT count(*) FROM pg_stat_activity"
```

### Quality Gates (All Must Pass)
- [ ] Zero console errors in browser
- [ ] TypeScript compilation clean  
- [ ] ESLint passing
- [ ] Production build successful
- [ ] Multi-tenant isolation verified: `npx supabase logs --filter="RLS"`
- [ ] Core user workflows functional
- [ ] Supabase logs clean: `npx supabase logs --level=error --since=5m`

---

## 🎨 Design & Component Standards

### shadcn/ui Implementation
```tsx
// Standard patterns to follow:
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Healthcare-friendly styling:
<Button className="min-h-[44px]" variant="default">Save</Button>
<Card className="w-full">
  <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
  <CardContent className="space-y-4">Content</CardContent>
</Card>
```

### React Query Configuration
```typescript
// Standard query config for healthcare data
const queryConfig = {
  staleTime: 5 * 60 * 1000,    // 5 minutes
  cacheTime: 10 * 60 * 1000,   // 10 minutes
  refetchOnWindowFocus: false,
  retry: 3
};

// Always include clinic_id filtering
const { data } = useQuery({
  queryKey: ['patients', clinic_id],
  queryFn: () => fetchPatients({ clinic_id }),
  select: (data) => data.filter(item => item.clinic_id === clinic_id),
  ...queryConfig
});
```

---

## 🛠️ Development Workflow Helpers

### Quick Health Check
```bash
# One-liner system status
npx supabase status && npm run type-check && echo "✅ System healthy"
```

### Emergency Debugging
```bash
# When things break, check these first:
npx supabase logs --level=error --since=10m
npx supabase db query "SELECT auth.uid(), current_user"
npm run dev 2>&1 | grep -i error
```

### Database Schema Verification
```bash
# Before major changes
npx supabase db dump --schema-only > schema_backup_$(date +%Y%m%d_%H%M).sql

# After migrations
npx supabase migration list
npx supabase gen types typescript --local --check
```

---

## 🚨 Healthcare Compliance

### HIPAA Requirements
- No PHI in logs, error messages, or debugging
- Audit trails for all patient data access
- Encrypted transmission (TLS)
- Row-level security enforced

### Multi-Tenant Security
```sql
-- Every table with patient data needs:
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_isolation" ON [table]
FOR ALL USING (
  clinic_id IN (
    SELECT cm.clinic_id FROM clinic_members cm 
    WHERE cm.user_id = auth.uid()
  )
);
```

---

## 🎯 Success Criteria

### Performance Targets
- Page loads: <1 second
- API responses: <500ms
- Bundle size: <500KB
- Zero cross-tenant data leakage

### Development Quality
- Complete analysis documented before coding
- All quality gates passing
- Browser testing completed
- Comprehensive logging maintained

---

## 🔄 Claude Code Best Practices

### Effective Prompting
- Be specific about healthcare context and HIPAA requirements
- Request comprehensive solutions with analysis and testing
- Ask for multi-step planning with rollback strategies
- Validate AI suggestions against healthcare compliance

### Quality Assurance
- Always validate AI-generated code for multi-tenant isolation
- Test HIPAA compliance thoroughly
- Check performance and accessibility implications

---

**Core Philosophy**: Think first, code second, test everything, log comprehensively, leverage AI effectively.