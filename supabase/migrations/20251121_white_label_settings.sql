-- Create white_label_settings table for brand customization
CREATE TABLE IF NOT EXISTS white_label_settings (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  
  -- Company Information
  company_name text NOT NULL DEFAULT 'iMóbia CRM',
  company_cnpj text,
  company_address text,
  company_phone text,
  company_email text,
  company_website text,
  
  -- Branding
  logo_url text,
  logo_metadata jsonb DEFAULT '{}'::jsonb, -- stores original filename, size, etc
  favicon_url text,
  
  -- Color Customization
  primary_color text DEFAULT '#3882F6',
  secondary_color text DEFAULT '#10b981',
  accent_color text DEFAULT '#8b5cf6',
  
  -- Chat Colors (for future chat feature)
  chat_background_color text DEFAULT '#FFFFFF',
  chat_user_bubble_color text DEFAULT '#3882F6',
  chat_bot_bubble_color text DEFAULT '#F3F4F6',
  chat_history_panel_bg_color text DEFAULT '#FFFFFF',
  
  -- Typography
  font_family text DEFAULT 'system-ui',
  font_size_base text DEFAULT '16px',
  
  -- Additional Customization
  custom_css text,
  custom_js text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by int8 REFERENCES profiles(id),
  updated_by int8 REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE white_label_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can manage white label settings
CREATE POLICY "Admin can view white label settings" 
  ON white_label_settings FOR SELECT 
  TO authenticated 
  USING (true); -- Everyone can read to apply the branding

CREATE POLICY "Admin can insert white label settings" 
  ON white_label_settings FOR INSERT 
  TO authenticated 
  WITH CHECK (has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admin can update white label settings" 
  ON white_label_settings FOR UPDATE 
  TO authenticated 
  USING (has_role(auth.uid(), 'ADMIN'))
  WITH CHECK (has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admin can delete white label settings" 
  ON white_label_settings FOR DELETE 
  TO authenticated 
  USING (has_role(auth.uid(), 'ADMIN'));

-- Create trigger to update updated_at
CREATE TRIGGER update_white_label_settings_updated_at 
  BEFORE UPDATE ON white_label_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Insert default settings
INSERT INTO white_label_settings (
  company_name,
  company_cnpj,
  company_address,
  company_phone,
  company_email,
  primary_color,
  font_family
) VALUES (
  'iMóbia CRM',
  NULL,
  NULL,
  NULL,
  NULL,
  '#3882F6',
  'system-ui'
) ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_white_label_settings_created_at 
  ON white_label_settings(created_at DESC);
