
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePayments } from "@/hooks/use-payments";
import { PaymentsList } from "@/components/PaymentsList";
import { PaymentForm } from "@/components/PaymentForm";
import { Payment } from "@/types";

const PaymentsManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { payments, getAllPayments } = usePayments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh of payments list
  const handlePaymentAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
    toast({
      title: "✅ تم التحديث",
      description: "تم تحديث قائمة المدفوعات بنجاح",
    });
  };
  
  // فلترة المدفوعات حسب نوع المستخدم
  useEffect(() => {
    if (!currentUser) {
      setFilteredPayments([]);
      return;
    }

    // Get fresh payments data
    const latestPayments = getAllPayments();
    console.log("Latest payments in PaymentsManagement:", latestPayments);

    if ((currentUser as any).role === "admin") {
      // المدير يرى جميع المدفوعات
      console.log("Admin view - all payments:", latestPayments);
      setFilteredPayments([...latestPayments]);
    } else if ((currentUser as any).role === "student") {
      // الطالب يرى مدفوعاته فقط
      const studentPayments = latestPayments.filter(payment => payment.studentId === (currentUser as any).id);
      console.log("Student view - filtered payments:", studentPayments);
      setFilteredPayments(studentPayments);
    } else if ((currentUser as any).role === "parent") {
      // ولي الأمر يرى مدفوعات الطالب التابع له
      const associatedStudent = (currentUser as any).studentName;
      const studentPayments = latestPayments.filter(payment => payment.studentName === associatedStudent);
      console.log("Parent view - filtered payments:", studentPayments);
      setFilteredPayments(studentPayments);
    }
  }, [currentUser, payments, refreshKey]);
  
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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">إدارة المدفوعات</h1>
            
            {/* إظهار زر إضافة دفع جديد للمدير فقط */}
            {(currentUser as any)?.role === "admin" && (
              <button 
                onClick={() => setShowAddForm(true)} 
                className="goldBtn flex items-center gap-2"
              >
                <DollarSign size={18} />
                <span>دفع شهر جديد</span>
              </button>
            )}
          </div>
          
          {/* نموذج إضافة دفعة (للمدير فقط) */}
          {showAddForm && (currentUser as any)?.role === "admin" && (
            <PaymentForm 
              onClose={() => setShowAddForm(false)} 
              onPaymentAdded={handlePaymentAdded}
            />
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
