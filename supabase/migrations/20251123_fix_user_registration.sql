-- AUTOMATIC SUBSCRIPTION ON SIGNUP (FIXED VERSION)

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_tenant_id int8;
  v_plan_id int8;
  v_slug text;
  v_name text;
BEGIN
  -- 1. Create Profile (REQUIRED - this must succeed)
  v_name := COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1));
  
  INSERT INTO profiles (user_id, nome, email, papel)
  VALUES (
    NEW.id,
    v_name,
    NEW.email,
    'NENHUM' -- Default role, can be changed later
  );

  -- 2. Create Tenant (OPTIONAL - wrapped in exception handler)
  BEGIN
    -- Generate slug: email prefix + random suffix
    v_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substr(md5(random()::text), 1, 8);
    
    INSERT INTO tenants (name, slug)
    VALUES ('Empresa ' || v_name, v_slug)
    RETURNING id INTO v_tenant_id;
    
    -- 3. Link User to Tenant
    UPDATE profiles SET tenant_id = v_tenant_id WHERE user_id = NEW.id;
    
    -- 4. Create Initial Subscription
    -- Find 'Básico' or 'Inicial' plan
    SELECT id INTO v_plan_id FROM plans WHERE name = 'Básico' LIMIT 1;
    IF v_plan_id IS NULL THEN
       SELECT id INTO v_plan_id FROM plans WHERE name = 'Inicial' LIMIT 1;
    END IF;
    
    -- If we found a plan, assign it
    IF v_plan_id IS NOT NULL THEN
      INSERT INTO tenant_plans (tenant_id, plan_id, status, start_date, auto_renew)
      VALUES (v_tenant_id, v_plan_id, 'active', now(), true);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create tenant/subscription for user %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is set (it should already be, but good to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
