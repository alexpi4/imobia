import { supabase } from './src/integrations/supabase/client';

/**
 * Migration Runner Script
 * 
 * This script applies the missing migrations to the production database.
 * Run this in the browser console or as a one-time setup script.
 */

async function applyMigrations() {
    console.log('🚀 Starting migration application...');

    try {
        // Migration 1: Fix profiles trigger
        console.log('📝 Applying migration: fix_profiles_trigger');
        const { error: error1 } = await supabase.rpc('exec_sql', {
            sql: `
-- FIX USER REGISTRATION TRIGGER
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
      `
        });

        if (error1) {
            console.error('❌ Error in migration 1:', error1);
        } else {
            console.log('✅ Migration 1 applied successfully');
        }

        // Migration 2: Auto-confirm users
        console.log('📝 Applying migration: auto_confirm_users');
        const { error: error2 } = await supabase.rpc('exec_sql', {
            sql: `
-- AUTO CONFIRM USERS TRIGGER
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
      `
        });

        if (error2) {
            console.error('❌ Error in migration 2:', error2);
        } else {
            console.log('✅ Migration 2 applied successfully');
        }

        console.log('🎉 All migrations completed!');

        // Verify triggers
        console.log('🔍 Verifying triggers...');
        const { data: triggers, error: verifyError } = await supabase.rpc('exec_sql', {
            sql: `
SELECT t.tgname 
FROM pg_trigger t 
JOIN pg_class c ON t.tgrelid = c.oid 
JOIN pg_namespace n ON c.relnamespace = n.oid 
WHERE n.nspname = 'auth' AND c.relname = 'users';
      `
        });

        if (verifyError) {
            console.error('❌ Error verifying triggers:', verifyError);
        } else {
            console.log('✅ Triggers found:', triggers);
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

// Run migrations
applyMigrations();

export { applyMigrations };
