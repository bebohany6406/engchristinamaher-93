
import { useState } from "react";
import { Calendar, Search, Trash2 } from "lucide-react";
import { Payment } from "@/types";
import { sanitizeSearchText } from "@/lib/utils";
import { usePayments } from "@/hooks/use-payments";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaymentsListProps {
  payments: Payment[];
}

export function PaymentsList({ payments }: PaymentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"name" | "code" | "group">("name");
  const { deletePayment } = usePayments();
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // تصفية المدفوعات حسب البحث
  const filteredPayments = payments.filter(payment => {
    const query = sanitizeSearchText(searchQuery);
    if (!query) return true;
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(payment.studentName).includes(query);
      case "code":
        return sanitizeSearchText(payment.studentCode).includes(query);
      case "group":
        return sanitizeSearchText(payment.group).includes(query);
      default:
        return true;
    }
  });

  // وظيفة حذف سجل الدفع
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deletePayment(paymentToDelete.id);
      
      if (result.success) {
        toast({
          title: "تم الحذف بنجاح",
          description: `تم حذف سجل الدفع الخاص بالطالب ${paymentToDelete.studentName} نهائياً`,
        });
      } else {
        toast({
          title: "خطأ في الحذف",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      toast({
        title: "خطأ في الحذف",
        description: `حدث خطأ أثناء محاولة حذف سجل الدفع: ${error.message || 'خطأ غير معروف'}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPaymentToDelete(null);
    }
  };

  return (
    <div>
      {/* حقل البحث مع اختيار نوع البحث */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <select
              className="inputField w-full"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as "name" | "code" | "group")}
            >
              <option value="name">بحث بالاسم</option>
              <option value="code">بحث بالكود</option>
              <option value="group">بحث بالمجموعة</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-3/4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="inputField pr-10 w-full"
              placeholder={
                searchField === "name" ? "بحث عن طالب بالاسم..." : 
                searchField === "code" ? "بحث عن طالب بالكود..." :
                "بحث عن مجموعة..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* عرض المدفوعات */}
      {filteredPayments.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-white text-lg">لا توجد مدفوعات مسجلة</p>
        </div>
      ) : (
        <div className="divide-y divide-physics-navy">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="p-4 hover:bg-physics-navy/30">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">{payment.studentName}</h3>
                  <div className="flex items-center flex-wrap gap-2 text-sm text-gray-300">
                    <span>كود: {payment.studentCode}</span>
                    <span className="hidden md:inline">|</span>
                    <span>المجموعة: {payment.group}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2 md:mt-0">
                  <div className="flex items-center">
                    <Calendar size={14} className="ml-1 text-physics-gold" />
                    <span className="text-physics-gold">
                      آخر دفعة: {formatDate(payment.date)}
                    </span>
                  </div>
                  
                  {/* زر حذف سجل الدفع */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-red-500 hover:text-red-300 bg-physics-navy/50 p-1 rounded-full"
                        onClick={() => setPaymentToDelete(payment)}
                        title="حذف سجل الدفع"
                      >
                        <Trash2 size={16} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-physics-dark border-physics-navy text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-physics-gold">تأكيد حذف سجل الدفع</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          هل أنت متأكد من رغبتك في حذف سجل الدفع الخاص بالطالب "{payment.studentName}" نهائياً من قاعدة البيانات؟
                          <br />
                          <span className="text-red-400 block mt-2">
                            تحذير: سيتم حذف جميع الأشهر المدفوعة المرتبطة بهذا السجل ولا يمكن استعادتها.
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-physics-navy text-white hover:bg-physics-navy/80">
                          إلغاء
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleDeletePayment}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "جاري الحذف..." : "حذف نهائي"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              {/* الأشهر المدفوعة */}
              <div className="mt-4">
                <p className="text-sm text-gray-400">
                  الأشهر المدفوعة ({payment.paidMonths.length}):
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {payment.paidMonths.map((paidMonth, index) => (
                    <span 
                      key={index} 
                      className="bg-physics-navy px-3 py-1 rounded-full text-sm text-white"
                      title={`تاريخ الدفع: ${formatDate(paidMonth.date)}`}
                    >
                      {paidMonth.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
