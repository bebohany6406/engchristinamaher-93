
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, CheckCircle, XCircle, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student, Attendance } from "@/types";

const AttendanceListByGrade = () => {
  const navigate = useNavigate();
  const { grade = "first" } = useParams<{ grade: "first" | "second" | "third" }>();
  const { currentUser, getAllStudents } = useAuth();
  const { getStudentAttendance } = useData();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all");
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Get all students for this grade
    const allStudents = getAllStudents();
    const gradeStudents = allStudents.filter(student => student.grade === grade);
    setStudents(gradeStudents);
    
    // Get attendance records for all students
    const records: Attendance[] = [];
    gradeStudents.forEach(student => {
      const studentRecords = getStudentAttendance(student.id);
      records.push(...studentRecords);
    });
    
    setAttendanceRecords(records);
  }, [currentUser, getAllStudents, getStudentAttendance, grade]);
  
  const filteredRecords = attendanceRecords.filter(record => {
    if (filter === "all") return true;
    if (filter === "present") return record.status === "present";
    if (filter === "absent") return record.status === "absent";
    return true;
  });

  const getGradeTitle = () => {
    switch (grade) {
      case "first": return "الصف الأول الثانوي";
      case "second": return "الصف الثاني الثانوي";
      case "third": return "الصف الثالث الثانوي";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/attendance-list")}
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-physics-gold">سجل الحضور</h1>
              <p className="text-white mt-1">{getGradeTitle()}</p>
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2 bg-physics-dark rounded-lg p-2">
              <Filter className="text-physics-gold" size={20} />
              <select 
                className="bg-transparent text-white border-none outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">الكل</option>
                <option value="present">الحاضرين</option>
                <option value="absent">الغائبين</option>
              </select>
            </div>
          </div>
          
          {filteredRecords.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد سجلات حضور متاحة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوقت</TableHead>
                    <TableHead className="text-right">رقم الحصة</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const student = students.find(s => s.id === record.studentId);
                    
                    return (
                      <TableRow key={record.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <TableCell className="text-white">{record.studentName}</TableCell>
                        <TableCell className="text-white">{student?.code || ""}</TableCell>
                        <TableCell className="text-white">{formatDate(record.date)}</TableCell>
                        <TableCell className="text-white">{record.time || "غير متاح"}</TableCell>
                        <TableCell className="text-white">الحصة {record.lessonNumber || 1}</TableCell>
                        <TableCell className="text-center">
                          {record.status === "present" ? (
                            <div className="inline-flex items-center text-green-400 gap-1">
                              <CheckCircle size={18} />
                              <span>حاضر</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center text-red-400 gap-1">
                              <XCircle size={18} />
                              <span>غائب</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceListByGrade;
