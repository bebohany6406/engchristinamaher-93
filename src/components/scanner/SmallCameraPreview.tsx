
import React, { useEffect, useState } from "react";
import { X, AlertCircle, Camera } from "lucide-react";

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
    const timer = setTimeout(checkVideoVisibility, 500);
    return () => clearTimeout(timer);
  }, [videoRef, videoRef.current?.srcObject]);

  return (
    <div className="relative mt-4 w-full aspect-video bg-physics-dark rounded-lg overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 p-4 text-center z-20">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-white text-sm">{error}</p>
        </div>
      ) : !isVideoVisible ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <Camera className="text-white/50 mb-2" size={32} />
          <p className="text-white/70 text-sm">جاري تهيئة الكاميرا...</p>
        </div>
      ) : null}
      
      <video 
        ref={videoRef} 
        className={`w-full h-full object-cover ${isVideoVisible ? 'block' : 'hidden'}`}
        playsInline 
        muted 
        autoPlay
      />
      
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-1 bg-physics-dark rounded-full z-10"
      >
        <X className="text-white" size={18} />
      </button>
    </div>
  );
}
