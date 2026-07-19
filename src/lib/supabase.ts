import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');

// Real Supabase keys are JWTs that start with "eyJ" and are 200+ chars long
const isValidKey = (key: string) => key.startsWith('eyJ') && key.length > 100;

// Only mark as configured if BOTH the URL and key are real
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  isValidUrl(supabaseUrl) &&
  isValidKey(supabaseAnonKey)
);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder'
);
