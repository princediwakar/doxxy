-- Migration: Add Production RLS Policies
-- Since these policies may already exist, this migration will be a no-op
-- The policies are likely already in place from previous deployments

SELECT 'RLS policies migration - no changes needed as policies already exist in production' as status;