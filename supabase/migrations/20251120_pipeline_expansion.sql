-- PIPELINES
CREATE TABLE pipelines (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL,
  descricao text,
  unidade_id int8 REFERENCES unidades(id) ON DELETE CASCADE,
  tipo text DEFAULT 'vendas', -- vendas, locacao, custom
  ativo boolean DEFAULT true,
  created_by int8 REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read access for authenticated" ON pipelines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and Gestor can manage pipelines" ON pipelines FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'GESTOR')
);

-- PIPELINE ETAPAS
CREATE TABLE pipeline_etapas (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pipeline_id int8 REFERENCES pipelines(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem int NOT NULL,
  cor text DEFAULT '#e5e7eb',
  obrigatorio boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pipeline_id, ordem)
);

ALTER TABLE pipeline_etapas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read access for authenticated" ON pipeline_etapas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and Gestor can manage etapas" ON pipeline_etapas FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'GESTOR')
);

-- UPDATE LEADS
ALTER TABLE leads ADD COLUMN pipeline_id int8 REFERENCES pipelines(id);
ALTER TABLE leads ADD COLUMN etapa_id int8 REFERENCES pipeline_etapas(id);

CREATE INDEX idx_leads_pipeline_id ON leads(pipeline_id);
CREATE INDEX idx_leads_etapa_id ON leads(etapa_id);

-- UPDATE PROFILES
ALTER TABLE profiles ADD COLUMN unidade_id int8 REFERENCES unidades(id);
