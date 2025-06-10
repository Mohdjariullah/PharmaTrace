"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, isBatchExpired } from "@/services/qrService";
import { truncatePublicKey, getExplorerUrl } from "@/lib/solana";
import {
  getBatchByPDA,
  getTransfersByBatch,
  getFlagsByBatch,
} from "@/services/supabaseService";
import { Batch, BatchTransfer, BatchFlag } from "@/types";
import {
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  Calendar,
  ExternalLink,
  ShieldAlert,
  ArrowRightLeft,
  Flag,
  Clock,
  QrCode,
  Download,
} from "lucide-react";
import Link from "next/link";
import QrGenerator from "@/components/QrGenerator";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const batchPDA = searchParams.get("batchPDA");
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [transfers, setTransfers] = useState<BatchTransfer[]>([]);
  const [flags, setFlags] = useState<BatchFlag[]>([]);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const fetchBatchData = async () => {
      if (!batchPDA) {
        toast({
          title: "Missing Batch PDA",
          description: "No batch PDA provided for verification.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch batch data
        const batchData = await getBatchByPDA(batchPDA);
        setBatch(batchData);
        
        if (batchData) {
          // Fetch related transfers
          const transfersData = await getTransfersByBatch(batchData.batch_id);
          setTransfers(transfersData || []);
          
          // Fetch related flags
          const flagsData = await getFlagsByBatch(batchData.batch_id);
          setFlags(flagsData || []);
          
          // Check if batch is expired but not marked as such
          if (batchData.status !== 2 && isBatchExpired(batchData.exp_date)) {
            // In a real app, you would update the status in the database
            setBatch({ ...batchData, status: 2 });
          }
        }
      } catch (error) {
        console.error("Error fetching batch data:", error);
        toast({
          title: "Verification Failed",
          description: "Unable to verify this batch. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBatchData();
  }, [batchPDA, toast]);

  if (!batchPDA) {
    return (
      <div className="space-y-8">
        <PageHeader
          heading="Verify Batch"
          text="Verify the authenticity of a pharmaceutical batch"
        />
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>No Batch to Verify</CardTitle>
            <CardDescription>
              No batch PDA was provided for verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please scan a QR code or provide a batch PDA to verify a batch.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/scan">Scan QR Code</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Verify Batch"
        text="Verify the authenticity of a pharmaceutical batch"
      />
      
      {loading ? (
        <VerificationSkeleton />
      ) : !batch ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Batch Not Found</CardTitle>
            <CardDescription>
              The batch with the provided PDA could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This batch may not be registered or the PDA may be invalid.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Batch PDA: <span className="font-mono">{batchPDA}</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/scan">Scan Another QR Code</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Batch Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{batch.product_name}</CardTitle>
                  <CardDescription>
                    Batch ID: <span className="font-mono">{batch.batch_id}</span>
                  </CardDescription>
                </div>
                
                <StatusBadge status={batch.status} expDate={batch.exp_date} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Manufacturer</div>
                    <div className="font-mono text-sm break-all">
                      {batch.manufacturer_wallet}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Current Owner</div>
                    <div className="font-mono text-sm break-all">
                      {batch.current_owner_wallet}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Manufacturing Date</div>
                    <div>{formatDate(batch.mfg_date)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Expiry Date</div>
                    <div>{formatDate(batch.exp_date)}</div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Verification Status */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Verification Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="rounded-full p-1.5 bg-primary/10">
                        {batch.status === 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Authenticity</div>
                        <div className="text-sm text-muted-foreground">
                          {batch.status === 0 
                            ? "This batch is authentic and has not been flagged"
                            : batch.status === 1
                              ? "This batch has been flagged as suspicious"
                              : "This batch has expired"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="rounded-full p-1.5 bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Expiration</div>
                        <div className="text-sm text-muted-foreground">
                          {isBatchExpired(batch.exp_date)
                            ? `Expired on ${formatDate(batch.exp_date)}`
                            : `Valid until ${formatDate(batch.exp_date)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Blockchain Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Blockchain Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Batch PDA</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{truncatePublicKey(batch.batch_pda)}</span>
                        <a 
                          href={getExplorerUrl(batch.batch_pda, 'address')} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Initial Transaction</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{truncatePublicKey(batch.init_tx_signature)}</span>
                        <a 
                          href={getExplorerUrl(batch.init_tx_signature)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Registration Date</span>
                      <span>{formatDate(batch.created_at || '')}</span>
                    </div>
                    
                    {batch.ipfs_hash && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">IPFS Hash</span>
                        <span className="font-mono text-sm">{truncatePublicKey(batch.ipfs_hash)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowQr(!showQr)}>
                <QrCode className="h-4 w-4 mr-2" />
                {showQr ? "Hide QR Code" : "Show QR Code"}
              </Button>
              
              <Button asChild>
                <Link href="/scan">
                  Scan Another
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* QR Code or Activity */}
          <div>
            {showQr ? (
              <QrGenerator batchPDA={batch.batch_pda} />
            ) : (
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle>Batch Activity</CardTitle>
                  <CardDescription>
                    History of transfers and flags
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="transfers">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="transfers" className="flex items-center gap-1.5">
                        <ArrowRightLeft className="h-4 w-4" />
                        Transfers
                      </TabsTrigger>
                      <TabsTrigger value="flags" className="flex items-center gap-1.5">
                        <Flag className="h-4 w-4" />
                        Flags
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="transfers" className="mt-0">
                      {transfers.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <div className="flex justify-center mb-2">
                            <ArrowRightLeft className="h-8 w-8 opacity-20" />
                          </div>
                          <p>No transfers recorded yet</p>
                          <p className="text-sm mt-1">
                            This batch has not changed ownership
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transfers.map((transfer) => (
                            <div 
                              key={transfer.id} 
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(transfer.transfer_date).toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="mt-2 text-sm">
                                <span className="font-mono">
                                  {truncatePublicKey(transfer.from_wallet)}
                                </span>
                                <span className="mx-2">→</span>
                                <span className="font-mono">
                                  {truncatePublicKey(transfer.to_wallet)}
                                </span>
                              </div>
                              
                              <div className="mt-2 text-xs">
                                <a
                                  href={getExplorerUrl(transfer.tx_signature)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View Transaction
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="flags" className="mt-0">
                      {flags.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <div className="flex justify-center mb-2">
                            <ShieldAlert className="h-8 w-8 opacity-20" />
                          </div>
                          <p>No flags recorded</p>
                          <p className="text-sm mt-1">
                            This batch has not been flagged
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {flags.map((flag) => (
                            <div 
                              key={flag.id} 
                              className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/10 dark:border-amber-900 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(flag.flagged_at).toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="mt-2 text-sm">
                                <div className="mb-1">
                                  <span className="text-muted-foreground">Flagged by: </span>
                                  <span className="font-mono">
                                    {truncatePublicKey(flag.flagged_by_wallet)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Reason: </span>
                                  <span>{flag.reason}</span>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-xs">
                                <a
                                  href={getExplorerUrl(flag.tx_signature)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View Transaction
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, expDate }: { status: number; expDate: string }) {
  let variant: "default" | "warning" | "destructive" | "outline" = "default";
  let label = "Valid";
  let icon = CheckCircle2;
  
  // Check if expired
  const isExpired = isBatchExpired(expDate);
  
  if (status === 1) {
    variant = "warning";
    label = "Flagged";
    icon = AlertTriangle;
  } else if (status === 2 || isExpired) {
    variant = "destructive";
    label = "Expired";
    icon = Calendar;
  }
  
  const Icon = icon;
  
  return (
    <Badge variant={variant} className="flex items-center gap-1 py-1 px-2">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}

function VerificationSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div>
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}