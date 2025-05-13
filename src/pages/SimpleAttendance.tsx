
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, Camera, QrCode, UserCheck } from "lucide-react";
import { Html5QrScanner } from "@/components/scanner/Html5QrScanner";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
import { toast } from "@/hooks/use-toast";

const SimpleAttendance = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>("");
  const [successfulScans, setSuccessfulScans] = useState<string[]>([]);
  
  const handleScanSuccess = (code: string) => {
    setScannedCode(code);
    setShowScanner(false);
    setSuccessfulScans(prev => [...prev, code]);
  };
  
  const handleStartScanning = () => {
    setShowScanner(true);
    toast({
      title: "جاري تشغيل الكاميرا",
      description: "وجه الكاميرا إلى رمز QR أو Barcode للطالب"
    });
  };
  
  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 relative z-10">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold text-physics-gold text-center mb-6">تسجيل الحضور بالباركود</h1>
          
          {showScanner ? (
            <div className="mb-6">
              {/* عرض ماسح باستخدام HTML5 QR Scanner */}
              <Html5QrScanner
                onScanSuccess={handleScanSuccess}
                onClose={handleCloseScanner}
              />
              <p className="text-white text-center mt-4">
                وجّه الكاميرا نحو باركود أو رمز QR للطالب
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-6">
              <button 
                onClick={handleStartScanning}
                className="flex items-center justify-center gap-2 bg-physics-gold text-physics-navy rounded-full py-4 px-6 font-bold shadow-lg hover:bg-physics-gold/90 transition-all transform active:scale-95 w-full md:w-3/4 text-lg mb-4"
              >
                <Camera size={24} />
                <span>📷 مسح الكود بالكاميرا</span>
              </button>
              
              <p className="text-white text-sm mb-2">
                اضغط على الزر لبدء مسح رمز QR أو الباركود الخاص بالطالب
              </p>
            </div>
          )}
          
          {/* عرض الرموز التي تم مسحها بنجاح */}
          {successfulScans.length > 0 && (
            <div className="bg-physics-dark p-4 rounded-lg mt-6">
              <h2 className="text-xl font-bold text-physics-gold mb-4">تم تسجيل حضور</h2>
              <div className="space-y-2">
                {successfulScans.map((code, index) => (
                  <div key={`${code}-${index}`} className="flex items-center gap-2 bg-physics-navy/50 p-3 rounded-lg">
                    <UserCheck className="text-green-500" size={20} />
                    <span className="text-white">كود الطالب: {code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimpleAttendance;
