
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Plus, Search, X } from "lucide-react";
import { Student, Grade } from "@/types";
import { getGradeDisplay, formatDate, sanitizeSearchText } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

const GradesByGrade = () => {
  const navigate = useNavigate();
  const { grade = "first" } = useParams<{ grade: "first" | "second" | "third" }>();
  const { getAllStudents } = useAuth();
  const { grades, addGrade } = useData();
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "code" | "group">("name");

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [examName, setExamName] = useState("");
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(100);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [group, setGroup] = useState("");
  
  // Search in AddForm
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState<Student[]>([]);
  const [showStudentSearchResults, setShowStudentSearchResults] = useState(false);
  
  useEffect(() => {
    // Get all students for this grade
    const allStudents = getAllStudents();
    const gradeStudents = allStudents.filter(student => student.grade === grade);
    setStudents(gradeStudents);
  }, [getAllStudents, grade]);
  
  // Handle student search in add form
  useEffect(() => {
    if (studentSearchQuery.length > 0) {
      const query = sanitizeSearchText(studentSearchQuery);
      const results = students.filter(student => {
        return sanitizeSearchText(student.name).includes(query) || 
               sanitizeSearchText(student.code).includes(query);
      });
      setStudentSearchResults(results);
      setShowStudentSearchResults(true);
    } else {
      setStudentSearchResults([]);
      setShowStudentSearchResults(false);
    }
  }, [studentSearchQuery, students]);

  const getGradeTitle = () => {
    switch (grade) {
      case "first": return "الصف الأول الثانوي";
      case "second": return "الصف الثاني الثانوي";
      case "third": return "الصف الثالث الثانوي";
      default: return "";
    }
  };
  
  const handleSelectStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setStudentSearchQuery("");
    setShowStudentSearchResults(false);
    setGroup(student.group || "");
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
      toast({
        title: "❌ خطأ",
        description: "يرجى اختيار طالب أولاً",
        variant: "destructive"
      });
      return;
    }
    
    if (!examName) {
      toast({
        title: "❌ خطأ",
        description: "يرجى إدخال عنوان الاختبار",
        variant: "destructive"
      });
      return;
    }
    
    addGrade(
      student.id, 
      student.name, 
      examName,
      score,
      totalScore,
      lessonNumber,
      group // Pass the group parameter
    );
    
    // Reset form
    setSelectedStudentId("");
    setExamName("");
    setScore(0);
    setTotalScore(100);
    setLessonNumber(1);
    setGroup("");
    setShowAddForm(false);
    
    toast({
      title: "✅ تم إضافة الدرجة",
      description: `تم إضافة درجة للطالب ${student.name} بنجاح`,
    });
  };
  
  // Filter grades for the selected grade level
  const filteredGrades = grades.filter(g => {
    const student = students.find(s => s.id === g.studentId);
    if (!student) return false;
    
    // إذا كان هناك بحث، قم بتصفية النتائج حسب نوع البحث
    if (searchTerm) {
      const query = sanitizeSearchText(searchTerm);
      
      switch (searchType) {
        case "name":
          return sanitizeSearchText(g.studentName).includes(query);
        case "code":
          return student.code ? sanitizeSearchText(student.code).includes(query) : false;
        case "group":
          return g.group ? sanitizeSearchText(g.group).includes(query) : false;
        default:
          return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/grades-management")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة لقائمة الصفوف</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-physics-gold">سجل الدرجات</h1>
              <p className="text-white mt-1">{getGradeTitle()}</p>
            </div>
            
            <button 
              onClick={() => setShowAddForm(true)}
              className="goldBtn flex items-center gap-2"
            >
              <Plus size={18} />
              إضافة درجة
            </button>
          </div>
          
          {/* Search with Type Selector */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/4">
              <select
                className="inputField w-full"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as "name" | "code" | "group")}
              >
                <option value="name">بحث بالاسم</option>
                <option value="code">بحث بالكود</option>
                <option value="group">بحث بالمجموعة</option>
              </select>
            </div>
            
            <div className="relative w-full md:w-3/4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12 w-full"
                placeholder={
                  searchType === "name" ? "ابحث عن طالب بالاسم" :
                  searchType === "code" ? "ابحث بكود الطالب" :
                  "ابحث بالمجموعة"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {filteredGrades.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد درجات مسجلة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">الاختبار</TableHead>
                    <TableHead className="text-center">الدرجة</TableHead>
                    <TableHead className="text-center">من</TableHead>
                    <TableHead className="text-right">رقم الحصة</TableHead>
                    <TableHead className="text-right">المجموعة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => {
                    const student = students.find(s => s.id === grade.studentId);
                    
                    return (
                      <TableRow key={grade.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <TableCell className="text-white">{grade.studentName}</TableCell>
                        <TableCell className="text-white">{student?.code || ""}</TableCell>
                        <TableCell className="text-white">{grade.examName}</TableCell>
                        <TableCell className="text-center text-white">{grade.score}</TableCell>
                        <TableCell className="text-center text-white">{grade.totalScore}</TableCell>
                        <TableCell className="text-white">الحصة {grade.lessonNumber || 1}</TableCell>
                        <TableCell className="text-white">{grade.group || "—"}</TableCell>
                        <TableCell className="text-white">{formatDate(grade.date)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      
      {/* Add Grade Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-physics-gold">إضافة درجة جديدة</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-white hover:text-physics-gold"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddGrade} className="space-y-4">
              {/* بحث عن الطالب */}
              <div>
                <label className="block text-white mb-1">الطالب</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-physics-gold" size={18} />
                  <input
                    type="text"
                    className="inputField pr-10 w-full"
                    placeholder="ابحث عن الطالب بالاسم أو الكود"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                  />
                  
                  {/* نتائج البحث عن طالب */}
                  {showStudentSearchResults && studentSearchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-physics-navy border border-physics-gold rounded-md shadow-lg max-h-48 overflow-auto">
                      {studentSearchResults.map(student => (
                        <div 
                          key={student.id} 
                          className="p-2 hover:bg-physics-dark cursor-pointer text-white border-b border-physics-navy/50"
                          onClick={() => handleSelectStudent(student)}
                        >
                          <div>{student.name}</div>
                          <div className="text-xs text-physics-gold">كود: {student.code} | مجموعة: {student.group || "—"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showStudentSearchResults && studentSearchResults.length === 0 && studentSearchQuery && (
                    <div className="absolute z-10 mt-1 w-full bg-physics-navy border border-red-500 rounded-md p-2 text-center text-white">
                      لا توجد نتائج
                    </div>
                  )}
                </div>
                
                {/* عرض الطالب المختار */}
                {selectedStudentId && (
                  <div className="mt-2 bg-physics-navy/50 p-2 rounded">
                    <p className="text-sm text-physics-gold">
                      {students.find(s => s.id === selectedStudentId)?.name}
                      {" - كود: "}
                      {students.find(s => s.id === selectedStudentId)?.code}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-white mb-1">عنوان الاختبار</label>
                <input
                  type="text"
                  className="inputField"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">المجموعة</label>
                <input
                  type="text"
                  className="inputField"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="أدخل اسم المجموعة"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-1">رقم الحصة</label>
                  <select
                    className="inputField"
                    value={lessonNumber}
                    onChange={(e) => setLessonNumber(Number(e.target.value))}
                    required
                  >
                    <option value={1}>الحصة الأولى</option>
                    <option value={2}>الحصة الثانية</option>
                    <option value={3}>الحصة الثالثة</option>
                    <option value={4}>الحصة الرابعة</option>
                    <option value={5}>الحصة الخامسة</option>
                    <option value={6}>الحصة السادسة</option>
                    <option value={7}>الحصة السابعة</option>
                    <option value={8}>الحصة الثامنة</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white mb-1">الدرجة الكلية</label>
                  <input
                    type="number"
                    className="inputField"
                    value={totalScore}
                    onChange={(e) => setTotalScore(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white mb-1">الدرجة المحصلة</label>
                <input
                  type="number"
                  className="inputField"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  min={0}
                  max={totalScore}
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="goldBtn flex-1"
                  disabled={!selectedStudentId || !examName || !group}
                >
                  إضافة الدرجة
                </button>
                <button 
                  type="button" 
                  className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesByGrade;
