-- Cleanup script for processed invitation: mental.alternate@gmail.com
-- This script safely removes a processed invitation that was successfully completed
-- but not cleaned up during the normal flow.

-- First, verify the invitation is processed and user exists
-- (This query should return 1 row with all fields populated)
SELECT 
  pi.id as invitation_id,
  pi.email,
  pi.accepted_at,
  p.id as profile_id,
  cm.id as clinic_member_id,
  d.id as doctor_id,
  'All systems configured properly' as status
FROM pending_invitations pi
LEFT JOIN profiles p ON LOWER(TRIM(p.email)) = LOWER(TRIM(pi.email))
LEFT JOIN clinic_members cm ON cm.user_id = p.id AND cm.clinic_id = pi.clinic_id
LEFT JOIN doctors d ON d.user_id = p.id AND d.clinic_id = pi.clinic_id
WHERE pi.email = 'mental.alternate@gmail.com'
  AND pi.accepted_at IS NOT NULL;

-- If the above query returns a complete record, execute the deletion:
-- DELETE FROM pending_invitations 
-- WHERE email = 'mental.alternate@gmail.com' 
--   AND id = 'f6131938-8211-4039-ac68-c9e764c1b9f8'
--   AND accepted_at IS NOT NULL;

-- Alternative: Update invitation with cleanup timestamp instead of deletion
-- UPDATE pending_invitations 
-- SET updated_at = NOW()
-- WHERE email = 'mental.alternate@gmail.com' 
--   AND id = 'f6131938-8211-4039-ac68-c9e764c1b9f8'
--   AND accepted_at IS NOT NULL;