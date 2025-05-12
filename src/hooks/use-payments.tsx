
import { useState, useEffect } from 'react';
import { Payment, PaidMonth } from '@/types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // تحميل البيانات من localStorage عند تهيئة الهوك
  useEffect(() => {
    const storedPayments = localStorage.getItem("payments");
    if (storedPayments) {
      try {
        setPayments(JSON.parse(storedPayments));
      } catch (error) {
        console.error("Error loading payments from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // حفظ البيانات في localStorage عند تغييرها
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("payments", JSON.stringify(payments));
    console.log("Saving payments to localStorage:", payments);
  }, [payments, isInitialized]);

  // إضافة دفعة جديدة
  const addPayment = (
    studentId: string,
    studentName: string,
    studentCode: string,
    group: string,
    month: string
  ) => {
    const date = new Date().toISOString();
    const paidMonth: PaidMonth = {
      month,
      date
    };

    // البحث عن سجل دفع موجود للطالب
    const existingPayment = payments.find(p => p.studentId === studentId);

    if (existingPayment) {
      // تحديث سجل الدفع الموجود
      const updatedPayments = payments.map(payment => {
        if (payment.studentId === studentId) {
          // تحقق مما إذا كان الشهر مدفوعًا بالفعل
          const monthAlreadyPaid = payment.paidMonths.some(pm => pm.month === month);
          if (monthAlreadyPaid) {
            return payment; // لا تفعل شيئًا إذا كان الشهر مدفوعًا بالفعل
          }
          
          return {
            ...payment,
            month, // تحديث الشهر الحالي
            date,  // تحديث تاريخ الدفع
            paidMonths: [...payment.paidMonths, paidMonth] // إضافة الشهر الجديد إلى قائمة الأشهر المدفوعة
          };
        }
        return payment;
      });

      setPayments(updatedPayments);
      return {
        success: true,
        message: `تم تسجيل دفع شهر ${month} للطالب ${studentName}`
      };
    } else {
      // إنشاء سجل دفع جديد للطالب
      const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        studentId,
        studentName,
        studentCode,
        group,
        month,
        date,
        paidMonths: [paidMonth]
      };

      setPayments(prevPayments => {
        const updatedPayments = [...prevPayments, newPayment];
        localStorage.setItem("payments", JSON.stringify(updatedPayments));
        console.log("Added new payment and updated localStorage:", updatedPayments);
        return updatedPayments;
      });
      
      return {
        success: true,
        message: `تم تسجيل دفع شهر ${month} للطالب ${studentName}`
      };
    }
  };

  // الحصول على جميع سجلات الدفع
  const getAllPayments = () => {
    return payments;
  };

  // الحصول على سجلات دفع طالب معين
  const getStudentPayments = (studentId: string) => {
    return payments.filter(payment => payment.studentId === studentId);
  };

  // فحص حالة الهوك
  const debugPaymentsState = () => {
    console.log("Current payments state:", payments);
    console.log("Saved payments in localStorage:", localStorage.getItem("payments"));
    return {
      stateCount: payments.length,
      localStorageCount: localStorage.getItem("payments") ? JSON.parse(localStorage.getItem("payments") || "[]").length : 0
    };
  };

  return {
    payments,
    addPayment,
    getAllPayments,
    getStudentPayments,
    debugPaymentsState
  };
}
