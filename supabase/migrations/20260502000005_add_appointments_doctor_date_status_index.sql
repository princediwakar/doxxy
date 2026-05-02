-- Composite index for doctor-scoped date-range queries with status filtering
-- Covers: WHERE doctor_id = X AND date >= start AND date <= end AND status = 'No-Show'
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_status
ON appointments (doctor_id, date, status);
