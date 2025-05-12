import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanCode from './pages/ScanCode';
import AddStudent from './pages/AddStudent';
import AddParent from './pages/AddParent';
import AddGrade from './pages/AddGrade';
import AddVideo from './pages/AddVideo';
import AddBook from './pages/AddBook';
import ViewAttendance from './pages/ViewAttendance';
import ViewGrades from './pages/ViewGrades';
import ViewVideos from './pages/ViewVideos';
import ViewBooks from './pages/ViewBooks';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from "@/components/ui/toaster"
import ViewPayments from './pages/ViewPayments';
import AddPayment from './pages/AddPayment';
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
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/add-parent" element={<AddParent />} />
            <Route path="/add-grade" element={<AddGrade />} />
            <Route path="/add-video" element={<AddVideo />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/view-attendance" element={<ViewAttendance />} />
            <Route path="/view-grades" element={<ViewGrades />} />
            <Route path="/view-videos" element={<ViewVideos />} />
            <Route path="/view-books" element={<ViewBooks />} />
            <Route path="/view-payments" element={<ViewPayments />} />
            <Route path="/add-payment" element={<AddPayment />} />
          </Routes>
        </Router>
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
