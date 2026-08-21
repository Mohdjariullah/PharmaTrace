"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, QrCode } from 'lucide-react';
import { generateQrPayload, generateQrDataURL } from '@/services/qrService';
import { Skeleton } from '@/components/ui/skeleton';

interface QrGeneratorProps {
  txSignature: string;
  batchId: string;
  medicineName: string;
  ownerAddress: string;
  size?: number;
}

export default function QrGenerator({ txSignature, batchId, medicineName, ownerAddress, size = 250 }: QrGeneratorProps) {
  const [dataURL, setDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const payload = generateQrPayload(txSignature, batchId, medicineName, ownerAddress);
        const url = await generateQrDataURL(payload);
        setDataURL(url);
        setError(null);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    if (txSignature && batchId && medicineName && ownerAddress) {
      generateQR();
    }
  }, [txSignature, batchId, medicineName, ownerAddress]);

  const handleDownload = () => {
    if (!dataURL) return;
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `pharmatrace_${batchId}_${txSignature.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!dataURL || typeof navigator.share !== 'function') return;
    
    try {
      const blob = await fetch(dataURL).then(res => res.blob());
      const file = new File([blob], `pharmatrace_${batchId}.png`, { type: 'image/png' });
      
      await navigator.share({
        title: 'PharmaTrace Batch QR Code',
        text: `Scan this QR code to verify the pharmaceutical batch: ${medicineName}`,
        files: [file]
      });
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };

  return (
    <Card className="overflow-hidden transition-colors hover:border-primary/40">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <QrCode className="h-4 w-4 text-primary" strokeWidth={1.75} />
          Verification QR code
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ width: size, height: size }}>
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
            <p className="mb-2 font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : dataURL ? (
          <>
            <div className="mb-4 rounded-lg border border-border bg-white p-4">
              <img
                src={dataURL}
                alt="Batch verification QR code"
                width={size}
                height={size}
                className="h-auto max-w-full"
              />
            </div>

            <div className="mb-4 space-y-2 text-center">
              <div className="text-sm font-medium text-foreground">
                {medicineName}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                Batch: {batchId}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                TX: {txSignature.substring(0, 8)}...{txSignature.slice(-8)}
              </div>
              <div className="text-xs text-muted-foreground">
                Scan to verify authenticity on blockchain
              </div>
            </div>

            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex flex-1 items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              {typeof navigator.share === 'function' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex flex-1 items-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}