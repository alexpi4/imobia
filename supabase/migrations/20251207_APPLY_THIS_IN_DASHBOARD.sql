-- =====================================================
-- MIGRATION 1: FIX PROFILES TRIGGER
-- =====================================================
-- This ensures new users get a profile entry automatically

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_nome text;
BEGIN
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1));
  
  INSERT INTO public.profiles (user_id, nome, email, papel)
  VALUES (
    NEW.id,
    v_nome,
    NEW.email,
    'NENHUM'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =====================================================
-- MIGRATION 2: AUTO CONFIRM USERS
-- =====================================================
-- This bypasses email verification

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();


-- =====================================================
-- CLEANUP: DELETE TEST USERS
-- =====================================================
-- Remove test users and their dependencies

-- First, get the profile IDs
DO $$
DECLARE
  profile_ids int8[];
BEGIN
  -- Get all profile IDs for the test users
  SELECT array_agg(id) INTO profile_ids
  FROM profiles 
  WHERE email IN ('mara@gmail.com', 'maria@gmail.com', 'ana@test.com');
  
  -- Clean up all dependencies
  DELETE FROM rodadas_distribuicao WHERE corretor_id = ANY(profile_ids);
  DELETE FROM planejamento_plantao WHERE corretor_id = ANY(profile_ids);
  DELETE FROM liberacao WHERE usuario_id = ANY(profile_ids);
  
  -- Update leads to remove references (set to NULL instead of deleting leads)
  UPDATE leads SET responsavel_id = NULL WHERE responsavel_id = ANY(profile_ids);
  UPDATE leads SET criado_por = NULL WHERE criado_por = ANY(profile_ids);
  
  -- Now delete from auth.users (CASCADE will delete profiles)
  DELETE FROM auth.users WHERE email IN ('mara@gmail.com', 'maria@gmail.com', 'ana@test.com');
  
  RAISE NOTICE 'Deleted % test users', array_length(profile_ids, 1);
END $$;


-- =====================================================
-- VERIFICATION: CHECK TRIGGERS
-- =====================================================
-- Run this to verify everything is working

SELECT t.tgname, t.tgenabled
FROM pg_trigger t 
JOIN pg_class c ON t.tgrelid = c.oid 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE n.nspname = 'auth' AND c.relname = 'users'
ORDER BY t.tgname;
