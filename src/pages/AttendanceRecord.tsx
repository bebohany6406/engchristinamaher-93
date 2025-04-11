
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, Calendar, Check, X } from "lucide-react";
import { Student, Attendance } from "@/types";

const AttendanceRecord = () => {
  const navigate = useNavigate();
  const { currentUser, getAllStudents } = useAuth();
  const { getStudentAttendance } = useData();
  const [studentId, setStudentId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [studentName, setStudentName] = useState("");
  
  useEffect(() => {
    if (!currentUser) return;
    
    if (currentUser.role === "parent") {
      // Find the student ID associated with this parent
      const students = getAllStudents();
      const parentPhone = currentUser.phone;
      const studentData = students.find(s => s.parentPhone === parentPhone);
      
      if (studentData) {
        setStudentId(studentData.id);
        setStudentName(studentData.name);
        const records = getStudentAttendance(studentData.id);
        setAttendanceRecords(records);
      }
    } else if (currentUser.role === "student") {
      setStudentId(currentUser.id);
      setStudentName(currentUser.name);
      const records = getStudentAttendance(currentUser.id);
      setAttendanceRecords(records);
    }
  }, [currentUser, getAllStudents, getStudentAttendance]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">سجل الحضور</h1>
            {studentName && (
              <p className="text-white mt-1">الطالب: {studentName}</p>
            )}
          </div>
          
          {attendanceRecords.length === 0 ? (
            <div className="bg-physics-dark rounded-lg p-6 text-center">
              <p className="text-white text-lg">لا توجد سجلات حضور متاحة</p>
            </div>
          ) : (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-physics-navy/50 text-physics-gold">
                    <th className="text-right py-3 px-4">التاريخ</th>
                    <th className="text-center py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                      <td className="py-3 px-4 text-white">{formatDate(record.date)}</td>
                      <td className="py-3 px-4 text-center">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendanceRecord;
