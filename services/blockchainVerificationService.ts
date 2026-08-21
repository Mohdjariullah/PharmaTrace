import { PublicKey } from '@solana/web3.js';
import { getPharmaProgram } from '@/lib/anchor';
import { Batch } from '@/types';
import { withRpcCache } from '@/lib/rpcCache';

// Anchor deserializes a Rust enum with no explicit discriminants (like
// BatchStatus) into an object keyed by the camelCase variant name, e.g.
// { valid: {} } / { flagged: {} } / { expired: {} }. This maps that back
// to the plain numeric convention (0/1/2) used across the Supabase schema
// and the rest of the app.
const BATCH_STATUS_ORDER = ['valid', 'flagged', 'expired'];

function anchorBatchStatusToNumber(status: any): number {
  if (status && typeof status === 'object') {
    const key = Object.keys(status)[0];
    const index = BATCH_STATUS_ORDER.indexOf(key);
    if (index !== -1) return index;
  }
  return -1;
}

export interface OnChainBatch {
  batchId: string;
  productName: string;
  manufacturer: string;
  currentOwner: string;
  mfgDate: string;
  expDate: string;
  status: number;
  ipfsHash: string;
}

// Minimal read-only wallet stub. AnchorProvider requires a wallet-shaped
// object, but fetching an account doesn't require real signing.
const READ_ONLY_WALLET = {
  publicKey: PublicKey.default,
  signTransaction: async (tx: any) => tx,
  signAllTransactions: async (txs: any[]) => txs,
};

/**
 * Cross-verify batch data between the real on-chain Batch account and the
 * database record for the same batch.
 */
export async function crossVerifyBatch(
  batchPDA: string,
  databaseBatch?: Batch | null
): Promise<{
  isConsistent: boolean;
  discrepancies: string[];
  onChainBatch: OnChainBatch | null;
}> {
  const discrepancies: string[] = [];

  let onChainBatch: OnChainBatch | null = null;
  try {
    // Short TTL, unlike the transaction cache elsewhere - this account's
    // state genuinely changes (transfer, flag), just not multiple times
    // within the same handful of seconds a page render or two would hit it.
    const account: any = await withRpcCache(`batchAccount:${batchPDA}`, 15_000, () => {
      const program = getPharmaProgram(READ_ONLY_WALLET);
      return (program.account as any).batch.fetch(new PublicKey(batchPDA));
    });

    onChainBatch = {
      batchId: account.batchId,
      productName: account.productName,
      manufacturer: account.manufacturer.toString(),
      currentOwner: account.currentOwner.toString(),
      mfgDate: account.mfgDate,
      expDate: account.expDate,
      status: anchorBatchStatusToNumber(account.status),
      ipfsHash: account.ipfsHash,
    };
  } catch (error: any) {
    console.error('Error fetching on-chain batch account:', error);
    discrepancies.push('Batch account not found on-chain');
    return {
      isConsistent: false,
      discrepancies,
      onChainBatch: null,
    };
  }

  if (databaseBatch) {
    if (databaseBatch.batch_id !== onChainBatch.batchId) {
      discrepancies.push(
        `Batch ID mismatch: database says ${databaseBatch.batch_id}, blockchain says ${onChainBatch.batchId}`
      );
    }
    if (databaseBatch.product_name !== onChainBatch.productName) {
      discrepancies.push(
        `Product name mismatch: database says ${databaseBatch.product_name}, blockchain says ${onChainBatch.productName}`
      );
    }
    if (databaseBatch.manufacturer_wallet !== onChainBatch.manufacturer) {
      discrepancies.push(
        `Manufacturer mismatch: database says ${databaseBatch.manufacturer_wallet}, blockchain says ${onChainBatch.manufacturer}`
      );
    }
    if (databaseBatch.current_owner_wallet !== onChainBatch.currentOwner) {
      discrepancies.push(
        `Owner mismatch: database says ${databaseBatch.current_owner_wallet}, blockchain says ${onChainBatch.currentOwner}`
      );
    }
    if (databaseBatch.mfg_date !== onChainBatch.mfgDate) {
      discrepancies.push(
        `Manufacturing date mismatch: database says ${databaseBatch.mfg_date}, blockchain says ${onChainBatch.mfgDate}`
      );
    }
    if (databaseBatch.exp_date !== onChainBatch.expDate) {
      discrepancies.push(
        `Expiry date mismatch: database says ${databaseBatch.exp_date}, blockchain says ${onChainBatch.expDate}`
      );
    }
    if (databaseBatch.status !== onChainBatch.status) {
      discrepancies.push(
        `Status mismatch: database says ${databaseBatch.status}, blockchain says ${onChainBatch.status}`
      );
    }
  }

  return {
    isConsistent: onChainBatch !== null && discrepancies.length === 0,
    discrepancies,
    onChainBatch,
  };
}
