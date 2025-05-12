
import React, { useRef, useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/use-payments";
import { Camera, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsQR from "jsqr";

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<{paid: boolean, studentName?: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { getStudentByCode } = useAuth();
  const { addAttendance, getStudentLessonCount } = useData();
  const { hasStudentPaidForCurrentLesson } = usePayments();
  
  const requestCameraPermission = async () => {
    try {
      // Request camera permission explicitly
      const result = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // If we get here, permission was granted
      return true;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionDenied(true);
      toast({
        variant: "destructive",
        title: "❌ تم رفض الوصول للكاميرا",
        description: "يرجى السماح للتطبيق باستخدام الكاميرا من إعدادات الجهاز",
      });
      return false;
    }
  };
  
  const startScanner = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        setPermissionDenied(false);
        scanCode();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionDenied(true);
      toast({
        variant: "destructive",
        title: "❌ فشل الوصول للكاميرا",
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

  const processScannedCode = async (code: string) => {
    setScannedCode(code);
    stopScanner();
    setIsProcessing(true);
    
    try {
      const student = await getStudentByCode(code);
      if (student) {
        // Get current lesson count for the student
        const lessonCount = getStudentLessonCount(student.id) + 1; // +1 because we're adding a new attendance
        
        // Check if student has paid for this lesson
        const hasPaid = hasStudentPaidForCurrentLesson(student.id, lessonCount);
        
        // Update payment status state
        setPaymentStatus({
          paid: hasPaid,
          studentName: student.name
        });
        
        // Record attendance regardless of payment status
        addAttendance(student.id, student.name, "present", lessonCount);
        
        // Play sound effect
        const audio = new Audio("/attendance-present.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${student.name}${!hasPaid ? ' (غير مدفوع)' : ''}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود"
        });
      }
    } catch (error) {
      console.error("Error processing scanned code:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء معالجة الكود"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const student = await getStudentByCode(scannedCode);
      if (student) {
        // Get current lesson count for the student
        const lessonCount = getStudentLessonCount(student.id) + 1; // +1 because we're adding a new attendance
        
        // Check if student has paid for this lesson
        const hasPaid = hasStudentPaidForCurrentLesson(student.id, lessonCount);
        
        // Update payment status state
        setPaymentStatus({
          paid: hasPaid,
          studentName: student.name
        });
        
        // Record attendance regardless of payment status
        addAttendance(student.id, student.name, "present", lessonCount);
        
        // Play sound effect
        const audio = new Audio("/attendance-present.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${student.name}${!hasPaid ? ' (غير مدفوع)' : ''}`
        });
        setScannedCode("");
      } else {
        toast({
          variant: "destructive",
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود"
        });
      }
    } catch (error) {
      console.error("Error processing manual entry:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء معالجة الكود"
      });
    } finally {
      setIsProcessing(false);
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
              autoPlay
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
              className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-3 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-colors"
              disabled={isProcessing}
            >
              <Camera size={24} />
              <span>مسح الكود بالكاميرا</span>
            </button>
            
            {permissionDenied && (
              <div className="mt-4 p-3 bg-red-500/20 text-white rounded-lg text-sm text-center">
                تم رفض الوصول للكاميرا. يرجى تفعيل الكاميرا من إعدادات الجهاز ثم المحاولة مرة أخرى.
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
                  disabled={isProcessing}
                />
              </div>
              <button 
                type="submit" 
                className="goldBtn w-full rounded-full shadow-lg"
                disabled={!scannedCode || isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-physics-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>جاري المعالجة...</span>
                  </div>
                ) : (
                  "تسجيل الحضور"
                )}
              </button>
            </form>
          </div>
        )}
        
        {/* Payment status display */}
        {paymentStatus && (
          <div className={`mt-4 p-3 rounded-lg text-center ${paymentStatus.paid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className="flex items-center justify-center gap-2">
              {paymentStatus.paid ? (
                <CheckCircle2 className="text-green-400" size={20} />
              ) : (
                <AlertCircle className="text-red-400" size={20} />
              )}
              <p className="text-white font-bold">
                {paymentStatus.studentName}
              </p>
            </div>
            <p className="text-sm text-white mt-1">
              {paymentStatus.paid 
                ? 'الطالب مدفوع الاشتراك للدرس الحالي' 
                : 'الطالب غير مدفوع الاشتراك للدرس الحالي'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
