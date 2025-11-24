-- ASSIGN SUBSCRIPTIONS TO ALL USERS

DO $$
DECLARE
  r_profile RECORD;
  v_tenant_id int8;
  v_plan_id int8;
  v_slug text;
BEGIN
  -- Get the 'Básico' plan ID (or fallback to any active plan)
  SELECT id INTO v_plan_id FROM plans WHERE name = 'Básico' LIMIT 1;
  
  -- If 'Básico' not found, try 'Inicial'
  IF v_plan_id IS NULL THEN
     SELECT id INTO v_plan_id FROM plans WHERE name = 'Inicial' LIMIT 1;
  END IF;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'No active plan found to assign.';
  END IF;

  -- Iterate through all profiles
  FOR r_profile IN SELECT * FROM profiles LOOP
    
    -- 1. Ensure Tenant Exists
    IF r_profile.tenant_id IS NULL THEN
      -- Generate a slug from email or name
      v_slug := lower(regexp_replace(split_part(r_profile.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substr(md5(random()::text), 1, 4);
      
      -- Create Tenant
      INSERT INTO tenants (name, slug)
      VALUES (COALESCE(r_profile.nome, 'Empresa ' || r_profile.email), v_slug)
      RETURNING id INTO v_tenant_id;
      
      -- Link User to Tenant
      UPDATE profiles SET tenant_id = v_tenant_id WHERE id = r_profile.id;
      
      RAISE NOTICE 'Created tenant % for user %', v_slug, r_profile.email;
    ELSE
      v_tenant_id := r_profile.tenant_id;
    END IF;

    -- 2. Ensure Subscription Exists
    INSERT INTO tenant_plans (tenant_id, plan_id, status, start_date, auto_renew)
    VALUES (v_tenant_id, v_plan_id, 'active', now(), true)
    ON CONFLICT (tenant_id) DO NOTHING; -- Skip if already has a plan (even if suspended/cancelled, we leave it as is)
    
  END LOOP;
  
  RAISE NOTICE 'All users processed.';
END $$;
