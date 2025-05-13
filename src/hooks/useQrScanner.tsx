
import { useRef, useState, useEffect, useCallback } from "react";
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
  
  // تحقق من حالة إذن الكاميرا عند تحميل المكون
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // تحقق مما إذا كانت واجهة برمجة التطبيقات للأذونات متاحة
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          console.log("حالة إذن الكاميرا:", result.state);
          setPermissionState(result.state);
          
          if (result.state === 'denied') {
            setPermissionDenied(true);
          }
          
          // الاستماع لتغييرات حالة الإذن
          result.addEventListener('change', () => {
            console.log("تغيرت حالة الإذن إلى:", result.state);
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
        console.error("خطأ في طلب الأذونات:", error);
      }
    };
    
    checkPermissions();
    
    // تنظيف
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const requestCameraPermission = async () => {
    try {
      console.log("طلب إذن الكاميرا...");
      // طلب إذن الكاميرا بشكل صريح
      const result = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // إذا وصلنا إلى هنا، فقد تم منح الإذن
      console.log("تم منح إذن الكاميرا بنجاح");
      setPermissionDenied(false);
      setCameraStream(result);
      return result;
    } catch (err) {
      console.error("خطأ في الوصول إلى الكاميرا:", err);
      setPermissionDenied(true);
      toast({
        variant: "destructive",
        title: "❌ تم رفض الوصول للكاميرا",
        description: "يرجى السماح للتطبيق باستخدام الكاميرا من إعدادات الجهاز ثم المحاولة مرة أخرى"
      });
      return null;
    }
  };
  
  const startScanner = async () => {
    try {
      console.log("بدء تشغيل الماسح الضوئي...");
      const stream = await requestCameraPermission();
      if (!stream) return;
      
      console.log("تم الحصول على تدفق الكاميرا:", stream);
      setCameraStream(stream);
      
      if (videoRef.current) {
        console.log("ربط تدفق الكاميرا بعنصر الفيديو");
        videoRef.current.srcObject = stream;
        
        // التأكد من أن الفيديو يعمل قبل بدء المسح
        videoRef.current.onloadedmetadata = () => {
          console.log("تم تحميل بيانات الفيديو، بدء التشغيل...");
          videoRef.current!.play()
            .then(() => {
              console.log("تم تشغيل الفيديو بنجاح");
              setScanning(true);
              setIsCameraActive(true);
            })
            .catch(e => {
              console.error("خطأ في تشغيل الفيديو:", e);
              // محاولة أخرى لتشغيل الفيديو على الأجهزة المحمولة
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play()
                    .then(() => {
                      console.log("تم تشغيل الفيديو بنجاح في المحاولة الثانية");
                      setScanning(true);
                      setIsCameraActive(true);
                    })
                    .catch(e2 => console.error("فشل في تشغيل الفيديو مرة أخرى:", e2));
                }
              }, 500);
            });
        };
      }
    } catch (err) {
      console.error("خطأ في الوصول إلى الكاميرا:", err);
      setPermissionDenied(true);
      toast({
        variant: "destructive",
        title: "❌ فشل الوصول للكاميرا",
        description: "يرجى التأكد من السماح للتطبيق باستخدام الكاميرا",
      });
    }
  };

  const stopScanner = useCallback(() => {
    if (scanning) {
      console.log("إيقاف الماسح الضوئي");
      setScanning(false);
    }
  }, [scanning]);
  
  const closeCamera = useCallback(() => {
    console.log("إغلاق الكاميرا");
    setScanning(false);
    setIsCameraActive(false);
    
    if (cameraStream) {
      console.log("إيقاف جميع مسارات الكاميرا");
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  const scanCode = useCallback(() => {
    if (!scanning) return null;

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
          console.log("تم العثور على رمز QR:", code.data);
          // تم العثور على رمز QR
          return code.data;
        }
      }
    }
    
    return null;
  }, [scanning, videoRef, canvasRef]);

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
