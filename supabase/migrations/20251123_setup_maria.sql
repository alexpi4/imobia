-- SETUP MARIA USER AND SUBSCRIPTION

DO $$
DECLARE
  v_user_id uuid;
  v_tenant_id int8;
  v_plan_id int8;
BEGIN
  -- 1. Get or Create User (maria@test.com)
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'maria@test.com';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at, 
      raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'maria@test.com', 
      crypt('123456', gen_salt('bf')), now(), 
      jsonb_build_object('nome', 'Maria Silva'), 'authenticated', 'authenticated', now(), now()
    );
    RAISE NOTICE 'User maria@test.com created with ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'User maria@test.com already exists with ID: %', v_user_id;
  END IF;

  -- 2. Ensure Profile Exists
  INSERT INTO public.profiles (user_id, nome, email, papel, equipe, roleta_ativa)
  VALUES (v_user_id, 'Maria Silva', 'maria@test.com', 'ADMIN', 'Vendas', true)
  ON CONFLICT (user_id) DO UPDATE SET 
    papel = 'ADMIN'; -- Ensure she is ADMIN to see menus

  -- 3. Create Tenant (Maria's Company)
  INSERT INTO tenants (name, slug, cnpj)
  VALUES ('Maria Company', 'maria-company', '12345678000199')
  ON CONFLICT (slug) DO NOTHING;
  
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'maria-company';
  
  -- 4. Link User to Tenant
  UPDATE public.profiles SET tenant_id = v_tenant_id WHERE user_id = v_user_id;
  
  -- 5. Create Subscription (Plan: Básico)
  -- Find Plan ID for 'Básico'
  SELECT id INTO v_plan_id FROM plans WHERE name = 'Básico';
  
  IF v_plan_id IS NOT NULL THEN
    INSERT INTO tenant_plans (tenant_id, plan_id, status, start_date, auto_renew)
    VALUES (v_tenant_id, v_plan_id, 'active', now(), true)
    ON CONFLICT (tenant_id) DO UPDATE SET
      plan_id = EXCLUDED.plan_id,
      status = 'active';
      
    RAISE NOTICE 'Subscription created/updated for Tenant ID: % with Plan ID: %', v_tenant_id, v_plan_id;
  ELSE
    RAISE NOTICE 'Plan "Básico" not found. Please ensure seed data is run.';
  END IF;

END $$;
