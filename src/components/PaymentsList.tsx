
import { useState } from "react";
import { Search } from "lucide-react";
import { Payment } from "@/types";
import { sanitizeSearchText } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentsListProps {
  payments: Payment[];
}

export function PaymentsList({ payments }: PaymentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"name" | "code" | "group">("name");
  
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
    if (!searchQuery.trim()) return true;
    
    const query = sanitizeSearchText(searchQuery);
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(payment.studentName).includes(query);
      case "code":
        return sanitizeSearchText(payment.studentCode).includes(query);
      case "group":
        return payment.group ? sanitizeSearchText(payment.group).includes(query) : false;
      default:
        return true;
    }
  });

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
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-physics-navy/50">
                <TableHead className="text-right text-physics-gold">اسم الطالب</TableHead>
                <TableHead className="text-right text-physics-gold">الكود</TableHead>
                <TableHead className="text-right text-physics-gold">المجموعة</TableHead>
                <TableHead className="text-right text-physics-gold">السجل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-physics-navy/30 border-b border-physics-navy/20">
                  <TableCell className="text-white font-medium">{payment.studentName}</TableCell>
                  <TableCell className="text-white">{payment.studentCode}</TableCell>
                  <TableCell className="text-white">{payment.group}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
