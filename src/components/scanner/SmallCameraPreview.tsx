
import React, { useEffect, useState } from "react";
import { X, AlertCircle, Camera, ScanLine } from "lucide-react";

interface SmallCameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  closeCamera: () => void;
  error?: string;
}

export function SmallCameraPreview({ videoRef, closeCamera, error }: SmallCameraPreviewProps) {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  
  // تحقق من حالة الفيديو بعد التحميل
  useEffect(() => {
    const checkVideoVisibility = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        console.log("تهيئة عرض الكاميرا في العرض الصغير");
        // تأكد من أن الفيديو مرئي ويأخذ المساحة المناسبة
        videoRef.current.style.display = "block";
        videoRef.current.style.width = "100%";
        videoRef.current.style.height = "100%";
        videoRef.current.style.objectFit = "cover";
        setIsVideoVisible(true);
      } else {
        setIsVideoVisible(false);
      }
    };
    
    checkVideoVisibility();
    
    // تحقق مرة أخرى بعد فترة قصيرة للتأكد من تحميل الفيديو
    const timer = setTimeout(checkVideoVisibility, 1000);
    return () => clearTimeout(timer);
  }, [videoRef, videoRef.current?.srcObject]);

  return (
    <div className="relative mt-4 w-full aspect-video bg-physics-dark rounded-lg overflow-hidden flex items-center justify-center border-2 border-physics-gold/50 shadow-lg">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 p-4 text-center z-20">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-white text-sm">{error}</p>
        </div>
      ) : !isVideoVisible ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <ScanLine className="text-physics-gold mb-2 animate-pulse" size={32} />
          <p className="text-white/70 text-sm">جاري تنشيط الكاميرا...</p>
        </div>
      ) : null}
      
      <video 
        ref={videoRef} 
        className={`w-full h-full object-cover ${isVideoVisible ? 'block' : 'hidden'}`}
        playsInline 
        muted 
        autoPlay
      />
      
      {/* تحسين إطار دليل المسح مع تأثيرات بصرية جذابة */}
      {isVideoVisible && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-physics-gold/60 animate-glow rounded-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-physics-gold rounded-md animate-scan-border"></div>
        </div>
      )}
      
      {/* زر الإغلاق */}
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-2 bg-physics-navy/80 rounded-full z-10 shadow-md"
        aria-label="إغلاق الكاميرا"
      >
        <X className="text-white" size={18} />
      </button>
      
      {/* نص توجيهي للمستخدم */}
      {isVideoVisible && (
        <div className="absolute bottom-2 left-0 right-0 text-center z-10">
          <p className="text-white text-xs bg-physics-navy/80 py-1 px-3 rounded-full inline-block">
            ضع رمز QR داخل المربع للمسح
          </p>
        </div>
      )}
    </div>
  );
}
