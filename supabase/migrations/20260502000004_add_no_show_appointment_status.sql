-- Add No-Show to appointment_status enum for analytics tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'appointment_status'::regtype
    AND enumlabel = 'No-Show'
  ) THEN
    ALTER TYPE appointment_status ADD VALUE 'No-Show';
  END IF;
END $$;
