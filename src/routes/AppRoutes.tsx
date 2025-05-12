
import { Routes, Route } from "react-router-dom";
import RequireAuth from "@/components/RequireAuth";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import StudentCode from "@/pages/StudentCode";
import ScanCode from "@/pages/ScanCode";
import StudentsManagement from "@/pages/StudentsManagement";
import ParentsManagement from "@/pages/ParentsManagement";
import Books from "@/pages/Books";
import Videos from "@/pages/Videos";
import Grades from "@/pages/Grades";
import StudentGrades from "@/pages/StudentGrades";
import GradesManagement from "@/pages/GradesManagement";
import GradesByGrade from "@/pages/GradesByGrade";
import AttendanceRecord from "@/pages/AttendanceRecord";
import AttendanceRecordList from "@/pages/AttendanceRecordList";
import AttendanceListByGrade from "@/pages/AttendanceListByGrade";
import PaymentsManagement from "@/pages/PaymentsManagement";
import SystemReset from "@/pages/SystemReset";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<RequireAuth allowedRoles={["admin"]}><StudentsManagement /></RequireAuth>} />
        <Route path="/parents" element={<RequireAuth allowedRoles={["admin"]}><ParentsManagement /></RequireAuth>} />
        <Route path="/books" element={<Books />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/student-grades" element={<StudentGrades />} />
        <Route path="/grades-management" element={<RequireAuth allowedRoles={["admin"]}><GradesManagement /></RequireAuth>} />
        <Route path="/grades-by-grade/:grade" element={<RequireAuth allowedRoles={["admin"]}><GradesByGrade /></RequireAuth>} />
        <Route path="/student-code" element={<StudentCode />} />
        <Route path="/scan-code" element={<RequireAuth allowedRoles={["admin"]}><ScanCode /></RequireAuth>} />
        <Route path="/attendance-record" element={<AttendanceRecord />} />
        <Route path="/attendance-records" element={<RequireAuth allowedRoles={["admin"]}><AttendanceRecordList /></RequireAuth>} />
        <Route path="/attendance-by-grade/:grade" element={<RequireAuth allowedRoles={["admin"]}><AttendanceListByGrade /></RequireAuth>} />
        <Route path="/payments" element={<PaymentsManagement />} />
        <Route path="/system-reset" element={<RequireAuth allowedRoles={["admin"]}><SystemReset /></RequireAuth>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
