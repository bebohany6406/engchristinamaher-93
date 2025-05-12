
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Default values that will be used if environment variables are not available
// These should be replaced with actual values from your Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create a single supabase client for interacting with the database
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Function to check if Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('students').select('count');
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
