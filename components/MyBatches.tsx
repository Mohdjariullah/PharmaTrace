"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ArrowRight, ExternalLink, Repeat } from "lucide-react";
import { getBatchesByOwner } from "@/services/supabaseService";
import { useWalletContext } from "@/components/WalletProvider";
import { formatDate } from "@/services/qrService";
import { getExplorerUrl } from "@/lib/solana";
import { Batch } from "@/types";
import BatchStatusBadge from "@/components/BatchStatusBadge";

export default function MyBatches() {
  const { connected, publicKey } = useWalletContext();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBatches([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getBatchesByOwner(publicKey)
      .then((data) => {
        if (!cancelled) setBatches(data || []);
      })
      .catch((error) => {
        console.error("Error fetching my batches:", error);
        if (!cancelled) setBatches([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  if (!connected) return null;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
            <Package className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No batches yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-muted-foreground">
            Register your first batch to see it tracked here.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/register">
              Register a batch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {batches.map((batch) => (
        <Card key={batch.batch_pda} className="transition-colors hover:border-primary/40">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60">
                <Package className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{batch.product_name}</h3>
                  <BatchStatusBadge status={batch.status} expDate={batch.exp_date} />
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{batch.batch_id}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mfg {formatDate(batch.mfg_date)} · Exp {formatDate(batch.exp_date)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/verify?batchPDA=${batch.batch_pda}`}>View</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/transfer">
                  <Repeat className="mr-1.5 h-3.5 w-3.5" />
                  Transfer
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={getExplorerUrl(batch.init_tx_signature)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
