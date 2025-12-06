-- Create table for managing Scales (Headers)
CREATE TABLE IF NOT EXISTS public.escalas_planejamento (
    id SERIAL PRIMARY KEY,
    equipe_id INTEGER NOT NULL REFERENCES public.time_de_vendas(id) ON DELETE CASCADE,
    mes DATE NOT NULL, -- Stored as first day of the month (e.g., 2025-12-01)
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(equipe_id, mes) -- Ensure one scale per team per month
);

-- Add Foreign Key to planejamneto_plantao
ALTER TABLE public.planejamento_plantao 
ADD COLUMN IF NOT EXISTS escala_id INTEGER REFERENCES public.escalas_planejamento(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.escalas_planejamento ENABLE ROW LEVEL SECURITY;

-- Create Policy (Allow all for internal usage based on current patterns, refine later)
CREATE POLICY "Enable all access for authenticated users" ON public.escalas_planejamento
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON TABLE public.escalas_planejamento TO authenticated;
GRANT ALL ON SEQUENCE public.escalas_planejamento_id_seq TO authenticated;
