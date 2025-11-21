-- Create default pipelines for each unit

-- Get unit IDs (assuming they exist from initial data)
-- Criciúma (CR), Cocal do Sul (CO), Içara (IC)

-- Pipeline 1: Vendas Residencial - Criciúma
INSERT INTO pipelines (nome, descricao, unidade_id, tipo, ativo, created_by)
SELECT 
    'Vendas Residencial',
    'Pipeline padrão para vendas de imóveis residenciais',
    id,
    'vendas',
    true,
    (SELECT id FROM profiles LIMIT 1)
FROM unidades WHERE sigla = 'CR';

-- Get the pipeline ID we just created
DO $$
DECLARE
    cr_pipeline_id int8;
BEGIN
    SELECT id INTO cr_pipeline_id FROM pipelines WHERE nome = 'Vendas Residencial' AND unidade_id = (SELECT id FROM unidades WHERE sigla = 'CR');
    
    -- Create stages for Criciúma pipeline
    INSERT INTO pipeline_etapas (pipeline_id, nome, ordem, cor, obrigatorio) VALUES
    (cr_pipeline_id, 'Novo Lead', 0, '#dbeafe', false),
    (cr_pipeline_id, 'Qualificação', 1, '#fef9c3', false),
    (cr_pipeline_id, 'Visita Agendada', 2, '#f3e8ff', false),
    (cr_pipeline_id, 'Proposta Enviada', 3, '#fce7f3', false),
    (cr_pipeline_id, 'Negociação', 4, '#fed7aa', false),
    (cr_pipeline_id, 'Ganho', 5, '#dcfce7', false),
    (cr_pipeline_id, 'Perdido', 6, '#fee2e2', false);
END $$;

-- Pipeline 2: Locação - Cocal do Sul
INSERT INTO pipelines (nome, descricao, unidade_id, tipo, ativo, created_by)
SELECT 
    'Locação',
    'Pipeline para locação de imóveis',
    id,
    'locacao',
    true,
    (SELECT id FROM profiles LIMIT 1)
FROM unidades WHERE sigla = 'CO';

DO $$
DECLARE
    co_pipeline_id int8;
BEGIN
    SELECT id INTO co_pipeline_id FROM pipelines WHERE nome = 'Locação' AND unidade_id = (SELECT id FROM unidades WHERE sigla = 'CO');
    
    INSERT INTO pipeline_etapas (pipeline_id, nome, ordem, cor, obrigatorio) VALUES
    (co_pipeline_id, 'Novo Interessado', 0, '#dbeafe', false),
    (co_pipeline_id, 'Análise de Perfil', 1, '#fef9c3', false),
    (co_pipeline_id, 'Visita Realizada', 2, '#f3e8ff', false),
    (co_pipeline_id, 'Análise de Crédito', 3, '#fce7f3', false),
    (co_pipeline_id, 'Contrato', 4, '#fed7aa', false),
    (co_pipeline_id, 'Fechado', 5, '#dcfce7', false),
    (co_pipeline_id, 'Cancelado', 6, '#fee2e2', false);
END $$;

-- Pipeline 3: Vendas Comercial - Içara
INSERT INTO pipelines (nome, descricao, unidade_id, tipo, ativo, created_by)
SELECT 
    'Vendas Comercial',
    'Pipeline para vendas de imóveis comerciais',
    id,
    'vendas',
    true,
    (SELECT id FROM profiles LIMIT 1)
FROM unidades WHERE sigla = 'IC';

DO $$
DECLARE
    ic_pipeline_id int8;
BEGIN
    SELECT id INTO ic_pipeline_id FROM pipelines WHERE nome = 'Vendas Comercial' AND unidade_id = (SELECT id FROM unidades WHERE sigla = 'IC');
    
    INSERT INTO pipeline_etapas (pipeline_id, nome, ordem, cor, obrigatorio) VALUES
    (ic_pipeline_id, 'Lead Comercial', 0, '#dbeafe', false),
    (ic_pipeline_id, 'Qualificação', 1, '#fef9c3', false),
    (ic_pipeline_id, 'Apresentação', 2, '#f3e8ff', false),
    (ic_pipeline_id, 'Proposta', 3, '#fce7f3', false),
    (ic_pipeline_id, 'Negociação Final', 4, '#fed7aa', false),
    (ic_pipeline_id, 'Fechado', 5, '#dcfce7', false),
    (ic_pipeline_id, 'Perdido', 6, '#fee2e2', false);
END $$;

-- Verify the data
SELECT 
    p.id,
    p.nome as pipeline_nome,
    u.nome as unidade_nome,
    p.tipo,
    p.ativo,
    COUNT(pe.id) as total_etapas
FROM pipelines p
JOIN unidades u ON p.unidade_id = u.id
LEFT JOIN pipeline_etapas pe ON pe.pipeline_id = p.id
GROUP BY p.id, p.nome, u.nome, p.tipo, p.ativo
ORDER BY u.nome, p.nome;
