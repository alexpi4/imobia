-- =====================================================
-- FIX PERMISSIONS: RESTORE TENANT & PLAN CREATION
-- =====================================================

-- 1. DROP OLD TRIGGER/FUNCTION
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. CREATE ROBUST FUNCTION (PROFILES + TENANT + PLAN)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_nome text;
  v_tenant_id int8;
  v_plan_id int8;
  v_slug text;
BEGIN
  -- A. Create Profile
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1));
  
  INSERT INTO public.profiles (user_id, nome, email, papel)
  VALUES (
    NEW.id,
    v_nome,
    NEW.email,
    'NENHUM'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- B. Create Tenant (Empresa)
  -- Generate slug: clean email prefix + random suffix
  v_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substr(md5(random()::text), 1, 8);
  
  INSERT INTO tenants (name, slug)
  VALUES ('Empresa ' || v_nome, v_slug)
  RETURNING id INTO v_tenant_id;
  
  -- Link user to tenant
  UPDATE profiles SET tenant_id = v_tenant_id WHERE user_id = NEW.id;

  -- C. Create Subscription (Plan)
  -- Try to find 'Básico' plan, fallback to 'Inicial', then any plan
  SELECT id INTO v_plan_id FROM plans WHERE name = 'Básico' LIMIT 1;
  IF v_plan_id IS NULL THEN
     SELECT id INTO v_plan_id FROM plans WHERE name = 'Inicial' LIMIT 1;
  END IF;
  IF v_plan_id IS NULL THEN
     SELECT id INTO v_plan_id FROM plans LIMIT 1;
  END IF;
  
  IF v_plan_id IS NOT NULL THEN
    INSERT INTO tenant_plans (tenant_id, plan_id, status, start_date, auto_renew)
    VALUES (v_tenant_id, v_plan_id, 'active', now(), true);
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block registration
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. RECREATE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =====================================================
-- BACKFILL: FIX EXISTING USERS (like mara@gmail.com)
-- =====================================================
-- This block finds users without a tenant and creates one for them

DO $$
DECLARE
  r RECORD;
  v_tenant_id int8;
  v_plan_id int8;
  v_slug text;
BEGIN
  -- Find default plan ID once
  SELECT id INTO v_plan_id FROM plans WHERE name = 'Básico' LIMIT 1;
  IF v_plan_id IS NULL THEN
     SELECT id INTO v_plan_id FROM plans LIMIT 1;
  END IF;
  
  IF v_plan_id IS NULL THEN
    RAISE WARNING 'No plans found! Cannot backfill subscriptions.';
    RETURN;
  END IF;

  -- Loop through profiles that are missing a tenant_id
  FOR r IN SELECT * FROM profiles WHERE tenant_id IS NULL LOOP
    
    -- Generate slug
    v_slug := lower(regexp_replace(split_part(r.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substr(md5(random()::text), 1, 8);
    
    -- Create Tenant
    INSERT INTO tenants (name, slug)
    VALUES ('Empresa ' || r.nome, v_slug)
    RETURNING id INTO v_tenant_id;
    
    -- Update Profile
    UPDATE profiles SET tenant_id = v_tenant_id WHERE id = r.id;
    
    -- Create Subscription
    INSERT INTO tenant_plans (tenant_id, plan_id, status, start_date, auto_renew)
    VALUES (v_tenant_id, v_plan_id, 'active', now(), true);
    
    RAISE NOTICE 'Fixed user: % (Tenant ID: %)', r.email, v_tenant_id;
    
  END LOOP;
END $$;
