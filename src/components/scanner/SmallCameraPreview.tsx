
import React from "react";
import { X } from "lucide-react";

interface SmallCameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  closeCamera: () => void;
}

export function SmallCameraPreview({ videoRef, closeCamera }: SmallCameraPreviewProps) {
  return (
    <div className="relative mt-4 w-full aspect-video bg-physics-navy rounded-lg overflow-hidden">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover"
        playsInline 
        muted 
        autoPlay
      />
      <button 
        onClick={closeCamera}
        className="absolute top-2 right-2 p-1 bg-physics-dark rounded-full"
      >
        <X className="text-white" size={18} />
      </button>
    </div>
  );
}
