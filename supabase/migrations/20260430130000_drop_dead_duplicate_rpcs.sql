-- Migration: Drop redundant/duplicate RPC functions
-- These are dead code: no app code, triggers, or other RPCs call them

-- create_patient: App uses direct supabase.from('patients').insert() via usePatientMutations
DROP FUNCTION IF EXISTS public.create_patient(p_clinic_id uuid, p_name text, p_phone text, p_email text, p_medical_id text, p_gender text, p_address text, p_date_of_birth date);
DROP FUNCTION IF EXISTS public.create_patient(p_clinic_id uuid, p_name text, p_phone text, p_email text, p_medical_id text, p_gender text, p_address text, p_age integer);

-- update_patient: App uses direct supabase.from('patients').update() via usePatientMutations
DROP FUNCTION IF EXISTS public.update_patient(p_patient_id uuid, p_name text, p_phone text, p_email text, p_medical_id text, p_gender text, p_address text, p_date_of_birth date);
DROP FUNCTION IF EXISTS public.update_patient(p_patient_id uuid, p_name text, p_phone text, p_email text, p_medical_id text, p_gender text, p_address text, p_age integer);

-- add_clinic_credits: Not called from any app code, trigger, or other RPC.
-- Credits are managed directly via verify_and_process_payment and direct updates.
DROP FUNCTION IF EXISTS public.add_clinic_credits(clinic_id_param uuid, credits_to_add integer, transaction_id_param uuid);
DROP FUNCTION IF EXISTS public.add_clinic_credits(p_clinic_id uuid, p_credits integer, p_payment_id text, p_order_id text);

-- get_user_clinics / get_user_clinics_simple: Identical functions (both return TABLE(clinic_id uuid), no params).
-- Neither is called from any application code. App uses fetch-clinic-data.ts via get_user_clinic_memberships.
DROP FUNCTION IF EXISTS public.get_user_clinics();
DROP FUNCTION IF EXISTS public.get_user_clinics_simple();

-- verify_and_process_payment: Drop V1 (3-param), keep V2 (5-param) used by edge function
DROP FUNCTION IF EXISTS public.verify_and_process_payment(p_transaction_id uuid, p_razorpay_payment_id text, p_razorpay_signature text);
