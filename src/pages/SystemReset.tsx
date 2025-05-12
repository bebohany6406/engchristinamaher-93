import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Trash, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SystemReset = () => {
  const navigate = useNavigate();
  const { currentUser, getAllStudents } = useAuth();
  const { 
    getAllBooks, 
    getAllVideos, 
    getAllAttendance, 
    getAllGrades 
  } = useData();
  const [selectedGrade, setSelectedGrade] = useState<"first" | "second" | "third">("first");
  const [confirmReset, setConfirmReset] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // التحقق من صلاحيات المستخدم - المدير فقط
  const checkAuth = () => {
    if (!currentUser || (currentUser as any).role !== "admin") {
      toast({
        title: "غير مصرح",
        description: "يجب تسجيل الدخول كمدير للوصول لهذه الصفحة",
        variant: "destructive",
      });
      navigate("/unauthorized");
      return false;
    }
    return true;
  };
  
  const handleResetSystem = () => {
    if (!checkAuth()) return;
    
    setIsProcessing(true);
    
    try {
      // Get all students of selected grade
      const students = getAllStudents().filter(student => student.grade === selectedGrade);
      const studentIds = students.map(student => student.id);
      
      // Get local storage data
      let storedStudents = JSON.parse(localStorage.getItem("students") || "[]");
      let storedPayments = JSON.parse(localStorage.getItem("payments") || "[]");
      let storedAttendance = JSON.parse(localStorage.getItem("attendance") || "[]");
      let storedGrades = JSON.parse(localStorage.getItem("grades") || "[]");
      let storedVideos = JSON.parse(localStorage.getItem("videos") || "[]");
      
      // Filter out data for students of selected grade
      storedStudents = storedStudents.filter((student: any) => student.grade !== selectedGrade);
      storedPayments = storedPayments.filter((payment: any) => !studentIds.includes(payment.studentId));
      storedAttendance = storedAttendance.filter((record: any) => !studentIds.includes(record.studentId));
      storedGrades = storedGrades.filter((grade: any) => !studentIds.includes(grade.studentId));
      
      // Keep videos for selected grade (optional, based on requirement)
      storedVideos = storedVideos.filter((video: any) => video.grade !== selectedGrade);
      
      // Update local storage
      localStorage.setItem("students", JSON.stringify(storedStudents));
      localStorage.setItem("payments", JSON.stringify(storedPayments));
      localStorage.setItem("attendance", JSON.stringify(storedAttendance));
      localStorage.setItem("grades", JSON.stringify(storedGrades));
      localStorage.setItem("videos", JSON.stringify(storedVideos));
      
      // Play sound effect
      const audio = new Audio("/error-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: "✅ تم إعادة تعيين النظام",
        description: `تم حذف جميع بيانات طلاب الصف ${
          selectedGrade === "first" ? "الأول الثانوي" :
          selectedGrade === "second" ? "الثاني الثانوي" :
          "الثالث الثانوي"
        } بنجاح`,
      });
      
      // Reset UI state
      setConfirmReset(false);
      
      // Force reload after delay to refresh data contexts
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Error resetting system:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إعادة تعيين النظام",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
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
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">إعادة تعيين النظام</h1>
            <p className="text-white mt-2">
              يمكنك إعادة تعيين النظام لصف دراسي محدد، سيتم حذف جميع بيانات الطلاب والمدفوعات والحضور والدرجات المرتبطة بهذا الصف.
            </p>
          </div>
          
          <div className="bg-physics-dark rounded-lg p-6">
            <div className="mb-6">
              <label className="block text-white mb-2">اختر الصف الدراسي</label>
              <select 
                className="inputField"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as "first" | "second" | "third")}
              >
                <option value="first">الصف الأول الثانوي</option>
                <option value="second">الصف الثاني الثانوي</option>
                <option value="third">الصف الثالث الثانوي</option>
              </select>
            </div>
            
            {!confirmReset ? (
              <button 
                onClick={() => setConfirmReset(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Trash size={18} />
                <span>إعادة تعيين النظام</span>
              </button>
            ) : (
              <div className="border border-red-500 rounded-lg p-4 bg-red-500/10">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="text-red-500 font-bold text-lg mb-2">تأكيد إعادة تعيين النظام</h3>
                    <p className="text-white mb-2">
                      هل أنت متأكد من رغبتك في إعادة تعيين النظام للصف {
                        selectedGrade === "first" ? "الأول الثانوي" :
                        selectedGrade === "second" ? "الثاني الثانوي" :
                        "الثالث الثانوي"
                      }؟
                    </p>
                    <p className="text-red-300 text-sm">
                      سيتم حذف جميع بيانات الطلاب والمدفوعات والحضور والدرجات المرتبطة بهذا الصف، ولا يمكن التراجع عن هذه العملية.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleResetSystem}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 flex-1"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        <span>جاري المعالجة...</span>
                      </div>
                    ) : (
                      <>
                        <Trash size={18} />
                        <span>نعم، إعادة تعيين النظام</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setConfirmReset(false)}
                    disabled={isProcessing}
                    className="bg-physics-navy hover:bg-physics-navy/70 text-white px-4 py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemReset;
