"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Upload, FileText, X, RotateCcw, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { parseQrPayload } from '@/services/qrService';
import { QrCodePayload } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import jsQR from 'jsqr';

interface QrScannerProps {
  onScan: (payload: QrCodePayload) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [activeTab, setActiveTab] = useState('camera');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [triedBothFacingModes, setTriedBothFacingModes] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setScanning(true);
      setCameraError(null);
      setIsCameraAvailable(true);
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      // Reset the retry flag on successful camera access
      setTriedBothFacingModes(false);
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      // If we get a NotFoundError and haven't tried both facing modes yet
      if (error.name === 'NotFoundError' && !triedBothFacingModes) {
        setTriedBothFacingModes(true);
        const alternateFacingMode = facingMode === 'environment' ? 'user' : 'environment';
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: alternateFacingMode }
          });
          
          streamRef.current = stream;
          setFacingMode(alternateFacingMode);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          
          return; // Success with alternate camera
        } catch (retryError: any) {
          console.error('Error accessing alternate camera:', retryError);
          setCameraError('No cameras found on this device');
        }
      } else {
        // Set appropriate error message based on error type
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please allow camera permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('No cameras found on this device');
        } else if (error.name === 'NotReadableError') {
          setCameraError('Camera is already in use by another application');
        } else {
          setCameraError(error.message || 'Could not access camera');
        }
      }
      
      setIsCameraAvailable(false);
      setActiveTab('upload');
      setScanning(false);
    }
  }, [facingMode, triedBothFacingModes]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  }, []);

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setTriedBothFacingModes(false);
  };

  const captureFrame = useCallback(() => {
    if (scanning && videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          context.lineWidth = 4;
          context.strokeStyle = '#00FF00';
          context.beginPath();
          context.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          context.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
          context.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
          context.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
          context.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          context.stroke();
          
          const payload = parseQrPayload(code.data);
          if (payload) {
            stopCamera();
            onScan(payload);
            return;
          }
        }
      }
      
      requestAnimationFrame(captureFrame);
    }
  }, [scanning, onScan, stopCamera]);

  useEffect(() => {
    if (scanning) {
      const frameId = requestAnimationFrame(captureFrame);
      return () => cancelAnimationFrame(frameId);
    }
  }, [scanning, captureFrame]);

  useEffect(() => {
    if (activeTab === 'camera' && isCameraAvailable) {
      startCamera().catch(() => {
        setActiveTab('upload');
      });
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [activeTab, isCameraAvailable, startCamera, stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          const payload = parseQrPayload(code.data);
          if (payload) {
            onScan(payload);
          } else {
            alert('Invalid QR code format');
          }
        } else {
          alert('No QR code found in image');
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = () => {
    try {
      const payload = parseQrPayload(manualInput);
      if (payload) {
        onScan(payload);
      } else {
        alert('Invalid JSON format. Please check your input.');
      }
    } catch (error) {
      alert('Failed to parse JSON. Please check your input.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-2 hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="camera" disabled={!isCameraAvailable} className="flex items-center gap-1.5">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Camera</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-1.5">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Manual</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="text-destructive mb-2">Camera Error</div>
                  <div className="text-sm text-muted-foreground text-center mb-4">{cameraError}</div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setIsCameraAvailable(true);
                      setTriedBothFacingModes(false);
                      startCamera();
                    }} 
                    className="flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                  />
                  {!scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Skeleton className="w-16 h-16 rounded-full" />
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleCamera}
                      className="backdrop-blur-lg bg-background/80"
                    >
                      Switch Camera
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="text-sm text-center text-muted-foreground mb-4">
              Position the QR code within the camera view
            </div>
            <div className="flex justify-center">
              <Button 
                variant={scanning ? "destructive" : "default"} 
                onClick={scanning ? stopCamera : startCamera}
                disabled={cameraError !== null}
                className="flex items-center gap-1.5 min-w-[140px]"
              >
                {scanning ? (
                  <>
                    <X className="h-4 w-4" /> Stop Scanning
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4" /> Start Scanning
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upload">
            <div className="flex flex-col items-center">
              <div className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center mb-4 hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an image containing a QR code
                </p>
                <label>
                  <Button variant="secondary" className="cursor-pointer">
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WEBP
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="manual">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Paste the QR code JSON content below:
                </p>
                <Textarea
                  placeholder='{"txSignature": "...", "batchId": "...", "medicineName": "...", "ownerAddress": "...", "timestamp": "..."}'
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="min-h-[150px] font-mono text-xs"
                />
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full"
              >
                Verify
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}