-- Reload PostgREST schema cache
-- Run this if you see errors like "Could not find the table 'public.plans' in the schema cache"
NOTIFY pgrst, 'reload config';
