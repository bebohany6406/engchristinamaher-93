
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

export function QrScanner() {
  const [cameraError, setCameraError] = useState<string | undefined>();
  
  const {
    videoRef,
    canvasRef,
    scanning,
    permissionDenied,
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
    isProcessing,
    processScannedCode,
    handleManualEntry
  } = useStudentAttendance();

  // معالجة بدء الكاميرا
  const handleStartCamera = async () => {
    try {
      setCameraError(undefined);
      
      // نعرض رسالة إعلامية للمستخدم
      toast({
        title: "جاري تشغيل الكاميرا",
        description: "يرجى الانتظار لحظة..."
      });
      
      await startScanner();
    } catch (error) {
      console.error("Error starting camera:", error);
      setCameraError("حدث خطأ أثناء تشغيل الكاميرا. يرجى التحقق من الأذونات والمحاولة مرة أخرى.");
      
      toast({
        variant: "destructive",
        title: "❌ تعذر تشغيل الكاميرا",
        description: "يرجى التأكد من أن الكاميرا متصلة وأن لديك الأذونات المناسبة"
      });
    }
  };
  
  // تتبع حالة مسح الرمز
  useEffect(() => {
    let animationFrameId: number;
    
    const handleScan = () => {
      if (!scanning) return;
      
      const code = scanCode();
      if (code) {
        stopScanner();
        processScannedCode(code);
        return;
      }
      
      animationFrameId = requestAnimationFrame(handleScan);
    };
    
    if (scanning) {
      handleScan();
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [scanning, scanCode, processScannedCode, stopScanner]);
  
  // التحقق من الخطأ بعد تنشيط الكاميرا
  useEffect(() => {
    const checkCameraStatus = () => {
      if (isCameraActive && videoRef.current) {
        if (!videoRef.current.srcObject) {
          setCameraError("تعذر الوصول إلى الكاميرا. يرجى التأكد من تشغيلها وإعطاء الأذونات المطلوبة.");
        } else {
          setCameraError(undefined);
        }
      }
    };
    
    checkCameraStatus();
    
    // تحقق مرة أخرى بعد فترة قصيرة
    const timer = setTimeout(checkCameraStatus, 1000);
    return () => clearTimeout(timer);
  }, [isCameraActive, videoRef.current?.srcObject]);
  
  // تنظيف عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, [closeCamera]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-physics-dark p-4 rounded-lg">
        {scanning ? (
          <CameraPreview 
            videoRef={videoRef}
            canvasRef={canvasRef}
            scanning={scanning}
            closeCamera={closeCamera}
            error={cameraError}
          />
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
            
            <div className="my-4 text-center">
              <p className="text-white">أو</p>
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
