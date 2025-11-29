-- Seed fixed system webhooks
-- These webhooks are part of the core system and cannot be deleted

INSERT INTO webhooks (nome, url, tipo, fix, ativo, eventos, total_execucoes)
VALUES
  ('Atualiza AGENTE', 'https://wk8.dudaimoveis.com.br/webhook/atu-agente', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Recebe LEAD', 'https://wk8.dudaimoveis.com.br/webhook/rd-lead', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Envia RAG', 'https://wk8.dudaimoveis.com.br/webhook/cria-rag', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Exclui RAG', 'https://wk8.dudaimoveis.com.br/webhook/exc-rag', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Envia FAQ', 'https://wk8.dudaimoveis.com.br/webhook/cria-faq', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Exclui FAQ', 'https://wk8.dudaimoveis.com.br/webhook/exc-faq', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Cria INSTANCIA', 'https://wk8.dudaimoveis.com.br/webhook/cria-inst', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Exclui INSTANCIA', 'https://wk8.dudaimoveis.com.br/webhook/exc-inst', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Gera QR', 'https://wk8.dudaimoveis.com.br/webhook/QR', 'manual', TRUE, TRUE, '[]'::jsonb, 0),
  ('Renova QR', 'https://wk8.dudaimoveis.com.br/webhook/refreshQR', 'manual', TRUE, TRUE, '[]'::jsonb, 0)
ON CONFLICT DO NOTHING;

-- Verify insertion
DO $$
DECLARE
  fixed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fixed_count FROM webhooks WHERE fix = TRUE;
  RAISE NOTICE 'Total fixed webhooks: %', fixed_count;
END $$;
