import { useState } from "react";
import { Calendar, Search, Trash2 } from "lucide-react";
import { Payment } from "@/types";
import { sanitizeSearchText } from "@/lib/utils";
import { usePayments } from "@/hooks/use-payments";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
interface PaymentsListProps {
  payments: Payment[];
}
export function PaymentsList({
  payments
}: PaymentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"name" | "code" | "group">("name");
  const {
    deletePayment
  } = usePayments();
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
          description: `تم حذف سجل الدفع الخاص بالطالب ${paymentToDelete.studentName} نهائياً`
        });
      } else {
        toast({
          title: "خطأ في الحذف",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      toast({
        title: "خطأ في الحذف",
        description: `حدث خطأ أثناء محاولة حذف سجل الدفع: ${error.message || 'خطأ غير معروف'}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setPaymentToDelete(null);
    }
  };
  return <div>
      {/* حقل البحث مع اختيار نوع البحث */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <select className="inputField w-full" value={searchField} onChange={e => setSearchField(e.target.value as "name" | "code" | "group")}>
              <option value="name">بحث بالاسم</option>
              <option value="code">بحث بالكود</option>
              <option value="group">بحث بالمجموعة</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-3/4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" className="inputField pr-10 w-full" placeholder={searchField === "name" ? "بحث عن طالب بالاسم..." : searchField === "code" ? "بحث عن طالب بالكود..." : "بحث عن مجموعة..."} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* عرض المدفوعات */}
      {filteredPayments.length === 0 ? <div className="p-8 text-center">
          <p className="text-white text-lg">لا توجد مدفوعات مسجلة</p>
        </div> : <div className="divide-y divide-physics-navy">
          {filteredPayments.map(payment => {})}
        </div>}
    </div>;
}