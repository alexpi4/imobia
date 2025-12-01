-- RPC for KPIs (Venda and Locacao)
CREATE OR REPLACE FUNCTION rpc_get_kpis(periodo_dias int)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
    total_leads bigint;
    venda_count bigint;
    locacao_count bigint;
BEGIN
    start_date := now() - (periodo_dias || ' days')::interval;

    SELECT count(*) INTO total_leads
    FROM leads
    WHERE created_at >= start_date;

    SELECT count(*) INTO venda_count
    FROM leads
    WHERE created_at >= start_date AND intencao = 'Venda';

    SELECT count(*) INTO locacao_count
    FROM leads
    WHERE created_at >= start_date AND intencao = 'Locação';

    RETURN json_build_object(
        'venda', json_build_object('count', COALESCE(venda_count, 0), 'percentage', CASE WHEN total_leads > 0 THEN ROUND((venda_count::numeric / total_leads) * 100, 1) ELSE 0 END),
        'locacao', json_build_object('count', COALESCE(locacao_count, 0), 'percentage', CASE WHEN total_leads > 0 THEN ROUND((locacao_count::numeric / total_leads) * 100, 1) ELSE 0 END),
        'total', COALESCE(total_leads, 0)
    );
END;
$$;

-- RPC for Distribution (Pie Chart)
CREATE OR REPLACE FUNCTION rpc_get_distribuicao_intencao(periodo_dias int)
RETURNS TABLE (
    intencao text,
    count bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
    total_leads bigint;
BEGIN
    start_date := now() - (periodo_dias || ' days')::interval;
    
    SELECT count(*) INTO total_leads FROM leads WHERE created_at >= start_date;
    IF total_leads = 0 THEN total_leads := 1; END IF;

    RETURN QUERY
    SELECT
        COALESCE(l.intencao, 'Indefinido') as intencao,
        count(*) as count,
        ROUND((count(*)::numeric / total_leads) * 100, 1) as percentage
    FROM leads l
    WHERE l.created_at >= start_date
    GROUP BY l.intencao
    ORDER BY count DESC;
END;
$$;

-- RPC for Units (Vertical Bar Chart)
CREATE OR REPLACE FUNCTION rpc_get_unidades(periodo_dias int)
RETURNS TABLE (
    unidade text,
    venda bigint,
    locacao bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
BEGIN
    start_date := now() - (periodo_dias || ' days')::interval;

    RETURN QUERY
    SELECT
        COALESCE(l.unidade, 'Não informado') as unidade,
        count(*) FILTER (WHERE l.intencao = 'Venda') as venda,
        count(*) FILTER (WHERE l.intencao = 'Locação') as locacao
    FROM leads l
    WHERE l.created_at >= start_date
    GROUP BY l.unidade
    ORDER BY count(*) DESC;
END;
$$;

-- RPC for Cities (Top 10 Horizontal Bar Chart)
CREATE OR REPLACE FUNCTION rpc_get_cidades(periodo_dias int)
RETURNS TABLE (
    cidade text,
    venda bigint,
    locacao bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
BEGIN
    start_date := now() - (periodo_dias || ' days')::interval;

    RETURN QUERY
    SELECT
        COALESCE(l.cidade, 'Não informado') as cidade,
        count(*) FILTER (WHERE l.intencao = 'Venda') as venda,
        count(*) FILTER (WHERE l.intencao = 'Locação') as locacao
    FROM leads l
    WHERE l.created_at >= start_date
    GROUP BY l.cidade
    ORDER BY count(*) DESC
    LIMIT 10;
END;
$$;

-- RPC for Origins (Horizontal Bar Chart)
CREATE OR REPLACE FUNCTION rpc_get_origens(periodo_dias int)
RETURNS TABLE (
    origem text,
    venda bigint,
    locacao bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
BEGIN
    start_date := now() - (periodo_dias || ' days')::interval;

    RETURN QUERY
    SELECT
        COALESCE(l.origem, 'Outros') as origem,
        count(*) FILTER (WHERE l.intencao = 'Venda') as venda,
        count(*) FILTER (WHERE l.intencao = 'Locação') as locacao
    FROM leads l
    WHERE l.created_at >= start_date
    GROUP BY l.origem
    ORDER BY count(*) DESC;
END;
$$;

-- RPC for Summary Table
CREATE OR REPLACE FUNCTION rpc_get_tabela_resumo(periodo_dias int)
RETURNS TABLE (
    unidade text,
    total bigint,
    venda bigint,
    venda_perc numeric,
    locacao bigint,
    locacao_perc numeric,
    total_geral bigint -- This is redundant with total but kept for PRD compliance
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
BEGIN
    start_date := now() - (periodo_dias || ' days')::interval;

    RETURN QUERY
    SELECT
        COALESCE(l.unidade, 'Não informado') as unidade,
        count(*) as total,
        count(*) FILTER (WHERE l.intencao = 'Venda') as venda,
        CASE WHEN count(*) > 0 THEN ROUND((count(*) FILTER (WHERE l.intencao = 'Venda')::numeric / count(*)) * 100, 1) ELSE 0 END as venda_perc,
        count(*) FILTER (WHERE l.intencao = 'Locação') as locacao,
        CASE WHEN count(*) > 0 THEN ROUND((count(*) FILTER (WHERE l.intencao = 'Locação')::numeric / count(*)) * 100, 1) ELSE 0 END as locacao_perc,
        count(*) as total_geral
    FROM leads l
    WHERE l.created_at >= start_date
    GROUP BY l.unidade
    ORDER BY total DESC;
END;
$$;
