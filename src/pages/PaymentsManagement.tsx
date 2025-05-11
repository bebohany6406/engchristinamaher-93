
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Search, Calendar, User, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePayments } from "@/hooks/use-payments";
import { PaymentsList } from "@/components/PaymentsList";
import { PaymentForm } from "@/components/PaymentForm";

const PaymentsManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { payments } = usePayments();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية الوصول لهذه الصفحة",
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">إدارة المدفوعات</h1>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="goldBtn flex items-center gap-2"
            >
              <DollarSign size={18} />
              <span>دفع شهر جديد</span>
            </button>
          </div>
          
          {/* نموذج إضافة دفعة */}
          {showAddForm && (
            <PaymentForm onClose={() => setShowAddForm(false)} />
          )}
          
          {/* قائمة المدفوعات */}
          <div className="bg-physics-dark rounded-lg overflow-hidden mt-6">
            <PaymentsList payments={payments} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentsManagement;
