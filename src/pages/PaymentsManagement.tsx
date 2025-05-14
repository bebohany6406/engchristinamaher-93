import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, DollarSign, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { usePayments } from "@/hooks/use-payments";
import { PaymentsList } from "@/components/PaymentsList";
import { PaymentForm } from "@/components/PaymentForm";
import { Payment } from "@/types";

const PaymentsManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { payments, debugPaymentsState, deletePayment } = usePayments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [recentPayment, setRecentPayment] = useState<Payment | null>(null);
  
  // Filter payments based on user type
  useEffect(() => {
    if (!currentUser) {
      setFilteredPayments([]);
      return;
    }

    // Make sure data is loaded from local storage
    const state = debugPaymentsState();
    console.log("Payments data:", state);
    
    if (currentUser.role === "admin") {
      // Admin sees all payments
      setFilteredPayments(payments);
    } else if (currentUser.role === "student") {
      // Student sees only their payments
      const studentPayments = payments.filter(payment => payment.studentId === currentUser.id);
      setFilteredPayments(studentPayments);
    } else if (currentUser.role === "parent") {
      // Parent sees their child's payments
      const associatedStudent = currentUser.name.replace("ولي أمر ", "");
      const studentPayments = payments.filter(payment => payment.studentName === associatedStudent);
      setFilteredPayments(studentPayments);
    }
  }, [currentUser, payments, debugPaymentsState]);
  
  // Check user permissions
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
    // Show the newest payment
    setRecentPayment(payment);
    // We'll need to manually update the payments list to show changes immediately
    debugPaymentsState(); // Check data in console
  };
  
  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm("هل أنت متأكد من حذف سجل الدفع هذا؟ لا يمكن التراجع عن هذه العملية.")) {
      const result = await deletePayment(paymentId);
      
      if (result.success) {
        // Update the filtered payments list immediately
        setFilteredPayments(prevPayments => prevPayments.filter(payment => payment.id !== paymentId));
        
        toast({
          title: "✅ تم الحذف",
          description: "تم حذف سجل الدفع بنجاح",
        });
      } else {
        toast({
          title: "❌ خطأ في الحذف",
          description: result.message,
          variant: "destructive"
        });
      }
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
            <h1 className="text-2xl font-bold text-physics-gold">إدارة المدفوعات</h1>
            
            {/* Show add payment button for admin only */}
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
          
          {/* Payment form (admin only) */}
          {showAddForm && currentUser?.role === "admin" && (
            <PaymentForm 
              onClose={() => setShowAddForm(false)} 
              onPaymentAdded={handlePaymentAdded}
            />
          )}
          
          {/* Show newest added payment */}
          {recentPayment && (
            <div className="bg-physics-gold/10 border border-physics-gold rounded-lg p-4 mb-6">
              <h2 className="text-physics-gold font-bold mb-2">تم إضافة دفعة جديدة</h2>
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
          
          {/* Payments list */}
          <div className="bg-physics-dark rounded-lg overflow-hidden mt-6">
            <PaymentsList 
              payments={filteredPayments} 
              onDeletePayment={currentUser?.role === "admin" ? handleDeletePayment : undefined} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentsManagement;
