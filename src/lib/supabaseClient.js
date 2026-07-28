import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder if environment variables are not set yet
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
// Use a correctly formatted placeholder JWT token (three sections separated by dots) to prevent initialization crash
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkyMTI4MDAsImV4cCI6MTk5NDc4ODgwMH0.placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are missing. Please add them to your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
