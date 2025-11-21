-- SEED DATA
-- Creates 5 users, profiles, roles, and populates other tables

DO $$
DECLARE
  v_user_ids uuid[];
  v_user_id uuid;
  i integer;
  v_names text[] := ARRAY['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Lucas Pereira'];
  v_emails text[] := ARRAY['joao@test.com', 'maria@test.com', 'pedro@test.com', 'ana@test.com', 'lucas@test.com'];
  v_roles app_role[] := ARRAY['CORRETOR', 'CORRETOR', 'GESTOR', 'Agenciador', 'Atendente']::app_role[];
  v_unidade_ids int8[];
  v_cidade_ids int8[];
  v_equipe_ids int8[];
  v_turno_ids int8[];
BEGIN
  -- 1. AUTH USERS & PROFILES
  FOR i IN 1..5 LOOP
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_emails[i];
    
    IF v_user_id IS NULL THEN
      v_user_id := gen_random_uuid();
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
      VALUES (v_user_id, v_emails[i], crypt('123456', gen_salt('bf')), now(), jsonb_build_object('nome', v_names[i]), 'authenticated', 'authenticated');
      
      -- Profile is created by trigger, but we update it or insert if trigger failed/not present yet
      INSERT INTO public.profiles (user_id, nome, email, papel, equipe, roleta_ativa)
      VALUES (v_user_id, v_names[i], v_emails[i], v_roles[i]::text, 'Equipe Alpha', true)
      ON CONFLICT (user_id) DO UPDATE SET 
        papel = EXCLUDED.papel,
        equipe = EXCLUDED.equipe,
        roleta_ativa = EXCLUDED.roleta_ativa;
        
      INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, v_roles[i])
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    v_user_ids := array_append(v_user_ids, v_user_id);
  END LOOP;

  -- 2. CIDADES
  INSERT INTO cidades (nome, estado) VALUES 
    ('São Paulo', 'SP'), ('Rio de Janeiro', 'RJ'), ('Belo Horizonte', 'MG'), ('Curitiba', 'PR'), ('Porto Alegre', 'RS');
  
  SELECT array_agg(id) INTO v_cidade_ids FROM cidades WHERE nome IN ('São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre');

  -- 3. TIME DE VENDAS
  INSERT INTO time_de_vendas (nome, responsavel, unidade, email) VALUES
    ('Equipe Alpha', 'Carlos Gerente', 'Criciúma', 'alpha@crm.com'),
    ('Equipe Beta', 'Roberto Lider', 'Içara', 'beta@crm.com'),
    ('Equipe Gama', 'Fernanda Chefe', 'Cocal do Sul', 'gama@crm.com'),
    ('Equipe Delta', 'Ricardo Supervisor', 'Criciúma', 'delta@crm.com'),
    ('Equipe Omega', 'Patrícia Coord', 'Içara', 'omega@crm.com');
    
  SELECT array_agg(id) INTO v_equipe_ids FROM time_de_vendas WHERE email IN ('alpha@crm.com', 'beta@crm.com', 'gama@crm.com', 'delta@crm.com', 'omega@crm.com');

  -- 4. TURNOS
  INSERT INTO turnos (nome, hora_inicio, hora_fim, ativo) VALUES
    ('Manhã', '08:00', '12:00', true),
    ('Tarde', '13:00', '18:00', true),
    ('Noite', '18:00', '22:00', true),
    ('Plantão FDS', '09:00', '18:00', true),
    ('Madrugada', '22:00', '06:00', false);
    
  SELECT array_agg(id) INTO v_turno_ids FROM turnos WHERE nome IN ('Manhã', 'Tarde', 'Noite', 'Plantão FDS', 'Madrugada');

  -- 5. LEADS
  -- Using the first user as creator/responsible for simplicity
  INSERT INTO leads (nome, email, telefone, origem, intencao, unidade, pipeline, urgencia, criado_por, responsavel_id) VALUES
    ('Cliente Um', 'c1@lead.com', '11999991111', 'Site', 'Venda', 'Criciúma', 'Novo', 'Alta', (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), (SELECT id FROM profiles WHERE user_id = v_user_ids[1])),
    ('Cliente Dois', 'c2@lead.com', '11999992222', 'WhatsApp', 'Locação', 'Içara', 'Qualificação', 'Normal', (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), (SELECT id FROM profiles WHERE user_id = v_user_ids[2])),
    ('Cliente Três', 'c3@lead.com', '11999993333', 'Indicação', 'Venda', 'Cocal do Sul', 'Visita', 'Crítica', (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), (SELECT id FROM profiles WHERE user_id = v_user_ids[3])),
    ('Cliente Quatro', 'c4@lead.com', '11999994444', 'RD', 'Indefinido', 'Criciúma', 'Ganho', 'Normal', (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), (SELECT id FROM profiles WHERE user_id = v_user_ids[4])),
    ('Cliente Cinco', 'c5@lead.com', '11999995555', 'Site', 'Venda', 'Içara', 'Perdido', 'Normal', (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), NULL);

  -- 6. PLANEJAMENTO PLANTAO
  -- Current month, different days
  INSERT INTO planejamento_plantao (nome, mes, equipe_id, corretor_id, dia, turno_id) VALUES
    ('Plantão 01', CURRENT_DATE, v_equipe_ids[1], (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), CURRENT_DATE, v_turno_ids[1]),
    ('Plantão 02', CURRENT_DATE, v_equipe_ids[1], (SELECT id FROM profiles WHERE user_id = v_user_ids[2]), CURRENT_DATE + 1, v_turno_ids[1]),
    ('Plantão 03', CURRENT_DATE, v_equipe_ids[1], (SELECT id FROM profiles WHERE user_id = v_user_ids[3]), CURRENT_DATE + 2, v_turno_ids[1]),
    ('Plantão 04', CURRENT_DATE, v_equipe_ids[1], (SELECT id FROM profiles WHERE user_id = v_user_ids[4]), CURRENT_DATE + 3, v_turno_ids[1]),
    ('Plantão 05', CURRENT_DATE, v_equipe_ids[1], (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), CURRENT_DATE + 4, v_turno_ids[1])
  ON CONFLICT (dia, turno_id, corretor_id) DO NOTHING;

  -- 7. RODADAS DISTRIBUICAO
  INSERT INTO rodadas_distribuicao (numero_rodada, corretor_id, cliente_atribuido, status, origem_disparo) VALUES
    (1, (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), 'Cliente Teste 1', 'sucesso', 'manual'),
    (2, (SELECT id FROM profiles WHERE user_id = v_user_ids[2]), 'Cliente Teste 2', 'sucesso', 'automatico'),
    (3, (SELECT id FROM profiles WHERE user_id = v_user_ids[3]), 'Cliente Teste 3', 'erro', 'webhook'),
    (4, (SELECT id FROM profiles WHERE user_id = v_user_ids[4]), 'Cliente Teste 4', 'sucesso', 'manual'),
    (5, (SELECT id FROM profiles WHERE user_id = v_user_ids[1]), 'Cliente Teste 5', 'pendente', 'automatico');

  -- 8. WEBHOOKS
  INSERT INTO webhooks (nome, url, tipo, ativo) VALUES
    ('Webhook RD Station', 'https://api.rd.com/callback', 'automatico', true),
    ('Webhook Zapier', 'https://hooks.zapier.com/123', 'manual', true),
    ('Webhook Slack', 'https://slack.com/api/webhook', 'automatico', false),
    ('Webhook Custom', 'https://my-api.com/hook', 'manual', true),
    ('Webhook Legacy', 'https://old-system.com/hook', 'automatico', false);

  -- 9. INTEGRACOES
  INSERT INTO integracoes (nome, url, status) VALUES
    ('RD Station', 'https://api.rdstation.com', 'ativo'),
    ('Google Calendar', 'https://googleapis.com/calendar', 'ativo'),
    ('WhatsApp API', 'https://wpp.api.com', 'inativo'),
    ('Facebook Ads', 'https://graph.facebook.com', 'ativo'),
    ('Zapier', 'https://zapier.com', 'ativo');

  -- 10. CIDADE_UNIDADE (Linking first 5 cities to first unit)
  INSERT INTO cidade_unidade (cidade_id, unidade_id) 
  SELECT id, (SELECT id FROM unidades LIMIT 1) FROM cidades WHERE id = ANY(v_cidade_ids) LIMIT 5
  ON CONFLICT (cidade_id, unidade_id) DO NOTHING;

END $$;
