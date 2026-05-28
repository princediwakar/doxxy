-- Add pending_meta_verification to clinic_whatsapp_connections status CHECK constraint.
-- Must drop and recreate because Postgres does not support ALTER-ing CHECK constraints in-place.
ALTER TABLE clinic_whatsapp_connections
  DROP CONSTRAINT clinic_whatsapp_connections_status_check;

ALTER TABLE clinic_whatsapp_connections
  ADD CONSTRAINT clinic_whatsapp_connections_status_check
  CHECK (status IN ('active', 'expired', 'disconnected', 'pending_meta_verification'));
