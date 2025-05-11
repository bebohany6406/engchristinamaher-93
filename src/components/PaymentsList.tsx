
import { useState } from "react";
import { Calendar, Search } from "lucide-react";
import { Payment } from "@/types";

interface PaymentsListProps {
  payments: Payment[];
}

export function PaymentsList({ payments }: PaymentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // تصفية المدفوعات حسب البحث
  const filteredPayments = payments.filter(payment => 
    payment.studentName.includes(searchQuery) || 
    payment.studentCode.includes(searchQuery) ||
    payment.group.includes(searchQuery)
  );

  return (
    <div>
      {/* حقل البحث */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            className="inputField pr-10"
            placeholder="بحث عن طالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                
                <div className="flex items-center mt-2 md:mt-0">
                  <Calendar size={14} className="ml-1 text-physics-gold" />
                  <span className="text-physics-gold">
                    آخر دفعة: {formatDate(payment.date)}
                  </span>
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
