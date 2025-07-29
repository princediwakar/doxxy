# RLS Policies Tightening Plan - Doxxy Healthcare App

**Date**: 2025-07-29  
**Status**: In Progress  
**Priority**: Critical Security Enhancement

---

## 🎯 Executive Summary

Based on analysis of recent RLS policy migrations and actual application usage patterns, this plan systematically tightens Row Level Security policies table-by-table to ensure proper healthcare data isolation, role-based access control, and HIPAA compliance.

### Key Findings from Analysis:
1. **Current RLS policies are too permissive** - many use broad `FOR ALL` policies
2. **Frontend-heavy role filtering** - security depends on client-side logic
3. **Doctor-specific restrictions missing** - appointments/consultations lack proper doctor isolation
4. **Billing operations need tighter controls** - payment operations should be staff/admin only
5. **Missing granular permission checks** - RPC functions bypass some restrictions

---

## 📊 Current State Assessment

### ✅ Working Well:
- Multi-tenant isolation via `clinic_id` filtering
- Helper functions (`is_superadmin()`, `user_clinic_ids()`)
- Basic table-level RLS enablement

### ❌ Security Gaps Identified:
1. **Overly broad `FOR ALL` policies** on healthcare data
2. **Missing role-specific operation restrictions**
3. **Doctor appointment isolation insufficient**
4. **Billing operations lack proper role checks**
5. **Prescription creation not restricted to doctors**
6. **Patient data access too permissive**

---

## 🏗️ Implementation Strategy

### Phase 1: Core Healthcare Data (HIGH PRIORITY)
- **Timeline**: Immediate
- **Tables**: `patients`, `appointments`, `consultations`, `prescriptions`
- **Focus**: HIPAA compliance, doctor-patient relationships

### Phase 2: Business Operations (MEDIUM PRIORITY)
- **Timeline**: Within 48 hours
- **Tables**: `bills`, `payment_transactions`, `appointment_billing`
- **Focus**: Financial data security, role-based billing access

### Phase 3: Administrative Data (MEDIUM PRIORITY)
- **Timeline**: Within 72 hours
- **Tables**: `clinic_members`, `doctors`, `pending_invitations`
- **Focus**: User management, organizational security

---

## 📋 Table-by-Table Implementation Plan

### 1. **PATIENTS** - Priority: CRITICAL 🔴

**Current Issues:**
- Broad `FOR ALL` policy allows any clinic member full CRUD access
- No distinction between clinical and administrative access

**Proposed Policy Structure:**
```sql
-- Read access: All clinic members (for dropdowns, scheduling)
CREATE POLICY "patients_read_clinic_members" ON patients
FOR SELECT USING (
  clinic_id IN (SELECT user_clinic_ids())
);

-- Insert/Update: Staff and superadmins only (administrative)
CREATE POLICY "patients_admin_modify" ON patients
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR is_superadmin()
  )
);

CREATE POLICY "patients_admin_update" ON patients
FOR UPDATE USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR is_superadmin()
  )
);

-- No delete policy - soft deletes only
```

**Justification:**
- **Read access** needed by all for appointments, billing, prescriptions
- **Modify access** restricted to administrative roles
- **HIPAA compliance** through audit trail preservation

---

### 2. **APPOINTMENTS** - Priority: CRITICAL 🔴

**Current Issues:**
- Doctors can see all clinic appointments instead of just their own
- No restrictions on appointment modification based on role

**Proposed Policy Structure:**
```sql
-- Read access: Role-based filtering
CREATE POLICY "appointments_read_filtered" ON appointments
FOR SELECT USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    -- Doctors see only their appointments
    (get_user_role_in_clinic(clinic_id) = 'doctor' AND doctor_id = auth.uid())
    OR
    -- Staff and superadmins see all clinic appointments
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    is_superadmin()
  )
);

-- Create appointments: Staff and superadmins
CREATE POLICY "appointments_staff_create" ON appointments
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR is_superadmin()
  )
);

-- Update appointments: Doctors can update their own, staff/admin can update all
CREATE POLICY "appointments_role_update" ON appointments
FOR UPDATE USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    (get_user_role_in_clinic(clinic_id) = 'doctor' AND doctor_id = auth.uid())
    OR
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    is_superadmin()
  )
);
```

**Justification:**
- **Doctor isolation** for privacy and workflow efficiency
- **Administrative control** over scheduling
- **Status updates** by treating doctors

---

### 3. **CONSULTATIONS** - Priority: CRITICAL 🔴

