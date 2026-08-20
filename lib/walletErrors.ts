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

export function explainTransactionError(error: unknown): FriendlyError {
  const message = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();

  if (message.includes('user rejected') || message.includes('user cancelled') || message.includes('rejected the request')) {
    return {
      title: 'Transaction cancelled',
      description: 'You cancelled the transaction in your wallet. Please try again when ready.',
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
