
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scanning: boolean;
  closeCamera: () => void;
}

export function CameraPreview({ videoRef, canvasRef, scanning, closeCamera }: CameraPreviewProps) {
  // تأكد من أن الفيديو يظهر بشكل صحيح عند التحميل
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      console.log("تهيئة عرض الكاميرا في العرض الكامل");
      videoRef.current.style.width = "100%";
      videoRef.current.style.height = "auto";
      videoRef.current.style.objectFit = "cover";
      videoRef.current.style.display = "block"; // تأكد من أن الفيديو مرئي
    }
  }, [videoRef, videoRef.current?.srcObject]);

  return (
    <div className="relative w-full h-full bg-physics-dark rounded-lg overflow-hidden">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
        style={{ maxHeight: '50vh', display: 'block' }}
        playsInline
        muted
        autoPlay
      ></video>
      
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full"></canvas>
      
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
