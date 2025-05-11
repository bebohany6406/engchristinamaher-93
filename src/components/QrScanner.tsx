
import React, { useRef, useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Camera, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsQR from "jsqr";

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const { getStudentByCode } = useAuth();
  const { addAttendance } = useData();
  
  const startScanner = async () => {
    try {
      // Reset permission state before trying
      setPermissionDenied(false);
      
      const constraints = { 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setScanning(true);
          scanCode();
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionDenied(true);
      
      // Check for specific permission errors
      if (err instanceof DOMException && 
         (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        toast({
          variant: "destructive",
          title: "❌ تم رفض الوصول للكاميرا",
          description: "يرجى السماح للتطبيق باستخدام الكاميرا من إعدادات الجهاز أو المتصفح"
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ تعذر الوصول للكاميرا",
          description: "تأكد من وجود كاميرا متصلة وتعمل بشكل صحيح"
        });
      }
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setScanning(false);
    }
  };

  const scanCode = () => {
    if (!scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          // QR code found
          processScannedCode(code.data);
          return;
        }
      }
    }
    
    // Continue scanning if no code was found
    if (scanning) {
      requestAnimationFrame(scanCode);
    }
  };

  const processScannedCode = (code: string) => {
    setScannedCode(code);
    stopScanner();
    
    const student = getStudentByCode(code);
    if (student) {
      addAttendance(student.id, student.name, "present");
      // Play sound effect
      const audio = new Audio("/attendance-present.mp3");
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: "✅ تم تسجيل الحضور",
        description: `تم تسجيل حضور الطالب ${student.name}`
      });
    } else {
      toast({
        variant: "destructive",
        title: "❌ كود غير صالح",
        description: "لم يتم العثور على طالب بهذا الكود"
      });
    }
  };
  
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (scannedCode) {
      const student = getStudentByCode(scannedCode);
      if (student) {
        addAttendance(student.id, student.name, "present");
        // Play sound effect
        const audio = new Audio("/attendance-present.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${student.name}`
        });
        setScannedCode("");
      } else {
        toast({
          variant: "destructive",
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود"
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-physics-dark p-4 rounded-lg">
        {scanning ? (
          <div className="relative">
            <video 
              ref={videoRef} 
              className="w-full h-[300px] rounded-lg object-cover"
              playsInline
              muted
              autoPlay
            ></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="absolute inset-0 pointer-events-none border-2 border-physics-gold rounded-lg flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-physics-gold/70 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-physics-gold"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-physics-gold"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-physics-gold"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-physics-gold"></div>
              </div>
            </div>
            <button 
              onClick={stopScanner}
              className="absolute top-2 right-2 p-2 bg-physics-navy rounded-full"
            >
              <X className="text-white" size={24} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center p-6">
            <button 
              onClick={startScanner}
              className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-3 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-colors"
            >
              <Camera size={24} />
              <span>مسح الكود بالكاميرا</span>
            </button>
            
            {permissionDenied && (
              <div className="mt-4 p-3 bg-red-500/30 text-white rounded-lg text-sm text-center border border-red-500/50">
                تم رفض الوصول للكاميرا. يرجى تفعيل الكاميرا من إعدادات الجهاز أو المتصفح ثم المحاولة مرة أخرى.
              </div>
            )}
            
            <div className="my-4 text-center">
              <p className="text-white">أو</p>
            </div>
            
            <form onSubmit={handleManualEntry} className="w-full">
              <div className="mb-4">
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="أدخل كود الطالب يدوياً"
                  className="inputField bg-physics-navy/60 border-physics-gold/50 text-white"
                />
              </div>
              <button 
                type="submit" 
                className="goldBtn w-full rounded-full shadow-lg"
                disabled={!scannedCode}
              >
                تسجيل الحضور
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
