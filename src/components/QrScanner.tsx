
import React, { useRef, useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Camera, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>("");
  const { getStudentByCode } = useAuth();
  const { addAttendance } = useData();
  
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanCode();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        variant: "destructive",
        title: "فشل الوصول للكاميرا",
        description: "يرجى التأكد من السماح للتطبيق باستخدام الكاميرا",
      });
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
    
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // This is a placeholder for actual barcode scanning library
        // In a real implementation, you'd use a library like jsQR or similar
        // For the purposes of this demo, we'll just pretend to scan after a delay
        setTimeout(() => {
          if (scanning) {
            // Simulate finding a code
            const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            processScannedCode(simulatedCode);
          }
        }, 2000);
      }
    }
    
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
        title: "تم تسجيل الحضور",
        description: `تم تسجيل حضور الطالب ${student.name}`
      });
    } else {
      toast({
        variant: "destructive",
        title: "كود غير صالح",
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
          title: "تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${student.name}`
        });
        setScannedCode("");
      } else {
        toast({
          variant: "destructive",
          title: "كود غير صالح",
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
              className="w-full rounded-lg"
              playsInline
              muted
            ></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <button 
              onClick={stopScanner}
              className="absolute top-2 right-2 p-2 bg-physics-navy rounded-full"
            >
              <X className="text-white" size={24} />
            </button>
            <div className="absolute inset-0 border-2 border-physics-gold rounded-lg"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center p-6">
            <button 
              onClick={startScanner}
              className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-3 px-6 font-bold"
            >
              <Camera size={24} />
              <span>مسح الكود</span>
            </button>
            
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
                  className="inputField"
                />
              </div>
              <button 
                type="submit" 
                className="goldBtn w-full"
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
