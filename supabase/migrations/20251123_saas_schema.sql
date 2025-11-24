-- SAAS SUBSCRIPTION SYSTEM MIGRATION

-- 1. TENANTS (Missing from previous schema)
CREATE TABLE IF NOT EXISTS tenants (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  cnpj text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON tenants FOR SELECT TO authenticated USING (true);

-- 2. PLANS
CREATE TABLE plans (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  features jsonb DEFAULT '[]'::jsonb, -- UI display features
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON plans FOR SELECT TO authenticated USING (true);

-- 3. MODULES
CREATE TABLE modules (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  key text UNIQUE NOT NULL, -- e.g., 'crm_full', 'chat', 'integrations'
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON modules FOR SELECT TO authenticated USING (true);

-- 4. PLAN_MODULES (Many-to-Many)
CREATE TABLE plan_modules (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  plan_id int8 REFERENCES plans(id) ON DELETE CASCADE,
  module_id int8 REFERENCES modules(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, module_id)
);

ALTER TABLE plan_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON plan_modules FOR SELECT TO authenticated USING (true);

-- 5. TENANT_PLANS (Subscriptions)
CREATE TABLE tenant_plans (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id int8 REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id int8 REFERENCES plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id) -- One active plan per tenant for now
);

ALTER TABLE tenant_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON tenant_plans FOR SELECT TO authenticated USING (true);

-- 6. BILLING_HISTORY
CREATE TABLE billing_history (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id int8 REFERENCES tenants(id),
  amount numeric(10, 2) NOT NULL,
  date timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  invoice_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for tenant users" ON billing_history FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND tenant_id = billing_history.tenant_id)
);

-- 7. TENANT_MODULE_STATUS (Granular override or status tracking)
CREATE TABLE tenant_module_status (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id int8 REFERENCES tenants(id) ON DELETE CASCADE,
  module_id int8 REFERENCES modules(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, module_id)
);

ALTER TABLE tenant_module_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON tenant_module_status FOR SELECT TO authenticated USING (true);

-- 8. UPDATE PROFILES
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS tenant_id int8 REFERENCES tenants(id);

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);

-- 9. SEED DATA
-- Modules
INSERT INTO modules (name, key, description) VALUES
('CRM Básico', 'crm_basic', 'Gestão básica de leads e funil simples'),
('CRM Completo', 'crm_full', 'Múltiplos funis, automações e relatórios avançados'),
('Multiatendimento', 'multiatendimento', 'Chat centralizado para múltiplos atendentes'),
('Integrações', 'integracoes', 'Webhooks e API externa'),
('Chats Internos', 'chat_internal', 'Comunicação interna entre equipe');

-- Plans
INSERT INTO plans (name, description, price) VALUES
('Inicial', 'Para quem está começando', 0.00),
('Básico', 'Pequenas equipes', 99.00),
('Intermediário', 'Operações em crescimento', 199.00),
('Total', 'Funcionalidades ilimitadas', 399.00);

-- Plan Modules Mapping
-- Inicial: CRM Basic
INSERT INTO plan_modules (plan_id, module_id) 
SELECT p.id, m.id FROM plans p, modules m WHERE p.name = 'Inicial' AND m.key = 'crm_basic';

-- Básico: CRM Basic + Chat Internal
INSERT INTO plan_modules (plan_id, module_id) 
SELECT p.id, m.id FROM plans p, modules m WHERE p.name = 'Básico' AND m.key IN ('crm_basic', 'chat_internal');

-- Intermediário: CRM Full + Multiatendimento + Webhooks
INSERT INTO plan_modules (plan_id, module_id) 
SELECT p.id, m.id FROM plans p, modules m WHERE p.name = 'Intermediário' AND m.key IN ('crm_full', 'multiatendimento', 'integracoes', 'chat_internal');

-- Total: All Modules
INSERT INTO plan_modules (plan_id, module_id) 
SELECT p.id, m.id FROM plans p, modules m WHERE p.name = 'Total';

-- 10. FUNCTIONS

-- Function to get modules allowed for a tenant based on their plan
CREATE OR REPLACE FUNCTION get_tenant_modules(p_tenant_id int8)
RETURNS TABLE (module_key text) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.key
  FROM modules m
  JOIN plan_modules pm ON pm.module_id = m.id
  JOIN tenant_plans tp ON tp.plan_id = pm.plan_id
  WHERE tp.tenant_id = p_tenant_id
  AND tp.status = 'active'
  UNION
  -- Include modules explicitly enabled in tenant_module_status (overrides)
  SELECT m.key
  FROM modules m
  JOIN tenant_module_status tms ON tms.module_id = m.id
  WHERE tms.tenant_id = p_tenant_id
  AND tms.status = 'active';
END;
$$;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(p_tenant_id int8)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status
  FROM tenant_plans
  WHERE tenant_id = p_tenant_id
  LIMIT 1;
  
  RETURN COALESCE(v_status, 'none');
END;
$$;

-- Trigger to create default tenant for new user (Optional, for now we assume manual assignment or existing flow)
-- But let's ensure updated_at works
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenant_plans_updated_at BEFORE UPDATE ON tenant_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

