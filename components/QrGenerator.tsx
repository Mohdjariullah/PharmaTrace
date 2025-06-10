"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { generateQrPayload, generateQrDataURL } from '@/services/qrService';
import { Skeleton } from '@/components/ui/skeleton';

interface QrGeneratorProps {
  batchPDA: string;
  size?: number;
}

export default function QrGenerator({ batchPDA, size = 250 }: QrGeneratorProps) {
  const [dataURL, setDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const payload = generateQrPayload(batchPDA);
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

    if (batchPDA) {
      generateQR();
    }
  }, [batchPDA]);

  const handleDownload = () => {
    if (!dataURL) return;
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `batch_${batchPDA.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!dataURL || !navigator.share) return;
    
    try {
      const blob = await fetch(dataURL).then(res => res.blob());
      const file = new File([blob], `batch_${batchPDA.substring(0, 8)}.png`, { type: 'image/png' });
      
      await navigator.share({
        title: 'PharmaTrace Batch QR Code',
        text: 'Scan this QR code to verify the pharmaceutical batch',
        files: [file]
      });
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6 flex flex-col items-center">
        {isLoading ? (
          <div className="flex items-center justify-center\" style={{ width: size, height: size }}>
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center p-4 bg-destructive/10 rounded-lg">
            <p className="font-medium mb-2">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : dataURL ? (
          <>
            <div className="p-4 bg-white rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow">
              <img
                src={dataURL}
                alt="Batch QR Code"
                width={size}
                height={size}
                className="max-w-full h-auto"
              />
            </div>
            <div className="text-sm text-muted-foreground mb-4 text-center">
              Scan this QR code to verify the authenticity of the batch
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload} 
                className="flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              {navigator.share && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare} 
                  className="flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground"
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