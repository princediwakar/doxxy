-- Cleanup unwanted doctor profiles for superadmins who should be administrators only
-- This migration addresses the issue where superadmins created before the fix 
-- have doctor profiles but should only be administrators

-- First, let's see what we have (this will be logged)
DO $$
DECLARE
    doctor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO doctor_count
    FROM doctors d 
    INNER JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
    WHERE cm.role = 'superadmin';
    
    RAISE NOTICE 'Found % doctor profiles for superadmin users', doctor_count;
END $$;

-- Create a backup table before cleanup (just in case)
CREATE TABLE IF NOT EXISTS doctors_backup_before_cleanup AS 
SELECT * FROM doctors WHERE id IN (
    SELECT d.id
    FROM doctors d 
    INNER JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
    WHERE cm.role = 'superadmin'
);

-- For now, let's just mark these doctor profiles as inactive instead of deleting them
-- This way users can reactivate if they want to become doctors later
UPDATE doctors 
SET is_active = false
WHERE id IN (
    SELECT d.id
    FROM doctors d 
    INNER JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
    WHERE cm.role = 'superadmin'
);

-- Log the cleanup
DO $$
DECLARE
    deactivated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deactivated_count
    FROM doctors d 
    INNER JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
    WHERE cm.role = 'superadmin' AND d.is_active = false;
    
    RAISE NOTICE 'Deactivated % doctor profiles for superadmin users', deactivated_count;
    RAISE NOTICE 'These users can reactivate by using the "Become a Doctor" feature in their profile';
END $$; 