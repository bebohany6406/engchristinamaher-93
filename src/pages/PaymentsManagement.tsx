
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PaymentsManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { payments, debugPaymentsState, deletePayment } = usePayments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [recentPayment, setRecentPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // فلترة المدفوعات حسب نوع المستخدم
  useEffect(() => {
    if (!currentUser) {
      setFilteredPayments([]);
      return;
    }

    // تأكد من تحميل البيانات من المخزن المحلي
    const state = debugPaymentsState();
    console.log("Payments data:", state);
    
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
    // سنحتاج لتحديث قائمة المدفوعات يدوياً هنا لعرض التغييرات على الفور
    debugPaymentsState(); // للتحقق من البيانات في الكونسول
  };
  
  const confirmDeletePayment = (paymentId: string) => {
    setPaymentToDelete(paymentId);
  };
  
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // تشغيل الصوت عند الحذف
      const audio = new Audio("/scan-success.mp3");
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      // حذف السجل من قاعدة البيانات
      console.log("Attempting to delete payment:", paymentToDelete);
      const result = await deletePayment(paymentToDelete);
      
      if (result.success) {
        // تحديث القائمة بعد الحذف مباشرة
        setFilteredPayments(prevPayments => prevPayments.filter(p => p.id !== paymentToDelete));
        
        // التحقق من أن الحذف تم بنجاح
        console.log("Payment deleted successfully. Updated payments list");
        
        toast({
          title: "✅ تم الحذف",
          description: "تم حذف سجل الدفع بنجاح",
        });
      } else {
        toast({
          title: "❌ خطأ في الحذف",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error in payment deletion:", error);
      toast({
        title: "❌ خطأ",
        description: `فشل في حذف السجل: ${error.message || "خطأ غير معروف"}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPaymentToDelete(null);
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
          
          {/* قائمة المدفوعات */}
          <div className="bg-physics-dark rounded-lg overflow-hidden mt-6">
            <PaymentsList 
              payments={filteredPayments} 
              onDeletePayment={currentUser?.role === "admin" ? confirmDeletePayment : undefined} 
            />
          </div>
        </div>
      </main>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={() => !isDeleting && setPaymentToDelete(null)}>
        <AlertDialogContent className="bg-physics-dark border border-physics-gold text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-physics-gold">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              هل أنت متأكد من حذف سجل الدفع هذا؟ لا يمكن التراجع عن هذه العملية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting} 
              className="bg-transparent border border-gray-400 text-gray-300 hover:bg-physics-navy"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePayment}
              disabled={isDeleting}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentsManagement;
