
import { useState, useEffect } from "react";
import { Payment } from "@/types";

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  // تحميل المدفوعات من التخزين المحلي عند بدء التطبيق
  useEffect(() => {
    const storedPayments = localStorage.getItem("payments");
    if (storedPayments) {
      try {
        setPayments(JSON.parse(storedPayments));
      } catch (error) {
        console.error("Failed to parse payments from localStorage:", error);
      }
    }
  }, []);

  // حفظ المدفوعات في التخزين المحلي عند تغييرها
  useEffect(() => {
    localStorage.setItem("payments", JSON.stringify(payments));
  }, [payments]);

  // إضافة دفعة جديدة
  const addPayment = (
    studentId: string, 
    studentName: string,
    studentCode: string,
    group: string,
    month: string
  ) => {
    const today = new Date().toISOString();
    
    // Create new payment
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      studentId,
      studentName,
      studentCode,
      group,
      month,
      date: today,
      paidMonths: [{ month, date: today }]
    };
    
    // Check if student already has a payment record
    const existingPaymentIndex = payments.findIndex(p => p.studentId === studentId);
    
    if (existingPaymentIndex !== -1) {
      // Update existing payment record
      const updatedPayments = [...payments];
      const existingPayment = updatedPayments[existingPaymentIndex];
      
      // Check if this month is already paid
      const monthAlreadyPaid = existingPayment.paidMonths.some(
        m => m.month.toLowerCase() === month.toLowerCase()
      );
      
      if (!monthAlreadyPaid) {
        existingPayment.paidMonths.push({ month, date: today });
        existingPayment.date = today; // Update last payment date
        existingPayment.month = month; // تحديث الشهر الأخير المدفوع
        updatedPayments[existingPaymentIndex] = existingPayment;
        setPayments(updatedPayments);
        
        // Play sound effect
        const audio = new Audio("/payment-success.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        return { 
          success: true, 
          message: "تم تسجيل الدفعة بنجاح",
          payment: existingPayment
        };
      } else {
        return { 
          success: false, 
          message: "هذا الشهر مدفوع بالفعل",
          payment: null
        };
      }
    } else {
      // Add new payment record
      setPayments(prevPayments => [...prevPayments, newPayment]);
      
      // Play sound effect
      const audio = new Audio("/payment-success.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      return { 
        success: true, 
        message: "تم تسجيل الدفعة بنجاح",
        payment: newPayment
      };
    }
  };

  // الحصول على مدفوعات طالب معين
  const getStudentPayments = (studentId: string): Payment | undefined => {
    return payments.find(payment => payment.studentId === studentId);
  };

  return {
    payments,
    addPayment,
    getStudentPayments
  };
};
