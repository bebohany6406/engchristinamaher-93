
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-physics-navy">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Logo />
            <h1 className="text-3xl font-bold text-physics-gold mb-2">فيزياء المرحلة الثانوية</h1>
            <p className="text-white opacity-80 mb-8">تطبيق متكامل لدروس الفيزياء والمتابعة التعليمية</p>
          </div>

          <div className="space-y-4">
            <button
              className="goldBtn w-full"
              onClick={() => navigate("/login")}
            >
              تسجيل الدخول
            </button>
            
            <p className="text-center text-white mt-8">
              تطبيق تعليمي متكامل لطلاب المرحلة الثانوية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
