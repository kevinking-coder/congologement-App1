import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabaseUrl = 'https://bmdcgumvqqicayfedeem.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZGNndW12cXFpY2F5ZmVkZWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MjQxMzMsImV4cCI6MjEwNTEwMDEzM30.y9lHvW_WjVGt6KoQwmVJ7_u_ZybvqzmV65dMbpyOoio';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
