-- Drop unused RPCs that have been replaced or were never functional.
-- deduct_appointment_credit: replaced by atomic complete_appointment, zero callers
-- sync_all_clinic_credits: broken (type mismatch), never called from app code
-- sync_credits_one_time: wrapper for broken function, never called from app code

DROP FUNCTION IF EXISTS public.deduct_appointment_credit;
DROP FUNCTION IF EXISTS public.sync_all_clinic_credits;
DROP FUNCTION IF EXISTS public.sync_credits_one_time;
