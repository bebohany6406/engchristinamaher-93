
import { useState, useEffect } from 'react';
import { Payment, PaidMonth } from '@/types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage when hook initializes
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

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("payments", JSON.stringify(payments));
    console.log("Saving payments to localStorage:", payments);
  }, [payments, isInitialized]);

  // Add a new payment
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

    // Check if payment record for this student already exists
    const existingPayment = payments.find(p => p.studentId === studentId);

    if (existingPayment) {
      // Update existing payment record
      const updatedPayments = payments.map(payment => {
        if (payment.studentId === studentId) {
          // Check if this month is already paid
          const monthAlreadyPaid = payment.paidMonths.some(pm => pm.month === month);
          if (monthAlreadyPaid) {
            return payment; // Don't do anything if month is already paid
          }
          
          return {
            ...payment,
            month, // Update current month
            date,  // Update payment date
            paidMonths: [...payment.paidMonths, paidMonth] // Add new month to paid months list
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
      // Create new payment record for student
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

      setPayments(prevPayments => [...prevPayments, newPayment]);
      
      return {
        success: true,
        message: `تم تسجيل دفع شهر ${month} للطالب ${studentName}`
      };
    }
  };

  // Get all payment records
  const getAllPayments = () => {
    return payments;
  };

  // Get payment records for a specific student
  const getStudentPayments = (studentId: string) => {
    return payments.filter(payment => payment.studentId === studentId);
  };
  
  // Check if a student has paid for current month
  const hasStudentPaidForCurrentLesson = (studentId: string, lessonNumber: number) => {
    const studentPayment = payments.find(p => p.studentId === studentId);
    if (!studentPayment) return false;
    
    // Each month includes 8 lessons
    // If student has paid and hasn't reached 8 lessons yet, they're considered paid
    const lessonsPerMonth = 8;
    
    // Calculate how many months they should have paid for
    const requiredMonths = Math.ceil(lessonNumber / lessonsPerMonth);
    
    // Check if they have enough paid months
    return studentPayment.paidMonths.length >= requiredMonths;
  };

  // Debug function to check hook state
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
    hasStudentPaidForCurrentLesson,
    debugPaymentsState
  };
}
