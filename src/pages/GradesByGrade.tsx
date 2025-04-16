
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Plus, Search } from "lucide-react";
import { Student, Grade } from "@/types";
import { getGradeDisplay, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GradesByGrade = () => {
  const navigate = useNavigate();
  const { grade = "first" } = useParams<{ grade: "first" | "second" | "third" }>();
  const { getAllStudents } = useAuth();
  const { grades, addGrade } = useData();
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "code">("name");

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [examName, setExamName] = useState("");
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(100);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [group, setGroup] = useState("A"); // Default group
  
  useEffect(() => {
    // Get all students for this grade
    const allStudents = getAllStudents();
    const gradeStudents = allStudents.filter(student => student.grade === grade);
    setStudents(gradeStudents);
  }, [getAllStudents, grade]);

  const getGradeTitle = () => {
    switch (grade) {
      case "first": return "الصف الأول الثانوي";
      case "second": return "الصف الثاني الثانوي";
      case "third": return "الصف الثالث الثانوي";
      default: return "";
    }
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;
    
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
    setGroup("A");
    setShowAddForm(false);
  };
  
  // Filter grades for the selected grade level
  const filteredGrades = grades.filter(g => {
    const student = students.find(s => s.id === g.studentId);
    if (!student) return false;
    
    // If we have a search term, filter by student name or exam name or code based on searchType
    if (searchTerm) {
      if (searchType === "name") {
        return student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               g.examName.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return student.code.includes(searchTerm);
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
                className="inputField"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as "name" | "code")}
              >
                <option value="name">بحث بالاسم</option>
                <option value="code">بحث بالكود</option>
              </select>
            </div>
            
            <div className="relative w-full md:w-3/4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12"
                placeholder={searchType === "name" ? "ابحث عن طالب بالاسم أو عنوان الاختبار" : "ابحث عن طالب بالكود"}
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
                        <TableCell className="text-white">{grade.group || "A"}</TableCell>
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
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة درجة جديدة</h2>
            
            <form onSubmit={handleAddGrade} className="space-y-4">
              <div>
                <label className="block text-white mb-1">الطالب</label>
                <div className="mb-2">
                  <input
                    type="text"
                    className="inputField mb-2"
                    placeholder="ابحث عن الطالب بالاسم أو الكود"
                    onChange={(e) => {
                      const searchVal = e.target.value.toLowerCase();
                      // Clear the selection when search changes
                      setSelectedStudentId("");
                    }}
                  />
                </div>
                <select
                  className="inputField"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                >
                  <option value="">اختر الطالب</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.code}
                    </option>
                  ))}
                </select>
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
                  <label className="block text-white mb-1">المجموعة</label>
                  <select
                    className="inputField"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    required
                  >
                    <option value="A">المجموعة A</option>
                    <option value="B">المجموعة B</option>
                    <option value="C">المجموعة C</option>
                    <option value="D">المجموعة D</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-1">الدرجة المحصلة</label>
                  <input
                    type="number"
                    className="inputField"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    min={0}
                    required
                  />
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
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
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
