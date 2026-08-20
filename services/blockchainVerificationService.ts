import { PublicKey } from '@solana/web3.js';
import { connection, PHARMATRACE_PUBLIC_KEY } from '@/lib/solana';
import { getPharmaProgram } from '@/lib/anchor';
import { Batch } from '@/types';

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

export interface BlockchainBatch {
  batchId: string;
  productName: string;
  manufacturer: PublicKey;
  currentOwner: PublicKey;
  mfgDate: string;
  expDate: string;
  status: number;
  ipfsHash: string;
  createdAt: number;
  updatedAt: number;
}

export interface VerificationResult {
  isValid: boolean;
  isOnBlockchain: boolean;
  batch?: BlockchainBatch;
  error?: string;
  verificationDetails: {
    transactionExists: boolean;
    validTransaction: boolean;
    sentToPharmaTrace: boolean;
    statusCheck: 'valid' | 'flagged' | 'expired' | 'unknown';
  };
}

/**
 * Verify a transaction exists on the blockchain and is valid
 */
export async function verifyTransactionOnBlockchain(txSignature: string): Promise<VerificationResult> {
  const result: VerificationResult = {
    isValid: false,
    isOnBlockchain: false,
    verificationDetails: {
      transactionExists: false,
      validTransaction: false,
      sentToPharmaTrace: false,
      statusCheck: 'unknown',
    },
  };

  try {
    // Get transaction details
    const transaction = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!transaction) {
      result.error = 'Transaction not found on blockchain - this may be a fake QR code';
      return result;
    }

    result.verificationDetails.transactionExists = true;

    // Check if transaction was successful
    if (transaction.meta?.err) {
      result.error = 'Transaction failed on blockchain';
      return result;
    }

    result.verificationDetails.validTransaction = true;
    result.isOnBlockchain = true;

    // Get transaction details
    const message = transaction.transaction.message;
    const accountKeys = message.getAccountKeys();
    
    // Handle different account key structures
    let toAccount: string | undefined;
    
    if (Array.isArray(accountKeys)) {
      // Legacy message format
      if (accountKeys.length < 2) {
        result.error = 'Invalid transaction structure';
        return result;
      }
      toAccount = accountKeys[1].toString();
    } else {
      // Versioned message format with LoadedAddresses
      if (!accountKeys.staticAccountKeys || accountKeys.staticAccountKeys.length < 2) {
        result.error = 'Invalid transaction structure';
        return result;
      }
      toAccount = accountKeys.staticAccountKeys[1].toString();
    }

    if (!toAccount) {
      result.error = 'Could not retrieve account information';
      return result;
    }

    // Verify the transaction was sent to our PharmaTrace account
    const isPharmaTraceTransaction = toAccount === PHARMATRACE_PUBLIC_KEY.toString();

    if (!isPharmaTraceTransaction) {
      result.error = 'Transaction was not sent to PharmaTrace verification account';
      return result;
    }

    result.verificationDetails.sentToPharmaTrace = true;
    result.verificationDetails.statusCheck = 'valid';
    result.isValid = true;

  } catch (error: any) {
    console.error('Blockchain verification error:', error);
    result.error = error.message || 'Failed to verify transaction on blockchain';
  }

  return result;
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
    const program = getPharmaProgram(READ_ONLY_WALLET);
    const account: any = await (program.account as any).batch.fetch(new PublicKey(batchPDA));

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

/**
 * Get comprehensive verification report
 */
export async function getVerificationReport(txSignature: string): Promise<{
  timestamp: string;
  txSignature: string;
  verification: VerificationResult;
  securityLevel: 'high' | 'medium' | 'low' | 'invalid';
  recommendations: string[];
}> {
  const verification = await verifyTransactionOnBlockchain(txSignature);
  let securityLevel: 'high' | 'medium' | 'low' | 'invalid' = 'invalid';
  const recommendations: string[] = [];

  if (verification.isValid && verification.isOnBlockchain) {
    securityLevel = 'high';
    recommendations.push('✅ Transaction is authentic and verified on blockchain');
    recommendations.push('✅ This is a legitimate PharmaTrace registration');
  } else if (verification.isOnBlockchain && !verification.isValid) {
    securityLevel = 'medium';
    recommendations.push('⚠️ Transaction exists but has validation issues');
  } else if (verification.verificationDetails.transactionExists) {
    securityLevel = 'low';
    recommendations.push('⚠️ Transaction exists but has integrity issues');
  } else {
    securityLevel = 'invalid';
    recommendations.push('❌ FAKE QR CODE DETECTED - Transaction not found on blockchain');
    recommendations.push('❌ Do not trust this product');
    recommendations.push('❌ Report suspicious QR codes to authorities');
  }

  return {
    timestamp: new Date().toISOString(),
    txSignature,
    verification,
    securityLevel,
    recommendations,
  };
}