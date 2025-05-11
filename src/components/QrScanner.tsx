
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
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const { getStudentByCode } = useAuth();
  const { addAttendance } = useData();
  
  // تحسين وظائف الوصول للكاميرا
  const startScanner = async () => {
    try {
      // إعادة ضبط حالة الأذونات قبل المحاولة
      setPermissionDenied(false);
      setCameraReady(false);
      
      console.log("محاولة الوصول للكاميرا...");
      
      // محاولة الوصول للكاميرا الخلفية أولاً ثم الأمامية إذا لم تتوفر
      let stream;
      try {
        // محاولة استخدام الكاميرا الخلفية أولاً (المفضلة لمسح الباركود)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log("تم الوصول للكاميرا الخلفية بنجاح");
      } catch (err) {
        // إذا فشلت الكاميرا الخلفية، حاول استخدام أي كاميرا متاحة
        console.log("فشل الوصول للكاميرا الخلفية، محاولة استخدام كاميرا أخرى:", err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        console.log("تم الوصول لكاميرا بديلة بنجاح");
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            console.log("بدأ تشغيل الفيديو بنجاح");
            setScanning(true);
            setCameraReady(true);
            scanCode();
          }).catch(e => {
            console.error("فشل في تشغيل الفيديو:", e);
            toast({
              variant: "destructive",
              title: "❌ خطأ في تشغيل الكاميرا",
              description: "يرجى السماح بتشغيل الفيديو أو استخدام متصفح آخر"
            });
          });
        };
      }
    } catch (err) {
      console.error("خطأ في الوصول للكاميرا:", err);
      setPermissionDenied(true);
      
      // رسائل خطأ محددة حسب نوع المشكلة
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          toast({
            variant: "destructive",
            title: "❌ تم رفض الوصول للكاميرا",
            description: "يرجى السماح للتطبيق باستخدام الكاميرا من إعدادات المتصفح ثم المحاولة مرة أخرى"
          });
        } else if (err.name === "NotFoundError") {
          toast({
            variant: "destructive",
            title: "❌ لا توجد كاميرا",
            description: "لم يتم العثور على كاميرا متصلة بجهازك"
          });
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          toast({
            variant: "destructive",
            title: "❌ الكاميرا غير متاحة",
            description: "الكاميرا قيد الاستخدام من قبل تطبيق آخر، أغلق أي تطبيقات تستخدم الكاميرا"
          });
        } else {
          toast({
            variant: "destructive",
            title: "❌ خطأ في الكاميرا",
            description: "حدث خطأ أثناء محاولة الوصول للكاميرا: " + err.name
          });
        }
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
      setCameraReady(false);
      console.log("تم إيقاف الماسح الضوئي");
    }
  };

  // تحسين وظيفة مسح الكود
  const scanCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    requestAnimationFrame(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // رسم الفيديو على الكانفاس
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            // الحصول على بيانات الصورة من الكانفاس
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // محاولة التعرف على كود QR في الصورة
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            
            if (code) {
              console.log("تم العثور على كود QR:", code.data);
              // تم العثور على الكود
              processScannedCode(code.data);
              return;
            }
          } catch (e) {
            console.error("خطأ في معالجة الصورة:", e);
          }
        }
      }
      
      // استمرار المسح إذا لم يتم العثور على كود
      if (scanning) {
        scanCode();
      }
    });
  };

  const processScannedCode = (code: string) => {
    setScannedCode(code);
    stopScanner();
    
    const student = getStudentByCode(code);
    if (student) {
      addAttendance(student.id, student.name, "present");
      // تشغيل صوت تأكيد
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
    // تنظيف عند مغادرة المكون
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
        // تشغيل صوت تأكيد
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
            
            {cameraReady ? (
              <div className="absolute inset-0 pointer-events-none border-2 border-physics-gold rounded-lg flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-physics-gold/70 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-physics-gold"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-physics-gold"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-physics-gold"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-physics-gold"></div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm absolute mt-16">جاري تجهيز الكاميرا...</p>
              </div>
            )}
            
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
                تم رفض الوصول للكاميرا. يرجى التحقق من الإعدادات التالية:
                <ul className="text-right list-disc list-inside mt-2">
                  <li>السماح للمتصفح باستخدام الكاميرا</li>
                  <li>فتح الموقع بـ HTTPS</li>
                  <li>تجربة متصفح آخر (كروم أو سفاري)</li>
                </ul>
                <button
                  onClick={startScanner}
                  className="mt-2 w-full py-2 bg-physics-gold text-physics-navy rounded-md font-bold"
                >
                  إعادة المحاولة
                </button>
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
