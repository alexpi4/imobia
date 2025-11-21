-- Fix RLS policies for leads table
-- The original schema only defined SELECT policies, causing INSERT/UPDATE/DELETE to fail

-- Allow authenticated users to insert leads
CREATE POLICY "Authenticated users can insert leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update leads
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete leads
CREATE POLICY "Authenticated users can delete leads" ON leads FOR DELETE TO authenticated USING (true);
