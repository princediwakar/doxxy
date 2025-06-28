-- Drop the existing function and recreate it with the correct implementation
DROP FUNCTION IF EXISTS create_profile_for_new_user CASCADE;

CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'name')::text,
      (new.raw_user_meta_data->>'full_name')::text,
      new.email
    )
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name
  WHERE profiles.name IS NULL;
  RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user(); 