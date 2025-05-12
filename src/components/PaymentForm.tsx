
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/use-payments";
import { Student } from "@/types";
import { Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentFormProps {
  onClose: () => void;
}

export function PaymentForm({ onClose }: PaymentFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [month, setMonth] = useState("");
  const [customGroup, setCustomGroup] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  
  const { getAllStudents } = useAuth();
  const { addPayment } = usePayments();
  
  // Handle search
  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = getAllStudents().filter(
        student => 
          student.name.includes(searchQuery) || 
          student.code.includes(searchQuery)
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, getAllStudents]);
  
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    // Set the default group from the student data
    setCustomGroup(student.group || "");
    setSearchQuery("");
    setShowResults(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار طالب أولا",
        variant: "destructive",
      });
      return;
    }
    
    if (!month) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة اسم الشهر",
        variant: "destructive",
      });
      return;
    }
    
    const result = addPayment(
      selectedStudent.id,
      selectedStudent.name,
      selectedStudent.code,
      customGroup, // Use the custom group input instead of student.group
      month
    );
    
    if (result.success) {
      toast({
        title: "تم تسجيل الدفعة",
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
  
  return (
    <div className="bg-physics-dark rounded-lg p-4 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-physics-gold font-bold">دفع شهر جديد</h3>
        <button onClick={onClose} className="text-white hover:text-physics-gold">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* بحث عن الطالب */}
        {!selectedStudent && (
          <div className="relative">
            <label className="block text-white mb-2 text-sm">بحث عن الطالب (بالاسم أو الكود)</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-physics-gold" size={18} />
              <input
                type="text"
                className="inputField pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اكتب اسم الطالب أو الكود..."
              />
            </div>
            
            {/* نتائج البحث */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-physics-navy border border-physics-gold rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map(student => (
                  <div 
                    key={student.id} 
                    className="p-2 hover:bg-physics-dark cursor-pointer text-white border-b border-physics-navy/50"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div>{student.name}</div>
                    <div className="text-xs text-physics-gold">كود: {student.code} | مجموعة: {student.group}</div>
                  </div>
                ))}
              </div>
            )}
            
            {showResults && searchResults.length === 0 && (
              <div className="absolute z-10 mt-1 w-full bg-physics-navy border border-red-500 rounded-md p-2 text-center text-white">
                لا توجد نتائج
              </div>
            )}
          </div>
        )}
        
        {/* بيانات الطالب المحدد */}
        {selectedStudent && (
          <div className="bg-physics-navy/50 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <h4 className="text-physics-gold font-bold">بيانات الطالب</h4>
              <button 
                type="button" 
                className="text-xs text-red-400 hover:text-red-300"
                onClick={() => setSelectedStudent(null)}
              >
                تغيير الطالب
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-white">الاسم: <span className="text-physics-gold">{selectedStudent.name}</span></div>
              <div className="text-white">الكود: <span className="text-physics-gold">{selectedStudent.code}</span></div>
              
              {/* Manual Group Input */}
              <div className="col-span-2 mt-2">
                <label className="block text-white mb-1 text-sm">المجموعة</label>
                <input
                  type="text"
                  className="inputField bg-physics-navy/60 border-physics-gold/50 text-white w-full"
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value)}
                  placeholder="أدخل اسم المجموعة"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* حقل الشهر - مدخل نصي */}
        <div>
          <label className="block text-white mb-1 text-sm">اسم الشهر</label>
          <input
            type="text"
            className="inputField"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="مثال: يناير 2024"
            required
          />
        </div>
        
        <div className="pt-2 flex gap-2">
          <button 
            type="submit" 
            className="goldBtn flex-1"
            disabled={!selectedStudent || !month}
          >
            تسجيل الدفعة
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
