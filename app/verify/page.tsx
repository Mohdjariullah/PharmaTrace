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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  getCurrentQrCodeForBatch,
  getBatchByPDA,
  markQrCodeAsConsumed,
} from "@/services/supabaseService";
import { verifyBatchTransaction } from "@/services/blockchainService";
import { crossVerifyBatch } from "@/services/blockchainVerificationService";
import { logBatchVerification } from "@/services/auditService";
import { useWalletContext } from "@/components/WalletProvider";
import { Batch, BatchTransfer, BatchFlag, QrCode } from "@/types";
import BatchStatusBadge from "@/components/BatchStatusBadge";
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
  XCircle,
  Copy,
  Award,
  History,
  RefreshCcw
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import QrGenerator from "@/components/QrGenerator";
import AuditTrail from "@/components/AuditTrail";

// The NFT cert tab pulls in the Metaplex/spl-token stack; only load it
// when a viewer actually opens that tab.
const NFTCertificate = dynamic(() => import("@/components/NFTCertificate"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const txSignature = searchParams.get("txSignature");
  const batchPDA = searchParams.get("batchPDA");
  // Only a visit that arrived via the actual QR scan flow represents a
  // real-world scan; internal navigation (post-registration confirmation,
  // dashboard "Details" links, regulator/transfer views) must not consume
  // the QR code or it would falsely flag the genuine first scan as reused.
  const isScanVisit = searchParams.get("source") === "scan";
  const { toast } = useToast();
  const { publicKey } = useWalletContext();

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [qrCode, setQrCode] = useState<QrCode | null>(null);
  const [transfers, setTransfers] = useState<BatchTransfer[]>([]);
  const [flags, setFlags] = useState<BatchFlag[]>([]);
  const [showQr, setShowQr] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [blockchainVerified, setBlockchainVerified] = useState<boolean | null>(null);
  const [isConsumed, setIsConsumed] = useState<boolean>(false);
  const [isOutdatedQr, setIsOutdatedQr] = useState<boolean>(false);
  const [crossVerifyDiscrepancies, setCrossVerifyDiscrepancies] = useState<string[]>([]);

  useEffect(() => {
    const fetchBatchData = async () => {
      if (!txSignature && !batchPDA) {
        toast({
          title: "Missing parameters",
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
        let isValidOnChain = false;

        if (batchPDA) {
          batchData = await getBatchByPDA(batchPDA);
          if (batchData) {
            verificationTxSignature = batchData.init_tx_signature;
            // Internal links (dashboard, regulator table) always want the
            // batch's current QR, not necessarily the one from the original
            // registration - it may have been superseded by a transfer.
            qrCodeData = await getCurrentQrCodeForBatch(batchData.batch_id);
          }
        }

        if (verificationTxSignature) {
          const verification = await verifyBatchTransaction(verificationTxSignature);
          setVerificationResult(verification);
          setBlockchainVerified(verification.isValid);
          isValidOnChain = verification.isValid;

          if (!verification.isValid) {
            toast({
              title: "Invalid transaction",
              description: verification.error || "This transaction was not found on the blockchain.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          if (!batchData) {
            const [fetchedBatch, fetchedQrCode] = await Promise.all([
              getBatchByTxSignature(verificationTxSignature),
              getQrCodeByTxSignature(verificationTxSignature)
            ]);
            batchData = fetchedBatch;
            qrCodeData = fetchedQrCode;
          }

          if (qrCodeData) {
            // is_current is a new column - existing rows created before
            // this feature default to true, so `false` unambiguously means
            // "a transfer has since issued a newer QR for this batch."
            if (qrCodeData.is_current === false) {
              setIsOutdatedQr(true);
            } else if (qrCodeData.is_consumed) {
              setIsConsumed(true);
            } else if (isScanVisit) {
              await markQrCodeAsConsumed(qrCodeData.tx_signature);
            }
          }
        }

        if (batchData) {
          setBatch(batchData);
          setQrCode(qrCodeData);

          const [transfersData, flagsData] = await Promise.all([
            getTransfersByBatch(batchData.batch_id),
            getFlagsByBatch(batchData.batch_id),
          ]);

          setTransfers(transfersData || []);
          setFlags(flagsData || []);

          if (batchData.status !== 2 && isBatchExpired(batchData.exp_date)) {
            setBatch({ ...batchData, status: 2 });
          }

          // Cross-check the Supabase record against the real on-chain
          // Batch account so a database row that was never actually
          // written on-chain (or was tampered with) doesn't get trusted
          // blindly.
          try {
            const crossVerify = await crossVerifyBatch(batchData.batch_pda, batchData);
            setCrossVerifyDiscrepancies(crossVerify.isConsistent ? [] : crossVerify.discrepancies);
          } catch (crossVerifyError) {
            console.error("Cross-verification error:", crossVerifyError);
          }

          logBatchVerification(
            batchData.batch_id,
            publicKey || "anonymous",
            isValidOnChain
          ).catch((auditError) => console.error("Failed to log verification event:", auditError));
        } else if (qrCodeData) {
          setQrCode(qrCodeData);
        }

      } catch (error) {
        console.error("Error fetching batch data:", error);
        toast({
          title: "Verification failed",
          description: "Unable to verify this transaction. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
  }, [txSignature, batchPDA, isScanVisit, toast]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard.`,
    });
  };

  if (!txSignature && !batchPDA) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verify batch</h1>
          <p className="mt-1 text-muted-foreground">
            Verify the authenticity of a pharmaceutical batch on-chain.
          </p>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
              <Shield className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <CardTitle className="text-xl">No transaction to verify</CardTitle>
            <CardDescription>
              No transaction signature or batch PDA was provided for verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              Please scan a QR code or provide a transaction signature to verify a batch.
            </p>
            <Button asChild>
              <Link href="/scan">
                <QrCodeIcon className="mr-2 h-4 w-4" />
                Scan QR code
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Batch verification</h1>
        <p className="mt-1 text-muted-foreground">
          On-chain verification and authenticity check.
        </p>
      </div>

      {loading ? (
        <VerificationSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Outdated QR alert - batch has changed hands since this code was issued */}
          {isOutdatedQr && (
            <Alert>
              <div className="flex items-center gap-3">
                <RefreshCcw className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1">
                  <AlertTitle>This QR code has been superseded</AlertTitle>
                  <AlertDescription className="mt-1">
                    This batch has changed ownership since this code was issued, and a newer QR
                    code now represents it. The batch itself is genuine, but this specific code is
                    no longer the one that should be in circulation - ask the current holder for
                    the current QR code.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Consumer warning alert */}
          {isConsumed && (
            <Alert variant="destructive">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <AlertTitle>Warning: product already verified</AlertTitle>
                  <AlertDescription className="mt-1">
                    This QR code has already been scanned and verified previously. This could
                    signify that the product is a counterfeit replica using a duplicated QR code,
                    or someone is trying to resell a used product. Do not consume or trust this product.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* On-chain / database consistency warning */}
          {crossVerifyDiscrepancies.length > 0 && (
            <Alert>
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1">
                  <AlertTitle>Database / blockchain mismatch</AlertTitle>
                  <AlertDescription className="mt-1">
                    <p className="mb-2">This batch's stored record doesn't match its on-chain data:</p>
                    <ul className="list-inside list-disc space-y-1">
                      {crossVerifyDiscrepancies.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Blockchain verification alert */}
          {verificationResult && (
            <Alert variant={verificationResult.isValid ? "default" : "destructive"}>
              <div className="flex items-center gap-3">
                {verificationResult.isValid ? (
                  <Shield className="h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0" />
                )}
                <div className="flex-1">
                  <AlertTitle>
                    {verificationResult.isValid ? "Authentic transaction" : "Invalid transaction"}
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    {verificationResult.isValid ? (
                      <div className="space-y-3">
                        <div className="text-sm">This transaction has been verified on the Solana blockchain.</div>
                        <div className="rounded-lg border border-border bg-secondary/40 p-4">
                          <div className="mb-3 text-sm font-medium text-foreground">Transaction details</div>
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
                          <div className="mt-3 border-t border-border pt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">Transaction signature:</span>
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
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
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
                        <div className="text-sm font-medium">
                          {verificationResult.error || 'Transaction not found on blockchain'}
                        </div>
                        <div className="text-sm">This may be a fake QR code or an invalid transaction signature.</div>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {!verificationResult?.isValid ? (
            <Card className="mx-auto max-w-2xl border-destructive/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                  <XCircle className="h-5 w-5" />
                  Invalid transaction
                </CardTitle>
                <CardDescription>This transaction was not found on the Solana blockchain.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
                    <h3 className="mb-3 font-semibold text-foreground">Potentially fake</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• This transaction is not registered on the blockchain</li>
                      <li>• The QR code may be counterfeit or tampered with</li>
                      <li>• Do not trust this product without proper verification</li>
                      <li>• Report suspicious products to authorities</li>
                    </ul>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      <strong className="text-foreground">Transaction signature:</strong>
                      <span className="ml-2 break-all font-mono">{txSignature || 'N/A'}</span>
                    </div>
                    <div>
                      <strong className="text-foreground">Verification time:</strong> {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href="/scan">
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    Scan another QR code
                  </Link>
                </Button>
                {txSignature && (
                  <Button asChild>
                    <a href={getExplorerUrl(txSignature)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Check on explorer
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {batch?.product_name || qrCode?.medicine_name || 'Unknown product'}
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

                    {batch && <BatchStatusBadge status={batch.status} expDate={batch.exp_date} />}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {batch ? (
                        <>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Manufacturer</div>
                            <div className="break-all rounded-lg bg-secondary/40 p-3 font-mono text-sm">
                              {batch.manufacturer_wallet}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Current owner</div>
                            <div className="break-all rounded-lg bg-secondary/40 p-3 font-mono text-sm">
                              {batch.current_owner_wallet}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Manufacturing date</div>
                            <div className="rounded-lg bg-secondary/40 p-3 font-medium">{formatDate(batch.mfg_date)}</div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Expiry date</div>
                            <div className="rounded-lg bg-secondary/40 p-3 font-medium">{formatDate(batch.exp_date)}</div>
                          </div>
                        </>
                      ) : qrCode ? (
                        <>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Medicine name</div>
                            <div className="rounded-lg bg-secondary/40 p-3 font-medium">{qrCode.medicine_name}</div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Owner address</div>
                            <div className="break-all rounded-lg bg-secondary/40 p-3 font-mono text-sm">
                              {qrCode.owner_address}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Batch ID</div>
                            <div className="rounded-lg bg-secondary/40 p-3 font-mono">{qrCode.batch_id}</div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Registration date</div>
                            <div className="rounded-lg bg-secondary/40 p-3 font-medium">{formatDate(qrCode.created_at || '')}</div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 py-12 text-center text-muted-foreground">
                          <div className="mb-4 flex justify-center">
                            <PackageCheck className="h-10 w-10 opacity-20" />
                          </div>
                          <p>Transaction verified but no batch details found in database.</p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-4 text-base font-semibold text-foreground">Verification status</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60">
                            <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Blockchain verified</div>
                            <div className="text-sm text-muted-foreground">
                              This transaction has been verified on the Solana blockchain
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60">
                            {batch?.status === 1 ? (
                              <AlertTriangle className="h-4 w-4 text-primary" strokeWidth={1.75} />
                            ) : (
                              <Calendar className="h-4 w-4 text-primary" strokeWidth={1.75} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Status</div>
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
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-border">
                  <Button variant="outline" onClick={() => setShowQr(!showQr)}>
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    {showQr ? "Hide QR code" : "Show QR code"}
                  </Button>

                  <Button asChild>
                    <Link href="/scan">
                      <QrCodeIcon className="mr-2 h-4 w-4" />
                      Scan another
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

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
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Batch activity</CardTitle>
                      <CardDescription>History of transfers and flags</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Tabs defaultValue="transfers">
                        <TabsList className="mb-6 grid w-full grid-cols-4">
                          <TabsTrigger value="transfers" className="flex items-center gap-1.5">
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            Transfers
                          </TabsTrigger>
                          <TabsTrigger value="flags" className="flex items-center gap-1.5">
                            <Flag className="h-3.5 w-3.5" />
                            Flags
                          </TabsTrigger>
                          <TabsTrigger value="certificate" className="flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5" />
                            Certificate
                          </TabsTrigger>
                          <TabsTrigger value="audit" className="flex items-center gap-1.5">
                            <History className="h-3.5 w-3.5" />
                            Audit
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="transfers" className="mt-0">
                          {transfers.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                              <div className="mb-4 flex justify-center">
                                <ArrowRightLeft className="h-10 w-10 opacity-20" />
                              </div>
                              <p className="font-medium">No transfers recorded yet</p>
                              <p className="mt-1 text-sm">This batch has not changed ownership</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {transfers.map((transfer) => (
                                <div key={transfer.id} className="rounded-lg border border-border p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(transfer.transfer_date).toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="mb-3 text-sm">
                                    <span className="rounded bg-secondary/60 px-2 py-1 font-mono">
                                      {truncatePublicKey(transfer.from_wallet)}
                                    </span>
                                    <span className="mx-3">→</span>
                                    <span className="rounded bg-secondary/60 px-2 py-1 font-mono">
                                      {truncatePublicKey(transfer.to_wallet)}
                                    </span>
                                  </div>

                                  <a
                                    href={getExplorerUrl(transfer.tx_signature)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View transaction
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="flags" className="mt-0">
                          {flags.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                              <div className="mb-4 flex justify-center">
                                <ShieldAlert className="h-10 w-10 opacity-20" />
                              </div>
                              <p className="font-medium">No flags recorded</p>
                              <p className="mt-1 text-sm">This batch has not been flagged</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {flags.map((flag) => (
                                <div key={flag.id} className="rounded-lg border border-border p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(flag.flagged_at).toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="mb-3 text-sm">
                                    <div className="mb-2">
                                      <span className="text-muted-foreground">Flagged by: </span>
                                      <span className="rounded bg-secondary/60 px-2 py-1 font-mono">
                                        {truncatePublicKey(flag.flagged_by_wallet)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Reason: </span>
                                      <span className="font-medium">{flag.reason}</span>
                                    </div>
                                  </div>

                                  <a
                                    href={getExplorerUrl(flag.tx_signature)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View transaction
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="certificate" className="mt-0">
                          {batch && <NFTCertificate batch={batch} />}
                        </TabsContent>

                        <TabsContent value="audit" className="mt-0">
                          {batch && <AuditTrail batchId={batch.batch_id} />}
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

function VerificationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="mb-3 h-6 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <Skeleton className="mb-4 h-5 w-40" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-5 w-28" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
