import { PublicKey } from '@solana/web3.js';
import { connection, PHARMACY_PROGRAM_ID, findBatchPDA } from '@/lib/solana';
import { getPharmaProgram } from '@/lib/anchor';
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
    pdaExists: boolean;
    accountDataValid: boolean;
    programOwned: boolean;
    statusCheck: 'valid' | 'flagged' | 'expired' | 'unknown';
  };
}

/**
 * Verify a batch exists on the blockchain and is authentic
 */
export async function verifyBatchOnBlockchain(batchPDA: string): Promise<VerificationResult> {
  const result: VerificationResult = {
    isValid: false,
    isOnBlockchain: false,
    verificationDetails: {
      pdaExists: false,
      accountDataValid: false,
      programOwned: false,
      statusCheck: 'unknown',
    },
  };

  try {
    // Validate PDA format
    let batchPDAKey: PublicKey;
    try {
      batchPDAKey = new PublicKey(batchPDA);
    } catch (error) {
      result.error = 'Invalid batch PDA format';
      return result;
    }

    // Check if account exists
    const accountInfo = await connection.getAccountInfo(batchPDAKey);
    if (!accountInfo) {
      result.error = 'Batch not found on blockchain - this may be a fake medicine';
      return result;
    }

    result.verificationDetails.pdaExists = true;

    // Verify the account is owned by our program
    if (!accountInfo.owner.equals(PHARMACY_PROGRAM_ID)) {
      result.error = 'Batch account not owned by PharmaTrace program';
      return result;
    }

    result.verificationDetails.programOwned = true;

    // Try to deserialize the account data
    try {
      // Create a mock wallet for program interaction
      const mockWallet = {
        publicKey: new PublicKey('11111111111111111111111111111111'),
        signTransaction: async () => { throw new Error('Mock wallet'); },
        signAllTransactions: async () => { throw new Error('Mock wallet'); },
      };

      const program = getPharmaProgram(mockWallet);
      const batchAccount = await program.account.batch.fetch(batchPDAKey);

      result.verificationDetails.accountDataValid = true;
      result.isOnBlockchain = true;

      // Convert the blockchain data to our format
      const blockchainBatch: BlockchainBatch = {
        batchId: batchAccount.batchId,
        productName: batchAccount.productName,
        manufacturer: batchAccount.manufacturer,
        currentOwner: batchAccount.currentOwner,
        mfgDate: batchAccount.mfgDate,
        expDate: batchAccount.expDate,
        status: batchAccount.status === 'Valid' ? 0 : batchAccount.status === 'Flagged' ? 1 : 2,
        ipfsHash: batchAccount.ipfsHash,
        createdAt: batchAccount.createdAt?.toNumber() || 0,
        updatedAt: batchAccount.updatedAt?.toNumber() || 0,
      };

      result.batch = blockchainBatch;

      // Determine status
      if (blockchainBatch.status === 1) {
        result.verificationDetails.statusCheck = 'flagged';
        result.error = 'This batch has been flagged as suspicious by regulators';
      } else if (blockchainBatch.status === 2) {
        result.verificationDetails.statusCheck = 'expired';
      } else {
        result.verificationDetails.statusCheck = 'valid';
        result.isValid = true;
      }

      // Additional validation: check if batch is expired
      if (result.isValid) {
        const expDate = new Date(blockchainBatch.expDate);
        const now = new Date();
        if (expDate < now) {
          result.verificationDetails.statusCheck = 'expired';
          result.error = 'This batch has expired';
          result.isValid = false;
        }
      }

    } catch (fetchError: any) {
      console.error('Error fetching batch data:', fetchError);
      result.error = 'Unable to read batch data from blockchain';
      return result;
    }

  } catch (error: any) {
    console.error('Blockchain verification error:', error);
    result.error = error.message || 'Failed to verify batch on blockchain';
  }

  return result;
}

/**
 * Verify a batch ID by deriving its PDA and checking blockchain
 */
export async function verifyBatchById(batchId: string): Promise<VerificationResult> {
  try {
    const [batchPDA] = await findBatchPDA(batchId);
    return await verifyBatchOnBlockchain(batchPDA.toString());
  } catch (error: any) {
    return {
      isValid: false,
      isOnBlockchain: false,
      error: `Failed to derive PDA for batch ID: ${error.message}`,
      verificationDetails: {
        pdaExists: false,
        accountDataValid: false,
        programOwned: false,
        statusCheck: 'unknown',
      },
    };
  }
}

/**
 * Cross-verify batch data between blockchain and database
 */
export async function crossVerifyBatch(batchPDA: string, databaseBatch?: Batch): Promise<{
  isConsistent: boolean;
  discrepancies: string[];
  blockchainVerification: VerificationResult;
}> {
  const blockchainVerification = await verifyBatchOnBlockchain(batchPDA);
  const discrepancies: string[] = [];

  if (!blockchainVerification.isOnBlockchain || !blockchainVerification.batch) {
    return {
      isConsistent: false,
      discrepancies: ['Batch not found on blockchain'],
      blockchainVerification,
    };
  }

  if (databaseBatch) {
    const blockchain = blockchainVerification.batch;

    // Compare critical fields
    if (blockchain.batchId !== databaseBatch.batch_id) {
      discrepancies.push('Batch ID mismatch between blockchain and database');
    }

    if (blockchain.productName !== databaseBatch.product_name) {
      discrepancies.push('Product name mismatch between blockchain and database');
    }

    if (blockchain.manufacturer.toString() !== databaseBatch.manufacturer_wallet) {
      discrepancies.push('Manufacturer wallet mismatch between blockchain and database');
    }

    if (blockchain.currentOwner.toString() !== databaseBatch.current_owner_wallet) {
      discrepancies.push('Current owner mismatch between blockchain and database');
    }

    if (blockchain.status !== databaseBatch.status) {
      discrepancies.push('Status mismatch between blockchain and database');
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
export async function getVerificationReport(batchPDA: string): Promise<{
  timestamp: string;
  batchPDA: string;
  verification: VerificationResult;
  securityLevel: 'high' | 'medium' | 'low' | 'invalid';
  recommendations: string[];
}> {
  const verification = await verifyBatchOnBlockchain(batchPDA);
  let securityLevel: 'high' | 'medium' | 'low' | 'invalid' = 'invalid';
  const recommendations: string[] = [];

  if (verification.isValid && verification.isOnBlockchain) {
    securityLevel = 'high';
    recommendations.push('✅ Batch is authentic and verified on blockchain');
  } else if (verification.isOnBlockchain && !verification.isValid) {
    securityLevel = 'medium';
    if (verification.verificationDetails.statusCheck === 'flagged') {
      recommendations.push('⚠️ Batch is flagged as suspicious - do not use');
    } else if (verification.verificationDetails.statusCheck === 'expired') {
      recommendations.push('⚠️ Batch has expired - do not use');
    }
  } else if (verification.verificationDetails.pdaExists) {
    securityLevel = 'low';
    recommendations.push('⚠️ Batch exists but has data integrity issues');
  } else {
    securityLevel = 'invalid';
    recommendations.push('❌ FAKE MEDICINE DETECTED - Batch not found on blockchain');
    recommendations.push('❌ Do not consume this product');
    recommendations.push('❌ Report to authorities immediately');
  }

  return {
    timestamp: new Date().toISOString(),
    batchPDA,
    verification,
    securityLevel,
    recommendations,
  };
}