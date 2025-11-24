# Missing Tables Implementation Plan

## Goal
Create the database tables that are referenced in the application or required for planned features but are currently missing from the schema.

## Identified Missing Tables
1.  **`tasks` (Tarefas)**: Required for Pipeline Automations (`acao_tipo = 'task'`) and general CRM task management.
2.  **`notifications` (Notificações)**: Required for `NotificacoesPage` and system alerts.
3.  **`visits` (Agendamentos/Visitas)**: Required for `AgendarVisitaPage`.

## Proposed Schema

### 1. Tasks
```sql
CREATE TABLE tasks (
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
```

### 2. Notifications
```sql
CREATE TABLE notifications (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id int8 REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  type text DEFAULT 'info', -- info, warning, success, error
  link text, -- URL to redirect
  created_at timestamptz DEFAULT now()
);
```

### 3. Visits (Agendamentos)
```sql
CREATE TABLE visits (
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
```

## Verification
1.  **Database**: Execute the migration and verify tables are created.
2.  **Frontend**:
    - Update `NotificacoesPage` to fetch from `notifications`.
    - Update `AgendarVisitaPage` to fetch from `visits`.
