
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<RequireAuth children={<Dashboard />} />} />
              <Route path="/students" element={<RequireAuth allowedRoles={["admin"]} children={<StudentsManagement />} />} />
              <Route path="/parents" element={<RequireAuth allowedRoles={["admin"]} children={<ParentsManagement />} />} />
              <Route path="/scan-code" element={<RequireAuth allowedRoles={["admin"]} children={<ScanCode />} />} />
              <Route path="/videos" element={<RequireAuth children={<Videos />} />} />
              <Route path="/books" element={<RequireAuth children={<Books />} />} />
              <Route path="/student-code" element={<RequireAuth allowedRoles={["student"]} children={<StudentCode />} />} />
              <Route path="/attendance-record" element={<RequireAuth allowedRoles={["parent"]} children={<AttendanceRecord />} />} />
              <Route path="/grades" element={<RequireAuth allowedRoles={["parent"]} children={<Grades />} />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
