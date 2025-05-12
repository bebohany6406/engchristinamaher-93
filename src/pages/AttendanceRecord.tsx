
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, Calendar, Check, X } from "lucide-react";
import { Student, Attendance } from "@/types";
import { formatDate } from "@/lib/utils";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AttendanceRecord = () => {
  const navigate = useNavigate();
  const { currentUser, getAllStudents } = useAuth();
  const { getStudentAttendance, getStudentLessonCount } = useData();
  const [studentId, setStudentId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [studentGroup, setStudentGroup] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [lessonCount, setLessonCount] = useState(0);
  
  useEffect(() => {
    if (!currentUser) return;
    
    if (currentUser.role === "parent") {
      // Find the student ID associated with this parent
      const students = getAllStudents();
      const parentPhone = (currentUser as any).phone;
      const studentData = students.find(s => s.parentPhone === parentPhone);
      
      if (studentData) {
        setStudentId(studentData.id);
        setStudentName(studentData.name);
        setStudentCode(studentData.code);
        setStudentGroup(studentData.group);
        setStudentGrade(studentData.grade);
        const records = getStudentAttendance(studentData.id);
        setAttendanceRecords(records);
        setLessonCount(getStudentLessonCount(studentData.id));
      }
    } else if (currentUser.role === "student") {
      setStudentId((currentUser as any).id);
      setStudentName((currentUser as any).name);
      setStudentCode((currentUser as any).code);
      setStudentGroup((currentUser as any).group);
      setStudentGrade((currentUser as any).grade);
      const records = getStudentAttendance((currentUser as any).id);
      setAttendanceRecords(records);
      setLessonCount(getStudentLessonCount((currentUser as any).id));
    }
  }, [currentUser, getAllStudents, getStudentAttendance, getStudentLessonCount]);
  
  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">سجل الحضور</h1>
            
            <div className="bg-physics-dark p-4 rounded-lg mt-4 mb-6">
              <div className="flex flex-wrap gap-4 text-white">
                <div className="flex-1">
                  <p className="text-physics-gold text-sm">الطالب</p>
                  <p>{studentName}</p>
                </div>
                <div>
                  <p className="text-physics-gold text-sm">الكود</p>
                  <p>{studentCode}</p>
                </div>
                <div>
                  <p className="text-physics-gold text-sm">المجموعة</p>
                  <p>{studentGroup}</p>
                </div>
                <div>
                  <p className="text-physics-gold text-sm">الصف</p>
                  <p>
                    {studentGrade === "first" ? "الأول الثانوي" : 
                     studentGrade === "second" ? "الثاني الثانوي" : 
                     studentGrade === "third" ? "الثالث الثانوي" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-physics-gold text-sm">الحصة الحالية</p>
                  <p>الحصة {lessonCount + 1 > 8 ? 8 : lessonCount + 1}</p>
                </div>
              </div>
            </div>
          </div>
          
          {attendanceRecords.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد سجلات حضور متاحة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-physics-navy/50 text-physics-gold hover:bg-physics-navy/50">
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوقت</TableHead>
                    <TableHead className="text-right">رقم الحصة</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                      <TableCell className="text-white">{formatDate(record.date)}</TableCell>
                      <TableCell className="text-white">{record.time || "غير متاح"}</TableCell>
                      <TableCell className="text-white">الحصة {record.lessonNumber || 1}</TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        {record.status === "present" ? (
                          <div className="inline-flex items-center text-green-400 gap-1">
                            <Check size={18} />
                            <span>حاضر</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center text-red-400 gap-1">
                            <X size={18} />
                            <span>غائب</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceRecord;
