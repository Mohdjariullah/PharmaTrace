"use client";

import { Batch } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, isBatchExpired } from "@/services/qrService";
import { truncatePublicKey } from "@/lib/solana";
import { Eye, Flag, Package, Calendar, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

interface BatchCardProps {
  batch: Batch;
  onViewDetails?: () => void;
  onFlag?: () => void;
  showActions?: boolean;
}

export default function BatchCard({ batch, onViewDetails, onFlag, showActions = true }: BatchCardProps) {
  let status: { label: string; variant: "default" | "warning" | "destructive"; icon: any } = {
    label: "Valid",
    variant: "default",
    icon: Package
  };
  
  if (batch.status === 1) {
    status = { label: "Flagged", variant: "warning", icon: Flag };
  } else if (batch.status === 2 || isBatchExpired(batch.exp_date)) {
    status = { label: "Expired", variant: "destructive", icon: Calendar };
  }

  const StatusIcon = status.icon;

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-1">
          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
            {batch.product_name}
          </CardTitle>
          <Badge variant={status.variant} className="flex items-center gap-1.5 py-1 px-2">
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          {batch.batch_id}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Manufacturer</div>
            <div className="text-sm font-mono bg-muted/50 p-1.5 rounded-md">
              {truncatePublicKey(batch.manufacturer_wallet)}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Owner</div>
            <div className="text-sm font-mono bg-muted/50 p-1.5 rounded-md">
              {truncatePublicKey(batch.current_owner_wallet)}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Manufactured</div>
            <div className="text-sm flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground" />
              {formatDate(batch.mfg_date)}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Expires</div>
            <div className="text-sm flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(batch.exp_date)}
            </div>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-2 flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 hover:bg-primary hover:text-primary-foreground"
            asChild
          >
            <Link href={`/verify?batchPDA=${batch.batch_pda}`}>
              <Eye className="h-4 w-4" />
              Details
            </Link>
          </Button>
          
          {onFlag && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-amber-600 hover:bg-amber-600 hover:text-white border-amber-600"
              onClick={onFlag}
            >
              <Flag className="h-4 w-4" />
              Flag
            </Button>
          )}
          
          {batch.manufacturer_wallet !== batch.current_owner_wallet && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-600"
              asChild
            >
              <Link href={`/transfer?batchPDA=${batch.batch_pda}`}>
                <ArrowRightLeft className="h-4 w-4" />
                Transfer
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}