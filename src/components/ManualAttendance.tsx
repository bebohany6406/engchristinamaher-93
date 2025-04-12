
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { toast } from "@/hooks/use-toast";

export function ManualAttendance() {
  const [studentCode, setStudentCode] = useState("");
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string } | null>(null);
  
  const { getStudentByCode } = useAuth();
  const { addAttendance } = useData();

  const handleLookup = () => {
    if (!studentCode.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال كود الطالب"
      });
      return;
    }

    const student = getStudentByCode(studentCode);
    if (student) {
      setStudentInfo({ id: student.id, name: student.name });
    } else {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم العثور على طالب بهذا الكود"
      });
      setStudentInfo(null);
    }
  };

  const handleAbsence = () => {
    if (studentInfo) {
      addAttendance(studentInfo.id, studentInfo.name, "absent");
      // Play sound effect
      const audio = new Audio("/attendance-absent.mp3");
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: "تم تسجيل الغياب",
        description: `تم تسجيل غياب الطالب ${studentInfo.name}`
      });
      setStudentCode("");
      setStudentInfo(null);
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
          />
          <button 
            onClick={handleLookup}
            className="goldBtn"
          >
            بحث
          </button>
        </div>
        
        {studentInfo && (
          <div className="bg-physics-navy p-4 rounded-lg">
            <p className="text-white mb-2">الطالب: <span className="font-bold">{studentInfo.name}</span></p>
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
