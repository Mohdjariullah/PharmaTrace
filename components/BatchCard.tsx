"use client";

import { Batch } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/services/qrService";
import { truncatePublicKey } from "@/lib/solana";
import { Eye, Flag, Package, Calendar, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import BatchStatusBadge from "@/components/BatchStatusBadge";

interface BatchCardProps {
  batch: Batch;
  onViewDetails?: () => void;
  onFlag?: () => void;
  showActions?: boolean;
}

export default function BatchCard({ batch, onFlag, showActions = true }: BatchCardProps) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardHeader className="pb-2">
        <div className="mb-1 flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold text-foreground">{batch.product_name}</CardTitle>
          <BatchStatusBadge status={batch.status} expDate={batch.exp_date} />
        </div>
        <div className="font-mono text-sm text-muted-foreground">{batch.batch_id}</div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Manufacturer</div>
            <div className="rounded-md bg-secondary/40 p-1.5 font-mono text-sm">
              {truncatePublicKey(batch.manufacturer_wallet)}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Current owner</div>
            <div className="rounded-md bg-secondary/40 p-1.5 font-mono text-sm">
              {truncatePublicKey(batch.current_owner_wallet)}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Manufactured</div>
            <div className="flex items-center gap-1.5 text-sm">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              {formatDate(batch.mfg_date)}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Expires</div>
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {formatDate(batch.exp_date)}
            </div>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-between gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" asChild>
            <Link href={`/verify?batchPDA=${batch.batch_pda}`}>
              <Eye className="h-3.5 w-3.5" />
              Details
            </Link>
          </Button>

          {onFlag && (
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onFlag}>
              <Flag className="h-3.5 w-3.5" />
              Flag
            </Button>
          )}

          {batch.manufacturer_wallet !== batch.current_owner_wallet && (
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" asChild>
              <Link href={`/transfer?batchPDA=${batch.batch_pda}`}>
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Transfer
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
