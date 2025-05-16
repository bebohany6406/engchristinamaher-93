import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, DollarSign, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePayments } from "@/hooks/use-payments";
import { PaymentsList } from "@/components/PaymentsList";
import { PaymentForm } from "@/components/PaymentForm";
import { Payment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
const PaymentsManagement = () => {
  const navigate = useNavigate();
  const {
    currentUser
  } = useAuth();
  const {
    payments,
    debugPaymentsState,
    refreshPayments
  } = usePayments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [recentPayment, setRecentPayment] = useState<Payment | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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
        variant: "destructive"
      });
      navigate("/unauthorized");
    }
  }, [currentUser, navigate]);
  const handlePaymentAdded = (payment: Payment) => {
    // عند إضافة دفعة جديدة، نعرضها كأحدث دفعة
    setRecentPayment(payment);
  };

  // وظيفة حذف جميع المدفوعات
  const handleDeleteAllPayments = async () => {
    if (currentUser?.role !== "admin") {
      toast({
        title: "غير مصرح",
        description: "لا يمكن إلا للمدير حذف جميع المدفوعات",
        variant: "destructive"
      });
      return;
    }
    setIsDeletingAll(true);
    try {
      // حذف جميع الأشهر المدفوعة أولاً
      const {
        error: paidMonthsError
      } = await supabase.from('paid_months').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // حذف جميع السجلات

      if (paidMonthsError) {
        console.error("Error deleting all paid months:", paidMonthsError);
        toast({
          title: "خطأ في حذف الأشهر المدفوعة",
          description: paidMonthsError.message,
          variant: "destructive"
        });
        return;
      }

      // ثم حذف جميع سجلات المدفوعات
      const {
        error: paymentsError
      } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // حذف جميع السجلات

      if (paymentsError) {
        console.error("Error deleting all payments:", paymentsError);
        toast({
          title: "خطأ في حذف سجلات المدفوعات",
          description: paymentsError.message,
          variant: "destructive"
        });
        return;
      }

      // تحديث الحالة المحلية بعد الحذف
      setFilteredPayments([]);

      // إعادة تحميل البيانات من Supabase
      await refreshPayments();
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف جميع سجلات المدفوعات والأشهر المدفوعة المرتبطة بنجاح"
      });
      console.log("All payments deleted successfully");
    } catch (error: any) {
      console.error("Error deleting all payments:", error);
      toast({
        title: "خطأ في الحذف",
        description: `حدث خطأ أثناء محاولة حذف جميع المدفوعات: ${error.message || 'خطأ غير معروف'}`,
        variant: "destructive"
      });
    } finally {
      setIsDeletingAll(false);
    }
  };
  return <div className="min-h-screen bg-physics-navy flex flex-col">
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
            
            <div className="flex flex-wrap gap-2">
              {/* إظهار زر إضافة دفع جديد للمدير فقط */}
              {currentUser?.role === "admin" && <>
                  <button onClick={() => setShowAddForm(true)} className="goldBtn flex items-center gap-2">
                    <DollarSign size={18} />
                    <span>دفع شهر جديد</span>
                  </button>
                  
                  {/* زر حذف جميع المدفوعات */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-physics-dark border-physics-navy text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-500">تأكيد حذف جميع المدفوعات</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          هل أنت متأكد من رغبتك في حذف جميع سجلات المدفوعات والأشهر المدفوعة نهائياً من قاعدة البيانات؟
                          <br />
                          <span className="text-red-400 block mt-2 font-bold">
                            تحذير: هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع سجلات المدفوعات بشكل نهائي!
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-physics-navy text-white hover:bg-physics-navy/80">
                          إلغاء
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteAllPayments}>
                          حذف نهائي لجميع المدفوعات
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>}
            </div>
          </div>
          
          {/* نموذج إضافة دفعة (للمدير فقط) */}
          {showAddForm && currentUser?.role === "admin" && <PaymentForm onClose={() => setShowAddForm(false)} onPaymentAdded={handlePaymentAdded} />}
          
          {/* عرض أحدث دفعة تم إضافتها */}
          {recentPayment && <div className="bg-physics-gold/10 border border-physics-gold rounded-lg p-4 mb-6">
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
                    {recentPayment.paidMonths.map((month, index) => <span key={index} className="bg-physics-navy px-2 py-1 rounded-full text-xs text-white">
                        {month.month}
                      </span>)}
                  </div>
                </div>
              </div>
            </div>}
          
          {/* قائمة المدفوعات */}
          <div className="bg-physics-dark rounded-lg overflow-hidden mt-6">
            <PaymentsList payments={filteredPayments} />
          </div>
        </div>
      </main>
    </div>;
};
export default PaymentsManagement;