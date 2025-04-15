
import React, { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayerFixed({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  
  // جودات الفيديو المتاحة
  const qualities = {
    auto: src,
    high: src,
    medium: src,
    low: src
  };
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = (e: any) => {
      setIsLoading(false);
      setError("حدث خطأ في تحميل الفيديو، يرجى التحقق من الرابط");
      console.error("Video error loading source:", src, e);
    };
    
    const video = videoRef.current;
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    // التأكد من تحميل مصدر الفيديو
    video.load();
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);
  
  // معالجة خطأ التحميل في حالة اكتشافه
  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => {
          console.error("Failed to play video:", e);
          setError("فشل تشغيل الفيديو، يرجى المحاولة مرة أخرى");
        });
      } else {
        videoRef.current.pause();
      }
    }
  };
  
  // تغيير جودة الفيديو
  const changeQuality = (quality: string) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const isPlaying = !videoRef.current.paused;
      
      setCurrentQuality(quality);
      videoRef.current.src = qualities[quality as keyof typeof qualities];
      videoRef.current.load();
      
      // الاستمرار من نفس النقطة
      videoRef.current.addEventListener("canplay", function resumePlayback() {
        videoRef.current?.removeEventListener("canplay", resumePlayback);
        videoRef.current.currentTime = currentTime;
        if (isPlaying) videoRef.current.play();
      });
    }
  };
  
  return (
    <div className="relative w-full h-full bg-physics-dark rounded-lg overflow-hidden">
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
        className="w-full h-full rounded-lg aspect-video bg-black"
        controls
        title={title}
        controlsList="nodownload"
        playsInline
        preload="auto"
        onClick={handleVideoClick}
        onContextMenu={(e) => e.preventDefault()}
        style={{ display: isLoading ? 'none' : 'block' }}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="application/x-mpegURL" />
        متصفحك لا يدعم تشغيل الفيديو
      </video>
      
      {/* زر اختيار الجودة */}
      <div className="absolute bottom-14 left-4 bg-black/70 rounded-md overflow-hidden" style={{ display: isLoading ? 'none' : 'block' }}>
        <div className="text-white text-xs p-1 bg-physics-gold">الجودة</div>
        <div className="p-1">
          {Object.keys(qualities).map((quality) => (
            <button
              key={quality}
              onClick={() => changeQuality(quality)}
              className={`block w-full text-xs text-left px-2 py-1 ${currentQuality === quality ? 'text-physics-gold' : 'text-white'} hover:bg-gray-700`}
            >
              {quality === 'auto' ? 'تلقائي' : 
               quality === 'high' ? 'عالية' : 
               quality === 'medium' ? 'متوسطة' : 'منخفضة'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
