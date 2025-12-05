-- Sync clinic credits with actual consultation counts
-- This migration fixes the credit usage data to match actual appointments

-- Create a function to calculate credit usage per clinic
CREATE OR REPLACE FUNCTION public.calculate_clinic_credit_usage(clinic_id_param UUID)
RETURNS TABLE (
  clinic_id UUID,
  credits_used INTEGER,
  appointments_count INTEGER,
  completed_count INTEGER,
  in_progress_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH appointment_counts AS (
    SELECT
      a.clinic_id,
      COUNT(*) FILTER (WHERE a.status = 'Completed') as completed_count,
      COUNT(*) FILTER (WHERE a.status = 'In Progress') as in_progress_count,
      COUNT(*) FILTER (WHERE a.status IN ('Completed', 'In Progress')) as total_consultations
    FROM appointments a
    WHERE a.clinic_id = clinic_id_param
    GROUP BY a.clinic_id
  )
  SELECT
    ac.clinic_id,
    ac.total_consultations as credits_used,
    ac.total_consultations as appointments_count,
    ac.completed_count,
    ac.in_progress_count
  FROM appointment_counts ac;
END;
$$;

-- Create a function to sync all clinic credits
CREATE OR REPLACE FUNCTION public.sync_all_clinic_credits()
RETURNS TABLE (
  clinic_id UUID,
  old_credits_used INTEGER,
  new_credits_used INTEGER,
  credit_balance INTEGER,
  total_credits_purchased INTEGER,
  updated BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  clinic_record RECORD;
  calculated_usage RECORD;
  clinics_updated INTEGER;
  clinics_unchanged INTEGER;
  summary_text TEXT;
BEGIN
  -- Initialize counters
  clinics_updated := 0;
  clinics_unchanged := 0;
  summary_text := '';

  -- Loop through all clinics with credit records
  FOR clinic_record IN
    SELECT cc.clinic_id, cc.total_credits_purchased, cc.total_credits_used as old_usage
    FROM clinic_credits cc
  LOOP
    -- Calculate actual credit usage for this clinic
    SELECT * INTO calculated_usage
    FROM calculate_clinic_credit_usage(clinic_record.clinic_id);

    -- Update clinic_credits if usage is different
    IF calculated_usage.credits_used IS NOT NULL AND
       calculated_usage.credits_used != clinic_record.old_usage THEN

      UPDATE clinic_credits
      SET
        total_credits_used = calculated_usage.credits_used,
        credit_balance = clinic_record.total_credits_purchased - calculated_usage.credits_used,
        updated_at = NOW()
      WHERE clinic_id = clinic_record.clinic_id;

      clinics_updated := clinics_updated + 1;
      summary_text := summary_text ||
        FORMAT('Clinic %s: %s ’ %s credits used (balance: %s), ',
               clinic_record.clinic_id, clinic_record.old_usage,
               calculated_usage.credits_used,
               clinic_record.total_credits_purchased - calculated_usage.credits_used);

      -- Return update result
      clinic_id := clinic_record.clinic_id;
      old_credits_used := clinic_record.old_usage;
      new_credits_used := calculated_usage.credits_used;
      credit_balance := clinic_record.total_credits_purchased - calculated_usage.credits_used;
      total_credits_purchased := clinic_record.total_credits_purchased;
      updated := TRUE;
      RETURN NEXT;
    ELSE
      clinics_unchanged := clinics_unchanged + 1;
      summary_text := summary_text ||
        FORMAT('Clinic %s: %s credits used (no change), ',
               clinic_record.clinic_id, clinic_record.old_usage);

      -- No update needed
      clinic_id := clinic_record.clinic_id;
      old_credits_used := clinic_record.old_usage;
      new_credits_used := COALESCE(calculated_usage.credits_used, clinic_record.old_usage);
      credit_balance := clinic_record.total_credits_purchased - COALESCE(calculated_usage.credits_used, clinic_record.old_usage);
      total_credits_purchased := clinic_record.total_credits_purchased;
      updated := FALSE;
      RETURN NEXT;
    END IF;
  END LOOP;

  -- Handle clinics without credit records (create them)
  FOR clinic_record IN
    SELECT c.id as clinic_id, 0 as total_credits_purchased
    FROM clinics c
    WHERE NOT EXISTS (
      SELECT 1 FROM clinic_credits cc WHERE cc.clinic_id = c.id
    )
  LOOP
    -- Calculate usage for clinic without credit record
    SELECT * INTO calculated_usage
    FROM calculate_clinic_credit_usage(clinic_record.clinic_id);

    -- Insert new credit record
    INSERT INTO clinic_credits (
      clinic_id,
      credit_balance,
      total_credits_purchased,
      total_credits_used,
      created_at,
      updated_at
    ) VALUES (
      clinic_record.clinic_id,
      clinic_record.total_credits_purchased - COALESCE(calculated_usage.credits_used, 0),
      clinic_record.total_credits_purchased,
      COALESCE(calculated_usage.credits_used, 0),
      NOW(),
      NOW()
    );

    clinics_updated := clinics_updated + 1;
    summary_text := summary_text ||
      FORMAT('Clinic %s: created with %s credits used (balance: %s), ',
             clinic_record.clinic_id, COALESCE(calculated_usage.credits_used, 0),
             clinic_record.total_credits_purchased - COALESCE(calculated_usage.credits_used, 0));

    -- Return creation result
    clinic_id := clinic_record.clinic_id;
    old_credits_used := 0;
    new_credits_used := COALESCE(calculated_usage.credits_used, 0);
    credit_balance := clinic_record.total_credits_purchased - COALESCE(calculated_usage.credits_used, 0);
    total_credits_purchased := clinic_record.total_credits_purchased;
    updated := TRUE;
    RETURN NEXT;
  END LOOP;

  -- Log summary
  RAISE NOTICE 'Credit sync: % clinics updated, % clinics unchanged', clinics_updated, clinics_unchanged;
  RAISE NOTICE 'Summary: %', summary_text;
END;
$$;

-- Create a one-time sync function that can be called manually
CREATE OR REPLACE FUNCTION public.sync_credits_one_time()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log start
  RAISE NOTICE 'Starting credit sync for all clinics...';

  -- Call the sync function
  PERFORM * FROM sync_all_clinic_credits();

  RAISE NOTICE 'Credit sync completed successfully';
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.calculate_clinic_credit_usage IS 'Calculates credit usage based on completed and in-progress appointments';
COMMENT ON FUNCTION public.sync_all_clinic_credits IS 'Syncs clinic_credits table with actual appointment counts';
COMMENT ON FUNCTION public.sync_credits_one_time IS 'One-time sync function to fix credit data';

-- Run the sync (uncomment to run automatically during migration)
-- SELECT public.sync_credits_one_time();