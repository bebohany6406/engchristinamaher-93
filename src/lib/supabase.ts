
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Function to get Supabase URL from localStorage or use default value
const getSupabaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || 'https://comzekipeqxdbppfkwac.supabase.co';
  }
  return import.meta.env.VITE_SUPABASE_URL || 'https://comzekipeqxdbppfkwac.supabase.co';
};

// Function to get Supabase Anon Key from localStorage or use default value
const getSupabaseKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbXpla2lwZXF4ZGJwcGZrd2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzYwNjMsImV4cCI6MjA2MjY1MjA2M30.OSHF_V5YKTWp3cB7awC-izobiathVs-_XB8dsB0aPXU';
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbXpla2lwZXF4ZGJwcGZrd2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzYwNjMsImV4cCI6MjA2MjY1MjA2M30.OSHF_V5YKTWp3cB7awC-izobiathVs-_XB8dsB0aPXU';
};

// Create a Supabase client with the values from localStorage or environment variables
export const createSupabaseClient = () => {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseKey();
  
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
};

// Export the Supabase client instance
export const supabase = createSupabaseClient();

// Function to reinitialize Supabase client with new credentials
export const reinitializeSupabase = () => {
  // This will create a new client instance with updated credentials from localStorage
  const newClient = createSupabaseClient();
  
  // Override the existing client's methods and properties
  // Note: This is a workaround since we can't replace the exported constant directly
  Object.assign(supabase, newClient);
  
  return newClient;
};

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
