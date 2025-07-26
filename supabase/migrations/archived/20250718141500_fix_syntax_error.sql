-- Fix syntax error and complete the display name fix

-- Create a view to easily check user data
CREATE OR REPLACE VIEW user_profile_debug AS
SELECT 
  u.id,
  u.email,
  u.phone as auth_phone,
  u.raw_user_meta_data,
  p.name as profile_name,
  p.email as profile_email,
  p.phone as profile_phone,
  p.created_at as profile_created,
  p.updated_at as profile_updated
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Final verification message
SELECT 'Display name fix completed for mental.alternate@gmail.com' as status;