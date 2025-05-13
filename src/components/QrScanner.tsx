
import React, { useEffect, useState } from "react";
import { useQrScanner } from "@/hooks/useQrScanner";
import { useStudentAttendance } from "@/hooks/useStudentAttendance";
import { CameraPreview } from "@/components/scanner/CameraPreview";
import { SmallCameraPreview } from "@/components/scanner/SmallCameraPreview";
import { CameraScanButton } from "@/components/scanner/CameraScanButton";
import { ManualCodeEntry } from "@/components/scanner/ManualCodeEntry";
import { PaymentStatusDisplay } from "@/components/scanner/PaymentStatusDisplay";
import { PermissionDeniedWarning } from "@/components/scanner/PermissionDeniedWarning";
import { toast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

export function QrScanner() {
  const [cameraError, setCameraError] = useState<string | undefined>();
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  
  const {
    videoRef,
    canvasRef,
    scanning,
    permissionDenied,
    isProcessing,
    isCameraActive,
    startScanner,
    stopScanner,
    closeCamera,
    scanCode
  } = useQrScanner();
  
  const {
    scannedCode,
    setScannedCode,
    paymentStatus,
    processScannedCode,
    handleManualEntry
  } = useStudentAttendance();

  // معالجة بدء الكاميرا
  const handleStartCamera = async () => {
    try {
      setCameraError(undefined);
      setShowFallbackPrompt(false);
      
      // نعرض رسالة إعلامية للمستخدم
      toast({
        title: "جاري تشغيل الكاميرا",
        description: "يرجى الانتظار لحظة..."
      });
      
      await startScanner();
      
    } catch (error) {
      console.error("Error starting camera:", error);
      setCameraError("حدث خطأ أثناء تشغيل الكاميرا. يرجى التحقق من الأذونات والمحاولة مرة أخرى.");
      setShowFallbackPrompt(true);
      
      toast({
        variant: "destructive",
        title: "❌ تعذر تشغيل الكاميرا",
        description: "يرجى التأكد من أن الكاميرا متصلة وأن لديك الأذونات المناسبة"
      });
    }
  };
  
  // تتبع حالة مسح الرمز مع تحسين للتعرف على الرمز
  useEffect(() => {
    let animationFrameId: number;
    let scanInterval: NodeJS.Timeout;
    
    const handleScan = () => {
      if (!scanning) return;
      
      const code = scanCode();
      if (code) {
        console.log("وجدت الكود في رسم الإطار:", code);
        stopScanner();
        processScannedCode(code);
        return;
      }
      
      animationFrameId = requestAnimationFrame(handleScan);
    };
    
    if (scanning) {
      // زيادة معدل المسح للتأكد من التقاط الرمز
      handleScan();
      
      // إضافة تقنية مسح ثانية باستخدام setInterval للتأكد من عمل المسح
      scanInterval = setInterval(() => {
        if (scanning) {
          setScanAttempts(prev => prev + 1);
          const code = scanCode();
          if (code) {
            console.log("وجدت الكود في الفاصل الزمني:", code);
            stopScanner();
            processScannedCode(code);
            clearInterval(scanInterval);
          }
        }
      }, 300); // مسح كل 300 مللي ثانية للحصول على معدل مسح أعلى
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanning, scanCode, processScannedCode, stopScanner, scanAttempts]);
  
  // التحقق من الخطأ بعد تنشيط الكاميرا
  useEffect(() => {
    const checkCameraStatus = () => {
      if (isCameraActive && videoRef.current) {
        if (!videoRef.current.srcObject) {
          setCameraError("تعذر الوصول إلى الكاميرا. يرجى التأكد من تشغيلها وإعطاء الأذونات المطلوبة.");
          setShowFallbackPrompt(true);
        } else {
          setCameraError(undefined);
          setShowFallbackPrompt(false);
        }
      }
    };
    
    checkCameraStatus();
    
    // تحقق مرة أخرى بعد فترة قصيرة
    const timer = setTimeout(checkCameraStatus, 1000);
    return () => clearTimeout(timer);
  }, [isCameraActive, videoRef]);
  
  // تنظيف عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, [closeCamera]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative bg-physics-dark p-4 rounded-lg">
        {scanning ? (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-physics-gold text-center mb-2">قم بتوجيه الكاميرا إلى كود QR</h2>
            <CameraPreview 
              videoRef={videoRef}
              canvasRef={canvasRef}
              scanning={scanning}
              closeCamera={closeCamera}
              error={cameraError}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center p-6">
            <CameraScanButton 
              onClick={handleStartCamera}
              isProcessing={isProcessing}
            />
            
            {permissionDenied && <PermissionDeniedWarning />}
            
            {/* عرض الكاميرا الصغير */}
            {!scanning && isCameraActive && (
              <SmallCameraPreview 
                videoRef={videoRef}
                closeCamera={closeCamera}
                error={cameraError}
              />
            )}
            
            {/* نص توجيهي إضافي في حالة فشل الكاميرا */}
            {showFallbackPrompt && (
              <div className="mt-4 p-3 bg-physics-navy/50 rounded-lg text-center">
                <Camera className="mx-auto mb-2 text-physics-gold" size={24} />
                <p className="text-white text-sm">
                  يبدو أن هناك مشكلة في الوصول إلى الكاميرا. يمكنك إدخال الكود يدويًا أدناه.
                </p>
              </div>
            )}
            
            <div className="my-4 text-center w-full">
              <p className="text-white mb-2">أو</p>
              <div className="w-full h-px bg-physics-gold/30"></div>
            </div>
            
            <ManualCodeEntry
              scannedCode={scannedCode}
              setScannedCode={setScannedCode}
              handleManualEntry={handleManualEntry}
              isProcessing={isProcessing}
            />
          </div>
        )}
        
        <PaymentStatusDisplay paymentStatus={paymentStatus} />
      </div>
    </div>
  );
}
