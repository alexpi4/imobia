-- Drop existing foreign key constraints
ALTER TABLE cidade_unidade
DROP CONSTRAINT IF EXISTS cidade_unidade_cidade_id_fkey,
DROP CONSTRAINT IF EXISTS cidade_unidade_unidade_id_fkey;

-- Re-add constraints with ON DELETE CASCADE
ALTER TABLE cidade_unidade
ADD CONSTRAINT cidade_unidade_cidade_id_fkey
FOREIGN KEY (cidade_id)
REFERENCES cidades(id)
ON DELETE CASCADE;

ALTER TABLE cidade_unidade
ADD CONSTRAINT cidade_unidade_unidade_id_fkey
FOREIGN KEY (unidade_id)
REFERENCES unidades(id)
ON DELETE CASCADE;
