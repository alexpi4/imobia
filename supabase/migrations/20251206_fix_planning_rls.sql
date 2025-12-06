-- Enable RLS (just in case)
ALTER TABLE public.planejamento_plantao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_planejamento ENABLE ROW LEVEL SECURITY;

-- 1. Policies for planejamento_plantao
-- Drop existing potential conflicting policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.planejamento_plantao;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.planejamento_plantao;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.planejamento_plantao;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.planejamento_plantao;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.planejamento_plantao;

-- Create comprehensive policy
CREATE POLICY "Enable all access for authenticated users" ON public.planejamento_plantao
    FOR ALL
    USING (auth.role() = 'authenticated');

-- 2. Policies for escalas_planejamento
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.escalas_planejamento;

CREATE POLICY "Enable all access for authenticated users" ON public.escalas_planejamento
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Grant permissions just to be sure
GRANT ALL ON TABLE public.planejamento_plantao TO authenticated;
GRANT ALL ON TABLE public.escalas_planejamento TO authenticated;
GRANT ALL ON SEQUENCE public.planejamento_plantao_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.escalas_planejamento_id_seq TO authenticated;
