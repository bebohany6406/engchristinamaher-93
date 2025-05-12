
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PhysicsBackground from "@/components/PhysicsBackground";
import { supabase } from "@/integrations/supabase/client";

const SystemReset = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<"first" | "second" | "third">("first");
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (confirmText !== `reset-${selectedGrade}`) {
      toast({
        title: "خطأ في التأكيد",
        description: "الرجاء كتابة نص التأكيد بشكل صحيح",
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);
    
    try {
      toast({
        title: "جاري إعادة تعيين النظام",
        description: "يرجى الانتظار..."
      });
      
      // 1. حذف الدرجات للصف المحدد
      const { error: gradesError } = await supabase
        .from('grades')
        .delete()
        .eq('group_name', `${selectedGrade}-group`);
      
      if (gradesError) throw gradesError;
      
      // 2. حذف الفيديوهات للصف المحدد
      const { error: videosError } = await supabase
        .from('videos')
        .delete()
        .eq('grade', selectedGrade);
      
      if (videosError) throw videosError;
      
      // 3. حذف الكتب للصف المحدد
      const { error: booksError } = await supabase
        .from('books')
        .delete()
        .eq('grade', selectedGrade);
      
      if (booksError) throw booksError;
      
      // 4. ملاحظة: لا يمكننا حذف سجلات الحضور لصف محدد لأنها لا تحتوي على حقل "grade"
      // يمكن تعديل الجدول لاحقًا ليشمل هذه المعلومات
      
      // الانتهاء
      toast({
        title: "تم إعادة تعيين النظام",
        description: `تم حذف بيانات ${getGradeName(selectedGrade)} بنجاح`,
      });
      
      setConfirmText("");
    } catch (error) {
      console.error("Error resetting system:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إعادة التعيين",
        description: "حدث خطأ أثناء محاولة حذف البيانات"
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  const getGradeName = (grade: string) => {
    switch(grade) {
      case "first": return "الصف الأول الثانوي";
      case "second": return "الصف الثاني الثانوي";
      case "third": return "الصف الثالث الثانوي";
      default: return "";
    }
  };
  
  // توجيه المستخدمين غير المسؤولين
  if (currentUser?.role !== "admin") {
    navigate("/unauthorized");
    return null;
  }

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <button 
          onClick={() => navigate("/dashboard")} 
          className="flex items-center gap-2 text-physics-gold hover:opacity-80"
        >
          <ArrowRight size={20} />
          <span>العودة للرئيسية</span>
        </button>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-2xl mx-auto bg-physics-dark rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={28} className="text-red-500" />
            <h1 className="text-2xl font-bold text-physics-gold">إعادة تعيين النظام</h1>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-white text-lg font-semibold mb-2">تحذير!</p>
            <p className="text-gray-300">
              ستقوم هذه العملية بحذف كافة البيانات المتعلقة بالصف الدراسي المحدد بما في ذلك:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              <li>درجات الطلاب</li>
              <li>الفيديوهات التعليمية</li>
              <li>الكتب والملفات</li>
            </ul>
            <p className="text-red-400 font-semibold mt-2">
              هذه العملية لا يمكن التراجع عنها!
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="grade" className="block text-white mb-2">
                اختر الصف الدراسي
              </label>
              <select 
                id="grade"
                className="inputField" 
                value={selectedGrade} 
                onChange={e => setSelectedGrade(e.target.value as "first" | "second" | "third")}
              >
                <option value="first">الصف الأول الثانوي</option>
                <option value="second">الصف الثاني الثانوي</option>
                <option value="third">الصف الثالث الثانوي</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="confirm" className="block text-white mb-2">
                اكتب "<span className="text-red-400">reset-{selectedGrade}</span>" للتأكيد
              </label>
              <input 
                id="confirm"
                type="text" 
                className="inputField" 
                value={confirmText} 
                onChange={e => setConfirmText(e.target.value)} 
                placeholder={`reset-${selectedGrade}`}
              />
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleReset}
                disabled={confirmText !== `reset-${selectedGrade}` || isResetting}
                className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center ${
                  confirmText === `reset-${selectedGrade}` && !isResetting 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isResetting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري إعادة التعيين...
                  </>
                ) : (
                  `إعادة تعيين بيانات ${getGradeName(selectedGrade)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemReset;
