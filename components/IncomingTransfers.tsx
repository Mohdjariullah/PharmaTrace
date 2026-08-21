"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, X } from "lucide-react";
import { getIncomingTransfersByWallet } from "@/services/supabaseService";
import { useWalletContext } from "@/components/WalletProvider";
import { truncatePublicKey } from "@/lib/solana";
import { BatchTransfer } from "@/types";

type IncomingTransfer = BatchTransfer & {
  batches: { batch_pda: string; product_name: string } | null;
};

function dismissedKey(wallet: string) {
  return `pharmatrace:dismissed-transfers:${wallet}`;
}

function readDismissed(wallet: string): Set<string> {
  try {
    const raw = localStorage.getItem(dismissedKey(wallet));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeDismissed(wallet: string, ids: Set<string>) {
  try {
    localStorage.setItem(dismissedKey(wallet), JSON.stringify(Array.from(ids)));
  } catch {
    // Best-effort only - if storage is unavailable, the banner just
    // reappears next visit, which is a harmless annoyance, not a bug.
  }
}

export default function IncomingTransfers() {
  const { connected, publicKey } = useWalletContext();
  const [transfers, setTransfers] = useState<IncomingTransfer[]>([]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setTransfers([]);
      return;
    }

    let cancelled = false;

    getIncomingTransfersByWallet(publicKey)
      .then((data) => {
        if (cancelled) return;
        const dismissed = readDismissed(publicKey);
        setTransfers((data || []).filter((t) => t.id && !dismissed.has(t.id)));
      })
      .catch((error) => console.error("Error fetching incoming transfers:", error));

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  if (!connected || !publicKey || transfers.length === 0) return null;

  const dismiss = (id?: string) => {
    if (!publicKey) return;
    const dismissed = readDismissed(publicKey);
    if (id) {
      dismissed.add(id);
    } else {
      transfers.forEach((t) => t.id && dismissed.add(t.id));
    }
    writeDismissed(publicKey, dismissed);
    setTransfers((prev) => (id ? prev.filter((t) => t.id !== id) : []));
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-background">
              <ArrowDownLeft className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {transfers.length === 1 ? "You've received a batch" : `You've received ${transfers.length} batches`}
              </h3>
              <p className="text-xs text-muted-foreground">Ownership was transferred to your wallet on-chain.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => dismiss()}>
            Dismiss all
          </Button>
        </div>

        <div className="space-y-2">
          {transfers.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-foreground">
                  {t.batches?.product_name || t.batch_id}
                </div>
                <div className="truncate font-mono text-[11px] text-muted-foreground">
                  {t.batch_id} · from {truncatePublicKey(t.from_wallet)} · {new Date(t.transfer_date).toLocaleString()}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {t.batches?.batch_pda && (
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                    <Link href={`/verify?batchPDA=${t.batches.batch_pda}`}>View</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => dismiss(t.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
