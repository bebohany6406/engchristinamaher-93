
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
      className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-4 px-8 font-bold shadow-lg hover:bg-physics-gold/90 transition-all transform active:scale-95 w-full sm:w-auto text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isProcessing}
    >
      <Camera size={28} className={isProcessing ? "animate-pulse" : ""} />
      <span>{isProcessing ? "جاري تشغيل الكاميرا..." : "مسح الكود بالكاميرا"}</span>
    </button>
  );
}
