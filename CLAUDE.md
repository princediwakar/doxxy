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

## 🔒 BACKUP SAFETY PROTOCOL

### Mandatory Backup Rules

**WHEN TO CREATE BACKUPS:**
- Before editing any file with unstaged git changes
- Before significant refactoring operations
- When user explicitly requests backup
- Before making changes to files with complex logic

**WHEN NOT TO CREATE BACKUPS:**
- Simple one-line changes (comments, minor fixes)
- Files without existing changes
- When user explicitly says not to backup

**BACKUP WORKFLOW:**
1. Check if file has unstaged changes: `git status --porcelain <file>`
2. If changes exist, create backup: `source .claude/backup-utils.sh && backup_file <file_path>`
3. Make edits to original file
4. Clean up backups before git commit: `source .claude/backup-utils.sh && clean_backups`

**BACKUP MANAGEMENT:**
- Single `.bak` file per original file (replaces existing)
- Clean all backups before any git commit
- Manual restoration available: `restore_backup <file_path>`
- List current backups: `list_backups`

### Backup Utility Commands
```bash
# Load backup utilities
source .claude/backup-utils.sh

# Create backup before editing
backup_file "src/components/SomeComponent.tsx"

# Restore from backup if needed
restore_backup "src/components/SomeComponent.tsx"

# List current backups
list_backups

# Clean all backups (MANDATORY before commits)
clean_backups
```

---

**Core Philosophy**: Think first, code second, test everything, log comprehensively, leverage AI effectively.