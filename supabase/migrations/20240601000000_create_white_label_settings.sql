-- Create white_label_settings table
CREATE TABLE IF NOT EXISTS public.white_label_settings (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_name text NOT NULL DEFAULT 'iMóbia CRM',
    company_cnpj text,
    company_address text,
    company_phone text,
    company_email text,
    company_website text,
    logo_url text,
    logo_metadata jsonb,
    favicon_url text,
    primary_color text DEFAULT '#3882F6',
    secondary_color text DEFAULT '#10b981',
    accent_color text DEFAULT '#8b5cf6',
    chat_background_color text DEFAULT '#FFFFFF',
    chat_user_bubble_color text DEFAULT '#3882F6',
    chat_bot_bubble_color text DEFAULT '#F3F4F6',
    chat_history_panel_bg_color text DEFAULT '#FFFFFF',
    font_family text DEFAULT 'system-ui',
    font_size_base text DEFAULT '16px',
    custom_css text,
    custom_js text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users"
ON public.white_label_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert access for authenticated users"
ON public.white_label_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update access for authenticated users"
ON public.white_label_settings
FOR UPDATE
TO authenticated
USING (true);

-- Create storage bucket for white label assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('white-label-assets', 'white-label-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'white-label-assets');

CREATE POLICY "Allow authenticated upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'white-label-assets');

CREATE POLICY "Allow authenticated delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'white-label-assets');
