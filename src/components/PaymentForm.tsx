
import { useState } from "react";
import { X, Search, Check } from "lucide-react";
import { usePayments } from "@/hooks/use-payments";
import { useData } from "@/context/DataContext";
import { toast } from "@/hooks/use-toast";
import { Student } from "@/types";

interface PaymentFormProps {
  onClose: () => void;
}

export function PaymentForm({ onClose }: PaymentFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [month, setMonth] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { addPayment } = usePayments();
  const { getStudentLessonCount } = useData();

  // دالة البحث عن الطالب
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredStudents([]);
      setShowResults(false);
      return;
    }

    // بحث وهمي عن الطلاب (يجب استبداله بالبحث الفعلي)
    const storedStudents = localStorage.getItem("students");
    let students: Student[] = [];
    
    if (storedStudents) {
      try {
        students = JSON.parse(storedStudents);
        const filtered = students.filter(student => 
          student.name.includes(query) || 
          student.code.includes(query) ||
          student.group.includes(query)
        );
        setFilteredStudents(filtered);
        setShowResults(true);
      } catch (error) {
        console.error("Failed to parse students:", error);
      }
    }
  };

  // اختيار طالب
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setShowResults(false);
  };

  // حفظ الدفعة
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !month.trim()) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى اختيار الطالب وإدخال الشهر",
        variant: "destructive",
      });
      return;
    }
    
    // إضافة الدفعة
    const result = addPayment(
      selectedStudent.id,
      selectedStudent.name,
      selectedStudent.code,
      selectedStudent.group,
      month
    );
    
    if (result.success) {
      toast({
        title: "تم بنجاح",
        description: result.message,
      });
      onClose();
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const getMonthSuggestions = () => {
    const months = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return months;
  };

  return (
    <div className="bg-physics-dark p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-physics-gold">دفع شهر جديد</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* بحث عن طالب */}
        <div>
          <label className="block text-white mb-1">بحث عن الطالب</label>
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="inputField pr-10"
              placeholder="اكتب اسم الطالب أو الكود"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          {/* نتائج البحث */}
          {showResults && filteredStudents.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-physics-navy border border-physics-gold rounded-md overflow-auto max-h-60">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  className="p-2 hover:bg-physics-dark cursor-pointer flex items-center justify-between"
                  onClick={() => handleSelectStudent(student)}
                >
                  <div>
                    <div>{student.name}</div>
                    <div className="text-sm text-gray-400">
                      كود: {student.code} | مجموعة: {student.group}
                    </div>
                  </div>
                  {selectedStudent?.id === student.id && (
                    <Check size={18} className="text-green-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* بيانات الطالب */}
        {selectedStudent && (
          <div className="bg-physics-navy/50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-2">بيانات الطالب</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">الاسم:</span>
                <span className="text-white mr-2">{selectedStudent.name}</span>
              </div>
              <div>
                <span className="text-gray-400">الكود:</span>
                <span className="text-white mr-2">{selectedStudent.code}</span>
              </div>
              <div>
                <span className="text-gray-400">المجموعة:</span>
                <span className="text-white mr-2">{selectedStudent.group}</span>
              </div>
              <div>
                <span className="text-gray-400">عدد الحصص:</span>
                <span className="text-white mr-2">{getStudentLessonCount(selectedStudent.id)}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* اختيار الشهر */}
        <div>
          <label className="block text-white mb-1">اسم الشهر</label>
          <input 
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="inputField"
            placeholder="مثال: يناير 2023"
            list="month-suggestions"
          />
          <datalist id="month-suggestions">
            {getMonthSuggestions().map((month, index) => (
              <option key={index} value={`${month} ${new Date().getFullYear()}`} />
            ))}
          </datalist>
        </div>
        
        {/* أزرار */}
        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="goldBtn flex-1"
            disabled={!selectedStudent || !month.trim()}
          >
            تسجيل الدفعة
          </button>
          <button 
            type="button" 
            className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
            onClick={onClose}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
