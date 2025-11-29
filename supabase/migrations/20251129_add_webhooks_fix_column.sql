-- Add fix column to webhooks table
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS fix BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_webhooks_fix ON webhooks(fix) WHERE fix = TRUE;

-- Update RLS policy to prevent deletion of fixed webhooks
-- First, drop the existing policy
DROP POLICY IF EXISTS "Admin access" ON webhooks;

-- Recreate with updated logic
CREATE POLICY "Admin access" ON webhooks 
FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'ADMIN'))
WITH CHECK (has_role(auth.uid(), 'ADMIN'));

-- Add specific policy to prevent deletion of fixed webhooks
CREATE POLICY "Prevent deletion of fixed webhooks" ON webhooks
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'ADMIN') AND (fix = FALSE OR fix IS NULL));

-- Add comment
COMMENT ON COLUMN webhooks.fix IS 'Indicates if this is a fixed system webhook that cannot be deleted';
