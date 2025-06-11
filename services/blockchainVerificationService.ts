import { PublicKey } from '@solana/web3.js';
import { connection, PHARMATRACE_PUBLIC_KEY } from '@/lib/solana';
import { Batch } from '@/types';

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
    const accountKeys = message.staticAccountKeys || message.accountKeys;
    
    if (!accountKeys || accountKeys.length < 2) {
      result.error = 'Invalid transaction structure';
      return result;
    }

    const toAccount = accountKeys[1].toString();

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

/**
 * Cross-verify batch data between blockchain and database
 */
export async function crossVerifyBatch(txSignature: string, databaseBatch?: Batch): Promise<{
  isConsistent: boolean;
  discrepancies: string[];
  blockchainVerification: VerificationResult;
}> {
  const blockchainVerification = await verifyTransactionOnBlockchain(txSignature);
  const discrepancies: string[] = [];

  if (!blockchainVerification.isOnBlockchain) {
    return {
      isConsistent: false,
      discrepancies: ['Transaction not found on blockchain'],
      blockchainVerification,
    };
  }

  if (databaseBatch) {
    // Check if the transaction signature matches
    if (databaseBatch.init_tx_signature !== txSignature) {
      discrepancies.push('Transaction signature mismatch between request and database');
    }
  }

  return {
    isConsistent: discrepancies.length === 0,
    discrepancies,
    blockchainVerification,
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