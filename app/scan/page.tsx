"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { QrCodePayload } from "@/types";
import QrScanner from "@/components/QrScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ScanLine, CheckCircle2, Zap, Shield, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [scannedPayload, setScannedPayload] = useState<QrCodePayload | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = (payload: QrCodePayload) => {
    setScanning(false);
    setScannedPayload(payload);
    setScanError(null);
  };

  const handleReset = () => {
    setScanning(true);
    setScannedPayload(null);
    setScanError(null);
  };

  const handleVerify = () => {
    if (!scannedPayload) return;
    router.push(`/verify?txSignature=${scannedPayload.txSignature}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          heading="Scan QR Code"
          text="Scan a pharmaceutical batch QR code to verify its authenticity on the blockchain"
        />

        <div className="max-w-4xl mx-auto mt-8">
          {scanning ? (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* QR Scanner */}
              <div className="lg:col-span-2">
                <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <QrCode className="h-6 w-6 text-primary" />
                      Scan Batch QR Code
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Position the QR code within the camera view or upload an image
                    </p>
                  </CardHeader>
                  <CardContent>
                    <QrScanner onScan={handleScan} />
                  </CardContent>
                </Card>
              </div>
              
              {/* Instructions */}
              <div className="space-y-6">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-blue-500" />
                      How to Scan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1.5 mt-0.5">
                          <ScanLine className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                            Camera Scanning
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Position the QR code within the camera view for automatic scanning.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                        <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-1.5 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">
                            Alternative Methods
                          </h4>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            If camera doesn't work, use the upload or manual entry tabs.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <div className="rounded-full bg-green-100 dark:bg-green-900 p-1.5 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100 text-sm mb-1">
                            Instant Verification
                          </h4>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            Once scanned, verify the batch's authenticity on the Solana blockchain.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-6 w-6 text-amber-500" />
                      Security Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Blockchain verification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Transaction authenticity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Tamper-proof records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Real-time validation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-green-800 dark:text-green-200">
                    QR Code Scanned Successfully!
                  </CardTitle>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    The QR code has been decoded. Review the details below and verify on blockchain.
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {scanError ? (
                    <div className="p-4 bg-destructive/10 rounded-lg text-destructive border border-destructive/20">
                      <div className="font-medium mb-1">Scan Error</div>
                      <div className="text-sm">{scanError}</div>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                          <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
                          <div className="font-mono text-sm break-all bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {scannedPayload?.txSignature}
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                          <div className="text-sm text-muted-foreground mb-1">Batch ID</div>
                          <div className="font-mono text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {scannedPayload?.batchId}
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                          <div className="text-sm text-muted-foreground mb-1">Medicine Name</div>
                          <div className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {scannedPayload?.medicineName}
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                          <div className="text-sm text-muted-foreground mb-1">Owner Address</div>
                          <div className="font-mono text-sm break-all bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {scannedPayload?.ownerAddress}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                        <div className="text-sm text-muted-foreground mb-1">Scan Timestamp</div>
                        <div className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          {scannedPayload?.timestamp ? new Date(scannedPayload.timestamp).toLocaleString() : 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Ready for Blockchain Verification
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Click "Verify on Blockchain" to check this transaction's authenticity on the Solana network.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" onClick={handleReset} className="flex-1">
                          Scan Another QR Code
                        </Button>
                        <Button onClick={handleVerify} className="flex-1">
                          <Zap className="h-4 w-4 mr-2" />
                          Verify on Blockchain
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}