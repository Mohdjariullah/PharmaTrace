export interface Batch {
  id?: string;
  batch_id: string;
  product_name: string;
  manufacturer_wallet: string;
  current_owner_wallet: string;
  mfg_date: string; // ISO date string
  exp_date: string; // ISO date string
  status: number; // Changed from 0 | 1 | 2 to number to match Supabase schema
  ipfs_hash?: string | null;
  batch_pda: string; // Program Derived Address for the batch
  init_tx_signature: string; // Initial transaction signature
  created_at?: string;
  updated_at?: string;
}

export interface BatchTransfer {
  id?: string;
  batch_id: string;
  from_wallet: string;
  to_wallet: string;
  tx_signature: string;
  transfer_date: string;
}

export interface BatchFlag {
  id?: string;
  batch_id: string;
  flagged_by_wallet: string;
  reason: string;
  tx_signature: string;
  flagged_at: string;
}

export interface QrCode {
  id?: string;
  tx_signature: string;
  batch_id: string;
  medicine_name: string;
  owner_address: string;
  created_at?: string;
  updated_at?: string;
}

export interface QrCodePayload {
  txSignature: string;
  batchId: string;
  medicineName: string;
  ownerAddress: string;
  timestamp: string;
}

export type BatchStatus = 'valid' | 'flagged' | 'expired';