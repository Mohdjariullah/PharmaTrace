"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/solana";
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
    connection
      .getBalance(new PublicKey(walletAddress))
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
    <Alert className="border-2 shadow-lg border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
          <Droplet className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <AlertTitle className="text-lg font-bold text-amber-700 dark:text-amber-300">
            Low devnet SOL balance
          </AlertTitle>
          <AlertDescription className="mt-2 text-amber-800 dark:text-amber-200">
            <p className="mb-3">
              Your wallet has {(balance / 1_000_000_000).toFixed(4)} SOL on Solana Devnet — you'll
              need at least 0.01 SOL to cover transaction fees. PharmaTrace runs on Devnet, so
              mainnet SOL won't work here, and your wallet must be switched to Devnet too.
            </p>
            <Button asChild size="sm" variant="outline" className="bg-white dark:bg-gray-900">
              <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Get free devnet SOL
              </a>
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
