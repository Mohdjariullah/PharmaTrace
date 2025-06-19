"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { QrCodePayload } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ScanLine, CheckCircle2, Zap, Shield, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const QrScanner = dynamic(() => import("@/components/QrScanner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading camera...</p>
      </div>
    </div>
  )
});

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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Scan QR Code
        </h1>
        <p className="text-xl text-muted-foreground">
          Scan pharmaceutical batch QR codes to verify authenticity on the blockchain
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {scanning ? (
          <div className="grid gap-8 lg:grid-cols-4">
            {/* QR Scanner */}
            <div className="lg:col-span-3">
              <QrScanner onScan={handleScan} />
            </div>
            
            {/* Instructions */}
            <div className="space-y-6">
              <Card className="sticky top-8 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    How to Scan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <ScanLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
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

              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Blockchain verification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Transaction authenticity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Tamper-proof records</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Real-time validation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-green-800 dark:text-green-200">
                  QR Code Scanned Successfully!
                </CardTitle>
                <p className="text-green-700 dark:text-green-300 text-lg mt-2">
                  The QR code has been decoded. Review the details below and verify on blockchain.
                </p>
              </CardHeader>
              
              <CardContent className="space-y-8 p-8">
                {scanError ? (
                  <div className="p-6 bg-destructive/10 rounded-xl text-destructive border border-destructive/20">
                    <div className="font-medium mb-2 text-lg">Scan Error</div>
                    <div className="text-sm">{scanError}</div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2 font-semibold">Transaction Hash</div>
                        <div className="font-mono text-sm break-all bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          {scannedPayload?.txSignature}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2 font-semibold">Batch ID</div>
                        <div className="font-mono text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          {scannedPayload?.batchId}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2 font-semibold">Medicine Name</div>
                        <div className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg font-medium">
                          {scannedPayload?.medicineName}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
                        <div className="text-sm text-muted-foreground mb-2 font-semibold">Owner Address</div>
                        <div className="font-mono text-sm break-all bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          {scannedPayload?.ownerAddress}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-2 font-semibold">Scan Timestamp</div>
                      <div className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg font-medium">
                        {scannedPayload?.timestamp ? new Date(scannedPayload.timestamp).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-lg">
                            Ready for Blockchain Verification
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Click "Verify on Blockchain" to check this transaction's authenticity on the Solana network.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="outline" onClick={handleReset} className="flex-1 h-12">
                        <QrCode className="h-5 w-5 mr-2" />
                        Scan Another QR Code
                      </Button>
                      <Button onClick={handleVerify} className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600">
                        <Sparkles className="h-5 w-5 mr-2" />
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
  );
}