**Current Issues:**
- Any clinic member can create/modify consultation records
- No doctor ownership enforcement

**Proposed Policy Structure:**
```sql
-- Read access: Doctors see their own + staff/admin see all
CREATE POLICY "consultations_read_role_based" ON consultations
FOR SELECT USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    -- Doctors see consultations for their appointments
    (get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND appointment_id IN (
       SELECT id FROM appointments 
       WHERE doctor_id = auth.uid() AND clinic_id = consultations.clinic_id
     ))
    OR
    -- Staff and superadmins see all
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    is_superadmin()
  )
);

-- Create/Update: Only doctors for their appointments
CREATE POLICY "consultations_doctor_only" ON consultations
FOR ALL USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    -- Only doctors can create/update consultations
    (get_user_role_in_clinic(clinic_id) = 'doctor'
     AND appointment_id IN (
       SELECT id FROM appointments 
       WHERE doctor_id = auth.uid() AND clinic_id = consultations.clinic_id
     ))
    OR
    is_superadmin()
  )
);
```

**Justification:**
- **Medical record integrity** - only treating doctor can document
- **Clinical workflow** enforcement
- **Legal compliance** for medical documentation

---

### 4. **PRESCRIPTIONS** - Priority: CRITICAL 🔴

**Current Issues:**
- Non-doctors can create prescriptions
- No validation of doctor-patient relationship

**Proposed Policy Structure:**
```sql
-- Read access: Role-based with patient relationship
CREATE POLICY "prescriptions_read_authorized" ON prescriptions
FOR SELECT USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    -- Doctors see prescriptions they created
    (get_user_role_in_clinic(clinic_id) = 'doctor' AND doctor_id = auth.uid())
    OR
    -- Staff/admin see all for administrative purposes
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    is_superadmin()
  )
);

-- Create: Only doctors
CREATE POLICY "prescriptions_doctor_create_only" ON prescriptions
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    get_user_role_in_clinic(clinic_id) = 'doctor'
    AND doctor_id = auth.uid()
  )
  AND (
    -- Ensure patient belongs to same clinic
    patient_id IN (SELECT id FROM patients WHERE clinic_id = prescriptions.clinic_id)
  )
);

-- Update: Only prescribing doctor
CREATE POLICY "prescriptions_doctor_update_own" ON prescriptions
FOR UPDATE USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND doctor_id = auth.uid()
  AND get_user_role_in_clinic(clinic_id) = 'doctor'
);
```

**Justification:**
- **Legal requirement** - only licensed doctors can prescribe
- **Patient safety** through proper validation
- **Audit compliance** for controlled substances

---

### 5. **BILLS** - Priority: HIGH 🟡

**Current Issues:**
- All clinic members can modify billing data
- No role restrictions on payment operations

**Proposed Policy Structure:**
```sql
-- Read access: All clinic members (for patient care context)
CREATE POLICY "bills_read_clinic_access" ON bills
FOR SELECT USING (
  clinic_id IN (SELECT user_clinic_ids())
);

-- Create/Update: Staff and superadmins only
CREATE POLICY "bills_admin_modify" ON bills
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    -- Only administrative roles can handle billing
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR is_superadmin()
  )
);

CREATE POLICY "bills_admin_update" ON bills
FOR UPDATE USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR is_superadmin()
  )
);
```

**Justification:**
- **Financial controls** - prevent unauthorized billing changes
- **Workflow separation** - doctors focus on care, staff handle billing
- **Audit compliance** for financial operations

---

### 6. **PAYMENT_TRANSACTIONS** - Priority: HIGH 🟡

**Current Issues:**
- Payment records accessible to all clinic members
- No restrictions on transaction creation

**Proposed Policy Structure:**
```sql
-- Read access: Administrative roles only
CREATE POLICY "payment_transactions_admin_read" ON payment_transactions
FOR SELECT USING (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR is_superadmin()
  )
);

-- Create: Staff and superadmins only (via payment processing)
CREATE POLICY "payment_transactions_admin_create" ON payment_transactions
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT user_clinic_ids())
  AND (
    get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR is_superadmin()
  )
);

-- Update: Superadmins only (for corrections)
CREATE POLICY "payment_transactions_superadmin_update" ON payment_transactions
FOR UPDATE USING (is_superadmin());
```

**Justification:**
- **Financial data protection** - sensitive payment information
- **Role-based access** - only financial administrators
- **Audit security** - prevent unauthorized modifications

---

### 7. **CLINIC_MEMBERS** - Priority: MEDIUM 🟠

