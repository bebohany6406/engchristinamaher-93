
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scanning: boolean;
  closeCamera: () => void;
}

export function CameraPreview({ videoRef, canvasRef, scanning, closeCamera }: CameraPreviewProps) {
  // تأكد من أن الفيديو يملأ الشاشة بشكل صحيح
  useEffect(() => {
    if (videoRef.current) {
      // تعيين المحتوى ليملأ الشاشة بشكل صحيح
      videoRef.current.style.width = "100%";
      videoRef.current.style.height = "auto";
      videoRef.current.style.objectFit = "cover";
    }
  }, [videoRef]);

  return (
    <div className="relative w-full h-full">
      <video 
        ref={videoRef} 
        className="w-full rounded-lg"
        style={{ display: 'block', maxHeight: '50vh' }}
        playsInline
        muted
        autoPlay
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-2 bg-physics-navy rounded-full"
      >
        <X className="text-white" size={24} />
      </button>
      <div className="absolute inset-0 border-2 border-physics-gold rounded-lg"></div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-1/2 h-1/2 border-2 border-physics-gold rounded-lg"></div>
      </div>
    </div>
  );
}
