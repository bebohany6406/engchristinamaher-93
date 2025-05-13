import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, QrCode, ClipboardList, Users } from "lucide-react";
import { PhoneContact } from "@/components/PhoneContact";
import { ManualAttendance } from "@/components/ManualAttendance";
import PhysicsBackground from "@/components/PhysicsBackground";
const ScanCode = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 relative z-10">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold text-physics-gold text-center mb-6">تسجيل الحضور والغياب</h1>
          
          <div className="space-y-6">
            {/* تسجيل الحضور بالباركود */}
            <div className="bg-physics-dark p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4 text-physics-gold">تسجيل الحضور يدوي و بالباركود</h2>
              <div className="flex flex-col space-y-4">
                <button onClick={() => navigate("/simple-attendance")} className="goldBtn flex items-center justify-center gap-2">
                  <QrCode size={20} />
                  <span>فتح ماسح الباركود</span>
                </button>
              </div>
            </div>
            
            {/* تسجيل الحضور اليدوي */}
            <div className="bg-physics-dark p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-physics-gold">تسجيل الغياب يدوياً</h2>
              <div className="flex flex-col space-y-4">
                <ManualAttendance />
                
                {/* زر للانتقال إلى صفحة تسجيل الحضور لجميع الطلاب */}
                <div className="mt-4">
                  <button onClick={() => navigate("/manual-attendance-all")} className="w-full flex items-center justify-center gap-2 bg-physics-navy hover:bg-physics-navy/80 text-white py-3 px-4 rounded-lg">
                    <Users size={20} />
                    <span className="">تسجيل الحضور/الغياب تلقائي</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* عرض سجل الحضور */}
            
          </div>
        </div>
      </main>
    </div>;
};
export default ScanCode;