import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { SUPABASE_CONFIG } from './config';

// Helper function to determine if an error should be retried
function shouldRetryError(error: any, response?: Response): boolean {
  // Don't retry on client errors (4xx) except for specific cases
  if (response?.status) {
    const status = response.status;
    
    // Retry on server errors (5xx)
    if (status >= 500) return true;
    
    // Retry on rate limiting
    if (status === 429) return true;
    
    // Retry on request timeout
    if (status === 408) return true;
    
    // Don't retry on other 4xx errors (client errors)
    if (status >= 400 && status < 500) return false;
  }
  
  // Retry on network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
  if (error.name === 'AbortError') return true;
  if (error.message?.includes('network')) return true;
  if (error.message?.includes('timeout')) return true;
  
  return false;
}

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
      let lastError: any;
      
      while (attempt < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // If response is not ok, check if we should retry
          if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`);
            
            // For client errors, don't retry and throw immediately with better error message
            if (!shouldRetryError(error, response)) {
              let errorMessage = `Request failed with status ${response.status}`;
              
              try {
                const errorBody = await response.text();
                if (errorBody) {
                  const parsedError = JSON.parse(errorBody);
                  if (parsedError.message) {
                    errorMessage = parsedError.message;
                  } else if (parsedError.code) {
                    errorMessage = `${parsedError.code}: ${parsedError.details || 'Request failed'}`;
                  }
                }
              } catch (parseError) {
                // If we can't parse the error body, use the default message
              }
              
              throw new Error(errorMessage);
            }
            
            throw error;
          }
          
          return response;
        } catch (error: any) {
          lastError = error;
          attempt++;
          
          // Don't retry if this is not a retryable error
          if (!shouldRetryError(error)) {
            console.error('Supabase request failed (non-retryable):', error);
            throw error;
          }
          
          if (attempt === maxRetries) {
            console.error('Supabase request failed after retries:', error);
            throw new Error('Failed to connect to Supabase. Please check your connection and try again.');
          }
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
      
      throw lastError;
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