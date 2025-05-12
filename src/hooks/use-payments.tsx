
import { useState, useEffect } from "react";
import { Payment } from "@/types";

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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
    setIsInitialized(true);
  }, []);

  // حفظ المدفوعات في التخزين المحلي عند تغييرها
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("payments", JSON.stringify(payments));
      console.log("Payments saved to localStorage:", payments);
    }
  }, [payments, isInitialized]);

  // إضافة دفعة جديدة
  const addPayment = (
    studentId: string, 
    studentName: string,
    studentCode: string,
    group: string,
    month: string
  ) => {
    const today = new Date().toISOString();
    console.log("Adding payment for:", studentName, "Month:", month, "Group:", group);
    
    // Check if student has existing payment record
    const existingPaymentIndex = payments.findIndex(p => p.studentId === studentId);
    
    if (existingPaymentIndex !== -1) {
      // Update existing payment record
      const updatedPayments = [...payments];
      const existingPayment = {...updatedPayments[existingPaymentIndex]};
      
      // Check if this month is already paid
      const monthAlreadyPaid = existingPayment.paidMonths.some(
        m => m.month.toLowerCase() === month.toLowerCase()
      );
      
      if (!monthAlreadyPaid) {
        // Add new month to paid months
        const updatedPaidMonths = [...existingPayment.paidMonths, { month, date: today }];
        existingPayment.paidMonths = updatedPaidMonths;
        existingPayment.date = today; // Update last payment date
        existingPayment.month = month; // Update current month
        
        updatedPayments[existingPaymentIndex] = existingPayment;
        setPayments(updatedPayments);
        
        console.log("Updated existing payment record:", existingPayment);
        
        // Play sound effect
        const audio = new Audio("/payment-success.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        return { success: true, message: "تم تسجيل الدفعة بنجاح" };
      } else {
        console.log("Month already paid:", month);
        return { success: false, message: "هذا الشهر مدفوع بالفعل" };
      }
    } else {
      // Create new payment record
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
      
      setPayments(prevPayments => [...prevPayments, newPayment]);
      console.log("Created new payment record:", newPayment);
      
      // Play sound effect
      const audio = new Audio("/payment-success.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      return { success: true, message: "تم تسجيل الدفعة بنجاح" };
    }
  };

  // الحصول على مدفوعات طالب معين
  const getStudentPayments = (studentId: string): Payment | undefined => {
    return payments.find(payment => payment.studentId === studentId);
  };

  // Get all payments
  const getAllPayments = (): Payment[] => {
    return payments;
  };

  // Reset payments for a specific grade
  const resetPaymentsByGrade = (grade: "first" | "second" | "third"): number => {
    // Filter out payments for students of the specified grade
    const filteredPayments = payments.filter(payment => {
      // Need to find the student grade, which we don't have in the payment object
      // This will be handled by the system reset page instead
      return true;
    });
    
    return 0; // Return 0 since we don't handle this here
  };

  return {
    payments,
    addPayment,
    getStudentPayments,
    getAllPayments,
    resetPaymentsByGrade
  };
};
