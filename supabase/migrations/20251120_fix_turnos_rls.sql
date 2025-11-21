-- Add missing RLS policies for turnos table
CREATE POLICY "Insert access" ON turnos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access" ON turnos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access" ON turnos FOR DELETE TO authenticated USING (true);
