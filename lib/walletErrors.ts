// Turns a raw wallet/RPC error into a message a non-technical user can act
// on. Solana wallets throw very generic strings ("Failed to simulate the
// results of this request") for what is almost always one of a handful of
// real causes - this maps those causes to plain instructions instead of
// forwarding the raw error text to the user.

export interface FriendlyError {
  title: string;
  description: string;
}

const DEVNET_FAUCET_HINT =
  "Get free devnet SOL at https://faucet.solana.com, or run \"solana airdrop 2 <your address> --url devnet\" from the Solana CLI.";

// PharmaTrace program errors (pharmatrace-program/src/lib.rs) come back
// through Anchor as e.g. "AnchorError thrown in src/lib.rs:51. Error Code:
// NotCurrentOwner. Error Number: 6006. Error Message: You are not the
// current owner of this batch." - the embedded Error Message is already the
// exact, correct explanation, so surface it directly instead of a generic
// "transaction failed".
const ANCHOR_ERROR_PATTERN = /Error Code:\s*(\w+)\.\s*Error Number:\s*\d+\.\s*Error Message:\s*([^\n]+?)\.?\s*$/;

function humanizeErrorCode(code: string): string {
  return code.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function explainTransactionError(error: unknown): FriendlyError {
  const rawMessage = error instanceof Error ? error.message : String(error ?? '');
  const message = rawMessage.toLowerCase();

  const anchorMatch = rawMessage.match(ANCHOR_ERROR_PATTERN);
  if (anchorMatch) {
    return {
      title: humanizeErrorCode(anchorMatch[1]),
      description: anchorMatch[2],
    };
  }

  if (message.includes('user rejected') || message.includes('user cancelled') || message.includes('rejected the request')) {
    return {
      title: 'Transaction cancelled',
      description: 'You cancelled the transaction in your wallet. Please try again when ready.',
    };
  }

  if (
    message.includes('429') ||
    message.includes('too many requests') ||
    message.includes('rate limit') ||
    message.includes('rate limits exceeded')
  ) {
    return {
      title: 'Devnet is rate-limiting requests',
      description: "Solana's public devnet RPC is temporarily rejecting requests as too frequent. Wait about 30 seconds and try again.",
    };
  }

  if (
    message.includes('failed to simulate') ||
    message.includes('simulation failed') ||
    message.includes('unable to simulate')
  ) {
    return {
      title: "Your wallet couldn't simulate this transaction",
      description:
        "This almost always means your wallet's active network is set to Mainnet, but PharmaTrace runs on Solana Devnet. " +
        "Open your wallet's Settings → Developer Settings (Phantom) or network switcher and select Devnet, then try again. " +
        DEVNET_FAUCET_HINT,
    };
  }

  if (
    message.includes('insufficient sol') ||
    message.includes('insufficient funds') ||
    message.includes('insufficient lamports') ||
    message.includes('no record of a prior credit')
  ) {
    return {
      title: 'Not enough devnet SOL',
      description: `Your wallet doesn't have enough devnet SOL to cover this transaction. ${DEVNET_FAUCET_HINT}`,
    };
  }

  if (message.includes('blockhash not found') || message.includes('block height exceeded')) {
    return {
      title: 'Network congestion',
      description: 'The Solana devnet network is busy right now. Please wait a moment and try again.',
    };
  }

  if (message.includes('wallet not properly connected') || message.includes('wallet not connected')) {
    return {
      title: 'Wallet not connected',
      description: 'Please connect your wallet before continuing.',
    };
  }

  return {
    title: 'Transaction failed',
    description: 'There was an error processing this transaction. Please try again.',
  };
}
