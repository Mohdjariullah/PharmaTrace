import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Network settings
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(NETWORK as any);

// Program ID handling with validation
const PROGRAM_ID_STRING = process.env.NEXT_PUBLIC_PROGRAM_ID || '7QUnqWD9rAAy5PNCpvXqZxYXfPW7G9SrWKJ3osTWy2EL';
export const PHARMACY_PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);

// Create connection to Solana
export const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS_ENDPOINT || 'wss://api.devnet.solana.com',
});

// Helper to find PDA for batch accounts
export async function findBatchPDA(batchId: string): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from('batch'), Buffer.from(batchId)],
    PHARMACY_PROGRAM_ID
  );
  
  return pda;
}

// Helper to check if a string is a valid Solana public key
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

// Helper to truncate public key for display
export function truncatePublicKey(publicKey: string): string {
  if (!publicKey) return '';
  return `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}`;
}

// Helper to get explorer URL for transaction
export function getExplorerUrl(signature: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = NETWORK === 'mainnet-beta' 
    ? 'https://explorer.solana.com' 
    : `https://explorer.solana.com/?cluster=${NETWORK}`;
  
  return `${baseUrl}/${type}/${signature}`;
}