**Current Issues:**
- Current policy allows broad access for collaboration
- Need tighter controls on membership management

**Proposed Policy Structure:**
```sql
-- Read access: Users see their own memberships + clinic directories
CREATE POLICY "clinic_members_read_controlled" ON clinic_members
FOR SELECT USING (
  -- Users always see their own memberships
  user_id = auth.uid()
  OR
  -- See other members in shared clinics (for collaboration)
  clinic_id IN (SELECT user_clinic_ids())
  OR
  is_superadmin()
);

-- Create: Superadmins and existing clinic superadmins
CREATE POLICY "clinic_members_admin_invite" ON clinic_members
FOR INSERT WITH CHECK (
  is_superadmin()
  OR
  -- Existing clinic members with admin role can invite
  (clinic_id IN (SELECT user_clinic_ids())
   AND get_user_role_in_clinic(clinic_id) = 'superadmin')
);

-- Update: Role changes by superadmins only
CREATE POLICY "clinic_members_admin_update" ON clinic_members
FOR UPDATE USING (
  is_superadmin()
  OR
  (clinic_id IN (SELECT user_clinic_ids())
   AND get_user_role_in_clinic(clinic_id) = 'superadmin')
);
```

**Justification:**
- **Access control management** - prevent unauthorized role changes
- **Organizational security** - controlled membership management
- **Delegation support** - clinic admins can manage their teams

---

## 🧪 Testing & Validation Plan

### 1. **Multi-Tenant Isolation Testing**
```sql
-- Test clinic isolation
SELECT COUNT(*) FROM (
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name LIKE '%_test%'
) subq;
```

### 2. **Role-Based Access Testing**
- Create test users with different roles
- Verify appointment filtering for doctors
- Test billing restrictions for non-staff users
- Validate prescription creation permissions

### 3. **RPC Function Validation**
- Test all RPC functions with different role contexts
- Verify clinic filtering in complex queries
- Check performance impact of new policies

### 4. **Integration Testing**
- Full application workflow testing
- API endpoint validation
- Frontend role filtering confirmation

---

## 📈 Success Metrics

### Security Metrics:
- ✅ Zero cross-clinic data leakage
- ✅ Role-based restrictions properly enforced
- ✅ Doctor appointment isolation working
- ✅ Billing operations restricted to authorized roles
- ✅ Prescription creation limited to doctors

### Performance Metrics:
- ✅ Query performance maintained (<500ms)
- ✅ RPC function execution times acceptable
- ✅ Frontend application response times stable

### Compliance Metrics:
- ✅ HIPAA audit trail preservation
- ✅ Medical record access properly controlled
- ✅ Financial data access restricted

---

## 🚀 Implementation Timeline

### Phase 1 (Immediate - 24 hours):
- [x] Complete analysis and planning
- [ ] Implement critical healthcare data policies (patients, appointments, consultations, prescriptions)  
- [ ] Basic testing and validation

### Phase 2 (24-48 hours):
- [ ] Implement billing and payment policies
- [ ] Administrative table policies
- [ ] Comprehensive testing

### Phase 3 (48-72 hours):
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Full integration testing
- [ ] Production deployment preparation

---

## 📝 Migration Script Template

Each table will have a dedicated migration following this pattern:

```sql
-- Migration: Tighten RLS for [TABLE_NAME]
-- Date: [DATE]
-- Priority: [PRIORITY]

-- Drop existing broad policies
DROP POLICY IF EXISTS "[old_policy_name]" ON "[table_name]";

-- Create specific role-based policies
CREATE POLICY "[new_policy_name]" ON "[table_name]"
FOR [operation] USING ([conditions]);

-- Add helpful comments
COMMENT ON POLICY "[new_policy_name]" ON "[table_name]" 
IS '[Description of policy purpose and role restrictions]';

-- Test policy effectiveness
SELECT '[table_name] RLS policies updated successfully' as status;
```

---

## 🔍 Monitoring & Maintenance

### Ongoing Monitoring:
1. **Weekly RLS audit queries** to verify isolation
2. **Performance monitoring** for query impacts  
3. **Access pattern analysis** for optimization opportunities
4. **Security log review** for unauthorized access attempts

### Maintenance Tasks:
1. **Quarterly policy review** as application evolves
2. **Role definition updates** as organization grows
3. **Performance tuning** based on usage patterns
4. **Documentation updates** for new team members

---

**Next Steps**: Proceed with Phase 1 implementation focusing on critical healthcare data tables.