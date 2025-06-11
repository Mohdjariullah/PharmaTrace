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
  size?: number;
}

export default function QrGenerator({ txSignature, batchId, medicineName, size = 250 }: QrGeneratorProps) {
  const [dataURL, setDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const payload = generateQrPayload(txSignature, batchId, medicineName);
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

    if (txSignature && batchId && medicineName) {
      generateQR();
    }
  }, [txSignature, batchId, medicineName]);

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
    if (!dataURL || !navigator.share) return;
    
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
    <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5 text-primary" />
          Verification QR Code
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center">
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ width: size, height: size }}>
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center p-4 bg-destructive/10 rounded-lg">
            <p className="font-medium mb-2">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : dataURL ? (
          <>
            <div className="p-4 bg-white rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow border">
              <img
                src={dataURL}
                alt="Batch Verification QR Code"
                width={size}
                height={size}
                className="max-w-full h-auto"
              />
            </div>
            
            <div className="text-center mb-4 space-y-2">
              <div className="text-sm font-medium text-foreground">
                {medicineName}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Batch: {batchId}
              </div>
              <div className="text-xs text-muted-foreground">
                Scan to verify authenticity on blockchain
              </div>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload} 
                className="flex-1 flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              {navigator.share && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare} 
                  className="flex-1 flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground"
                >
                  <Share2 className="h-4 w-4" />
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