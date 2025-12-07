-- FIX USER REGISTRATION TRIGGER
-- This migration ensures that the handle_new_user trigger exists and works correctly
-- It handles cases where metadata might be missing or different

-- 1. Drop existing trigger and function to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Recreate the function with robust error handling and defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_nome text;
BEGIN
  -- Determine name from metadata or fall back to email username
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1));
  
  -- Insert into profiles
  -- Using ON CONFLICT DO NOTHING to prevent errors if profile already exists (e.g. manual insert)
  INSERT INTO public.profiles (user_id, nome, email, papel)
  VALUES (
    NEW.id,
    v_nome,
    NEW.email,
    'NENHUM' -- Default role
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but do not block user registration
    -- In a real production scenario, you might want to log this to a separate table
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
