"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/solana";
import { withRpcCache } from "@/lib/rpcCache";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Droplet, ExternalLink } from "lucide-react";

// Same minimum used by blockchainService's own pre-flight balance check.
const MIN_RECOMMENDED_LAMPORTS = 0.01 * 1_000_000_000;

interface DevnetBalanceNoticeProps {
  walletAddress: string;
}

/**
 * Warns when the connected wallet has too little SOL on the devnet cluster
 * this app runs on. A low/zero balance here is real regardless of what
 * network the wallet app itself is currently pointed at, so this check
 * stays accurate even when the "failed to simulate" wallet-network-mismatch
 * case (handled separately via explainTransactionError) doesn't apply.
 */
export default function DevnetBalanceNotice({ walletAddress }: DevnetBalanceNoticeProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setChecking(true);
    // This component mounts fresh on register/transfer/regulator pages, so
    // navigating between them within a few seconds shouldn't refire an
    // identical balance check each time.
    withRpcCache(`balance:${walletAddress}`, 15_000, () => connection.getBalance(new PublicKey(walletAddress)))
      .then((lamports) => {
        if (!cancelled) setBalance(lamports);
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  if (checking || balance === null || balance >= MIN_RECOMMENDED_LAMPORTS) {
    return null;
  }

  return (
    <Alert>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60">
          <Droplet className="h-4 w-4 text-primary" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <AlertTitle>Low devnet SOL balance</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              Your wallet has {(balance / 1_000_000_000).toFixed(4)} SOL on Solana Devnet — you'll
              need at least 0.01 SOL to cover transaction fees. PharmaTrace runs on Devnet, so
              mainnet SOL won't work here, and your wallet must be switched to Devnet too.
            </p>
            <Button asChild size="sm" variant="outline">
              <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Get free devnet SOL
              </a>
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
