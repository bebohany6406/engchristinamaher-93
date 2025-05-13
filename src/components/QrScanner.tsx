
import React, { useEffect } from "react";
import { useQrScanner } from "@/hooks/useQrScanner";
import { useStudentAttendance } from "@/hooks/useStudentAttendance";
import { CameraPreview } from "@/components/scanner/CameraPreview";
import { SmallCameraPreview } from "@/components/scanner/SmallCameraPreview";
import { CameraScanButton } from "@/components/scanner/CameraScanButton";
import { ManualCodeEntry } from "@/components/scanner/ManualCodeEntry";
import { PaymentStatusDisplay } from "@/components/scanner/PaymentStatusDisplay";
import { PermissionDeniedWarning } from "@/components/scanner/PermissionDeniedWarning";

export function QrScanner() {
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
  
  // Effect to handle QR code detection
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
  
  // Cleanup effect
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
          />
        ) : (
          <div className="flex flex-col items-center p-6">
            <CameraScanButton 
              onClick={startScanner}
              isProcessing={isProcessing}
            />
            
            {permissionDenied && <PermissionDeniedWarning />}
            
            {/* عرض الكاميرا الصغير */}
            {!scanning && isCameraActive && videoRef.current && videoRef.current.srcObject && (
              <SmallCameraPreview 
                videoRef={videoRef}
                closeCamera={closeCamera}
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
