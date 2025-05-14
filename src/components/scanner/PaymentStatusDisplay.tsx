
import React from "react";
import { CheckCircle2, AlertCircle, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentStatusDisplayProps {
  paymentStatus: {
    paid: boolean;
    studentName?: string;
    studentId?: string;
    group?: string;
    studentCode?: string;
    lessonNumber?: number;
  } | null;
}

export function PaymentStatusDisplay({ paymentStatus }: PaymentStatusDisplayProps) {
  const navigate = useNavigate();
  
  if (!paymentStatus) return null;
  
  const handlePaymentClick = () => {
    if (paymentStatus.studentId && paymentStatus.studentName && paymentStatus.group && paymentStatus.studentCode) {
      // Navigate to payments page with student info
      navigate(`/payments?studentId=${paymentStatus.studentId}&name=${encodeURIComponent(paymentStatus.studentName)}&group=${encodeURIComponent(paymentStatus.group)}&code=${paymentStatus.studentCode}`);
    }
  };
  
  // Calculate which month they need to pay (based on lesson number)
  const currentMonth = paymentStatus.lessonNumber ? Math.ceil(paymentStatus.lessonNumber / 8) : 1;
  
  return (
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
          ? `الطالب مدفوع الاشتراك للدرس الحالي (الحصة ${paymentStatus.lessonNumber})` 
          : `الطالب غير مدفوع الاشتراك للدرس الحالي (الحصة ${paymentStatus.lessonNumber}) - يرجى التنبيه`}
      </p>
      
      {/* Add payment button for students who haven't paid */}
      {!paymentStatus.paid && (
        <button 
          onClick={handlePaymentClick} 
          className="mt-3 bg-physics-gold text-physics-navy px-4 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto"
        >
          <WalletCards size={18} />
          <span>دفع الشهر {currentMonth}</span>
        </button>
      )}
    </div>
  );
}
