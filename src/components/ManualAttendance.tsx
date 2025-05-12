
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { usePayments } from "@/hooks/use-payments";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ManualAttendance() {
  const [studentCode, setStudentCode] = useState("");
  const [studentInfo, setStudentInfo] = useState<{ 
    id: string; 
    name: string; 
    hasPaid: boolean; 
    lessonNumber: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { getStudentByCode } = useAuth();
  const { getStudentLessonCount } = useData();
  const { hasStudentPaidForCurrentLesson } = usePayments();

  const handleLookup = async () => {
    if (!studentCode.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال كود الطالب"
      });
      return;
    }

    setIsLoading(true);
    try {
      const student = await getStudentByCode(studentCode);
      if (student) {
        // Get current lesson count
        const lessonNumber = getStudentLessonCount(student.id) + 1; // +1 because we're about to add a new attendance
        
        // Check payment status
        const hasPaid = hasStudentPaidForCurrentLesson(student.id, lessonNumber);
        
        setStudentInfo({ 
          id: student.id, 
          name: student.name,
          hasPaid,
          lessonNumber
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم يتم العثور على طالب بهذا الكود"
        });
        setStudentInfo(null);
      }
    } catch (error) {
      console.error("Error looking up student:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء البحث عن الطالب"
      });
      setStudentInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbsence = async () => {
    if (studentInfo) {
      try {
        // Create the attendance record
        const now = new Date();
        const attendanceRecord = {
          id: `attendance-${Date.now()}`,
          student_id: studentInfo.id,
          student_name: studentInfo.name,
          status: "absent",
          lesson_number: studentInfo.lessonNumber,
          time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
          date: now.toISOString()
        };

        // Save directly to Supabase
        const { error } = await supabase
          .from('attendance')
          .insert([attendanceRecord]);

        if (error) {
          throw error;
        }
        
        // Play sound effect
        const audio = new Audio("/attendance-absent.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "تم تسجيل الغياب",
          description: `تم تسجيل غياب الطالب ${studentInfo.name}`
        });
        setStudentCode("");
        setStudentInfo(null);
      } catch (error) {
        console.error("Error recording absence:", error);
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الغياب",
          description: "حدث خطأ أثناء محاولة تسجيل الغياب"
        });
      }
    }
  };

  return (
    <div className="bg-physics-dark p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6 text-physics-gold">تسجيل الغياب</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="أدخل كود الطالب"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="inputField flex-1"
            disabled={isLoading}
          />
          <button 
            onClick={handleLookup}
            className="goldBtn"
            disabled={isLoading}
          >
            {isLoading ? 'جاري البحث...' : 'بحث'}
          </button>
        </div>
        
        {isLoading && (
          <div className="bg-physics-navy p-4 rounded-lg text-center">
            <div className="inline-block w-6 h-6 border-2 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-2">جاري البحث عن الطالب...</p>
          </div>
        )}
        
        {!isLoading && studentInfo && (
          <div className="bg-physics-navy p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-white">الطالب: <span className="font-bold">{studentInfo.name}</span></p>
              
              {studentInfo.hasPaid ? (
                <span className="flex items-center" aria-label="مدفوع">
                  <CheckCircle2 className="text-green-400" size={20} />
                </span>
              ) : (
                <span className="flex items-center" aria-label="غير مدفوع">
                  <AlertCircle className="text-red-400" size={20} />
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-300 mb-2">
              {studentInfo.hasPaid 
                ? 'الطالب مدفوع الاشتراك للدرس الحالي' 
                : 'الطالب غير مدفوع الاشتراك للدرس الحالي'}
            </div>
            
            <button 
              onClick={handleAbsence}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              تسجيل غياب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
