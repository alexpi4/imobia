-- RLS POLICIES FOR LIBERACAO TABLE (Menu Permissions)

-- Enable RLS
ALTER TABLE liberacao ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own permissions" ON liberacao;
DROP POLICY IF EXISTS "Admin can read all permissions" ON liberacao;
DROP POLICY IF EXISTS "Admin can insert permissions" ON liberacao;
DROP POLICY IF EXISTS "Admin can update permissions" ON liberacao;
DROP POLICY IF EXISTS "Admin can delete permissions" ON liberacao;

-- Allow users to read their own permissions
CREATE POLICY "Users can read own permissions" ON liberacao
  FOR SELECT TO authenticated
  USING (usuario_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Allow ADMIN to read all permissions
CREATE POLICY "Admin can read all permissions" ON liberacao
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Allow ADMIN to insert permissions
CREATE POLICY "Admin can insert permissions" ON liberacao
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Allow ADMIN to update permissions
CREATE POLICY "Admin can update permissions" ON liberacao
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Allow ADMIN to delete permissions
CREATE POLICY "Admin can delete permissions" ON liberacao
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );
