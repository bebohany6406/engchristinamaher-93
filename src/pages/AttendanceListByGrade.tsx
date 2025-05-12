
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Search, Calendar, UserCheck, UserX, Trash2 } from "lucide-react";
import { Student, Attendance } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { sanitizeSearchText, getGradeDisplay } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const AttendanceListByGrade = () => {
  const navigate = useNavigate();
  const { grade = "first" } = useParams<{ grade: "first" | "second" | "third" }>();
  const { getAllStudents } = useAuth();
  const { attendance, deleteAttendance } = useData();

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"name" | "code" | "date" | "status" | "all">("all");
  
  useEffect(() => {
    // Get all students for this grade
    const allStudents = getAllStudents();
    const gradeStudents = allStudents.filter(student => student.grade === grade);
    setStudents(gradeStudents);
  }, [getAllStudents, grade]);
  
  const getAttendanceWithStudents = () => {
    // Filter attendance records for students in this grade
    return attendance.filter(record => {
      // Find the student for this attendance record
      const student = students.find(s => s.id === record.studentId);
      return student !== undefined;
    });
  };
  
  const handleDeleteAttendance = (id: string, studentName: string) => {
    if (confirm(`هل أنت متأكد من حذف سجل حضور الطالب ${studentName}؟`)) {
      deleteAttendance(id);
    }
  };
  
  // Filter attendance records based on search query
  const filteredAttendance = getAttendanceWithStudents().filter(record => {
    if (!searchQuery) return true;
    
    const query = sanitizeSearchText(searchQuery);
    const student = students.find(s => s.id === record.studentId);
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(record.studentName).includes(query);
      case "code":
        return student && student.code ? sanitizeSearchText(student.code).includes(query) : false;
      case "date":
        return sanitizeSearchText(record.date).includes(query);
      case "status":
        return record.status === "present" && "حاضر".includes(query) ||
               record.status === "absent" && "غائب".includes(query);
      case "all":
      default:
        return (
          sanitizeSearchText(record.studentName).includes(query) ||
          (student && student.code && sanitizeSearchText(student.code).includes(query)) ||
          sanitizeSearchText(record.date).includes(query) ||
          (record.status === "present" && "حاضر".includes(query)) ||
          (record.status === "absent" && "غائب".includes(query))
        );
    }
  });
  
  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/attendance-records")}
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">سجل الحضور</h1>
            <p className="text-white mt-1">{getGradeDisplay(grade)}</p>
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
                <option value="date">بحث بالتاريخ</option>
                <option value="status">بحث بالحالة</option>
              </select>
            </div>
            
            <div className="relative md:w-3/4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12 w-full"
                placeholder="ابحث في سجلات الحضور..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {filteredAttendance.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد سجلات حضور</p>
            </div>
          ) : (
            <div className="bg-physics-dark/80 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">الكود</th>
                      <th className="text-center py-3 px-4">رقم الحصة</th>
                      <th className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar size={16} />
                          <span>التاريخ</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4">الحالة</th>
                      <th className="text-center py-3 px-4">خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => {
                      const student = students.find(s => s.id === record.studentId);
                      
                      return (
                        <tr key={record.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                          <td className="py-3 px-4 text-white">{record.studentName}</td>
                          <td className="py-3 px-4 text-white">{student?.code || ""}</td>
                          <td className="py-3 px-4 text-white text-center">الحصة {record.lessonNumber}</td>
                          <td className="py-3 px-4 text-white text-center">{record.date}</td>
                          <td className="py-3 px-4 text-center">
                            {record.status === "present" ? (
                              <div className="inline-flex items-center gap-1 text-green-500">
                                <UserCheck size={16} />
                                <span>حاضر</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 text-red-500">
                                <UserX size={16} />
                                <span>غائب</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => handleDeleteAttendance(record.id, record.studentName)}
                              className="p-1 text-red-400 hover:text-red-500"
                              title="حذف"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceListByGrade;
