-- Add missing performance indexes identified in schema comparison
-- These indexes improve query performance for common healthcare application patterns

-- Appointment billing indexes for clinic isolation and lookups
CREATE INDEX IF NOT EXISTS idx_appointment_billing_appointment_id ON appointment_billing(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_billing_clinic_id ON appointment_billing(clinic_id);

-- Bills table indexes for invoice lookups and status filtering
CREATE INDEX IF NOT EXISTS idx_bills_invoice_number ON bills(invoice_number);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_clinic_id_created_at ON bills(clinic_id, created_at);

-- Appointments table indexes for date-based queries and status filtering
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id_date ON appointments(clinic_id, date);

-- Patient table indexes for search functionality
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_medical_id ON patients(medical_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id_name ON patients(clinic_id, name);

-- Payment transactions index for Razorpay integration
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_clinic_id ON payment_transactions(clinic_id);

-- Clinic table indexes for public access and slug lookups
CREATE INDEX IF NOT EXISTS idx_clinics_slug ON clinics(slug);
CREATE INDEX IF NOT EXISTS idx_clinics_is_public ON clinics(is_public);

-- Profile table index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Consultation table indexes for appointment and clinic filtering
CREATE INDEX IF NOT EXISTS idx_consultations_appointment_id ON consultations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consultations_clinic_id ON consultations(clinic_id);

-- Prescription table indexes for patient and doctor lookups
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_clinic_id ON prescriptions(clinic_id);

-- Doctor table indexes for clinic and user filtering
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

-- Clinic member indexes for user and clinic lookups (performance critical for RLS)
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON clinic_members(clinic_id);

-- Monthly billing cycles index for clinic filtering
CREATE INDEX IF NOT EXISTS idx_monthly_billing_cycles_clinic_id ON monthly_billing_cycles(clinic_id);

-- Medicine table indexes for search functionality
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_manufacturer ON medicines(manufacturer_name);