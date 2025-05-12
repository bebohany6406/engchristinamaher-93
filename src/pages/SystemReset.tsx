
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, RefreshCcw, AlertTriangle } from "lucide-react";
import { getGradeDisplay } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import PhysicsBackground from "@/components/PhysicsBackground";

const SystemReset = () => {
  const navigate = useNavigate();
  const { currentUser, students, setStudents } = useAuth();
  const { grades, setGrades, attendance, setAttendance } = useData();
  
  const [selectedGrade, setSelectedGrade] = useState<"first" | "second" | "third" | "all">("first");
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [resetCode, setResetCode] = useState("");
  
  // التأكد من أن المستخدم هو مسؤول النظام
  if (currentUser?.role !== "admin") {
    navigate("/unauthorized");
    return null;
  }
  
  const handleReset = () => {
    // التحقق من كود التأكيد
    if (resetCode !== "12345") {
      toast({
        title: "❌ خطأ في كود التأكيد",
        description: "يرجى إدخال كود التأكيد الصحيح",
        variant: "destructive",
      });
      return;
    }
    
    setResetInProgress(true);
    
    // حذف البيانات حسب الصف المحدد
    setTimeout(() => {
      if (selectedGrade === "all") {
        // حذف كل البيانات
        // لا نقوم بحذف بيانات النظام الأساسية مثل المسؤول
      } else {
        // حذف بيانات الصف المحدد فقط
        
        // حذف الطلاب في الصف المحدد
        const remainingStudents = students.filter(student => student.grade !== selectedGrade);
        setStudents(remainingStudents);
        
        // حذف درجات الطلاب في الصف المحدد
        const studentsInGradeIds = students
          .filter(student => student.grade === selectedGrade)
          .map(student => student.id);
        
        const remainingGrades = grades.filter(g => !studentsInGradeIds.includes(g.studentId));
        setGrades(remainingGrades);
        
        // حذف سجلات الحضور
        const remainingAttendance = attendance.filter(record => {
          const student = students.find(s => s.id === record.studentId);
          return student?.grade !== selectedGrade;
        });
        setAttendance(remainingAttendance);
      }
      
      setResetInProgress(false);
      setConfirmReset(false);
      setResetCode("");
      
      toast({
        title: "✅ تم إعادة تعيين النظام",
        description: selectedGrade === "all" 
          ? "تم إعادة تعيين جميع بيانات النظام بنجاح"
          : `تم إعادة تعيين بيانات ${getGradeDisplay(selectedGrade)} بنجاح`,
      });
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-physics-gold">إعادة تعيين النظام</h1>
            <p className="text-white mt-2">
              من هنا يمكنك إعادة تعيين بيانات النظام حسب الصف
            </p>
          </div>
          
          <div className="bg-physics-dark rounded-lg p-6">
            {!confirmReset ? (
              <>
                <div className="mb-6">
                  <label className="block text-white mb-2">اختر الصف الدراسي</label>
                  <select 
                    className="inputField w-full"
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as "first" | "second" | "third" | "all")}
                  >
                    <option value="first">الصف الأول الثانوي</option>
                    <option value="second">الصف الثاني الثانوي</option>
                    <option value="third">الصف الثالث الثانوي</option>
                    <option value="all">جميع الصفوف</option>
                  </select>
                </div>
                
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="text-red-500 mt-1 ml-2" size={20} />
                    <div>
                      <h3 className="text-red-500 font-bold mb-1">تحذير هام</h3>
                      <p className="text-white text-sm">
                        سيتم حذف جميع البيانات المتعلقة {selectedGrade === "all" ? "بجميع الصفوف" : `بالصف ${getGradeDisplay(selectedGrade)}`} بما في ذلك:
                      </p>
                      <ul className="text-gray-300 text-sm list-disc list-inside mt-2 space-y-1">
                        <li>بيانات الطلاب</li>
                        <li>سجلات الدرجات</li>
                        <li>سجلات الحضور</li>
                      </ul>
                      <p className="text-red-400 mt-2 text-sm font-bold">
                        هذا الإجراء لا يمكن التراجع عنه!
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setConfirmReset(true)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={18} />
                  <span>متابعة إعادة التعيين</span>
                </button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="bg-physics-navy/50 rounded-lg p-4 mb-4">
                    <h3 className="text-physics-gold font-bold mb-2">تأكيد إعادة التعيين</h3>
                    <p className="text-white text-sm">
                      أنت على وشك إعادة تعيين بيانات {selectedGrade === "all" ? "جميع الصفوف" : getGradeDisplay(selectedGrade)}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-white mb-2">أدخل رمز التأكيد (12345)</label>
                    <input 
                      type="text"
                      className="inputField w-full"
                      placeholder="أدخل رمز التأكيد..."
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleReset}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    disabled={resetInProgress}
                  >
                    {resetInProgress ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        <span>جاري المعالجة...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCcw size={18} />
                        <span>تأكيد إعادة التعيين</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 bg-physics-navy hover:bg-physics-navy/70 text-white py-2 px-4 rounded-lg"
                    disabled={resetInProgress}
                  >
                    إلغاء
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemReset;
