-- TURNOS
CREATE TABLE turnos (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL,
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access" ON turnos FOR SELECT TO authenticated USING (true);

-- PLANEJAMENTO PLANTAO
CREATE TABLE planejamento_plantao (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL,
  mes date NOT NULL,
  equipe_id int8 REFERENCES time_de_vendas(id) ON DELETE CASCADE,
  corretor_id int8 REFERENCES profiles(id) ON DELETE CASCADE,
  dia date NOT NULL,
  turno_id int8 REFERENCES turnos(id) ON DELETE CASCADE,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_dia_turno_corretor UNIQUE (dia, turno_id, corretor_id)
);
ALTER TABLE planejamento_plantao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access" ON planejamento_plantao FOR SELECT TO authenticated USING (true);

-- RODADAS DISTRIBUICAO
CREATE TABLE rodadas_distribuicao (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  numero_rodada int8 NOT NULL,
  equipe_id int8 REFERENCES time_de_vendas(id),
  unidade_id int8 REFERENCES unidades(id),
  corretor_id int8 NOT NULL REFERENCES profiles(id),
  cliente_atribuido text NOT NULL,
  telefone_cliente text,
  email_cliente text,
  origem_lead text,
  status text DEFAULT 'sucesso' CHECK (status IN ('sucesso', 'erro', 'pendente')),
  origem_disparo text DEFAULT 'manual' CHECK (origem_disparo IN ('manual', 'automatico', 'webhook')),
  lead_id int8 REFERENCES leads(id),
  observacoes text,
  data_execucao timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE rodadas_distribuicao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access" ON rodadas_distribuicao FOR SELECT TO authenticated USING (true);

-- WEBHOOKS
CREATE TABLE webhooks (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL,
  url text NOT NULL,
  tipo text DEFAULT 'manual' CHECK (tipo IN ('manual', 'automatico')),
  secret text,
  eventos jsonb DEFAULT '[]'::jsonb,
  ativo boolean DEFAULT true,
  ultima_execucao timestamptz,
  total_execucoes int8 DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON webhooks FOR ALL TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- HISTORICO WEBHOOKS
CREATE TABLE historico_webhooks (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  webhook_id int8 REFERENCES webhooks(id) ON DELETE CASCADE,
  rodada_id int8 REFERENCES rodadas_distribuicao(id),
  payload jsonb,
  response jsonb,
  status_code int,
  sucesso boolean,
  erro text,
  tempo_resposta_ms int,
  data_disparo timestamptz DEFAULT now()
);
ALTER TABLE historico_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON historico_webhooks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- CONFIG CRM
CREATE TABLE config_crm (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ativa boolean DEFAULT false,
  nome_integracao text,
  url text,
  api_key text,
  mapeamento_campos jsonb,
  ultima_sincronizacao timestamptz,
  total_sincronizacoes int8 DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE config_crm ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON config_crm FOR ALL TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- CONFIG GOOGLE CALENDAR
CREATE TABLE config_google_calendar (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  api_key text,
  client_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE config_google_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON config_google_calendar FOR ALL TO authenticated USING (has_role(auth.uid(), 'ADMIN'));

-- LOGS AUDITORIA
CREATE TABLE logs_auditoria (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  usuario_id int8 REFERENCES profiles(id),
  acao text NOT NULL CHECK (acao IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'DISTRIBUICAO', 'ROLETA', 'WEBHOOK')),
  entidade text NOT NULL,
  entidade_id text,
  dados_anteriores jsonb,
  dados_novos jsonb,
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access" ON logs_auditoria FOR SELECT TO authenticated USING (has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Insert access" ON logs_auditoria FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATES TO EXISTING TABLES
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS ultimo_atendimento timestamptz,
  ADD COLUMN IF NOT EXISTS total_atendimentos int8 DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_ultimo_atendimento ON profiles(ultimo_atendimento NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo_roleta ON profiles(roleta_ativa) WHERE roleta_ativa = true;

ALTER TABLE time_de_vendas 
  ADD COLUMN IF NOT EXISTS calendar_id text;

-- FUNCTIONS
CREATE OR REPLACE FUNCTION increment_rodada_number()
RETURNS trigger AS $$
BEGIN
  NEW.numero_rodada := COALESCE((SELECT MAX(numero_rodada) FROM public.rodadas_distribuicao), 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_rodada_number
  BEFORE INSERT ON rodadas_distribuicao
  FOR EACH ROW 
  WHEN (NEW.numero_rodada IS NULL)
  EXECUTE FUNCTION increment_rodada_number();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_turnos_updated_at BEFORE UPDATE ON turnos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_planejamento_plantao_updated_at BEFORE UPDATE ON planejamento_plantao FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_config_crm_updated_at BEFORE UPDATE ON config_crm FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_config_google_calendar_updated_at BEFORE UPDATE ON config_google_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at();
