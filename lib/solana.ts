import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { SOLANA_CONFIG, APP_CONFIG } from './config';
import bs58 from 'bs58';

// Use centralized configuration
export const NETWORK = SOLANA_CONFIG.NETWORK;
export const RPC_ENDPOINT = SOLANA_CONFIG.RPC_ENDPOINT;

// Create PharmaTrace verification keypair from private key
export const PHARMATRACE_KEYPAIR = Keypair.fromSecretKey(
  bs58.decode(SOLANA_CONFIG.PHARMATRACE_PRIVATE_KEY)
);

export const PHARMATRACE_PUBLIC_KEY = PHARMATRACE_KEYPAIR.publicKey;

// Program ID for the PharmaTrace Anchor program
export const PHARMACY_PROGRAM_ID = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);

// Create connection to Solana with retry logic
export const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: SOLANA_CONFIG.WS_ENDPOINT,
  confirmTransactionInitialTimeout: 60000,
});

// Helper to find batch PDA
export async function findBatchPDA(batchId: string): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('batch'),
      Buffer.from(batchId),
    ],
    PHARMACY_PROGRAM_ID
  );
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

// Helper to get explorer URL for transaction or address
export function getExplorerUrl(signature: string, type: 'tx' | 'address' = 'tx'): string {
  return `${APP_CONFIG.EXPLORER_BASE_URL}/${type}/${signature}`;
}

// Helper to validate connection
export async function validateConnection(): Promise<boolean> {
  try {
    const version = await connection.getVersion();
    console.log(`✅ Connected to Solana ${NETWORK}:`, version);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Solana:', error);
    return false;
  }
}

// Helper to get account info
export async function getAccountInfo(publicKey: PublicKey): Promise<any> {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo;
  } catch (error) {
    console.error('Error getting account info:', error);
    throw error;
  }
}