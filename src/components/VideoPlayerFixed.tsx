
import React, { useRef, useEffect, useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayerFixed({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const [isPlaying, setIsPlaying] = useState(false);
  
  // جودات الفيديو المتاحة - مع دعم أفضل للجوال
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
    
    // التأكد من تحميل مصدر الفيديو - مع دعم أفضل للمحمول
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x5-playsinline", "true");
    video.load();
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);
  
  // تشغيل الفيديو بشكل أفضل على الجوال
  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => {
          console.error("Failed to play video:", e);
          setError("فشل تشغيل الفيديو، يرجى المحاولة مرة أخرى");
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  
  // تغيير جودة الفيديو
  const changeQuality = (quality: string) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      setCurrentQuality(quality);
      videoRef.current.src = qualities[quality as keyof typeof qualities];
      videoRef.current.load();
      
      // الاستمرار من نفس النقطة
      videoRef.current.addEventListener("canplay", function resumePlayback() {
        if (!videoRef.current) return;
        videoRef.current.removeEventListener("canplay", resumePlayback);
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(e => console.error("Failed to resume video:", e));
        }
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
        controls={isPlaying}
        title={title}
        controlsList="nodownload"
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="auto"
        onContextMenu={(e) => e.preventDefault()}
        style={{ display: isLoading || !isPlaying ? 'none' : 'block' }}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="application/x-mpegURL" />
        متصفحك لا يدعم تشغيل الفيديو
      </video>
      
      {/* زر تشغيل واضح للفيديو */}
      {!isPlaying && !isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
          onClick={handlePlayVideo}
        >
          <div className="bg-physics-gold/80 p-6 rounded-full hover:bg-physics-gold transition-colors">
            <Play size={48} className="text-physics-navy" />
          </div>
          <div className="absolute bottom-6 left-6 text-lg text-white font-bold">
            اضغط للتشغيل
          </div>
        </div>
      )}
      
      {/* زر اختيار الجودة */}
      {isPlaying && (
        <div className="absolute bottom-14 left-4 bg-physics-gold/90 rounded-md overflow-hidden shadow-lg" style={{ display: isLoading ? 'none' : 'block' }}>
          <div className="text-physics-navy text-xs font-bold p-2 bg-physics-gold">الجودة</div>
          <div className="p-1">
            {Object.keys(qualities).map((quality) => (
              <button
                key={quality}
                onClick={() => changeQuality(quality)}
                className={`block w-full text-xs text-left px-3 py-2 rounded ${currentQuality === quality ? 'bg-physics-navy text-physics-gold' : 'text-physics-navy hover:bg-physics-navy/10'}`}
              >
                {quality === 'auto' ? 'تلقائي' : 
                 quality === 'high' ? 'عالية' : 
                 quality === 'medium' ? 'متوسطة' : 'منخفضة'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
