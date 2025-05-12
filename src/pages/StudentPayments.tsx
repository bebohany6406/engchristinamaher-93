
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/use-payments";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Payment } from "@/types";

const StudentPayments = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getStudentPayments } = usePayments();
  const [studentPayment, setStudentPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "❌ غير مصرح",
        description: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (currentUser.role !== "student") {
      toast({
        title: "❌ غير مصرح",
        description: "هذه الصفحة متاحة للطلاب فقط",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    // الحصول على مدفوعات الطالب الحالي
    const payment = getStudentPayments(currentUser.id);
    if (payment) {
      setStudentPayment(payment);
    }
  }, [currentUser, navigate, getStudentPayments]);

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">سجل المدفوعات</h1>
            <p className="text-gray-300 mt-2">يمكنك مراجعة سجل مدفوعاتك هنا</p>
          </div>
          
          {/* عرض المدفوعات */}
          <div className="bg-physics-dark rounded-lg overflow-hidden">
            {!studentPayment ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا توجد مدفوعات مسجلة</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-medium text-white">{studentPayment.studentName}</h2>
                  <div className="flex items-center text-sm text-gray-300">
                    <span>كود: {studentPayment.studentCode}</span>
                    <span className="mx-2">|</span>
                    <span>المجموعة: {studentPayment.group}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-physics-gold flex items-center mb-3">
                    <Calendar size={18} className="ml-2" />
                    الأشهر المدفوعة
                  </h3>
                  
                  {studentPayment.paidMonths.length === 0 ? (
                    <p className="text-gray-400">لا توجد أشهر مدفوعة حتى الآن</p>
                  ) : (
                    <div className="space-y-3">
                      {studentPayment.paidMonths.map((paidMonth, index) => (
                        <div key={index} className="bg-physics-navy/50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{paidMonth.month}</span>
                            <span className="text-xs text-gray-400">تاريخ الدفع: {formatDate(paidMonth.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-physics-navy/30 rounded-lg">
                  <div className="flex items-center text-physics-gold">
                    <span className="mr-2">
                      <Calendar size={18} />
                    </span>
                    <span>آخر دفعة: {formatDate(studentPayment.date)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPayments;
