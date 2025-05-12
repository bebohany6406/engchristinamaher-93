
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import Dashboard from "@/pages/Dashboard";
import ScanCode from "@/pages/ScanCode";
import Grades from "@/pages/Grades";
import AttendanceRecord from "@/pages/AttendanceRecord";
import StudentPaymentsPage from "@/pages/StudentPaymentsPage";
import StudentCode from "@/pages/StudentCode";
import StudentGrades from "@/pages/StudentGrades";
import StudentBooks from "@/pages/StudentBooks";
import GradesManagement from "@/pages/GradesManagement";
import GradesByGrade from "@/pages/GradesByGrade";
import StudentsManagement from "@/pages/StudentsManagement";
import Videos from "@/pages/Videos";
import Books from "@/pages/Books";
import SystemReset from "@/pages/SystemReset";
import AttendanceListByGrade from "@/pages/AttendanceListByGrade";
import AttendanceRecordList from "@/pages/AttendanceRecordList";
import ParentsManagement from "@/pages/ParentsManagement";
import PaymentsManagement from "@/pages/PaymentsManagement";
import ParentPaymentsPage from "@/pages/ParentPaymentsPage";
import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useFont } from "@/hooks/use-font";

function App() {
  const font = useFont();

  return (
    <div className={`w-full ${font.className} h-screen flex flex-col overflow-x-hidden`}>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scan" element={<ScanCode />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/attendance" element={<AttendanceRecord />} />
                <Route path="/payments" element={<StudentPaymentsPage />} />
                <Route path="/student-code" element={<StudentCode />} />
                <Route path="/student-grades" element={<StudentGrades />} />
                <Route path="/student-books" element={<StudentBooks />} />
                
                {/* Admin Routes */}
                <Route path="/grades-management" element={<GradesManagement />} />
                <Route path="/grades-by-grade" element={<GradesByGrade />} />
                <Route path="/students-management" element={<StudentsManagement />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/books" element={<Books />} />
                <Route path="/system-reset" element={<SystemReset />} />
                <Route path="/attendance-by-grade" element={<AttendanceListByGrade />} />
                <Route path="/attendance-records" element={<AttendanceRecordList />} />
                <Route path="/parents-management" element={<ParentsManagement />} />
                <Route path="/payments-management" element={<PaymentsManagement />} />
                <Route path="/parent-payments" element={<ParentPaymentsPage />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
