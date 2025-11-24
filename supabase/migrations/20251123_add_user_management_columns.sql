-- Add missing columns to profiles table for user management

-- Add telefone column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone text;

-- Add equipe_id column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipe_id int8;

-- Add unidade_id column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unidade_id int8;

-- Add turnos column (array of text for shifts: manha, tarde, noite)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS turnos text[];

-- Add ativo_roleta column (boolean for active in roulette)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ativo_roleta boolean DEFAULT false;

-- Add ultimo_atendimento column (timestamp of last service)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ultimo_atendimento timestamptz;

-- Add ativo column (boolean for active user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Add foreign key constraints (optional, if tables exist)
-- ALTER TABLE profiles ADD CONSTRAINT fk_equipe FOREIGN KEY (equipe_id) REFERENCES time_de_vendas(id);
-- ALTER TABLE profiles ADD CONSTRAINT fk_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id);
