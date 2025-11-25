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

---

## 📝 MANDATORY LOGGING

**Every development session MUST be logged in `development-log.md`**

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

docs/                        # 📁 Organized project documentation
├── README.md               # Documentation standards & organization
├── architecture/           # System design, technical decisions
├── migrations/             # Database migration documentation
├── security/               # RLS policies, compliance docs
├── workflows/              # Development & deployment guides
└── troubleshooting/        # Debugging guides, common fixes

development-log.md           # ⚠️ MANDATORY session log - STAYS IN ROOT for easy access
claude.md                   # This file - Claude Code guidelines
```

---


### Database Operations & Migration Workflow
```bash
# ESSENTIAL: Check system status before any work
npx supabase status

# 3. Generate TypeScript types after successful local migration
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
npx supabase gen types typescript --project-id chftygsapwhahqbqlfdx --schema public > src/integrations/supabase/types.ts
# PRODUCTION DEPLOYMENT
# 4. Push to production (only after local testing)
npx supabase db push

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

### Database Changes - MANDATORY WORKFLOW
1. **Check current state**: `npx supabase status && npx supabase migration list`
2. **Create migration**: `npx supabase migration new [descriptive_name]`
3. **Test locally FIRST**: `npx supabase migration up --local`
4. **Generate types after local success**: `npx supabase gen types typescript --local > src/integrations/supabase/types.ts`
5. **Deploy to production**: `npx supabase db push`
6. **Verify production**: `npx supabase migration list --linked`
7. **Browser validation**: Test all affected workflows
8. **Update development log**: Document in `development-log.md`

### Browser Testing Protocol
```bash
# Start services & verify
npx supabase start
npm run dev
sleep 3 && curl -f http://localhost:8080 || echo "Frontend not ready"

---

## 🔄 COMMIT FREQUENCY GUIDELINES

### MANDATORY: Commit Early, Commit Often

**Core Principle**: Create small, focused commits that represent logical, stable changes.

### When to Commit:
1. **After completing logical units** - When a feature, component, or fix is working
2. **At stable checkpoints** - After testing confirms functionality works end-to-end
3. **Before risky changes** - Before major refactors or AI-assisted file modifications
4. **When something works** - After successful implementation before moving to related files

### Commit Strategy:
- **Group related changes** - Billing system, payment system, clinic management, etc.
- **One logical change per commit** - Each commit should tell a clear story
- **Test before committing** - Ensure the change works as expected
- **Write descriptive messages** - Focus on "why" rather than "what"

### Examples of Logical Commit Units:
- Component updates with related hooks
- Database migrations with associated type generation
- Feature implementations across multiple related files
- Documentation updates as a cohesive set
- Configuration changes that work together

### Proactive Commit Behavior:
- **Suggest commits** after completing significant work units
- **Group changes logically** rather than by file count
- **Follow project commit message style** from recent history
- **Push regularly** to keep remote repository synchronized

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

**Core Philosophy**: Think first, code second, test everything, log comprehensively, leverage AI effectively.