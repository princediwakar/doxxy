-- Performance Database Indexes Migration
-- Phase 1.3: Database Index Optimization
-- Adds strategic composite indexes for common query patterns

-- 1. Appointments: Optimize for clinic dashboard queries
-- This index supports filtering by clinic, date range, and status
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date_status_composite
ON appointments (clinic_id, date, status);

-- 2. Patients: Optimize for patient list with pagination
-- This index supports filtering by clinic and sorting by creation date
CREATE INDEX IF NOT EXISTS idx_patients_clinic_created_at_pagination
ON patients (clinic_id, created_at DESC);

-- 3. Consultations: Optimize for consultation history queries
-- This index supports filtering by appointment and clinic with creation date
CREATE INDEX IF NOT EXISTS idx_consultations_appointment_clinic_created
ON consultations (appointment_id, clinic_id, created_at DESC);

-- 4. Appointments: Optimize for doctor-specific queries
-- This index supports filtering by doctor, status, and date range
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status_date_composite
ON appointments (doctor_id, status, date DESC);

-- 5. Consultations: Optimize for patient consultation history
-- This index supports filtering by patient and clinic with creation date
CREATE INDEX IF NOT EXISTS idx_consultations_patient_clinic_created_composite
ON consultations (patient_id, clinic_id, created_at DESC);

-- 6. Appointments: Optimize for date-based queries across clinics
-- This index supports global date-based queries (admin dashboards)
CREATE INDEX IF NOT EXISTS idx_appointments_date_status_clinic
ON appointments (date, status, clinic_id);

-- Note: Many indexes already exist from previous optimizations
-- These additional indexes target specific query patterns identified in performance analysis