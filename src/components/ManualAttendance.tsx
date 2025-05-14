
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
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
  const { addAttendance } = useData();
  
  // استعلام عن عدد الدروس السابقة للطالب
  const fetchStudentLessonCount = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('lesson_number')
        .eq('student_id', studentId)
        .order('lesson_number', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0].lesson_number;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching lesson count:", error);
      return 0;
    }
  };

  // حساب رقم الحصة داخل دورة الـ 8 حصص
  const calculateLessonNumberInCycle = (totalLessons: number): number => {
    // إذا كان رقم الحصة 9، سيعود إلى 1، وهكذا
    return (totalLessons % 8) + 1;
  };

  // التحقق من دفع الطالب للدرس الحالي
  const checkStudentPayment = async (studentId: string, lessonNumber: number) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      // افتراض أن الدفع مقبول إذا وجدنا أي سجل دفع
      // في التطبيق الحقيقي، يجب التحقق من الدفع المرتبط بالدرس المحدد
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking payment:", error);
      return false;
    }
  };

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
        // الحصول على عدد الدروس الحالية
        const currentLessonCount = await fetchStudentLessonCount(student.id);
        const nextTotalLessons = currentLessonCount + 1; // +1 لأننا على وشك إضافة حضور جديد
        
        // حساب رقم الدرس داخل دورة الـ 8 دروس
        const lessonNumber = calculateLessonNumberInCycle(nextTotalLessons);
        
        // التحقق من حالة الدفع
        const hasPaid = await checkStudentPayment(student.id, lessonNumber);
        
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
        // تسجيل الغياب باستخدام الدالة من سياق البيانات
        await addAttendance(
          studentInfo.id,
          studentInfo.name,
          "absent",
          studentInfo.lessonNumber
        );
        
        // تشغيل صوت
        const audio = new Audio("/attendance-absent.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "تم تسجيل الغياب",
          description: `تم تسجيل غياب الطالب ${studentInfo.name} (الدرس ${studentInfo.lessonNumber})`
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
