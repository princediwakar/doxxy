# Doxxy Performance Improvement Plan

## Executive Summary

**Current State**: Major TypeScript refactor complete (Hub & Spoke architecture), but runtime performance remains slow (2-4 second page loads, input lag in forms).

**Root Cause**: Optimizing development experience (TypeScript types) without addressing runtime bottlenecks (network, rendering, database).

**Goal**: Reduce page load times by 60-75%, eliminate input lag, and improve overall user experience.

---

## Phase 1: Critical Network Optimization (Priority: HIGH)

### 1.1 Parallelize Consultation Data Fetching
- **Problem**: 6 sequential queries in consultation page (2-3 second delay)
- **Location**: `src/hooks/consultation/useConsultationData.ts`
- **Solution**: Convert to parallel execution using Promise.all
- **Files to modify**:
  - `src/hooks/consultation/useConsultationData.ts`
  - `src/pages/Consultation.tsx`

### 1.2 React Query Prefetching
- **Problem**: Waterfall fetching across components
- **Solution**: Preload appointment/patient data before consultation page
- **Files to modify**:
  - `src/hooks/useAppointments.ts`
  - `src/hooks/usePatients.ts`
  - `src/components/appointments/AppointmentsTable.tsx`

### 1.3 Database Index Optimization
- **Problem**: Missing composite indexes on common filter patterns
- **Solution**: Add indexes for clinic_id + date + status combinations
- **Tables to index**:
  - `appointments` (clinic_id, date, status)
  - `patients` (clinic_id, created_at)
  - `consultations` (appointment_id, created_at)

**Expected Impact**: Consultation page load time: 2-4s ’ 0.5-1s

---

## Phase 2: React Rendering Optimization (Priority: HIGH)

### 2.1 Memoize Consultation Forms
- **Problem**: Excessive re-renders in complex forms
- **Location**: `src/components/consultation/ConsultationFormField.tsx`
- **Solution**: Add React.memo, useMemo for expensive calculations
- **Files to modify**:
  - `src/components/consultation/ConsultationFormField.tsx`
  - `src/components/consultation/ConsultationParts.tsx`
  - `src/components/consultation/MotorExaminationField.tsx`

### 2.2 Optimize Dashboard Components
- **Problem**: Large component trees re-rendering unnecessarily
- **Location**: `src/pages/Dashboard.tsx`
- **Solution**: Memoize charts, appointment lists, and statistics
- **Files to modify**:
  - `src/pages/Dashboard.tsx`
  - `src/components/dashboard/WeeklyAppointmentsChart.tsx`
  - `src/components/role/DoctorDashboard.tsx`

### 2.3 State Management Decoupling
- **Problem**: Global state changes causing cascade re-renders
- **Solution**: Isolate form state from parent components
- **Files to modify**:
  - `src/hooks/consultation/useConsultationForm.ts`
  - `src/hooks/useAppointmentForm.ts`

**Expected Impact**: Eliminate input lag, reduce render cycles by 70%

---

## Phase 3: Bundle & Loading Optimization (Priority: MEDIUM)

### 3.1 Code Splitting Implementation
- **Problem**: Large initial bundle (2-3MB)
- **Solution**: Lazy load non-critical components
- **Components to lazy load**:
  - Consultation modal and forms
  - PDF export functionality
  - Admin/superadmin components
  - Billing and payment modules

### 3.2 Dependency Optimization
- **Problem**: Heavy dependencies adding ~775KB
- **Solution**: Audit and optimize dependencies
- **Targets**:
  - `lodash-es` ’ import specific functions
  - `html2canvas` ’ lazy load only when needed
  - `jspdf` ’ lazy load only when needed

### 3.3 Performance Monitoring Integration
- **Problem**: Performance utilities exist but unused
- **Location**: `src/utils/performance.ts`
- **Solution**: Integrate monitoring into key components
- **Files to modify**:
  - `src/utils/performance.ts`
  - `src/pages/Dashboard.tsx`
  - `src/pages/Consultation.tsx`

**Expected Impact**: Bundle size reduction 40-50%, faster initial load

---

## Phase 4: Database & Query Optimization (Priority: MEDIUM)

### 4.1 Query Pattern Analysis
- **Problem**: N+1 query patterns in clinic data
- **Location**: `src/hooks/useClinicData.ts`
- **Solution**: Batch clinic data requests

### 4.2 Patient List Virtualization
- **Problem**: Large patient lists rendering all items
- **Solution**: Implement virtual scrolling
- **Files to modify**:
  - `src/components/patients/PatientDetailView.tsx`
  - `src/pages/Patients.tsx`

---

## Success Metrics

### Quantitative Goals
- **Consultation page load**: 2-4s ’ 0.5-1s (75% improvement)
- **Dashboard load**: 3-4s ’ 1-2s (60% improvement)
- **Bundle size**: 2-3MB ’ 1-1.5MB (50% reduction)
- **Input response time**: Eliminate lag in forms

### Qualitative Goals
- Smooth typing experience in consultation forms
- No visible loading states for common interactions
- Consistent performance across all user roles

---

## Implementation Strategy

### Week 1: Critical Network Fixes
- Parallel consultation queries
- Database indexes
- React Query prefetching

### Week 2: Rendering Optimization
- Memoize form components
- Optimize dashboard
- State management fixes

### Week 3: Bundle & Loading
- Code splitting
- Dependency optimization
- Performance monitoring

### Week 4: Polish & Measure
- Virtual scrolling
- Final optimizations
- Performance testing

---

## Risk Assessment

### Low Risk
- Memoization changes (reversible)
- Code splitting (progressive enhancement)
- Database indexes (backward compatible)

### Medium Risk
- Parallel query changes (data consistency)
- State management refactoring (complex logic)

### Mitigation Strategy
- Test each change in isolation
- Use feature flags for risky changes
- Maintain rollback capability
- Monitor performance metrics continuously

---

## Resources Required

- **Development Time**: 4 weeks (1 developer)
- **Testing**: Performance testing suite
- **Monitoring**: React Profiler, Network tab analysis
- **Database**: Supabase performance monitoring

---

## Next Steps

1.  Complete performance analysis
2.  Create improvement plan
3. Begin Phase 1 implementation
4. Track progress in `PERFORMANCE_IMPROVEMENT_PROGRESS.md`

---

*Last Updated: 2025-11-28*
*Status: Planning Complete - Ready for Implementation*