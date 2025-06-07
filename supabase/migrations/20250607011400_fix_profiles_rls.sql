-- Fix profiles table RLS policies

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "allow_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_read_profiles" ON profiles;

-- Allow users to read and update their own profiles
CREATE POLICY "allow_read_own_profile" ON profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "allow_update_own_profile" ON profiles  
FOR UPDATE USING (id = auth.uid());

-- Allow profile creation for new users
CREATE POLICY "allow_insert_own_profile" ON profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Also allow authenticated users to see other profiles (for member management)
CREATE POLICY "allow_read_profiles" ON profiles
FOR SELECT USING (auth.uid() IS NOT NULL); 