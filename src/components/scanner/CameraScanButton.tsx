
import React from "react";
import { Camera } from "lucide-react";

interface CameraScanButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

export function CameraScanButton({ onClick, isProcessing }: CameraScanButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-3 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-colors"
      disabled={isProcessing}
    >
      <Camera size={24} />
      <span>مسح الكود بالكاميرا</span>
    </button>
  );
}
