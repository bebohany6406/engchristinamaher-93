
import React, { useRef, useEffect, useState } from "react";
import { Play, Download } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
}

// Extended interface for HTMLVideoElement with webkit properties
interface HTMLVideoElementWithWebkit extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
  webkitSupportsFullscreen?: boolean;
  webkitExitFullscreen?: () => void;
}

export function VideoPlayerFixed({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElementWithWebkit>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Available video qualities with better mobile support
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
      console.error("Video error:", e);
      setError("حدث خطأ في تحميل الفيديو، يرجى التحقق من الرابط أو الاتصال بالإنترنت");
    };
    
    const video = videoRef.current;
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    // Ensure video loads properly on mobile
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x5-playsinline", "true");
    video.setAttribute("controls", "false");
    video.muted = false;
    video.preload = "auto";
    video.load();
    
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);
  
  // Better video playback function for mobile
  const handlePlayVideo = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      if (video.paused) {
        // Fix for iOS by forcing fullscreen first if available
        if (video.webkitSupportsFullscreen && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
          try {
            // Only try to enter fullscreen if available and not already fullscreen
            if (video.webkitEnterFullscreen && !video.webkitDisplayingFullscreen) {
              video.webkitEnterFullscreen();
            }
          } catch (e) {
            console.log("Failed to enter fullscreen:", e);
          }
        }
        
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(e => {
          console.error("Failed to play video:", e);
          setError("فشل تشغيل الفيديو، يرجى النقر مرة أخرى أو التحقق من إعدادات المتصفح");
          
          // Try playing muted if normal playback fails (browsers often allow muted autoplay)
          video.muted = true;
          video.play().then(() => {
            video.muted = false; // Try to unmute after playback starts
            setIsPlaying(true);
          }).catch(err => {
            console.error("Failed to play even when muted:", err);
          });
        });
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };
  
  // Change video quality
  const changeQuality = (quality: string) => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    
    setCurrentQuality(quality);
    videoRef.current.src = qualities[quality as keyof typeof qualities];
    videoRef.current.load();
    
    // Continue from the same point
    const resumePlayback = () => {
      if (!videoRef.current) return;
      videoRef.current.removeEventListener("canplay", resumePlayback);
      videoRef.current.currentTime = currentTime;
      if (wasPlaying) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Failed to resume video:", e));
      }
    };
    
    videoRef.current.addEventListener("canplay", resumePlayback);
  };
  
  // Handle video download
  const handleDownload = () => {
    if (src) {
      const link = document.createElement('a');
      link.href = src;
      link.download = `${title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Play sound effect
      const audio = new Audio("/click-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
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
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="mt-2 goldBtn"
            >
              إعادة المحاولة
            </button>
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
        preload="auto"
        onContextMenu={(e) => e.preventDefault()}
        style={{ display: isLoading || error || !isPlaying ? 'none' : 'block' }}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="application/x-mpegURL" />
        متصفحك لا يدعم تشغيل الفيديو
      </video>
      
      {/* Enhanced play button with improved style */}
      {!isPlaying && !isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayVideo}
        >
          <div className="bg-physics-gold/90 p-6 rounded-full hover:bg-physics-gold transition-colors shadow-xl hover:scale-105 transform duration-200 flex items-center justify-center">
            <Play size={48} className="text-physics-navy ml-2" />
          </div>
          
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="bg-physics-navy/90 hover:bg-physics-navy p-3 rounded-full text-physics-gold shadow-lg transition-all"
              title="تحميل الفيديو"
            >
              <Download size={24} />
            </button>
          </div>
          
          <div className="absolute bottom-6 left-6 text-lg text-white font-bold bg-physics-navy/90 hover:bg-physics-navy px-4 py-2 rounded-full shadow-lg transition-all">
            اضغط للتشغيل
          </div>
        </div>
      )}
      
      {/* Quality selection button */}
      {isPlaying && (
        <div className="absolute bottom-14 left-4 bg-physics-gold rounded-md overflow-hidden shadow-lg" style={{ display: isLoading ? 'none' : 'block' }}>
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
      
      {/* Download button while playing */}
      {isPlaying && (
        <div 
          className="absolute top-4 right-4 z-20"
          style={{ display: isLoading ? 'none' : 'block' }}
        >
          <button
            onClick={handleDownload}
            className="bg-physics-navy/80 hover:bg-physics-navy p-2 rounded-full text-physics-gold shadow-lg transition-all"
            title="تحميل الفيديو"
          >
            <Download size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
