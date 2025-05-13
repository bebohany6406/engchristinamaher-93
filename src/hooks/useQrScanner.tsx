
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
          } else {
            setPermissionDenied(false);
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
        cameraStream.getTracks().forEach(track => {
          track.stop();
          console.log("تم إيقاف مسار الكاميرا:", track.label);
        });
      }
    };
  }, []);
  
  // تحسين طلب إذن الكاميرا والحصول على دفق الكاميرا
  const requestCameraPermission = async () => {
    try {
      console.log("طلب إذن الكاميرا...");
      
      // استخدام الكاميرا الخلفية باستخدام القيم المثالية
      const constraints = {
        video: {
          facingMode: { exact: "environment" }, // إجبار استخدام الكاميرا الخلفية
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          aspectRatio: { ideal: 1.7778 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      };
      
      try {
        console.log("محاولة الوصول إلى الكاميرا الخلفية مع إعدادات مثالية");
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("تم الحصول على تدفق الكاميرا الخلفية بنجاح");
        return stream;
      } catch (backCameraError) {
        console.warn("فشل في الوصول إلى الكاميرا الخلفية مع الإعدادات المثالية:", backCameraError);
        
        // محاولة استخدام كاميرا الجهاز المحمول الخلفية دون قيود صارمة
        try {
          console.log("محاولة الوصول إلى الكاميرا الخلفية دون قيود صارمة");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
          console.log("تم الحصول على تدفق الكاميرا الخلفية");
          return stream;
        } catch (backCameraError2) {
          console.warn("فشل في الوصول إلى الكاميرا الخلفية:", backCameraError2);
          
          // محاولة استخدام أي كاميرا متاحة في الجهاز
          try {
            console.log("محاولة استخدام أي كاميرا متاحة");
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
            console.log("تم الحصول على تدفق كاميرا عام");
            return stream;
          } catch (genericError) {
            console.error("فشل في الوصول إلى أي كاميرا:", genericError);
            throw genericError;
          }
        }
      }
    } catch (err) {
      console.error("خطأ في أذونات الوسائط:", err);
      setPermissionDenied(true);
      throw err;
    }
  };
  
  // بدء المسح الضوئي مع تحسينات للأداء
  const startScanner = async () => {
    try {
      setIsProcessing(true);
      console.log("بدء تشغيل الماسح الضوئي...");
      
      // طلب الإذن والحصول على تدفق الكاميرا
      let stream;
      try {
        stream = await requestCameraPermission();
        
        // إظهار تنبيه للمستخدم أن الكاميرا قيد التشغيل
        toast({
          title: "جاري تشغيل الكاميرا",
          description: "يرجى توجيه الكاميرا إلى رمز QR"
        });
        
      } catch (err) {
        console.error("خطأ في الوصول إلى الكاميرا:", err);
        toast({
          variant: "destructive",
          title: "❌ لا يمكن الوصول إلى الكاميرا",
          description: "تأكد من أن لديك كاميرا متاحة وأنك منحتها الأذونات المناسبة"
        });
        setIsProcessing(false);
        throw err;
      }
      
      // تخزين تدفق الكاميرا
      setCameraStream(stream);
      
      // ربط تدفق الكاميرا بعنصر الفيديو بشكل مباشر
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = "block";
        setIsCameraActive(true);
        
        // التأكد من أن الفيديو يعمل قبل بدء المسح
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log("تم تحميل بيانات وصف الفيديو");
            
            // تفعيل الكاميرا مباشرة بعد تحميل البيانات
            videoRef.current.play()
              .then(() => {
                console.log("تم تشغيل الفيديو بنجاح");
                setIsProcessing(false);
                setScanning(true);  // تم تحسين تسلسل بدء المسح
              })
              .catch(playError => {
                console.error("خطأ في تشغيل الفيديو:", playError);
                
                // محاولة أخرى لتشغيل الفيديو بعد تأخير قصير
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                      .then(() => {
                        console.log("تم تشغيل الفيديو في المحاولة الثانية");
                        setIsProcessing(false);
                        setScanning(true);
                        toast({
                          title: "✅ الكاميرا جاهزة",
                          description: "يمكنك الآن مسح الكود"
                        });
                      })
                      .catch(secondPlayError => {
                        console.error("فشل تشغيل الفيديو في المحاولة الثانية:", secondPlayError);
                        setIsProcessing(false);
                        toast({
                          variant: "destructive",
                          title: "❌ تعذر تشغيل الكاميرا",
                          description: "حاول مرة أخرى أو استخدم الإدخال اليدوي"
                        });
                      });
                  }
                }, 1000);
              });
          }
        };
        
        // معالجة أخطاء الفيديو
        videoRef.current.onerror = (errorEvent) => {
          console.error("خطأ في عنصر الفيديو:", errorEvent);
          setIsProcessing(false);
          toast({
            variant: "destructive",
            title: "❌ خطأ في الكاميرا",
            description: "حدث خطأ أثناء محاولة تشغيل الكاميرا"
          });
        };
      }
    } catch (err) {
      console.error("خطأ في الوصول إلى الكاميرا:", err);
      setIsProcessing(false);
      throw err;
    }
  };

  // إيقاف المسح الضوئي
  const stopScanner = useCallback(() => {
    if (scanning) {
      console.log("إيقاف الماسح الضوئي");
      setScanning(false);
    }
  }, [scanning]);
  
  // إغلاق الكاميرا وتحرير الموارد
  const closeCamera = useCallback(() => {
    console.log("إغلاق الكاميرا");
    setScanning(false);
    setIsCameraActive(false);
    
    // إيقاف جميع مسارات الكاميرا
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }
    
    // تنظيف عنصر الفيديو
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  // مسح رمز QR في الإطار الحالي مع تحسينات للدقة
  const scanCode = useCallback(() => {
    if (!scanning) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // ضبط أبعاد Canvas لتتناسب مع الفيديو
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // رسم إطار الفيديو الحالي على Canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          // الحصول على بيانات الصورة من Canvas
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // تحليل بيانات الصورة للعثور على رمز QR مع ضبط اعدادات أكثر تسامحًا
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          
          // إذا تم العثور على رمز QR، أرجع البيانات
          if (code) {
            console.log("تم العثور على رمز QR:", code.data);
            return code.data;
          }
        } catch (error) {
          console.error("خطأ في تحليل رمز QR:", error);
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
