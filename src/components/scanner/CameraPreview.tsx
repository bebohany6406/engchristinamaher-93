
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
    <div className="relative w-full bg-physics-dark rounded-lg overflow-hidden" style={{ minHeight: '400px', maxHeight: '70vh' }}>
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
      
      {/* Video Element */}
      <video 
        ref={videoRef} 
        className={`w-full h-full object-cover ${isVideoVisible ? 'block' : 'hidden'}`}
        playsInline
        muted
        autoPlay
      />
      
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      
      {/* Close button */}
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-2 bg-physics-navy rounded-full z-30 shadow-md"
        aria-label="إغلاق الكاميرا"
      >
        <X className="text-white" size={24} />
      </button>
      
      {/* Scanner overlay with improved visibility */}
      <div className="absolute inset-0 border-2 border-physics-gold/70 rounded-lg pointer-events-none"></div>
      
      {/* Scanning area with guide frame - ENHANCED */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-4/5 h-3/5 border-4 border-physics-gold rounded-lg relative">
          {/* Corner markers for better visibility */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-physics-gold"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-physics-gold"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-physics-gold"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-physics-gold"></div>
        </div>
      </div>
      
      {/* Scanning line animation - ENHANCED */}
      {scanningAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-4/5 h-3/5">
            <div className="absolute inset-x-0 h-2 bg-physics-gold/70 animate-scan"></div>
          </div>
        </div>
      )}
      
      {/* Scanning instruction - ENHANCED */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-white font-bold bg-physics-navy/90 py-3 px-6 rounded-full inline-block shadow-lg border border-physics-gold/50">
          ضع رمز QR داخل المربع للمسح
        </p>
      </div>
    </div>
  );
}
