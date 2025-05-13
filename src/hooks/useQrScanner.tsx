
import { useRef, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import jsQR from "jsqr";

export function useQrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<string>("prompt");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Check camera permission status on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          console.info("Camera permission:", result.state);
          setPermissionState(result.state);
          
          if (result.state === 'denied') {
            setPermissionDenied(true);
          }
          
          // Listen for changes to permission state
          result.addEventListener('change', () => {
            console.info("Permission state changed to:", result.state);
            setPermissionState(result.state);
            if (result.state === 'granted') {
              setPermissionDenied(false);
            } else if (result.state === 'denied') {
              setPermissionDenied(true);
              stopScanner();
            }
          });
        }
      } catch (error) {
        console.info("Error requesting permissions:", error);
      }
    };
    
    checkPermissions();
    
    // Cleanup
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const requestCameraPermission = async () => {
    try {
      // Request camera permission explicitly
      const result = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // If we get here, permission was granted
      setPermissionDenied(false);
      setCameraStream(result);
      return true;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionDenied(true);
      toast({
        variant: "destructive",
        title: "❌ تم رفض الوصول للكاميرا",
        description: "يرجى السماح للتطبيق باستخدام الكاميرا من إعدادات الجهاز ثم المحاولة مرة أخرى"
      });
      return false;
    }
  };
  
  const startScanner = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    
    try {
      const stream = cameraStream || await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        setIsCameraActive(true);
        scanCode();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionDenied(true);
      toast({
        variant: "destructive",
        title: "❌ فشل الوصول للكاميرا",
        description: "يرجى التأكد من السماح للتطبيق باستخدام الكاميرا",
      });
    }
  };

  const stopScanner = () => {
    if (scanning) {
      setScanning(false);
    }
  };
  
  const closeCamera = () => {
    setScanning(false);
    setIsCameraActive(false);
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanCode = () => {
    if (!scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          // QR code found
          return code.data;
        }
      }
    }
    
    // Continue scanning if no code was found
    if (scanning) {
      requestAnimationFrame(scanCode);
    }
    
    return null;
  };

  return {
    videoRef,
    canvasRef,
    scanning,
    permissionDenied,
    isProcessing,
    setIsProcessing,
    isCameraActive,
    startScanner,
    stopScanner,
    closeCamera,
    scanCode
  };
}
