import { createClient } from '@supabase/supabase-js';

const localSupabaseUrl = localStorage.getItem('VITE_SUPABASE_URL');
const localSupabaseAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');

const supabaseUrl = localSupabaseUrl || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = localSupabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
