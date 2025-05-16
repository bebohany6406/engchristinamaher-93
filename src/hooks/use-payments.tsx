
import { useState, useEffect } from 'react';
import { Payment, PaidMonth } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// ثابت لعدد الحصص في الشهر الواحد
const LESSONS_PER_MONTH = 8;

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase when hook initializes
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        
        // First, fetch all payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');

        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          toast({
            title: "خطأ في جلب المدفوعات",
            description: paymentsError.message,
            variant: "destructive"
          });
          return;
        }
        
        // Then fetch all paid months
        const { data: paidMonthsData, error: paidMonthsError } = await supabase
          .from('paid_months')
          .select('*');
          
        if (paidMonthsError) {
          console.error("Error fetching paid months:", paidMonthsError);
          toast({
            title: "خطأ في جلب الأشهر المدفوعة",
            description: paidMonthsError.message,
            variant: "destructive"
          });
          return;
        }
        
        // Map the database data to our app's data structure
        const processedPayments = paymentsData.map(payment => {
          // Find all paid months for this payment
          const relatedPaidMonths = paidMonthsData
            .filter(pm => pm.payment_id === payment.id)
            .map(pm => ({
              month: pm.month,
              date: pm.date
            }));
          
          return {
            id: payment.id,
            studentId: payment.student_id,
            studentName: payment.student_name,
            studentCode: payment.student_code,
            group: payment.student_group,
            month: payment.month,
            date: payment.date,
            paidMonths: relatedPaidMonths
          };
        });
        
        setPayments(processedPayments);
        console.log("Loaded payments from Supabase:", processedPayments.length);
      } catch (error) {
        console.error("Error loading payments from Supabase:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
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
            success: false,
            message: `تم دفع شهر ${month} مسبقا للطالب ${studentName}`,
            payment: existingPayment
          };
        }

        // Update existing payment in Supabase
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            month,
            date
          })
          .eq('id', existingPayment.id);

        if (updateError) {
          console.error("Error updating payment:", updateError);
          throw updateError;
        }

        // Add new paid month
        const { error: paidMonthError } = await supabase
          .from('paid_months')
          .insert({
            payment_id: existingPayment.id,
            month,
            date
          });

        if (paidMonthError) {
          console.error("Error adding paid month:", paidMonthError);
          throw paidMonthError;
        }

        // Update local state
        const updatedPayments = payments.map(payment => {
          if (payment.id === existingPayment.id) {
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
          message: `تم تسجيل دفع شهر ${month} للطالب ${studentName}`,
          payment: {
            ...existingPayment,
            month,
            date,
            paidMonths: [...existingPayment.paidMonths, paidMonth]
          }
        };
      } else {
        // Create new payment record for student in Supabase
        const { data: newPaymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            student_id: studentId,
            student_name: studentName,
            student_code: studentCode,
            student_group: group,
            month,
            date
          })
          .select()
          .single();

        if (paymentError) {
          console.error("Error creating payment:", paymentError);
          throw paymentError;
        }

        // Add initial paid month
        const { error: paidMonthError } = await supabase
          .from('paid_months')
          .insert({
            payment_id: newPaymentData.id,
            month,
            date
          });

        if (paidMonthError) {
          console.error("Error adding paid month:", paidMonthError);
          throw paidMonthError;
        }

        // Create new payment object for local state
        const newPayment: Payment = {
          id: newPaymentData.id,
          studentId,
          studentName,
          studentCode,
          group,
          month,
          date,
          paidMonths: [paidMonth]
        };

        // Update state
        setPayments(prevPayments => [...prevPayments, newPayment]);

        return {
          success: true,
          message: `تم تسجيل دفع شهر ${month} للطالب ${studentName}`,
          payment: newPayment
        };
      }
    } catch (error: any) {
      console.error("Error in addPayment:", error);
      return {
        success: false,
        message: `حدث خطأ أثناء تسجيل الدفعة: ${error.message || 'خطأ غير معروف'}`,
        payment: null
      };
    }
  };

  // Delete a payment record
  const deletePayment = async (paymentId: string) => {
    try {
      console.log(`Starting deletion process for payment ID: ${paymentId}`);
      
      // First delete related paid_months
      const { error: paidMonthsError } = await supabase
        .from('paid_months')
        .delete()
        .eq('payment_id', paymentId);
        
      if (paidMonthsError) {
        console.error("Error deleting related paid months:", paidMonthsError);
        return {
          success: false,
          message: `حدث خطأ أثناء حذف الأشهر المدفوعة المرتبطة: ${paidMonthsError.message || 'خطأ غير معروف'}`
        };
      }
      
      console.log("Successfully deleted related paid months, now deleting payment record");
      
      // Then delete the payment itself
      const { error: paymentError } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (paymentError) {
        console.error("Error deleting payment from Supabase:", paymentError);
        return {
          success: false,
          message: `حدث خطأ أثناء حذف سجل الدفع: ${paymentError.message || 'خطأ غير معروف'}`
        };
      }

      // After successful deletion from database, update local state
      console.log("Payment deleted from database, updating local state...");
      
      setPayments(prevPayments => {
        const updatedPayments = prevPayments.filter(payment => payment.id !== paymentId);
        console.log(`Payments before deletion: ${prevPayments.length}, after deletion: ${updatedPayments.length}`);
        return updatedPayments;
      });
      
      console.log("Payment deleted successfully, state updated");

      return {
        success: true,
        message: "تم حذف سجل الدفع بنجاح"
      };
    } catch (error: any) {
      console.error("Error in deletePayment:", error);
      return {
        success: false,
        message: `حدث خطأ أثناء حذف سجل الدفع: ${error.message || 'خطأ غير معروف'}`
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
    
    // كل شهر يتضمن 8 حصص
    // إذا دفع الطالب ولم يصل إلى 8 حصص بعد، فيعتبر دافعًا
    
    // حساب عدد الأشهر المطلوب دفعها بناءً على رقم الحصة
    const requiredMonths = Math.ceil(lessonNumber / LESSONS_PER_MONTH);
    
    // التحقق مما إذا كان لديه عدد كافٍ من الأشهر المدفوعة
    const hasPaidEnough = studentPayment.paidMonths.length >= requiredMonths;
    
    console.log(`Student ${studentId} - Lesson ${lessonNumber} - Required Months ${requiredMonths} - Paid Months ${studentPayment.paidMonths.length} - Has Paid: ${hasPaidEnough}`);
    
    return hasPaidEnough;
  };

  // تحديد الشهر الحالي للطالب بناءً على رقم الحصة
  const getCurrentMonthByLessonNumber = (lessonNumber: number) => {
    return Math.ceil(lessonNumber / LESSONS_PER_MONTH);
  };

  // حساب الحصة الأولى في الشهر الحالي
  const getFirstLessonInCurrentMonth = (lessonNumber: number) => {
    const currentMonth = getCurrentMonthByLessonNumber(lessonNumber);
    return ((currentMonth - 1) * LESSONS_PER_MONTH) + 1;
  };

  // حساب الحصة الأخيرة في الشهر الحالي
  const getLastLessonInCurrentMonth = (lessonNumber: number) => {
    const currentMonth = getCurrentMonthByLessonNumber(lessonNumber);
    return currentMonth * LESSONS_PER_MONTH;
  };

  // Debug function to check hook state
  const debugPaymentsState = () => {
    console.log("Current payments state:", payments);
    return {
      stateCount: payments.length,
      supabaseIntegrated: true,
      lessonsPerMonth: LESSONS_PER_MONTH
    };
  };

  return {
    payments,
    isLoading,
    addPayment,
    deletePayment,
    getAllPayments,
    getStudentPayments,
    hasStudentPaidForCurrentLesson,
    getCurrentMonthByLessonNumber,
    getFirstLessonInCurrentMonth,
    getLastLessonInCurrentMonth,
    debugPaymentsState
  };
}
