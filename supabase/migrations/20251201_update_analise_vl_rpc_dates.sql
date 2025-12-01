-- Update RPC for KPIs (Venda and Locacao) to accept date range
CREATE OR REPLACE FUNCTION rpc_get_kpis(start_date timestamptz, end_date timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_leads bigint;
    venda_count bigint;
    locacao_count bigint;
BEGIN
    SELECT count(*) INTO total_leads
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date;

    SELECT count(*) INTO venda_count
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date AND intencao = 'Venda';

    SELECT count(*) INTO locacao_count
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date AND intencao = 'Locação';

    RETURN json_build_object(
        'venda', json_build_object('count', COALESCE(venda_count, 0), 'percentage', CASE WHEN total_leads > 0 THEN ROUND((venda_count::numeric / total_leads) * 100, 1) ELSE 0 END),
        'locacao', json_build_object('count', COALESCE(locacao_count, 0), 'percentage', CASE WHEN total_leads > 0 THEN ROUND((locacao_count::numeric / total_leads) * 100, 1) ELSE 0 END),
        'total', COALESCE(total_leads, 0)
    );
END;
$$;

-- Update RPC for Distribution (Pie Chart) to accept date range
CREATE OR REPLACE FUNCTION rpc_get_distribuicao_intencao(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    intencao text,
    count bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_leads bigint;
BEGIN
    SELECT count(*) INTO total_leads FROM leads WHERE created_at BETWEEN start_date AND end_date;
    IF total_leads = 0 THEN total_leads := 1; END IF;

    RETURN QUERY
    SELECT
        COALESCE(l.intencao, 'Indefinido') as intencao,
        count(*) as count,
        ROUND((count(*)::numeric / total_leads) * 100, 1) as percentage
    FROM leads l
    WHERE l.created_at BETWEEN start_date AND end_date
    GROUP BY l.intencao
    ORDER BY count DESC;
END;
$$;

-- Update RPC for Units (Vertical Bar Chart) to accept date range
CREATE OR REPLACE FUNCTION rpc_get_unidades(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    unidade text,
    venda bigint,
    locacao bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(l.unidade, 'Não informado') as unidade,
        count(*) FILTER (WHERE l.intencao = 'Venda') as venda,
        count(*) FILTER (WHERE l.intencao = 'Locação') as locacao
    FROM leads l
    WHERE l.created_at BETWEEN start_date AND end_date
    GROUP BY l.unidade
    ORDER BY count(*) DESC;
END;
$$;

-- Update RPC for Cities (Top 10 Horizontal Bar Chart) to accept date range
CREATE OR REPLACE FUNCTION rpc_get_cidades(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    cidade text,
    venda bigint,
    locacao bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(l.cidade, 'Não informado') as cidade,
        count(*) FILTER (WHERE l.intencao = 'Venda') as venda,
        count(*) FILTER (WHERE l.intencao = 'Locação') as locacao
    FROM leads l
    WHERE l.created_at BETWEEN start_date AND end_date
    GROUP BY l.cidade
    ORDER BY count(*) DESC
    LIMIT 10;
END;
$$;

-- Update RPC for Origins (Horizontal Bar Chart) to accept date range
CREATE OR REPLACE FUNCTION rpc_get_origens(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    origem text,
    venda bigint,
    locacao bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(l.origem, 'Outros') as origem,
        count(*) FILTER (WHERE l.intencao = 'Venda') as venda,
        count(*) FILTER (WHERE l.intencao = 'Locação') as locacao
    FROM leads l
    WHERE l.created_at BETWEEN start_date AND end_date
    GROUP BY l.origem
    ORDER BY count(*) DESC;
END;
$$;

-- Update RPC for Summary Table to accept date range
CREATE OR REPLACE FUNCTION rpc_get_tabela_resumo(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    unidade text,
    total bigint,
    venda bigint,
    venda_perc numeric,
    locacao bigint,
    locacao_perc numeric,
    total_geral bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    WHERE l.created_at BETWEEN start_date AND end_date
    GROUP BY l.unidade
    ORDER BY total DESC;
END;
$$;
