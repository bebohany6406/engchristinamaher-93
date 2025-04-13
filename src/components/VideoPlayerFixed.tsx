
import React, { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayerFixed({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setError("حدث خطأ في تحميل الفيديو، يرجى التحقق من الرابط");
    };
    
    const video = videoRef.current;
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-physics-dark">
          <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-physics-dark">
          <div className="text-white text-center px-4">
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-sm">تأكد من صحة الرابط وأنه يدعم التشغيل المباشر</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full rounded-lg aspect-video bg-black"
        controls
        title={title}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        متصفحك لا يدعم تشغيل الفيديو
      </video>
    </div>
  );
}
