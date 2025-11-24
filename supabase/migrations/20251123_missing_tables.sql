-- MISSING TABLES MIGRATION

-- 1. TASKS (Tarefas)
CREATE TABLE IF NOT EXISTS tasks (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id int8 REFERENCES profiles(id),
  lead_id int8 REFERENCES leads(id),
  created_by int8 REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert access for authenticated" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access for authenticated" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete access for authenticated" ON tasks FOR DELETE TO authenticated USING (true);

-- 2. NOTIFICATIONS (Notificações)
CREATE TABLE IF NOT EXISTS notifications (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id int8 REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  type text DEFAULT 'info', -- info, warning, success, error
  link text, -- URL to redirect
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = notifications.user_id));
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = notifications.user_id));

-- 3. VISITS (Agendamentos/Visitas)
CREATE TABLE IF NOT EXISTS visits (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lead_id int8 REFERENCES leads(id) NOT NULL,
  corretor_id int8 REFERENCES profiles(id) NOT NULL,
  data_visita timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  observacoes text,
  created_by int8 REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access for authenticated" ON visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert access for authenticated" ON visits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update access for authenticated" ON visits FOR UPDATE TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
