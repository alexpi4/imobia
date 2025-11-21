-- Add missing RLS policies for Cadastro tables to enable CRUD

-- CIDADES
CREATE POLICY "Insert access" ON cidades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access" ON cidades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access" ON cidades FOR DELETE TO authenticated USING (true);

-- UNIDADES
CREATE POLICY "Insert access" ON unidades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access" ON unidades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access" ON unidades FOR DELETE TO authenticated USING (true);

-- TIME DE VENDAS
CREATE POLICY "Insert access" ON time_de_vendas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access" ON time_de_vendas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access" ON time_de_vendas FOR DELETE TO authenticated USING (true);

-- ORIGENS
CREATE POLICY "Insert access" ON origens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access" ON origens FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access" ON origens FOR DELETE TO authenticated USING (true);

-- INTENCOES
CREATE POLICY "Insert access" ON intencoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access" ON intencoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access" ON intencoes FOR DELETE TO authenticated USING (true);

-- INTEGRACOES
CREATE POLICY "Insert access" ON integracoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access" ON integracoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access" ON integracoes FOR DELETE TO authenticated USING (true);
