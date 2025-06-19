"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Copy,
  Eye,
  Link as LinkIcon
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  if (!txSignature && !batchPDA) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Verify Batch
          </h1>
          <p className="text-xl text-muted-foreground">
            Verify the authenticity of pharmaceutical batches
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">No Transaction to Verify</CardTitle>
            <CardDescription className="text-lg">
              No transaction signature or batch PDA was provided for verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Please scan a QR code or provide a transaction signature to verify a batch.</p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href="/scan">
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Scan QR Code
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Batch Verification
        </h1>
        <p className="text-xl text-muted-foreground">
          Blockchain verification and authenticity check
        </p>
      </div>
      
      {loading ? (
        <VerificationSkeleton />
      ) : (
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Blockchain Verification Alert */}
          {verificationResult && (
            <Alert className={`border-2 shadow-lg ${
              verificationResult.isValid 
                ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10' 
                : 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10'
            }`}>
              <div className="flex items-center gap-3">
                {verificationResult.isValid ? (
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <AlertTitle className="text-xl font-bold">
                    {verificationResult.isValid ? '✅ Authentic Transaction' : '❌ INVALID TRANSACTION'}
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    {verificationResult.isValid ? (
                      <div className="space-y-3">
                        <div className="text-sm">This transaction has been verified on the Solana blockchain.</div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                          <div className="text-sm font-medium mb-3">Transaction Details:</div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between">
                              <span>From:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{truncatePublicKey(verificationResult.fromAccount || '')}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(verificationResult.fromAccount || '', 'From address')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>To:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{truncatePublicKey(verificationResult.toAccount || '')}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(verificationResult.toAccount || '', 'To address')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
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
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">Transaction Signature:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{truncatePublicKey(txSignature || '')}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(txSignature || '', 'Transaction signature')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {txSignature && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    asChild
                                  >
                                    <a href={getExplorerUrl(txSignature)} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </Button>
                                )}
                              </div>
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
                </div>
              </div>
            </Alert>
          )}

          {!verificationResult?.isValid ? (
            <Card className="max-w-2xl mx-auto border-red-500 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2 text-2xl">
                  <XCircle className="h-8 w-8" />
                  INVALID TRANSACTION
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400 text-lg">
                  This transaction was not found on the Solana blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-red-100 dark:bg-red-900/20 rounded-xl">
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 text-lg">⚠️ WARNING - POTENTIALLY FAKE</h3>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                      <li>• This transaction is not registered on the blockchain</li>
                      <li>• The QR code may be counterfeit or tampered with</li>
                      <li>• Do not trust this product without proper verification</li>
                      <li>• Report suspicious products to authorities</li>
                    </ul>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div>
                      <strong>Transaction Signature:</strong> 
                      <span className="font-mono break-all ml-2">{txSignature || 'N/A'}</span>
                    </div>
                    <div>
                      <strong>Verification Time:</strong> {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button asChild variant="outline" size="lg">
                  <Link href="/scan">
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    Scan Another QR Code
                  </Link>
                </Button>
                {txSignature && (
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <a href={getExplorerUrl(txSignature)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Check on Explorer
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Batch Information Card */}
              <Card className="lg:col-span-2 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        {batch?.product_name || qrCode?.medicine_name || 'Unknown Product'}
                        <Zap className="h-6 w-6" />
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-lg">
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
                
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {batch ? (
                        <>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Manufacturer</div>
                            <div className="font-mono text-sm break-all bg-muted/50 p-3 rounded-lg">
                              {batch.manufacturer_wallet}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Current Owner</div>
                            <div className="font-mono text-sm break-all bg-muted/50 p-3 rounded-lg">
                              {batch.current_owner_wallet}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Manufacturing Date</div>
                            <div className="bg-muted/50 p-3 rounded-lg font-medium">{formatDate(batch.mfg_date)}</div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Expiry Date</div>
                            <div className="bg-muted/50 p-3 rounded-lg font-medium">{formatDate(batch.exp_date)}</div>
                          </div>
                        </>
                      ) : qrCode ? (
                        <>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Medicine Name</div>
                            <div className="bg-muted/50 p-3 rounded-lg font-medium">{qrCode.medicine_name}</div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Owner Address</div>
                            <div className="font-mono text-sm break-all bg-muted/50 p-3 rounded-lg">
                              {qrCode.owner_address}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Batch ID</div>
                            <div className="font-mono bg-muted/50 p-3 rounded-lg">{qrCode.batch_id}</div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-semibold">Registration Date</div>
                            <div className="bg-muted/50 p-3 rounded-lg font-medium">{formatDate(qrCode.created_at || '')}</div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 text-center text-muted-foreground py-12">
                          <div className="flex justify-center mb-4">
                            <PackageCheck className="h-12 w-12 opacity-20" />
                          </div>
                          <p className="text-lg">Transaction verified but no batch details found in database.</p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Verification Status */}
                    <div>
                      <h3 className="text-xl font-semibold mb-6">Verification Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-green-800 dark:text-green-200">Blockchain Verified</div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              This transaction has been verified on the Solana blockchain
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            {batch?.status === 1 ? (
                              <AlertTriangle className="h-6 w-6 text-amber-500" />
                            ) : (
                              <Calendar className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-blue-800 dark:text-blue-200">Status</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
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
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between p-8 bg-gray-50 dark:bg-gray-800/50">
                  <Button variant="outline" onClick={() => setShowQr(!showQr)} size="lg">
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    {showQr ? "Hide QR Code" : "Show QR Code"}
                  </Button>
                  
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/scan">
                      <QrCodeIcon className="h-5 w-5 mr-2" />
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
                  <Card className="h-full border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg pb-4">
                      <CardTitle>Batch Activity</CardTitle>
                      <CardDescription className="text-green-100">
                        History of transfers and flags
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <Tabs defaultValue="transfers">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="transfers" className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4" />
                            Transfers
                          </TabsTrigger>
                          <TabsTrigger value="flags" className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Flags
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="transfers" className="mt-0">
                          {transfers.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                              <div className="flex justify-center mb-4">
                                <ArrowRightLeft className="h-12 w-12 opacity-20" />
                              </div>
                              <p className="text-lg font-medium">No transfers recorded yet</p>
                              <p className="text-sm mt-2">
                                This batch has not changed ownership
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {transfers.map((transfer) => (
                                <div 
                                  key={transfer.id} 
                                  className="p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(transfer.transfer_date).toLocaleString()}
                                    </span>
                                  </div>
                                  
                                  <div className="text-sm mb-3">
                                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                      {truncatePublicKey(transfer.from_wallet)}
                                    </span>
                                    <span className="mx-3">→</span>
                                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                      {truncatePublicKey(transfer.to_wallet)}
                                    </span>
                                  </div>
                                  
                                  <div className="text-xs">
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
                            <div className="py-12 text-center text-muted-foreground">
                              <div className="flex justify-center mb-4">
                                <ShieldAlert className="h-12 w-12 opacity-20" />
                              </div>
                              <p className="text-lg font-medium">No flags recorded</p>
                              <p className="text-sm mt-2">
                                This batch has not been flagged
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {flags.map((flag) => (
                                <div 
                                  key={flag.id} 
                                  className="p-4 border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-900 rounded-xl"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(flag.flagged_at).toLocaleString()}
                                    </span>
                                  </div>
                                  
                                  <div className="text-sm mb-3">
                                    <div className="mb-2">
                                      <span className="text-muted-foreground">Flagged by: </span>
                                      <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                        {truncatePublicKey(flag.flagged_by_wallet)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Reason: </span>
                                      <span className="font-medium">{flag.reason}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs">
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
    <Badge variant={variant} className="flex items-center gap-2 py-2 px-4 text-sm">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Badge>
  );
}

function VerificationSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-8 w-60 mb-3" />
                <Skeleton className="h-6 w-80" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between p-8">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </CardFooter>
        </Card>
        
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <Skeleton className="h-8 w-32 mb-3" />
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}