import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { SUPABASE_CONFIG } from './config';

// Create Supabase client with centralized configuration
export const supabase = createClient<Database>(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'pharmatrace'
    },
    fetch: async (url, options = {}) => {
      const maxRetries = 3;
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return response;
        } catch (error) {
          attempt++;
          if (attempt === maxRetries) {
            console.error('Supabase request failed after retries:', error);
            throw new Error('Failed to connect to Supabase. Please check your connection and try again.');
          }
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
      
      throw new Error('Failed to connect to Supabase after retries');
    }
  }
});

// For server-side only
export const createServerSupabaseClient = () => {
  if (!SUPABASE_CONFIG.SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for server operations');
  }

  return createClient<Database>(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
};

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return children;
}