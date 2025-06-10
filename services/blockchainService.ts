import { PublicKey, Transaction, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getPharmaProgram } from '@/lib/anchor';
import { connection, findBatchPDA, PHARMACY_PROGRAM_ID } from '@/lib/solana';
import { web3 } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

async function validateTransaction(connection: Connection, signature: string): Promise<boolean> {
  try {
    const status = await connection.getSignatureStatus(signature);
    if (!status || !status.value) return false;
    return status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized';
  } catch (error) {
    console.error('Error validating transaction:', error);
    return false;
  }
}

async function retryTransaction<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (error.name === 'WalletSignTransactionError') {
        console.error('User rejected signing. Transaction will not be retried.');
        throw error;
      }
      console.warn(`Transaction attempt ${attempt} failed:`, error);
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

// Check if the program is deployed and accessible
async function validateProgramDeployment(): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(PHARMACY_PROGRAM_ID);
    if (!accountInfo) {
      console.error('❌ Program not found on blockchain. Program ID:', PHARMACY_PROGRAM_ID.toString());
      return false;
    }
    
    if (!accountInfo.executable) {
      console.error('❌ Program account is not executable');
      return false;
    }
    
    console.log('✅ Program found and executable:', PHARMACY_PROGRAM_ID.toString());
    return true;
  } catch (error) {
    console.error('❌ Error validating program deployment:', error);
    return false;
  }
}

export async function initBatchOnChain(
  wallet: WalletContextState,
  batchId: string,
  productName: string,
  mfgDate: string,
  expDate: string,
  ipfsHash?: string
): Promise<{ batchPDA: string; txSignature: string }> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  // Validate program deployment first
  const isProgramDeployed = await validateProgramDeployment();
  if (!isProgramDeployed) {
    throw new Error(`Program not deployed or not found. Please check the program ID: ${PHARMACY_PROGRAM_ID.toString()}`);
  }

  // Check wallet balance
  try {
    const balance = await connection.getBalance(wallet.publicKey);
    const minBalance = 0.01 * LAMPORTS_PER_SOL; // Minimum 0.01 SOL
    
    if (balance < minBalance) {
      throw new Error(`Insufficient SOL balance. You need at least 0.01 SOL for transaction fees and rent. Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    }
  } catch (error: any) {
    if (error.message.includes('Insufficient SOL')) {
      throw error;
    }
    console.warn('Could not check wallet balance:', error);
  }

  const program = getPharmaProgram(wallet);
  const [batchPDA] = await findBatchPDA(batchId);

  // Check if batch already exists
  try {
    const existingAccount = await connection.getAccountInfo(batchPDA);
    if (existingAccount) {
      throw new Error(`Batch with ID "${batchId}" already exists. Please use a different batch ID.`);
    }
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      throw error;
    }
    // Account doesn't exist, which is what we want
  }

  return retryTransaction(async () => {
    try {
      console.log('🔄 Attempting to register batch on blockchain...');
      console.log('Batch PDA:', batchPDA.toString());
      console.log('Program ID:', PHARMACY_PROGRAM_ID.toString());
      
      const tx = await program.methods
        .initBatch(batchId, productName, mfgDate, expDate, ipfsHash || '')
        .accounts({
          batchAccount: batchPDA,
          manufacturer: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Transaction sent:', tx);

      const isValid = await validateTransaction(connection, tx);
      if (!isValid) {
        throw new Error('Transaction failed validation');
      }

      console.log('✅ Transaction confirmed:', tx);
      return {
        batchPDA: batchPDA.toString(),
        txSignature: tx,
      };
    } catch (error: any) {
      console.error('❌ Blockchain transaction failed:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('InstructionFallbackNotFound')) {
        throw new Error('Smart contract instruction not found. The program may not be properly deployed or the instruction name has changed.');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL for transaction fees. Please add more SOL to your wallet.');
      } else if (error.message?.includes('Simulation failed')) {
        throw new Error('Transaction simulation failed. Please check your inputs and try again.');
      }
      
      throw error;
    }
  });
}

export async function transferBatchOnChain(
  wallet: WalletContextState,
  batchPDA: string,
  newOwner: string
): Promise<string> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  const isProgramDeployed = await validateProgramDeployment();
  if (!isProgramDeployed) {
    throw new Error(`Program not deployed or not found. Please check the program ID: ${PHARMACY_PROGRAM_ID.toString()}`);
  }

  const program = getPharmaProgram(wallet);
  const newOwnerKey = new PublicKey(newOwner);
  const batchPDAKey = new PublicKey(batchPDA);

  return retryTransaction(async () => {
    const tx = await program.methods
      .transferBatch()
      .accounts({
        batchAccount: batchPDAKey,
        currentOwner: wallet.publicKey,
        newOwner: newOwnerKey,
      })
      .rpc();

    const isValid = await validateTransaction(connection, tx);
    if (!isValid) {
      throw new Error('Transaction failed validation');
    }

    return tx;
  });
}

export async function flagBatchOnChain(
  wallet: WalletContextState,
  batchPDA: string,
  reason: string
): Promise<string> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  const isProgramDeployed = await validateProgramDeployment();
  if (!isProgramDeployed) {
    throw new Error(`Program not deployed or not found. Please check the program ID: ${PHARMACY_PROGRAM_ID.toString()}`);
  }

  const program = getPharmaProgram(wallet);
  const batchPDAKey = new PublicKey(batchPDA);

  return retryTransaction(async () => {
    const tx = await program.methods
      .flagBatch(reason)
      .accounts({
        batchAccount: batchPDAKey,
        regulator: wallet.publicKey,
      })
      .rpc();

    const isValid = await validateTransaction(connection, tx);
    if (!isValid) {
      throw new Error('Transaction failed validation');
    }

    return tx;
  });
}

export async function isCurrentOwner(
  wallet: WalletContextState,
  batchPDA: string
): Promise<boolean> {
  try {
    if (!wallet.publicKey) return false;

    const program = getPharmaProgram(wallet);
    const batchAccount = await program.account.batch.fetch(new PublicKey(batchPDA));

    return batchAccount.currentOwner.toString() === wallet.publicKey.toString();
  } catch (error) {
    console.error('Error checking current owner:', error);
    return false;
  }
}

export async function isRegulator(
  wallet: WalletContextState
): Promise<boolean> {
  try {
    if (!wallet.publicKey) return false;

    // Replace with real validator logic
    return false;
  } catch (error) {
    console.error('Error checking regulator status:', error);
    return false;
  }
}