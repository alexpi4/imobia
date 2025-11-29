-- Function to get Dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(start_date timestamptz, end_date timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_leads bigint;
    intencao_counts json;
    top_unidade json;
    avg_interval_minutes numeric;
BEGIN
    -- Total Leads
    SELECT count(*) INTO total_leads
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date;

    -- Intencao Counts
    SELECT json_object_agg(COALESCE(intencao, 'Indefinido'), count)
    INTO intencao_counts
    FROM (
        SELECT intencao, count(*)
        FROM leads
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY intencao
    ) t;

    -- Top Unidade
    SELECT json_build_object('nome', unidade, 'count', count(*))
    INTO top_unidade
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY unidade
    ORDER BY count(*) DESC
    LIMIT 1;

    -- Average Interval (last 10 leads)
    WITH last_leads AS (
        SELECT created_at
        FROM leads
        ORDER BY created_at DESC
        LIMIT 10
    ),
    intervals AS (
        SELECT created_at - LAG(created_at) OVER (ORDER BY created_at) as diff
        FROM last_leads
    )
    SELECT EXTRACT(EPOCH FROM AVG(diff)) / 60
    INTO avg_interval_minutes
    FROM intervals
    WHERE diff IS NOT NULL;

    RETURN json_build_object(
        'total_leads', COALESCE(total_leads, 0),
        'intencao_counts', COALESCE(intencao_counts, '{}'::json),
        'top_unidade', COALESCE(top_unidade, '{"nome": "N/A", "count": 0}'::json),
        'avg_interval_minutes', COALESCE(ROUND(avg_interval_minutes, 0), 0)
    );
END;
$$;

-- Function to get Leads by Day (Line Chart)
CREATE OR REPLACE FUNCTION get_leads_by_day(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    date date,
    compra bigint,
    locacao bigint,
    indefinido bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        date(created_at) as date,
        count(*) FILTER (WHERE intencao = 'Compra') as compra,
        count(*) FILTER (WHERE intencao = 'Locação') as locacao,
        count(*) FILTER (WHERE intencao NOT IN ('Compra', 'Locação') OR intencao IS NULL) as indefinido
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY date(created_at)
    ORDER BY date(created_at);
END;
$$;

-- Function to get Leads by Origin (Bar Chart)
CREATE OR REPLACE FUNCTION get_leads_by_origin(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    origin text,
    count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(origem, 'Não informado') as origin,
        count(*) as count
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY origem
    ORDER BY count DESC;
END;
$$;

-- Function to get Leads by Unit (Pie Chart)
CREATE OR REPLACE FUNCTION get_leads_by_unit(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    unit text,
    count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(unidade, 'Não informado') as unit,
        count(*) as count
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY unidade
    ORDER BY count DESC;
END;
$$;

-- Function to get Leads by Urgency (Bar Chart)
CREATE OR REPLACE FUNCTION get_leads_by_urgency(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    urgency text,
    count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(urgencia, 'Normal') as urgency,
        count(*) as count
    FROM leads
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY urgencia
    ORDER BY count DESC;
END;
$$;

-- Function to get Unit Distribution (Table)
CREATE OR REPLACE FUNCTION get_unit_distribution(start_date timestamptz, end_date timestamptz)
RETURNS TABLE (
    unidade text,
    site bigint,
    upp bigint,
    whatsapp bigint,
    rd bigint,
    redes bigint,
    indicacao bigint,
    outros bigint,
    total bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_period_leads bigint;
BEGIN
    -- Calculate total leads for the period to calculate percentage
    SELECT count(*) INTO total_period_leads FROM leads WHERE created_at BETWEEN start_date AND end_date;
    
    IF total_period_leads = 0 THEN
        total_period_leads := 1; -- Avoid division by zero
    END IF;

    RETURN QUERY
    SELECT
        COALESCE(l.unidade, 'Não informado') as unidade,
        count(*) FILTER (WHERE l.origem ILIKE '%Site%') as site,
        count(*) FILTER (WHERE l.origem ILIKE '%UPP%') as upp,
        count(*) FILTER (WHERE l.origem ILIKE '%WhatsApp%') as whatsapp,
        count(*) FILTER (WHERE l.origem ILIKE '%RD%') as rd,
        count(*) FILTER (WHERE l.origem ILIKE '%Facebook%' OR l.origem ILIKE '%Instagram%') as redes,
        count(*) FILTER (WHERE l.origem ILIKE '%Indicação%') as indicacao,
        count(*) FILTER (WHERE l.origem NOT ILIKE '%Site%' 
                           AND l.origem NOT ILIKE '%UPP%' 
                           AND l.origem NOT ILIKE '%WhatsApp%' 
                           AND l.origem NOT ILIKE '%RD%' 
                           AND l.origem NOT ILIKE '%Facebook%' 
                           AND l.origem NOT ILIKE '%Instagram%' 
                           AND l.origem NOT ILIKE '%Indicação%') as outros,
        count(*) as total,
        ROUND((count(*)::numeric / total_period_leads) * 100, 1) as percentage
    FROM leads l
    WHERE l.created_at BETWEEN start_date AND end_date
    GROUP BY l.unidade
    ORDER BY total DESC;
END;
$$;
