
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, DollarSign, Download, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePayments } from "@/hooks/use-payments";
import { PaymentsList } from "@/components/PaymentsList";
import { PaymentForm } from "@/components/PaymentForm";
import { Payment } from "@/types";
import { backupAllData } from "@/integrations/supabase/client";

const PaymentsManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { payments, debugPaymentsState } = usePayments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [recentPayment, setRecentPayment] = useState<Payment | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  // فلترة المدفوعات حسب نوع المستخدم
  useEffect(() => {
    if (!currentUser) {
      setFilteredPayments([]);
      return;
    }

    // تأكد من تحميل البيانات من Supabase
    const state = debugPaymentsState();
    console.log("Payments data from Supabase:", state);
    
    if (currentUser.role === "admin") {
      // المدير يرى جميع المدفوعات
      setFilteredPayments(payments);
    } else if (currentUser.role === "student") {
      // الطالب يرى مدفوعاته فقط
      const studentPayments = payments.filter(payment => payment.studentId === currentUser.id);
      setFilteredPayments(studentPayments);
    } else if (currentUser.role === "parent") {
      // ولي الأمر يرى مدفوعات الطالب التابع له
      const associatedStudent = currentUser.name.replace("ولي أمر ", "");
      const studentPayments = payments.filter(payment => payment.studentName === associatedStudent);
      setFilteredPayments(studentPayments);
    }
  }, [currentUser, payments, debugPaymentsState]);
  
  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "غير مصرح",
        description: "يجب تسجيل الدخول للوصول لهذه الصفحة",
        variant: "destructive",
      });
      navigate("/unauthorized");
    }
  }, [currentUser, navigate]);

  const handlePaymentAdded = (payment: Payment) => {
    // عند إضافة دفعة جديدة، نعرضها كأحدث دفعة
    setRecentPayment(payment);
    toast({
      title: "تم الحفظ في Supabase",
      description: "تم حفظ الدفعة بنجاح في قاعدة البيانات",
    });
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await backupAllData();
      if (result.success) {
        toast({
          title: "✅ تم إنشاء النسخة الاحتياطية",
          description: "تم تحميل ملف النسخة الاحتياطية بنجاح",
        });
      } else {
        toast({
          title: "❌ خطأ في النسخ الاحتياطي",
          description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-physics-gold">إدارة المدفوعات</h1>
              <p className="text-sm text-physics-gold/70 flex items-center gap-1 mt-1">
                <Database size={16} />
                جميع البيانات محفوظة في Supabase
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* زر النسخ الاحتياطي للمدير */}
              {currentUser?.role === "admin" && (
                <button 
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Download size={18} />
                  <span>{isBackingUp ? "جاري النسخ..." : "نسخ احتياطي"}</span>
                </button>
              )}
              
              {/* إظهار زر إضافة دفع جديد للمدير فقط */}
              {currentUser?.role === "admin" && (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="goldBtn flex items-center gap-2"
                >
                  <DollarSign size={18} />
                  <span>دفع شهر جديد</span>
                </button>
              )}
            </div>
          </div>
          
          {/* نموذج إضافة دفعة (للمدير فقط) */}
          {showAddForm && currentUser?.role === "admin" && (
            <PaymentForm 
              onClose={() => setShowAddForm(false)} 
              onPaymentAdded={handlePaymentAdded}
            />
          )}
          
          {/* عرض أحدث دفعة تم إضافتها */}
          {recentPayment && (
            <div className="bg-physics-gold/10 border border-physics-gold rounded-lg p-4 mb-6">
              <h2 className="text-physics-gold font-bold mb-2 flex items-center gap-2">
                <Database size={16} />
                تم حفظ دفعة جديدة في Supabase
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-400 block text-sm">الطالب:</span>
                  <span className="text-white">{recentPayment.studentName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">كود الطالب:</span>
                  <span className="text-white">{recentPayment.studentCode}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">المجموعة:</span>
                  <span className="text-white">{recentPayment.group}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">الشهر المدفوع:</span>
                  <span className="text-white">{recentPayment.month}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-sm">الأشهر المدفوعة:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recentPayment.paidMonths.map((month, index) => (
                      <span key={index} className="bg-physics-navy px-2 py-1 rounded-full text-xs text-white">
                        {month.month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* قائمة المدفوعات */}
          <div className="bg-physics-dark rounded-lg overflow-hidden mt-6">
            <PaymentsList payments={filteredPayments} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentsManagement;
