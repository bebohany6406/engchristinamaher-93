import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PhysicsBackground from "./components/PhysicsBackground";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import "./App.css";

// استيراد خط Tajawal للنص العربي
import "@fontsource/tajawal/400.css"; 
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";

// إنشاء عنصر أنماط للخط
const tajawalFontStyles = document.createElement("style");
tajawalFontStyles.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
  
  * {
    font-family: 'Tajawal', sans-serif;
  }
  
  .font-tajawal {
    font-family: 'Tajawal', sans-serif;
  }
  
  /* تجاوز تصميم الإخطارات - جعلها غير شفافة */
  .toast-root {
    background-color: #171E31 !important;
    border: 1px solid #D4AF37 !important;
    color: white !important;
    opacity: 1 !important;
  }
  
  /* إشعارات غير شفافة */
  [data-sonner-toast] {
    opacity: 1 !important;
    background-color: #171E31 !important;
    border: 1px solid #D4AF37 !important;
  }
  
  /* أزرار مستديرة */
  .goldBtn {
    border-radius: 24px !important;
  }
  
  /* تحسين جودة الصورة */
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  /* مشغل فيديو أفضل */
  video {
    object-fit: contain;
  }
`;
document.head.appendChild(tajawalFontStyles);

const queryClient = new QueryClient();

const App = () => {
  // طلب الأذونات عند تحميل التطبيق
  useEffect(() => {
    const requestPermissions = async () => {
      // طلب إذن الإشعارات
      if ('Notification' in window && Notification.permission !== 'granted') {
        try {
          const permission = await Notification.requestPermission();
          console.log("Notification permission:", permission);
        } catch (error) {
          console.error("خطأ في طلب إذن الإشعارات:", error);
        }
      }
      
      // محاولة اكتشاف اتجاه الجهاز للحصول على الأذونات
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          await (DeviceOrientationEvent as any).requestPermission();
        } catch (error) {
          console.log("خطأ في إذن توجيه الجهاز:", error);
        }
      }
      
      // طلب إذن الكاميرا إذا كان متاحًا
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // طلب أذونات الصوت/الفيديو
          await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
              // إيقاف جميع المسارات لتحرير الكاميرا/الميكروفون
              stream.getTracks().forEach(track => track.stop());
            });
        } catch (error) {
          console.log("خطأ في أذونات الوسائط:", error);
        }
      }
    };
    
    // استدعاء وظيفة طلب الأذونات
    requestPermissions();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner 
                toastOptions={{
                  style: {
                    background: '#171E31',
                    color: 'white',
                    border: '1px solid #D4AF37',
                    borderRadius: '12px',
                    opacity: '1',
                  },
                  duration: 6000 // جعل الإشعارات تظهر لمدة 6 ثوانٍ
                }} 
              />
              <div className="relative min-h-screen font-tajawal">
                <PhysicsBackground />
                <div className="relative z-10">
                  <AppRoutes />
                </div>
              </div>
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
