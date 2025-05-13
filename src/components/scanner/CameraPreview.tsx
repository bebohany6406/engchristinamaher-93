
import React, { useEffect, useState } from "react";
import { X, AlertCircle, Camera } from "lucide-react";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scanning: boolean;
  closeCamera: () => void;
  error?: string;
}

export function CameraPreview({ videoRef, canvasRef, scanning, closeCamera, error }: CameraPreviewProps) {
  const [isVideoVisible, setIsVideoVisible] = useState(false);

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
    <div className="relative w-full bg-physics-dark rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
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
        style={{ maxHeight: '50vh' }}
        playsInline
        muted
        autoPlay
      />
      
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-2 bg-physics-navy rounded-full z-10"
      >
        <X className="text-white" size={24} />
      </button>
      
      {/* Scanner overlay */}
      <div className="absolute inset-0 border-2 border-physics-gold rounded-lg pointer-events-none"></div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-1/2 h-1/2 border-2 border-physics-gold rounded-lg"></div>
      </div>
    </div>
  );
}
