-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE profiles (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  papel text NOT NULL DEFAULT 'NENHUM',
  equipe text,
  roleta_ativa boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Admin can update profiles" ON profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'ADMIN')
);

-- USER ROLES
CREATE TYPE app_role AS ENUM ('ADMIN', 'CORRETOR', 'NENHUM', 'GESTOR', 'Agenciador', 'Atendente');

CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated users" ON user_roles FOR SELECT TO authenticated USING (true);

-- Helper function for role check
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- UNIDADES
CREATE TABLE unidades (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sigla text NOT NULL UNIQUE,
  nome text NOT NULL,
  responsavel text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON unidades FOR SELECT TO authenticated USING (true);

-- ORIGENS
CREATE TABLE origens (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE origens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON origens FOR SELECT TO authenticated USING (true);

-- INTENCOES
CREATE TABLE intencoes (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE intencoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON intencoes FOR SELECT TO authenticated USING (true);

-- LEADS
CREATE TABLE leads (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  data_criacao timestamptz DEFAULT now(),
  origem text NOT NULL,
  intencao text NOT NULL,
  cidade text,
  unidade text NOT NULL,
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  urgencia text DEFAULT 'Normal',
  imovel text,
  valor numeric,
  resumo text,
  pipeline text DEFAULT 'Novo',
  atribuido boolean DEFAULT false,
  responsavel_id int8 REFERENCES profiles(id),
  criado_por int8 REFERENCES profiles(id) NOT NULL,
  id_external text,
  rd_lead_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_leads_pipeline ON leads(pipeline);
CREATE INDEX idx_leads_criado_por ON leads(criado_por);
CREATE INDEX idx_leads_responsavel ON leads(responsavel_id);
CREATE INDEX idx_leads_data_criacao ON leads(data_criacao);
CREATE INDEX idx_leads_unidade ON leads(unidade);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and Gestor can view all" ON leads FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'GESTOR')
);
CREATE POLICY "Corretor sees assigned or unassigned" ON leads FOR SELECT TO authenticated USING (
  (has_role(auth.uid(), 'CORRETOR') AND (responsavel_id IS NULL OR responsavel_id = (SELECT id FROM profiles WHERE user_id = auth.uid())))
);

-- LIBERACAO (Menu Permissions)
CREATE TABLE liberacao (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  usuario_id int8 REFERENCES profiles(id) NOT NULL,
  menu text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, menu)
);
ALTER TABLE liberacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON liberacao FOR SELECT TO authenticated USING (true);

-- CIDADES
CREATE TABLE cidades (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL,
  estado text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access" ON cidades FOR SELECT TO authenticated USING (true);

-- CIDADE_UNIDADE
CREATE TABLE cidade_unidade (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cidade_id int8 REFERENCES cidades(id) NOT NULL,
  unidade_id int8 REFERENCES unidades(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cidade_id, unidade_id)
);
ALTER TABLE cidade_unidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access" ON cidade_unidade FOR SELECT TO authenticated USING (true);

-- TIME DE VENDAS
CREATE TABLE time_de_vendas (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL,
  responsavel text,
  unidade text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE time_de_vendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access" ON time_de_vendas FOR SELECT TO authenticated USING (true);

-- INTEGRACOES
CREATE TABLE integracoes (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL,
  url text NOT NULL,
  status text DEFAULT 'ativo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE integracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access" ON integracoes FOR SELECT TO authenticated USING (true);

-- TRIGGER FOR NEW USER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, nome, email, papel)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    'NENHUM'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- INITIAL DATA
INSERT INTO unidades (sigla, nome) VALUES ('CR', 'Criciúma'), ('CO', 'Cocal do Sul'), ('IC', 'Içara');
INSERT INTO origens (nome) VALUES ('Site'), ('WhatsApp'), ('RD'), ('Indicação');
INSERT INTO intencoes (nome) VALUES ('Venda'), ('Locação'), ('Indefinido');
