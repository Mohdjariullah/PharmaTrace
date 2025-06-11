import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { connection, PHARMATRACE_PUBLIC_KEY } from '@/lib/solana';
import { WalletContextState } from '@solana/wallet-adapter-react';

async function validateTransaction(signature: string): Promise<boolean> {
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

export async function registerBatchTransaction(
  wallet: WalletContextState,
  batchId: string,
  productName: string,
  mfgDate: string,
  expDate: string
): Promise<{ txSignature: string; batchId: string; productName: string }> {
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
      console.log('PharmaTrace Account:', PHARMATRACE_PUBLIC_KEY.toString());
      console.log('User Account:', wallet.publicKey!.toString());
      
      // Create a simple SOL transfer transaction to the PharmaTrace account
      // This serves as proof of batch registration
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey!,
          toPubkey: PHARMATRACE_PUBLIC_KEY,
          lamports: 1000000, // 0.001 SOL as registration fee
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey!;

      // Sign transaction with wallet
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ Transaction confirmed:', signature);

      const isValid = await validateTransaction(signature);
      if (!isValid) {
        throw new Error('Transaction failed validation');
      }

      return {
        txSignature: signature,
        batchId,
        productName,
      };
    } catch (error: any) {
      console.error('❌ Blockchain transaction failed:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL for transaction fees. Please add more SOL to your wallet.');
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
    const accountKeys = message.staticAccountKeys || message.accountKeys;
    
    if (!accountKeys || accountKeys.length < 2) {
      return {
        isValid: false,
        error: 'Invalid transaction structure'
      };
    }

    const fromAccount = accountKeys[0].toString();
    const toAccount = accountKeys[1].toString();

    // Verify the transaction was sent to our PharmaTrace account
    const isPharmaTraceTransaction = toAccount === PHARMATRACE_PUBLIC_KEY.toString();

    if (!isPharmaTraceTransaction) {
      return {
        isValid: false,
        error: 'Transaction was not sent to PharmaTrace verification account'
      };
    }

    // Get the amount transferred (from pre and post balances)
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];
    
    let amount = 0;
    if (preBalances.length > 1 && postBalances.length > 1) {
      amount = preBalances[0] - postBalances[0]; // Amount deducted from sender
    }

    return {
      isValid: true,
      fromAccount,
      toAccount,
      amount,
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
  batchId: string,
  newOwner: string
): Promise<string> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  const newOwnerKey = new PublicKey(newOwner);

  return retryTransaction(async () => {
    // Create a simple SOL transfer transaction to represent ownership transfer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey!,
        toPubkey: PHARMATRACE_PUBLIC_KEY,
        lamports: 500000, // 0.0005 SOL as transfer fee
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey!;

    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    await connection.confirmTransaction(signature, 'confirmed');

    const isValid = await validateTransaction(signature);
    if (!isValid) {
      throw new Error('Transaction failed validation');
    }

    return signature;
  });
}

export async function flagBatchOnChain(
  wallet: WalletContextState,
  batchId: string,
  reason: string
): Promise<string> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  return retryTransaction(async () => {
    // Create a simple SOL transfer transaction to represent flagging
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey!,
        toPubkey: PHARMATRACE_PUBLIC_KEY,
        lamports: 100000, // 0.0001 SOL as flagging fee
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey!;

    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    await connection.confirmTransaction(signature, 'confirmed');

    const isValid = await validateTransaction(signature);
    if (!isValid) {
      throw new Error('Transaction failed validation');
    }

    return signature;
  });
}