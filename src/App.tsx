
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PhysicsBackground from "./components/PhysicsBackground";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentsManagement from "./pages/StudentsManagement";
import ParentsManagement from "./pages/ParentsManagement";
import ScanCode from "./pages/ScanCode";
import Videos from "./pages/Videos";
import Books from "./pages/Books";
import StudentCode from "./pages/StudentCode";
import AttendanceRecord from "./pages/AttendanceRecord";
import Grades from "./pages/Grades";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import AttendanceRecordList from "./pages/AttendanceRecordList";
import AttendanceListByGrade from "./pages/AttendanceListByGrade";
import GradesManagement from "./pages/GradesManagement";
import GradesByGrade from "./pages/GradesByGrade";
import StudentGrades from "./pages/StudentGrades";
import { useEffect } from "react";
import "./App.css";

// Import Tajawal font for Arabic text
import "@fontsource/tajawal/400.css"; 
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";

// Create a styles element for the font
const tajawalFontStyles = document.createElement("style");
tajawalFontStyles.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
  
  * {
    font-family: 'Tajawal', sans-serif;
  }
  
  .font-tajawal {
    font-family: 'Tajawal', sans-serif;
  }
  
  /* Override notification styling */
  .toast-root {
    background-color: #171E31 !important;
    border: 1px solid #D4AF37 !important;
    color: white !important;
    opacity: 1 !important;
  }
  
  /* Non-transparent notifications */
  [data-sonner-toast] {
    opacity: 1 !important;
    background-color: #171E31 !important;
    border: 1px solid #D4AF37 !important;
  }
  
  /* Rounded buttons */
  .goldBtn {
    border-radius: 24px !important;
  }
  
  /* Improved image quality */
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  /* Better video player */
  video {
    object-fit: contain;
  }
`;
document.head.appendChild(tajawalFontStyles);

const queryClient = new QueryClient();

const App = () => {
  // Request permissions on app load
  useEffect(() => {
    const requestPermissions = async () => {
      // Request notification permission
      if ('Notification' in window && Notification.permission !== 'granted') {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.error("Error requesting notification permission:", error);
        }
      }
      
      // Try to detect device orientation for permissions
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          await (DeviceOrientationEvent as any).requestPermission();
        } catch (error) {
          console.log("DeviceOrientation permission error:", error);
        }
      }
      
      // Request camera permission if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Just request audio/video permissions
          await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
              // Stop all tracks to release the camera/mic
              stream.getTracks().forEach(track => track.stop());
            });
        } catch (error) {
          console.log("Media permissions error:", error);
        }
      }
    };
    
    // Call the permissions request function
    requestPermissions();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner toastOptions={{
              style: {
                background: '#171E31',
                color: 'white',
                border: '1px solid #D4AF37',
                borderRadius: '12px',
                opacity: '1',
              }
            }} />
            <BrowserRouter>
              <div className="relative min-h-screen font-tajawal">
                <PhysicsBackground />
                <div className="relative z-10">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<RequireAuth children={<Dashboard />} />} />
                    
                    {/* Admin Routes */}
                    <Route path="/students" element={<RequireAuth allowedRoles={["admin"]} children={<StudentsManagement />} />} />
                    <Route path="/parents" element={<RequireAuth allowedRoles={["admin"]} children={<ParentsManagement />} />} />
                    <Route path="/scan-code" element={<RequireAuth allowedRoles={["admin"]} children={<ScanCode />} />} />
                    <Route path="/attendance-list" element={<RequireAuth allowedRoles={["admin"]} children={<AttendanceRecordList />} />} />
                    <Route path="/attendance-list/:grade" element={<RequireAuth allowedRoles={["admin"]} children={<AttendanceListByGrade />} />} />
                    <Route path="/grades-management" element={<RequireAuth allowedRoles={["admin"]} children={<GradesManagement />} />} />
                    <Route path="/grades-management/:grade" element={<RequireAuth allowedRoles={["admin"]} children={<GradesByGrade />} />} />
                    
                    {/* Student Routes */}
                    <Route path="/student-code" element={<RequireAuth allowedRoles={["student"]} children={<StudentCode />} />} />
                    <Route path="/student-grades" element={<RequireAuth allowedRoles={["student"]} children={<StudentGrades />} />} />
                    
                    {/* All Users Routes */}
                    <Route path="/videos" element={<RequireAuth allowedRoles={["admin", "student"]} children={<Videos />} />} />
                    <Route path="/books" element={<RequireAuth allowedRoles={["admin", "student"]} children={<Books />} />} />
                    
                    {/* Parent & Student Routes */}
                    <Route path="/attendance-record" element={<RequireAuth allowedRoles={["parent", "student"]} children={<AttendanceRecord />} />} />
                    <Route path="/grades" element={<RequireAuth allowedRoles={["parent", "student"]} children={<Grades />} />} />
                    
                    {/* Auth error routes */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
