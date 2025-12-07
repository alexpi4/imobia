-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('white-label-assets', 'white-label-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop generic policies if they were created by previous migrations to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;

-- Create specific policies for White Label Assets
-- 1. Public Read Access
CREATE POLICY "White Label Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'white-label-assets');

-- 2. Authenticated Insert Access (Upload)
CREATE POLICY "White Label Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'white-label-assets');

-- 3. Authenticated Update Access (Replace)
CREATE POLICY "White Label Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'white-label-assets');

-- 4. Authenticated Delete Access
CREATE POLICY "White Label Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'white-label-assets');
