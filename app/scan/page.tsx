"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { QrCodePayload } from "@/types";
import QrScanner from "@/components/QrScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ScanLine, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-8">
      <PageHeader
        heading="Scan QR Code"
        text="Scan a pharmaceutical batch QR code to verify its authenticity"
      />

      <div className="max-w-md mx-auto">
        {scanning ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Scan Batch QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <QrScanner onScan={handleScan} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                    <ScanLine className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    Position the QR code within the camera view for scanning.
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    If the camera doesn't work, you can upload an image or manually enter the QR data.
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    Once scanned, you'll be able to verify the batch's authenticity and view its transaction history.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">QR Code Scanned</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {scanError ? (
                <div className="p-4 bg-destructive/10 rounded-lg text-destructive">
                  <div className="font-medium mb-1">Error</div>
                  <div className="text-sm">{scanError}</div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-primary/10">
                      <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
                      <div className="font-mono text-sm break-all">
                        {scannedPayload?.txSignature}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground mb-1">Batch ID</div>
                      <div className="font-mono text-sm">
                        {scannedPayload?.batchId}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground mb-1">Medicine Name</div>
                      <div className="text-sm">
                        {scannedPayload?.medicineName}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground mb-1">Owner Address</div>
                      <div className="font-mono text-sm break-all">
                        {scannedPayload?.ownerAddress}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground mb-1">Scan Timestamp</div>
                      <div className="text-sm">
                        {scannedPayload?.timestamp ? new Date(scannedPayload.timestamp).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      Scan Another
                    </Button>
                    <Button onClick={handleVerify}>
                      Verify on Blockchain
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}