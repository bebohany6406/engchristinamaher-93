
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SmallCameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  closeCamera: () => void;
}

export function SmallCameraPreview({ videoRef, closeCamera }: SmallCameraPreviewProps) {
  // تأكد من أن الفيديو يظهر بشكل صحيح في العرض الصغير
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      console.log("تهيئة عرض الكاميرا في العرض الصغير");
      videoRef.current.style.display = "block"; // تأكد من أن الفيديو مرئي
      videoRef.current.style.width = "100%";
      videoRef.current.style.height = "auto";
    }
  }, [videoRef, videoRef.current?.srcObject]);

  return (
    <div className="relative mt-4 w-full aspect-video bg-physics-dark rounded-lg overflow-hidden">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
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
