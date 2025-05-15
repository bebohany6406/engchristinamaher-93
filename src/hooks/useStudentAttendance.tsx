
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { usePayments } from "@/hooks/use-payments";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useStudentAttendance() {
  const [scannedCode, setScannedCode] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<{
    paid: boolean, 
    studentName?: string,
    studentId?: string,
    group?: string,
    studentCode?: string,
    lessonNumber?: number
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { getStudentByCode } = useAuth();
  const { addAttendance, getStudentLessonCount } = useData();
  const { hasStudentPaidForCurrentLesson } = usePayments();

  // Helper function to get the lesson count considering the 8-lesson cycle
  const getLessonNumberInCycle = async (studentId: string): Promise<number> => {
    try {
      // Get the total lesson count for this student
      const totalLessons = getStudentLessonCount(studentId);
      
      // Calculate the lesson number within the 8-lesson cycle
      // If it's the 9th lesson, it becomes lesson 1 of the new cycle
      const lessonNumberInCycle = (totalLessons % 8) + 1;
      
      console.log(`Student ID: ${studentId}, Total Lessons: ${totalLessons}, Lesson in Cycle: ${lessonNumberInCycle}`);
      
      return lessonNumberInCycle;
    } catch (error) {
      console.error("Error calculating lesson number in cycle:", error);
      // Return 1 as a fallback (first lesson)
      return 1;
    }
  };

  const processScannedCode = async (code: string) => {
    setIsProcessing(true);
    
    try {
      const student = await getStudentByCode(code);
      if (student) {
        // Get current lesson count for the student within the 8-lesson cycle
        const lessonNumber = await getLessonNumberInCycle(student.id);
        
        // Check if student has paid for this lesson
        const hasPaid = hasStudentPaidForCurrentLesson(student.id, lessonNumber);
        
        // Update payment status state with more student info
        setPaymentStatus({
          paid: hasPaid,
          studentName: student.name,
          studentId: student.id,
          group: student.group,
          studentCode: code,
          lessonNumber: lessonNumber
        });
        
        // Record attendance regardless of payment status
        await addAttendance(student.id, student.name, "present", lessonNumber);
        
        // Play sound effect
        const audio = new Audio("/attendance-present.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        // Include lesson number and payment request in toast notification
        let paymentMessage = '';
        if (!hasPaid) {
          paymentMessage = lessonNumber === 1 ? 
            ' (مطلوب دفع الشهر الجديد)' : 
            ' (غير مدفوع)';
        }
        
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${student.name} (الحصة ${lessonNumber})${paymentMessage}`
        });
        
        // Clear code field after successful processing
        setScannedCode("");
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود"
        });
        return false;
      }
    } catch (error) {
      console.error("Error processing scanned code:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء معالجة الكود"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode || isProcessing) return;
    
    await processScannedCode(scannedCode);
  };

  return {
    scannedCode,
    setScannedCode,
    paymentStatus,
    isProcessing,
    setIsProcessing,
    processScannedCode,
    handleManualEntry,
    getLessonNumberInCycle
  };
}
