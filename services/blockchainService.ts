import {
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from '@solana/web3.js';
import { connection, PHARMACY_PROGRAM_ID, findBatchPDA } from '@/lib/solana';
import { getPharmaProgram } from '@/lib/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

// A deterministic rejection by the on-chain program (wrong owner, batch
// already flagged, bad input, etc.) will fail identically on every retry -
// retrying it only burns RPC calls (making devnet 429s more likely) and
// replaces the real, actionable error message with whatever the RPC layer
// throws on the final attempt. Only genuine transient failures should retry.
function isNonRetryableProgramError(error: any): boolean {
  const message = String(error?.message ?? '');
  return (
    error?.name === 'WalletSignTransactionError' ||
    /AnchorError thrown in/.test(message) ||
    typeof error?.error?.errorCode?.code === 'string'
  );
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
      if (isNonRetryableProgramError(error)) {
        if (error.name !== 'WalletSignTransactionError') {
          console.error('Transaction rejected by the program. Will not retry:', error);
        }
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

/**
 * Builds an AnchorProvider-compatible wallet object from a wallet-adapter
 * WalletContextState. AnchorProvider only needs publicKey/signTransaction/
 * signAllTransactions, all of which WalletContextState already provides.
 */
function toAnchorWallet(wallet: WalletContextState) {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet not properly connected');
  }
  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  };
}

export async function registerBatchTransaction(
  wallet: WalletContextState,
  batchId: string,
  productName: string,
  mfgDate: string,
  expDate: string,
  ipfsHash?: string
): Promise<{ txSignature: string; batchId: string; productName: string; batchPDA: string }> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  // Check wallet balance
  try {
    const balance = await connection.getBalance(wallet.publicKey);
    const minBalance = 0.01 * LAMPORTS_PER_SOL; // Minimum 0.01 SOL

    if (balance < minBalance) {
      throw new Error(`Insufficient SOL balance. You need at least 0.01 SOL for transaction fees. Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    }
  } catch (error: any) {
    if (error.message.includes('Insufficient SOL')) {
      throw error;
    }
    console.warn('Could not check wallet balance:', error);
  }

  return retryTransaction(async () => {
    try {
      console.log('🔄 Creating batch registration transaction...');
      console.log('User Account:', wallet.publicKey!.toString());

      // Derive the batch PDA
      const [batchPDA] = await findBatchPDA(batchId);
      console.log('Batch PDA:', batchPDA.toString());

      const program = getPharmaProgram(toAnchorWallet(wallet));

      const signature = await program.methods
        .initBatch(batchId, productName, mfgDate, expDate, ipfsHash ?? '')
        .accounts({
          batchAccount: batchPDA,
          manufacturer: wallet.publicKey!,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Transaction confirmed:', signature);

      return {
        txSignature: signature,
        batchId,
        productName,
        batchPDA: batchPDA.toString(),
      };
    } catch (error: any) {
      console.error('❌ Blockchain transaction failed:', error);

      // Provide more specific error messages
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL for transaction fees. Please add more SOL to your wallet.');
      } else if (error.message?.includes('already in use') || error.message?.includes('0x0')) {
        throw new Error(`A batch with ID "${batchId}" is already registered on-chain.`);
      } else if (error.message?.includes('Simulation failed')) {
        throw new Error('Transaction simulation failed. Please check your inputs and try again.');
      }

      throw error;
    }
  });
}

export async function verifyBatchTransaction(txSignature: string): Promise<{
  isValid: boolean;
  fromAccount?: string;
  toAccount?: string;
  amount?: number;
  timestamp?: number;
  error?: string;
}> {
  try {
    // Get transaction details
    const transaction = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!transaction) {
      return {
        isValid: false,
        error: 'Transaction not found on blockchain'
      };
    }

    // Check if transaction was successful
    if (transaction.meta?.err) {
      return {
        isValid: false,
        error: 'Transaction failed on blockchain'
      };
    }

    // Get transaction details
    const message = transaction.transaction.message;
    const accountKeys = message.getAccountKeys();

    // Handle different account key structures
    let staticKeys: PublicKey[];
    if (Array.isArray(accountKeys)) {
      // Legacy message format
      staticKeys = accountKeys as unknown as PublicKey[];
    } else {
      // Versioned message format with LoadedAddresses
      staticKeys = accountKeys.staticAccountKeys || [];
    }

    if (!staticKeys.length) {
      return {
        isValid: false,
        error: 'Invalid transaction structure'
      };
    }

    // The signer/fee payer is always the first account key.
    const fromAccount = staticKeys[0]?.toString();

    // Confirm the transaction actually touches the PharmaTrace program -
    // this is the real signal now that we no longer route a manual "fee"
    // transfer to a fixed wallet.
    const touchesPharmaTraceProgram = staticKeys.some(
      (key) => key.toString() === PHARMACY_PROGRAM_ID.toString()
    );

    if (!touchesPharmaTraceProgram) {
      return {
        isValid: false,
        error: 'Transaction does not involve the PharmaTrace program'
      };
    }

    return {
      isValid: true,
      fromAccount,
      toAccount: PHARMACY_PROGRAM_ID.toString(),
      amount: 0,
      timestamp: transaction.blockTime || 0
    };

  } catch (error: any) {
    console.error('Error verifying transaction:', error);
    return {
      isValid: false,
      error: error.message || 'Failed to verify transaction'
    };
  }
}

export async function transferBatchOnChain(
  wallet: WalletContextState,
  batchPDA: string,
  newOwner: string
): Promise<string> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  const newOwnerKey = new PublicKey(newOwner);
  const program = getPharmaProgram(toAnchorWallet(wallet));

  return retryTransaction(async () => {
    const signature = await program.methods
      .transferBatch()
      .accounts({
        batchAccount: new PublicKey(batchPDA),
        currentOwner: wallet.publicKey!,
        newOwner: newOwnerKey,
      })
      .rpc();

    return signature;
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

  const program = getPharmaProgram(toAnchorWallet(wallet));

  return retryTransaction(async () => {
    const signature = await program.methods
      .flagBatch(reason)
      .accounts({
        batchAccount: new PublicKey(batchPDA),
        regulator: wallet.publicKey!,
      })
      .rpc();

    return signature;
  });
}

export async function isCurrentOwner(batchPDA: string, walletAddress: string): Promise<boolean> {
  // For now, we'll use a simple check based on the database
  // In a real implementation, this would check the blockchain state
  return true;
}
