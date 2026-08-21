"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { QrCodePayload } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ScanLine, CheckCircle2, Shield, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const QrScanner = dynamic(() => import("@/components/QrScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-lg border border-border bg-secondary/40">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-muted-foreground">Loading camera...</p>
      </div>
    </div>
  )
});

const HOW_TO_SCAN = [
  { icon: ScanLine, title: "Camera scanning", description: "Position the QR code within the camera view for automatic scanning." },
  { icon: AlertCircle, title: "Alternative methods", description: "If the camera doesn't work, use the upload or manual entry tabs." },
  { icon: CheckCircle2, title: "Instant verification", description: "Once scanned, verify the batch's authenticity on the Solana blockchain." },
];

const SECURITY_FEATURES = [
  "Blockchain verification",
  "Transaction authenticity",
  "Tamper-proof records",
  "Real-time validation",
];

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
    router.push(`/verify?txSignature=${scannedPayload.txSignature}&source=scan`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Scan QR code</h1>
        <p className="mt-1 text-muted-foreground">
          Scan a pharmaceutical batch QR code to verify its authenticity on-chain.
        </p>
      </div>

      {scanning ? (
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <QrScanner onScan={handleScan} />
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  How to scan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {HOW_TO_SCAN.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60">
                      <item.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Security features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-sm">
                  {SECURITY_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
                <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <CardTitle className="text-xl">QR code scanned successfully</CardTitle>
              <p className="mt-1 text-muted-foreground">
                The QR code has been decoded. Review the details below and verify on-chain.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {scanError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-destructive">
                  <div className="mb-1 font-medium">Scan error</div>
                  <div className="text-sm">{scanError}</div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">Transaction hash</div>
                      <div className="break-all rounded-md bg-secondary/40 p-3 font-mono text-sm">
                        {scannedPayload?.txSignature}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">Batch ID</div>
                      <div className="rounded-md bg-secondary/40 p-3 font-mono text-sm">
                        {scannedPayload?.batchId}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">Medicine name</div>
                      <div className="rounded-md bg-secondary/40 p-3 text-sm font-medium">
                        {scannedPayload?.medicineName}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">Owner address</div>
                      <div className="break-all rounded-md bg-secondary/40 p-3 font-mono text-sm">
                        {scannedPayload?.ownerAddress}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-2 text-sm font-medium text-muted-foreground">Scan timestamp</div>
                    <div className="rounded-md bg-secondary/40 p-3 text-sm font-medium">
                      {scannedPayload?.timestamp ? new Date(scannedPayload.timestamp).toLocaleString() : 'Unknown'}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/40 p-5">
                    <div className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
                      <div>
                        <h4 className="font-medium text-foreground">Ready for blockchain verification</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Click "Verify on blockchain" to check this transaction's authenticity on the Solana network.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                      <QrCode className="mr-2 h-4 w-4" />
                      Scan another QR code
                    </Button>
                    <Button onClick={handleVerify} className="flex-1">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Verify on blockchain
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
