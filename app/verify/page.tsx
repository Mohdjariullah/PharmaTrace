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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { formatDate, isBatchExpired } from "@/services/qrService";
import { truncatePublicKey, getExplorerUrl } from "@/lib/solana";
import {
  getBatchByTxSignature,
  getTransfersByBatch,
  getFlagsByBatch,
  getQrCodeByTxSignature,
  getBatchByPDA,
} from "@/services/supabaseService";
import { verifyBatchTransaction } from "@/services/blockchainService";
import { Batch, BatchTransfer, BatchFlag, QrCode } from "@/types";
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
  QrCode as QrCodeIcon,
  Shield,
  AlertCircle,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import QrGenerator from "@/components/QrGenerator";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const txSignature = searchParams.get("txSignature");
  const batchPDA = searchParams.get("batchPDA");
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [qrCode, setQrCode] = useState<QrCode | null>(null);
  const [transfers, setTransfers] = useState<BatchTransfer[]>([]);
  const [flags, setFlags] = useState<BatchFlag[]>([]);
  const [showQr, setShowQr] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [blockchainVerified, setBlockchainVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchBatchData = async () => {
      // Check if we have either txSignature or batchPDA
      if (!txSignature && !batchPDA) {
        toast({
          title: "Missing Parameters",
          description: "No transaction signature or batch PDA provided for verification.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        let batchData: Batch | null = null;
        let qrCodeData: QrCode | null = null;
        let verificationTxSignature = txSignature;
        
        // If we have a batchPDA, fetch batch by PDA first
        if (batchPDA) {
          console.log('🔍 Fetching batch by PDA...');
          batchData = await getBatchByPDA(batchPDA);
          if (batchData) {
            verificationTxSignature = batchData.init_tx_signature;
            // Also try to get QR code data
            qrCodeData = await getQrCodeByTxSignature(batchData.init_tx_signature);
          }
        }
        
        // If we have a txSignature (either provided or from batch), verify on blockchain
        if (verificationTxSignature) {
          console.log('🔍 Verifying transaction on blockchain...');
          const verification = await verifyBatchTransaction(verificationTxSignature);
          setVerificationResult(verification);
          setBlockchainVerified(verification.isValid);
          
          if (!verification.isValid) {
            toast({
              title: "⚠️ INVALID TRANSACTION",
              description: verification.error || "This transaction was not found on the blockchain.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          
          // If we don't have batch data yet, try to fetch by transaction signature
          if (!batchData) {
            const [fetchedBatch, fetchedQrCode] = await Promise.all([
              getBatchByTxSignature(verificationTxSignature),
              getQrCodeByTxSignature(verificationTxSignature)
            ]);
            batchData = fetchedBatch;
            qrCodeData = fetchedQrCode;
          }
        }
        
        if (batchData) {
          setBatch(batchData);
          setQrCode(qrCodeData);
          
          // Fetch related transfers and flags
          const [transfersData, flagsData] = await Promise.all([
            getTransfersByBatch(batchData.batch_id),
            getFlagsByBatch(batchData.batch_id),
          ]);
          
          setTransfers(transfersData || []);
          setFlags(flagsData || []);
          
          // Check if batch is expired but not marked as such
          if (batchData.status !== 2 && isBatchExpired(batchData.exp_date)) {
            setBatch({ ...batchData, status: 2 });
          }
        } else if (qrCodeData) {
          // We have QR code data but no batch data
          setQrCode(qrCodeData);
        }
        
      } catch (error) {
        console.error("Error fetching batch data:", error);
        toast({
          title: "Verification Failed",
          description: "Unable to verify this transaction. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBatchData();
  }, [txSignature, batchPDA, toast]);

  if (!txSignature && !batchPDA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            heading="Verify Batch"
            text="Verify the authenticity of a pharmaceutical batch"
          />
          
          <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
              <CardTitle>No Transaction to Verify</CardTitle>
              <CardDescription>
                No transaction signature or batch PDA was provided for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please scan a QR code or provide a transaction signature to verify a batch.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/scan">Scan QR Code</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          heading="Verify Batch"
          text="Blockchain verification and authenticity check"
        />
        
        {loading ? (
          <VerificationSkeleton />
        ) : (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Blockchain Verification Alert */}
            {verificationResult && (
              <Alert className={`border-2 ${
                verificationResult.isValid 
                  ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                  : 'border-red-500 bg-red-50 dark:bg-red-950'
              }`}>
                <div className="flex items-center gap-2">
                  {verificationResult.isValid ? (
                    <Shield className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <AlertTitle className="text-lg font-semibold">
                    {verificationResult.isValid ? 'Authentic Transaction ✅' : 'INVALID TRANSACTION ❌'}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {verificationResult.isValid ? (
                    <div className="space-y-2">
                      <div className="text-sm">This transaction has been verified on the Solana blockchain.</div>
                      <div className="mt-4 p-3 bg-background/50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Transaction Details:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>From:</span>
                            <span className="font-mono">{truncatePublicKey(verificationResult.fromAccount || '')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>To:</span>
                            <span className="font-mono">{truncatePublicKey(verificationResult.toAccount || '')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span>{((verificationResult.amount || 0) / 1000000000).toFixed(6)} SOL</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span>{verificationResult.timestamp ? new Date(verificationResult.timestamp * 1000).toLocaleString() : 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">
                        {verificationResult.error || 'Transaction not found on blockchain'}
                      </div>
                      <div className="text-sm">
                        This may be a fake QR code or an invalid transaction signature.
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {!verificationResult?.isValid ? (
              <Card className="max-w-2xl mx-auto border-red-500 bg-red-50 dark:bg-red-950">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                    <XCircle className="h-6 w-6" />
                    INVALID TRANSACTION
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-400">
                    This transaction was not found on the Solana blockchain.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                      <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ WARNING - POTENTIALLY FAKE</h3>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• This transaction is not registered on the blockchain</li>
                        <li>• The QR code may be counterfeit or tampered with</li>
                        <li>• Do not trust this product without proper verification</li>
                        <li>• Report suspicious products to authorities</li>
                      </ul>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <strong>Transaction Signature:</strong> <span className="font-mono break-all">{txSignature || 'N/A'}</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <strong>Verification Time:</strong> {new Date().toLocaleString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/scan">Scan Another QR Code</Link>
                  </Button>
                  {txSignature && (
                    <Button asChild>
                      <a href={getExplorerUrl(txSignature)} target="_blank" rel="noopener noreferrer">
                        Check on Explorer
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Batch Information Card */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {batch?.product_name || qrCode?.medicine_name || 'Unknown Product'}
                          <Zap className="h-5 w-5 text-blue-500" />
                        </CardTitle>
                        <CardDescription>
                          {batch ? (
                            <>Batch ID: <span className="font-mono">{batch.batch_id}</span></>
                          ) : qrCode ? (
                            <>Batch ID: <span className="font-mono">{qrCode.batch_id}</span></>
                          ) : (
                            <>Transaction: <span className="font-mono">{truncatePublicKey(txSignature || '')}</span></>
                          )}
                        </CardDescription>
                      </div>
                      
                      {batch && <StatusBadge status={batch.status} expDate={batch.exp_date} />}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {batch ? (
                          <>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Manufacturer</div>
                              <div className="font-mono text-sm break-all bg-muted/50 p-2 rounded">
                                {batch.manufacturer_wallet}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Current Owner</div>
                              <div className="font-mono text-sm break-all bg-muted/50 p-2 rounded">
                                {batch.current_owner_wallet}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Manufacturing Date</div>
                              <div className="bg-muted/50 p-2 rounded">{formatDate(batch.mfg_date)}</div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Expiry Date</div>
                              <div className="bg-muted/50 p-2 rounded">{formatDate(batch.exp_date)}</div>
                            </div>
                          </>
                        ) : qrCode ? (
                          <>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Medicine Name</div>
                              <div className="bg-muted/50 p-2 rounded">{qrCode.medicine_name}</div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Owner Address</div>
                              <div className="font-mono text-sm break-all bg-muted/50 p-2 rounded">
                                {qrCode.owner_address}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Batch ID</div>
                              <div className="font-mono bg-muted/50 p-2 rounded">{qrCode.batch_id}</div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Registration Date</div>
                              <div className="bg-muted/50 p-2 rounded">{formatDate(qrCode.created_at || '')}</div>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-2 text-center text-muted-foreground py-8">
                            <div className="flex justify-center mb-2">
                              <PackageCheck className="h-8 w-8 opacity-20" />
                            </div>
                            <p>Transaction verified but no batch details found in database.</p>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      {/* Verification Status */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Verification Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="rounded-full p-1.5 bg-primary/10">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Blockchain Verified</div>
                              <div className="text-sm text-muted-foreground">
                                This transaction has been verified on the Solana blockchain
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="rounded-full p-1.5 bg-primary/10">
                              {batch?.status === 1 ? (
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                              ) : (
                                <Calendar className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">Status</div>
                              <div className="text-sm text-muted-foreground">
                                {batch ? (
                                  batch.status === 1 ? "Flagged as suspicious" :
                                  batch.status === 2 ? "Expired" :
                                  isBatchExpired(batch.exp_date) ? "Expired" : "Valid"
                                ) : (
                                  "Transaction verified"
                                )}
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
                            <span className="text-sm text-muted-foreground">Transaction Signature</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{truncatePublicKey(txSignature || '')}</span>
                              {txSignature && (
                                <a 
                                  href={getExplorerUrl(txSignature)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                          
                          {verificationResult?.fromAccount && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">From Account</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{truncatePublicKey(verificationResult.fromAccount)}</span>
                                <a 
                                  href={getExplorerUrl(verificationResult.fromAccount, 'address')} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {verificationResult?.toAccount && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">To Account (PharmaTrace)</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{truncatePublicKey(verificationResult.toAccount)}</span>
                                <a 
                                  href={getExplorerUrl(verificationResult.toAccount, 'address')} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {verificationResult?.timestamp && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Transaction Time</span>
                              <span>{new Date(verificationResult.timestamp * 1000).toLocaleString()}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Verification Status</span>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 text-sm">Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowQr(!showQr)}>
                      <QrCodeIcon className="h-4 w-4 mr-2" />
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
                  {showQr && qrCode ? (
                    <QrGenerator 
                      txSignature={qrCode.tx_signature}
                      batchId={qrCode.batch_id}
                      medicineName={qrCode.medicine_name}
                      ownerAddress={qrCode.owner_address}
                    />
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
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, expDate }: { status: number; expDate: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let label = "Valid";
  let icon = CheckCircle2;
  
  // Check if expired
  const isExpired = isBatchExpired(expDate);
  
  if (status === 1) {
    variant = "secondary";
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <Skeleton className="h-32 w-full" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
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
    </div>
  );
}