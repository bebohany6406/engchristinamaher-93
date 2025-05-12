
import { useState, useEffect } from 'react';
import { Payment, PaidMonth } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from './use-toast';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase when hook initializes
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('payments')
          .select('*');

        if (error) throw error;

        // Convert the paidMonths from JSON to proper array
        const formattedPayments = data.map(payment => ({
          ...payment,
          paidMonths: payment.paidMonths as PaidMonth[]
        }));

        setPayments(formattedPayments);
        console.log("Loaded payments from Supabase:", formattedPayments);
      } catch (error) {
        console.error("Error loading payments from Supabase:", error);
        setError("Failed to load payment data");
        
        // Attempt to load from localStorage as fallback
        const storedPayments = localStorage.getItem("payments");
        if (storedPayments) {
          try {
            setPayments(JSON.parse(storedPayments));
            console.log("Loaded payments from localStorage (fallback)");
            
            // Attempt to sync localStorage data to Supabase
            const parsedPayments = JSON.parse(storedPayments);
            parsedPayments.forEach(async (payment: Payment) => {
              try {
                await supabase.from('payments').upsert({
                  id: payment.id,
                  studentId: payment.studentId,
                  studentName: payment.studentName,
                  studentCode: payment.studentCode,
                  group: payment.group,
                  month: payment.month,
                  date: payment.date,
                  paidMonths: payment.paidMonths
                });
              } catch (syncError) {
                console.error("Failed to sync payment to Supabase:", syncError);
              }
            });
          } catch (parseError) {
            console.error("Error loading payments from localStorage:", parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Add a new payment
  const addPayment = async (
    studentId: string,
    studentName: string,
    studentCode: string,
    group: string,
    month: string
  ) => {
    try {
      const date = new Date().toISOString();
      const paidMonth: PaidMonth = {
        month,
        date
      };

      // Check if payment record for this student already exists
      const existingPayment = payments.find(p => p.studentId === studentId);

      if (existingPayment) {
        // Check if this month is already paid
        const monthAlreadyPaid = existingPayment.paidMonths.some(pm => pm.month === month);
        if (monthAlreadyPaid) {
          return {
            success: true,
            message: `الشهر ${month} مدفوع بالفعل للطالب ${studentName}`,
            payment: existingPayment
          };
        }
        
        // Update existing payment record
        const updatedPaidMonths = [...existingPayment.paidMonths, paidMonth];
        
        const { error } = await supabase
          .from('payments')
          .update({
            month,
            date,
            paidMonths: updatedPaidMonths
          })
          .eq('id', existingPayment.id);

        if (error) throw error;

        // Update local state
        const updatedPayments = payments.map(payment => {
          if (payment.id === existingPayment.id) {
            return {
              ...payment,
              month,
              date,
              paidMonths: updatedPaidMonths
            };
          }
          return payment;
        });

        setPayments(updatedPayments);
        
        return {
          success: true,
          message: `تم تسجيل دفع شهر ${month} للطالب ${studentName}`,
          payment: {
            ...existingPayment,
            month,
            date,
            paidMonths: updatedPaidMonths
          }
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

        const { error } = await supabase
          .from('payments')
          .insert(newPayment);

        if (error) throw error;

        // Update local state
        setPayments([...payments, newPayment]);
        
        return {
          success: true,
          message: `تم تسجيل دفع شهر ${month} للطالب ${studentName}`,
          payment: newPayment
        };
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تسجيل الدفع",
        variant: "destructive"
      });
      
      return {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدفع"
      };
    }
  };

  // Delete a payment record
  const deletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      // Update local state
      const updatedPayments = payments.filter(payment => payment.id !== paymentId);
      setPayments(updatedPayments);
      
      return {
        success: true,
        message: "تم حذف سجل الدفع بنجاح"
      };
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء حذف سجل الدفع",
        variant: "destructive"
      });
      
      return {
        success: false,
        message: "حدث خطأ أثناء حذف سجل الدفع"
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
  
  // Check if a student has paid for current lesson
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
    return {
      stateCount: payments.length,
      isLoading,
      error
    };
  };

  return {
    payments,
    isLoading,
    error,
    addPayment,
    deletePayment,
    getAllPayments,
    getStudentPayments,
    hasStudentPaidForCurrentLesson,
    debugPaymentsState
  };
}
