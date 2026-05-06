CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_status
ON appointments (doctor_id, date, status);
