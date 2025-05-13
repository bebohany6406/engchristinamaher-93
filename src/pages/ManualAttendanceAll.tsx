
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { Student, Attendance } from "@/types";
import { getGradeDisplay, sanitizeSearchText } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ManualAttendanceAll = () => {
  const navigate = useNavigate();
  const { getAllStudents } = useAuth();
  const { addAttendance, getStudentLessonCount } = useData();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"all" | "name" | "code" | "group">("all");
  const [selectedGrade, setSelectedGrade] = useState<"all" | "first" | "second" | "third">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [processingStudentId, setProcessingStudentId] = useState<string | null>(null);
  
  useEffect(() => {
    // تحميل قائمة الطلاب عند تحميل الصفحة
    setStudents(getAllStudents());
  }, [getAllStudents]);
  
  // تصفية الطلاب بناءً على البحث والفلتر
  const filteredStudents = students.filter(student => {
    const query = sanitizeSearchText(searchQuery);
    const matchesSearch = !query || (
      searchField === "all" ? (
        sanitizeSearchText(student.name).includes(query) ||
        sanitizeSearchText(student.code).includes(query) ||
        (student.group ? sanitizeSearchText(student.group).includes(query) : false)
      ) :
      searchField === "name" ? sanitizeSearchText(student.name).includes(query) :
      searchField === "code" ? sanitizeSearchText(student.code).includes(query) :
      searchField === "group" && student.group ? sanitizeSearchText(student.group).includes(query) : false
    );
    
    const matchesGrade = selectedGrade === "all" || student.grade === selectedGrade;
    
    return matchesSearch && matchesGrade;
  });
  
  const handleMarkAttendance = async (student: Student, status: "present" | "absent") => {
    setProcessingStudentId(student.id);
    
    try {
      // حساب رقم الدرس الحالي للطالب
      const lessonNumber = getStudentLessonCount(student.id) + 1;
      
      // تسجيل الحضور أو الغياب
      await addAttendance(student.id, student.name, status, lessonNumber);
      
      // تشغيل صوت مناسب للحالة
      const audio = new Audio(status === "present" ? "/attendance-present.mp3" : "/attendance-absent.mp3");
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: status === "present" ? "✅ تم تسجيل الحضور" : "❌ تم تسجيل الغياب",
        description: `تم تسجيل ${status === "present" ? "حضور" : "غياب"} الطالب ${student.name}`
      });
    } catch (error) {
      console.error(`Error marking attendance as ${status}:`, error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: `حدث خطأ أثناء تسجيل ${status === "present" ? "الحضور" : "الغياب"}`
      });
    } finally {
      setProcessingStudentId(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
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
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">تسجيل الحضور اليدوي لجميع الطلاب</h1>
          </div>
          
          {/* Search and Filter Controls */}
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
                <option value="group">بحث بالمجموعة</option>
              </select>
            </div>
            
            <div className="md:w-1/4">
              <select
                className="inputField w-full"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as any)}
              >
                <option value="all">جميع الصفوف</option>
                <option value="first">الصف الأول الثانوي</option>
                <option value="second">الصف الثاني الثانوي</option>
                <option value="third">الصف الثالث الثانوي</option>
              </select>
            </div>
            
            <div className="relative md:w-2/4">
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
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">جاري تحميل البيانات...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد طلاب مطابقين لبحثك</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-physics-navy/50 text-physics-gold">
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الكود</TableHead>
                      <TableHead className="text-right">المجموعة</TableHead>
                      <TableHead className="text-right">الصف</TableHead>
                      <TableHead className="text-center">تسجيل الحضور/الغياب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <TableCell className="py-3 px-4 text-white">{student.name}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{student.code}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{student.group || "—"}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{getGradeDisplay(student.grade)}</TableCell>
                        <TableCell className="py-3 px-4 text-white text-center">
                          <div className="flex justify-center gap-3">
                            <button 
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleMarkAttendance(student, "present")}
                              disabled={processingStudentId === student.id}
                            >
                              <CheckCircle2 size={18} />
                              <span>حضور</span>
                            </button>
                            <button 
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleMarkAttendance(student, "absent")}
                              disabled={processingStudentId === student.id}
                            >
                              <XCircle size={18} />
                              <span>غياب</span>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManualAttendanceAll;
