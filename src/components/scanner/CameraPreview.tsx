
import React, { useEffect, useState } from "react";
import { X, AlertCircle, Camera, ScanLine } from "lucide-react";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scanning: boolean;
  closeCamera: () => void;
  error?: string;
}

export function CameraPreview({ videoRef, canvasRef, scanning, closeCamera, error }: CameraPreviewProps) {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [scanningAnimation, setScanningAnimation] = useState(false);

  // تحقق من حالة الفيديو بعد التحميل
  useEffect(() => {
    const checkVideoVisibility = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        console.log("تهيئة عرض الكاميرا في العرض الكامل");
        videoRef.current.style.width = "100%";
        videoRef.current.style.height = "100%";
        videoRef.current.style.objectFit = "cover";
        videoRef.current.style.display = "block";
        setIsVideoVisible(true);
        
        // تشغيل تأثير المسح بعد ظهور الفيديو
        setTimeout(() => setScanningAnimation(true), 500);
      } else {
        setIsVideoVisible(false);
        setScanningAnimation(false);
      }
    };
    
    checkVideoVisibility();
    
    // تحقق مرة أخرى بعد فترة قصيرة للتأكد من تحميل الفيديو
    const timer = setTimeout(checkVideoVisibility, 500);
    return () => clearTimeout(timer);
  }, [videoRef, videoRef.current?.srcObject]);

  return (
    <div className="relative w-full bg-physics-dark rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 p-4 text-center z-20">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-white text-sm">{error}</p>
        </div>
      ) : !isVideoVisible ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <Camera className="text-white/50 mb-2 animate-pulse" size={32} />
          <p className="text-white/70 text-sm">جاري تهيئة الكاميرا...</p>
        </div>
      ) : null}
      
      <video 
        ref={videoRef} 
        className={`w-full h-full object-cover ${isVideoVisible ? 'block' : 'hidden'}`}
        style={{ maxHeight: '50vh' }}
        playsInline
        muted
        autoPlay
      />
      
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-2 bg-physics-navy rounded-full z-30 shadow-md"
        aria-label="إغلاق الكاميرا"
      >
        <X className="text-white" size={24} />
      </button>
      
      {/* Scanner overlay with improved visibility */}
      <div className="absolute inset-0 border-2 border-physics-gold rounded-lg pointer-events-none"></div>
      
      {/* Scanning area with guide frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3/5 h-2/5 border-2 border-physics-gold rounded-lg relative">
          {/* Corner markers for better visibility */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-physics-gold"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-physics-gold"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-physics-gold"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-physics-gold"></div>
        </div>
      </div>
      
      {/* Scanning line animation */}
      {scanningAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-3/5 h-2/5">
            <div className="absolute inset-x-0 h-0.5 bg-physics-gold animate-scan"></div>
          </div>
        </div>
      )}
      
      {/* Scanning instruction */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white text-sm bg-physics-navy/70 py-1 px-3 rounded-full inline-block">
          ضع رمز QR داخل المربع للمسح
        </p>
      </div>
    </div>
  );
}
