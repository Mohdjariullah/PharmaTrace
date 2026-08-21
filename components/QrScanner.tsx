"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Upload, FileText, X, RotateCcw, Camera, Image, Type, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { parseQrPayload } from '@/services/qrService';
import { QrCodePayload } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [scanningActive, setScanningActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      setScanning(true);
      setCameraError(null);
      setIsCameraAvailable(true);
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanningActive(true);
      }
      
      setTriedBothFacingModes(false);
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      if (error.name === 'NotFoundError' && !triedBothFacingModes) {
        setTriedBothFacingModes(true);
        const alternateFacingMode = facingMode === 'environment' ? 'user' : 'environment';
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: alternateFacingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          
          streamRef.current = stream;
          setFacingMode(alternateFacingMode);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setScanningActive(true);
          }
          
          return;
        } catch (retryError: any) {
          console.error('Error accessing alternate camera:', retryError);
          setCameraError('No cameras found on this device. Please try uploading an image instead.');
        }
      } else {
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please allow camera permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('No cameras found on this device. Please try uploading an image instead.');
        } else if (error.name === 'NotReadableError') {
          setCameraError('Camera is already in use by another application');
        } else {
          setCameraError(error.message || 'Could not access camera. Please try uploading an image instead.');
        }
      }
      
      setIsCameraAvailable(false);
      setScanning(false);
      setScanningActive(false);
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

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setScanning(false);
    setScanningActive(false);
  }, []);

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setTriedBothFacingModes(false);
  };

  const captureFrame = useCallback(() => {
    if (scanningActive && videoRef.current && canvasRef.current && streamRef.current) {
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
          // Draw detection box
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
            toast({
              title: "QR Code Detected!",
              description: "Successfully scanned QR code from camera.",
            });
            return;
          }
        }
      }
    }
  }, [scanningActive, onScan, stopCamera, toast]);

  // Start continuous scanning when camera is active
  useEffect(() => {
    if (scanningActive) {
      scanIntervalRef.current = setInterval(captureFrame, 100); // Scan every 100ms for faster detection
      return () => {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
      };
    }
  }, [scanningActive, captureFrame]);

  useEffect(() => {
    if (activeTab === 'camera' && isCameraAvailable) {
      startCamera().catch(() => {
        // Don't automatically switch tabs, let user decide
      });
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [activeTab, isCameraAvailable, startCamera, stopCamera]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid image file (JPG, PNG, WEBP, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingFile(true);
    
    try {
      const reader = new FileReader();
      
      const processImage = new Promise<void>((resolve, reject) => {
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              
              if (!context) {
                reject(new Error('Could not create canvas context'));
                return;
              }
              
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
                  toast({
                    title: "QR Code Found",
                    description: "Successfully decoded QR code from image.",
                  });
                  resolve();
                } else {
                  reject(new Error('Invalid QR code format. Please ensure the QR code contains valid PharmaTrace data.'));
                }
              } else {
                reject(new Error('No QR code found in the image. Please ensure the image contains a clear QR code.'));
              }
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = () => {
            reject(new Error('Failed to load image. Please try a different image file.'));
          };
          
          img.src = e.target?.result as string;
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file. Please try again.'));
        };
      });
      
      reader.readAsDataURL(file);
      await processImage;
      
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast({
        title: "Image Processing Failed",
        description: error.message || "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFile(false);
      // Clear the input so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter QR code data before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = parseQrPayload(manualInput);
      if (payload) {
        onScan(payload);
        toast({
          title: "QR Data Parsed",
          description: "Successfully parsed QR code data.",
        });
        setManualInput('');
      } else {
        toast({
          title: "Invalid Format",
          description: "Invalid QR code format. Please check your input and ensure it contains valid PharmaTrace data.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error parsing manual input:', error);
      toast({
        title: "Parse Error",
        description: "Failed to parse QR code data. Please check the JSON format and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl overflow-hidden">
      <CardContent className="p-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-foreground">QR code scanner</h2>
          <p className="text-muted-foreground">
            Scan, upload, or manually enter QR code data for verification
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid h-12 grid-cols-3">
            <TabsTrigger
              value="camera"
              disabled={!isCameraAvailable}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              <span>Camera</span>
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex items-center gap-2"
            >
              <Type className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera">
            <div className="relative mb-6 aspect-video overflow-hidden rounded-lg border border-border bg-secondary/60">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/40 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background">
                    <X className="h-5 w-5 text-destructive" strokeWidth={1.75} />
                  </div>
                  <div className="mb-2 text-lg font-medium text-foreground">Camera error</div>
                  <div className="mb-6 max-w-md text-center text-sm text-muted-foreground">{cameraError}</div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setIsCameraAvailable(true);
                        setTriedBothFacingModes(false);
                        startCamera();
                      }}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Try again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload image
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {!scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Skeleton className="h-16 w-16 rounded-full" />
                    </div>
                  )}

                  {/* Scanning overlay */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-10 rounded-xl border-2 border-white/50">
                      <div className="absolute left-0 top-0 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-primary" />
                      <div className="absolute right-0 top-0 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-primary" />
                      <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-primary" />
                      <div className="absolute bottom-0 right-0 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-primary" />
                    </div>

                    {scanningActive && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                        <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                          <Zap className="h-4 w-4 animate-pulse" />
                          Scanning for QR codes...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-6 right-6 flex gap-3">
                    <Button size="sm" variant="secondary" onClick={toggleCamera}>
                      Switch camera
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="mb-6 text-center">
              <p className="mb-4 text-muted-foreground">
                Position the QR code within the scanning area for automatic detection
              </p>
              <div className="flex justify-center">
                <Button
                  variant={scanning ? "destructive" : "default"}
                  onClick={scanning ? stopCamera : startCamera}
                  disabled={cameraError !== null}
                  className="min-w-[200px]"
                >
                  {scanning ? (
                    <>
                      <X className="mr-2 h-4 w-4" /> Stop scanning
                    </>
                  ) : (
                    <>
                      <Scan className="mr-2 h-4 w-4" /> Start scanning
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="flex flex-col items-center">
              <div className="mb-6 w-full rounded-lg border border-dashed border-border p-16 text-center transition-colors hover:border-primary/40">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-md border border-border bg-secondary/60">
                  <Upload className="h-6 w-6 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">Upload QR code image</h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  Select an image file containing a QR code to decode automatically
                </p>
                <Button disabled={isProcessingFile} onClick={handleFileButtonClick}>
                  {isProcessingFile ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose image file
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, WEBP, GIF (max 10MB)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium text-foreground">Manual QR code entry</h3>
                <p className="mb-4 text-muted-foreground">
                  Paste the QR code JSON content below if you have it available:
                </p>
                <Textarea
                  placeholder='{"txSignature": "...", "batchId": "...", "medicineName": "...", "ownerAddress": "...", "timestamp": "..."}'
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                Parse QR data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}