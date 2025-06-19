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
    <Card className="w-full max-w-4xl mx-auto overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-900">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            QR Code Scanner
          </h2>
          <p className="text-muted-foreground">
            Scan, upload, or manually enter QR code data for verification
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 h-14">
            <TabsTrigger 
              value="camera" 
              disabled={!isCameraAvailable} 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 h-12"
            >
              <Camera className="h-5 w-5" />
              <span>Camera</span>
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 h-12"
            >
              <Image className="h-5 w-5" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 h-12"
            >
              <Type className="h-5 w-5" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera">
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-6 border-4 border-gray-300 dark:border-gray-600">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800">
                  <div className="rounded-full bg-red-100 dark:bg-red-900 p-6 mb-4">
                    <X className="h-12 w-12 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-red-600 dark:text-red-400 font-medium mb-2 text-lg">Camera Error</div>
                  <div className="text-sm text-red-500 dark:text-red-300 text-center mb-6 max-w-md">{cameraError}</div>
                  <div className="flex gap-3">
                    <Button 
                      size="lg" 
                      onClick={() => {
                        setIsCameraAvailable(true);
                        setTriedBothFacingModes(false);
                        startCamera();
                      }} 
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Try Again
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => setActiveTab('upload')} 
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      Upload Image
                    </Button>
                  </div>
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
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {!scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Skeleton className="w-20 h-20 rounded-full" />
                    </div>
                  )}
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-12 border-4 border-white/50 rounded-2xl">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-blue-500 rounded-tl-2xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-blue-500 rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-blue-500 rounded-bl-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-blue-500 rounded-br-2xl"></div>
                    </div>
                    
                    {scanningActive && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4 animate-pulse" />
                          Scanning for QR codes...
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-6 right-6 flex gap-3">
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={toggleCamera}
                      className="backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
                    >
                      Switch Camera
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="text-center mb-6">
              <p className="text-muted-foreground mb-4">
                Position the QR code within the scanning area for automatic detection
              </p>
              <div className="flex justify-center">
                <Button 
                  variant={scanning ? "destructive" : "default"} 
                  onClick={scanning ? stopCamera : startCamera}
                  disabled={cameraError !== null}
                  className="min-w-[200px] h-12 text-lg"
                  size="lg"
                >
                  {scanning ? (
                    <>
                      <X className="h-5 w-5 mr-2" /> Stop Scanning
                    </>
                  ) : (
                    <>
                      <Scan className="h-5 w-5 mr-2" /> Start Scanning
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload">
            <div className="flex flex-col items-center">
              <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-16 text-center mb-6 hover:border-primary/50 transition-colors bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-4 mb-6 inline-flex items-center justify-center">
                  <Upload className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-medium mb-3">Upload QR Code Image</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Select an image file containing a QR code to decode automatically
                </p>
                <Button 
                  variant="default" 
                  className="cursor-pointer h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600" 
                  size="lg"
                  disabled={isProcessingFile}
                  onClick={handleFileButtonClick}
                >
                  {isProcessingFile ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-3" />
                      Choose Image File
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
                <h3 className="text-2xl font-medium mb-3">Manual QR Code Entry</h3>
                <p className="text-muted-foreground mb-6">
                  Paste the QR code JSON content below if you have it available:
                </p>
                <Textarea
                  placeholder='{"txSignature": "...", "batchId": "...", "medicineName": "...", "ownerAddress": "...", "timestamp": "..."}'
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="min-h-[150px] font-mono text-sm bg-gray-50 dark:bg-gray-800 border-2"
                />
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                <FileText className="h-5 w-5 mr-3" />
                Parse QR Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}