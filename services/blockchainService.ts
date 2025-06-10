import { PublicKey, Transaction, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getPharmaProgram } from '@/lib/anchor';
import { connection, findBatchPDA } from '@/lib/solana';
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

  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programId || programId === '11111111111111111111111111111111') {
    throw new Error('Invalid program ID configuration');
  }

  const program = getPharmaProgram(wallet);
  const batchPDA = await findBatchPDA(batchId);

  return retryTransaction(async () => {
    const tx = await program.methods
      .initBatch(batchId, productName, mfgDate, expDate, ipfsHash || '')
      .accounts({
        batchAccount: batchPDA,
        manufacturer: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const isValid = await validateTransaction(connection, tx);
    if (!isValid) {
      throw new Error('Transaction failed validation');
    }

    return {
      batchPDA: batchPDA.toString(),
      txSignature: tx,
    };
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