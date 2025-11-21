-- PIPELINE TRANSICOES
CREATE TABLE pipeline_transicoes (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pipeline_id int8 REFERENCES pipelines(id) ON DELETE CASCADE,
  etapa_origem_id int8 REFERENCES pipeline_etapas(id) ON DELETE CASCADE,
  etapa_destino_id int8 REFERENCES pipeline_etapas(id) ON DELETE CASCADE,
  permitida boolean DEFAULT true,
  exige_justificativa boolean DEFAULT false,
  validacoes jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(pipeline_id, etapa_origem_id, etapa_destino_id)
);

ALTER TABLE pipeline_transicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read access for authenticated" ON pipeline_transicoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and Gestor can manage transicoes" ON pipeline_transicoes FOR ALL TO authenticated USING (
  has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'GESTOR')
);

-- LEAD PIPELINE HISTORICO
CREATE TABLE lead_pipeline_historico (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lead_id int8 REFERENCES leads(id) ON DELETE CASCADE,
  pipeline_id int8 REFERENCES pipelines(id),
  etapa_id int8 REFERENCES pipeline_etapas(id),
  etapa_anterior_id int8 REFERENCES pipeline_etapas(id),
  movido_por int8 REFERENCES profiles(id),
  justificativa text,
  tempo_na_etapa_anterior interval,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_historico_lead_id ON lead_pipeline_historico(lead_id);
CREATE INDEX idx_historico_pipeline_id ON lead_pipeline_historico(pipeline_id);
CREATE INDEX idx_historico_created_at ON lead_pipeline_historico(created_at);

ALTER TABLE lead_pipeline_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read access for authenticated" ON lead_pipeline_historico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert history" ON lead_pipeline_historico FOR INSERT TO authenticated WITH CHECK (true);

-- Function to automatically log pipeline changes
CREATE OR REPLACE FUNCTION log_pipeline_change()
RETURNS TRIGGER AS $$
DECLARE
  tempo_anterior interval;
  etapa_anterior_id int8;
BEGIN
  -- Only log if etapa_id changed
  IF (TG_OP = 'UPDATE' AND OLD.etapa_id IS DISTINCT FROM NEW.etapa_id) THEN
    -- Calculate time in previous stage
    SELECT 
      COALESCE(NOW() - created_at, interval '0'),
      etapa_id
    INTO tempo_anterior, etapa_anterior_id
    FROM lead_pipeline_historico
    WHERE lead_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no history, use lead creation time
    IF tempo_anterior IS NULL THEN
      tempo_anterior := NOW() - OLD.created_at;
      etapa_anterior_id := OLD.etapa_id;
    END IF;
    
    INSERT INTO lead_pipeline_historico (
      lead_id,
      pipeline_id,
      etapa_id,
      etapa_anterior_id,
      movido_por,
      tempo_na_etapa_anterior
    ) VALUES (
      NEW.id,
      NEW.pipeline_id,
      NEW.etapa_id,
      etapa_anterior_id,
      (SELECT id FROM profiles WHERE user_id = auth.uid()),
      tempo_anterior
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_lead_pipeline_change
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION log_pipeline_change();
