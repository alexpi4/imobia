-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON leads;

-- Create comprehensive policies for authenticated users
CREATE POLICY "Enable read access for authenticated users"
ON leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON leads FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON leads FOR DELETE
TO authenticated
USING (true);
