
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanCode from './pages/ScanCode';
import StudentsManagement from './pages/StudentsManagement';
import ParentsManagement from './pages/ParentsManagement';
import GradesManagement from './pages/GradesManagement';
import Videos from './pages/Videos';
import Books from './pages/Books';
import AttendanceRecord from './pages/AttendanceRecord';
import AttendanceRecordList from './pages/AttendanceRecordList';
import ViewGrades from './pages/GradesByGrade';
import Grades from './pages/Grades';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from "@/components/ui/toaster"
import PaymentsManagement from './pages/PaymentsManagement';
import { initializeSync } from "./lib/sync-service";

function App() {
  // استدعاء وظيفة بدء المزامنة عند تحميل التطبيق
  useEffect(() => {
    initializeSync();
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan-code" element={<ScanCode />} />
            <Route path="/add-student" element={<StudentsManagement />} />
            <Route path="/add-parent" element={<ParentsManagement />} />
            <Route path="/add-grade" element={<GradesManagement />} />
            <Route path="/add-video" element={<Videos />} />
            <Route path="/add-book" element={<Books />} />
            <Route path="/view-attendance" element={<AttendanceRecordList />} />
            <Route path="/view-grades" element={<ViewGrades />} />
            <Route path="/view-videos" element={<Videos />} />
            <Route path="/view-books" element={<Books />} />
            <Route path="/view-payments" element={<PaymentsManagement />} />
            <Route path="/add-payment" element={<PaymentsManagement />} />
            <Route path="/student-payments" element={<StudentPayments />} />
            <Route path="/parent-payments" element={<ParentPayments />} />
          </Routes>
        </Router>
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
