
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Search, UserPlus, X } from "lucide-react";
import { Student, Parent } from "@/types";
import { toast } from "@/hooks/use-toast";
import { sanitizeSearchText } from "@/lib/utils";

const StudentsManagement = () => {
  const navigate = useNavigate();
  const { createStudent, getAllStudents, getAllParents } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"all" | "name" | "code" | "phone" | "group" | "grade">("all");
  const [newStudentInfo, setNewStudentInfo] = useState<{
    name: string;
    code: string;
    password: string;
    grade: string;
  } | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");
  const [parentPhone, setParentPhone] = useState("");
  const [group, setGroup] = useState("");
  
  useEffect(() => {
    loadStudents();
    loadParents();
  }, []);
  
  const loadStudents = () => {
    setStudents(getAllStudents());
  };
  
  const loadParents = () => {
    setParents(getAllParents());
  };
  
  const filteredStudents = students.filter(student => {
    const query = sanitizeSearchText(searchQuery);
    if (!query) return true;
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(student.name).includes(query);
      case "code":
        return student.code ? sanitizeSearchText(student.code).includes(query) : false;
      case "phone":
        return student.parentPhone ? sanitizeSearchText(student.parentPhone).includes(query) : false;
      case "group":
        return student.group ? sanitizeSearchText(student.group).includes(query) : false;
      case "grade":
        return student.grade === "first" && "الأول".includes(query) || 
               student.grade === "second" && "الثاني".includes(query) ||
               student.grade === "third" && "الثالث".includes(query);
      case "all":
      default:
        return (
          sanitizeSearchText(student.name).includes(query) ||
          (student.code && sanitizeSearchText(student.code).includes(query)) ||
          (student.parentPhone && sanitizeSearchText(student.parentPhone).includes(query)) ||
          (student.group && sanitizeSearchText(student.group).includes(query)) ||
          (student.grade === "first" && "الأول".includes(query)) ||
          (student.grade === "second" && "الثاني".includes(query)) ||
          (student.grade === "third" && "الثالث".includes(query))
        );
    }
  });
  
  const getGradeDisplay = (grade: "first" | "second" | "third") => {
    switch (grade) {
      case "first": return "الأول الثانوي";
      case "second": return "الثاني الثانوي";
      case "third": return "الثالث الثانوي";
      default: return "";
    }
  };
  
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newStudent = createStudent(name, grade, parentPhone, group);
      
      // Show info about the newly created student
      setNewStudentInfo({
        name: newStudent.name,
        code: newStudent.code || "",
        password: newStudent.password || "",
        grade: getGradeDisplay(newStudent.grade)
      });
      
      // Update students list
      loadStudents();
      
      // Reset form
      setName("");
      setGrade("first");
      setParentPhone("");
      setGroup("");
      setShowAddForm(false);
      
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إنشاء حساب الطالب",
        variant: "destructive",
      });
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">إدارة الطلاب</h1>
            <button 
              onClick={() => setShowAddForm(true)}
              className="goldBtn flex items-center gap-2"
            >
              <UserPlus size={18} />
              <span>إضافة طالب جديد</span>
            </button>
          </div>
          
          {/* Search with filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/4">
              <select
                className="inputField w-full"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
              >
                <option value="all">بحث في كل الحقول</option>
                <option value="name">بحث بالاسم</option>
                <option value="code">بحث بالكود</option>
                <option value="phone">بحث برقم الهاتف</option>
                <option value="group">بحث بالمجموعة</option>
                <option value="grade">بحث بالصف</option>
              </select>
            </div>
            
            <div className="relative md:w-3/4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12 w-full"
                placeholder="ابحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Students List */}
          <div className="bg-physics-dark/80 rounded-lg overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد طلاب مسجلين</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">الصف</th>
                      <th className="text-right py-3 px-4">كود الطالب</th>
                      <th className="text-right py-3 px-4">كلمة المرور</th>
                      <th className="text-right py-3 px-4">رقم ولي الأمر</th>
                      <th className="text-right py-3 px-4">المجموعة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <td className="py-3 px-4 text-white">{student.name}</td>
                        <td className="py-3 px-4 text-white">{getGradeDisplay(student.grade)}</td>
                        <td className="py-3 px-4 text-white">{student.code}</td>
                        <td className="py-3 px-4 text-white font-bold text-physics-gold">{student.password}</td>
                        <td className="py-3 px-4 text-white">{student.parentPhone || "—"}</td>
                        <td className="py-3 px-4 text-white">{student.group || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-physics-gold">إضافة طالب جديد</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-white hover:text-physics-gold"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">اسم الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف</label>
                <select
                  className="inputField"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as "first" | "second" | "third")}
                  required
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white mb-1">المجموعة</label>
                <input
                  type="text"
                  className="inputField"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="اختياري"
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم هاتف ولي الأمر</label>
                <input
                  type="text"
                  className="inputField"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="اختياري"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  className="goldBtn w-full"
                >
                  إضافة الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Show New Student Info Modal */}
      {newStudentInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-4">تم إنشاء حساب الطالب بنجاح</h2>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-300">اسم الطالب:</p>
                <p className="text-white font-bold">{newStudentInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">الصف:</p>
                <p className="text-white font-bold">{newStudentInfo.grade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">كود الطالب:</p>
                <p className="text-white font-bold">{newStudentInfo.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">كلمة المرور:</p>
                <p className="text-physics-gold text-xl font-bold">{newStudentInfo.password}</p>
              </div>
            </div>
            
            <button 
              className="goldBtn w-full"
              onClick={() => setNewStudentInfo(null)}
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
