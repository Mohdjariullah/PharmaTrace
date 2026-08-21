import { PublicKey, clusterApiUrl } from '@solana/web3.js';

// Environment validation
function validateEnvVar(name: string, value: string | undefined, defaultValue?: string): string {
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || defaultValue!;
}

// Solana Configuration
export const SOLANA_CONFIG = {
  NETWORK: validateEnvVar('NEXT_PUBLIC_SOLANA_NETWORK', process.env.NEXT_PUBLIC_SOLANA_NETWORK, 'devnet'),
  RPC_ENDPOINT: validateEnvVar('NEXT_PUBLIC_SOLANA_RPC', process.env.NEXT_PUBLIC_SOLANA_RPC, clusterApiUrl('devnet')),
  WS_ENDPOINT: validateEnvVar('NEXT_PUBLIC_SOLANA_WS_ENDPOINT', process.env.NEXT_PUBLIC_SOLANA_WS_ENDPOINT, 'wss://api.devnet.solana.com'),
  // Falls back to the deployed devnet PharmaTrace Anchor program. The
  // previous program (7QUnq...Twy2EL) was stale - its deployed bytecode
  // predated this repo's lib.rs and didn't recognize any of its
  // instructions. This is a freshly built-and-deployed replacement,
  // verified end-to-end (register/transfer/flag all confirmed on-chain).
  PROGRAM_ID: validateEnvVar('NEXT_PUBLIC_PROGRAM_ID', process.env.NEXT_PUBLIC_PROGRAM_ID, 'F3zPqAT13xW9nK8DzcmrovYecipW97eyNzYRu88GV18r'),
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
  ANON_KEY: validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'PharmaTrace',
  DESCRIPTION: 'Blockchain-secured pharmaceutical supply chain tracking',
  VERSION: '1.0.0',
  EXPLORER_BASE_URL: 'https://explorer.solana.com',
};

// Development helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 PharmaTrace Configuration:', {
    network: SOLANA_CONFIG.NETWORK,
    rpcEndpoint: SOLANA_CONFIG.RPC_ENDPOINT,
  });
}