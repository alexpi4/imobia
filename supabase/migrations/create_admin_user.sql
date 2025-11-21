-- Criar usuário ADMIN: alex@gmail.com / 123456
-- Execute este script no SQL Editor do Supabase Dashboard

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'alex@gmail.com';
  
  IF v_user_id IS NULL THEN
    -- Criar novo usuário
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, 
      instance_id,
      email, 
      encrypted_password, 
      email_confirmed_at, 
      raw_user_meta_data, 
      aud, 
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'alex@gmail.com', 
      crypt('123456', gen_salt('bf')), 
      now(), 
      jsonb_build_object('nome', 'Alex Admin'), 
      'authenticated', 
      'authenticated',
      now(),
      now(),
      '',
      ''
    );
    
    -- Criar profile
    INSERT INTO public.profiles (user_id, nome, email, papel, equipe, roleta_ativa)
    VALUES (v_user_id, 'Alex Admin', 'alex@gmail.com', 'ADMIN', 'Administração', false)
    ON CONFLICT (user_id) DO UPDATE SET 
      papel = EXCLUDED.papel,
      equipe = EXCLUDED.equipe;
      
    -- Criar role
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (v_user_id, 'ADMIN')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Usuário alex@gmail.com criado com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário alex@gmail.com já existe com ID: %', v_user_id;
  END IF;
END $$;
