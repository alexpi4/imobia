-- MINIMAL USER REGISTRATION (PROFILE ONLY)
-- This version ONLY creates the profile, nothing else
-- Use this to test if the basic registration works

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_name text;
BEGIN
  -- Only create Profile - nothing else
  v_name := COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1));
  
  INSERT INTO public.profiles (user_id, nome, email, papel)
  VALUES (
    NEW.id,
    v_name,
    NEW.email,
    'NENHUM'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
