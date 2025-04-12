
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { 
  BookOpen, Video, UserCheck, QrCode, Users, User, 
  LogOut, BookCopy, CheckSquare, GraduationCap 
} from "lucide-react";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    code: "",
    group: "",
    grade: ""
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Load student information if the user is a student
    if (currentUser.role === "student") {
      setStudentInfo({
        name: currentUser.name,
        code: currentUser.code,
        group: currentUser.group,
        grade: currentUser.grade
      });
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    // Play logout sound
    const audio = new Audio("/logout.mp3");
    audio.play().catch(e => console.error("Sound play failed:", e));
    
    logout();
    navigate("/login");
  };

  if (!currentUser) return null;

  const getGradeDisplay = (grade?: "first" | "second" | "third") => {
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
          <Logo />
        </div>
        <div className="flex items-center">
          <div className="text-white ml-4">
            <p className="font-bold">{currentUser.name}</p>
            <p className="text-sm opacity-80">
              {currentUser.role === "admin" ? "مسؤول النظام" : 
               currentUser.role === "student" ? "طالب" : "ولي أمر"}
            </p>
            {currentUser.role === "student" && (
              <div className="text-sm opacity-80 flex flex-col sm:flex-row sm:gap-2">
                <span>الكود: {studentInfo.code}</span>
                <span>المجموعة: {studentInfo.group}</span>
                <span>{getGradeDisplay(currentUser.grade)}</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-white hover:text-physics-gold"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-physics-gold mb-8 text-center">الصفحة الرئيسية</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentUser.role === "admin" && (
            <>
              <DashboardCard 
                title="إدارة الطلاب"
                icon={<Users className="h-10 w-10" />}
                onClick={() => navigate("/students")}
              />
              
              <DashboardCard 
                title="إدارة أولياء الأمور"
                icon={<User className="h-10 w-10" />}
                onClick={() => navigate("/parents")}
              />
              
              <DashboardCard 
                title="تسجيل الحضور"
                icon={<QrCode className="h-10 w-10" />}
                onClick={() => navigate("/scan-code")}
              />
              
              <DashboardCard 
                title="سجلات الحضور"
                icon={<CheckSquare className="h-10 w-10" />}
                onClick={() => navigate("/attendance-list")}
              />
              
              <DashboardCard 
                title="سجلات الدرجات"
                icon={<GraduationCap className="h-10 w-10" />}
                onClick={() => navigate("/grades-management")}
              />
              
              <DashboardCard 
                title="الفيديوهات التعليمية"
                icon={<Video className="h-10 w-10" />}
                onClick={() => navigate("/videos")}
              />
              
              <DashboardCard 
                title="الكتب والملفات"
                icon={<BookOpen className="h-10 w-10" />}
                onClick={() => navigate("/books")}
              />
            </>
          )}
          
          {currentUser.role === "student" && (
            <>
              <DashboardCard 
                title="الكود الشخصي"
                icon={<QrCode className="h-10 w-10" />}
                onClick={() => navigate("/student-code")}
              />
              
              <DashboardCard 
                title="سجل الحضور"
                icon={<CheckSquare className="h-10 w-10" />}
                onClick={() => navigate("/attendance-record")}
              />
              
              <DashboardCard 
                title="سجل الدرجات"
                icon={<GraduationCap className="h-10 w-10" />}
                onClick={() => navigate("/grades")}
              />
              
              <DashboardCard 
                title="الفيديوهات التعليمية"
                icon={<Video className="h-10 w-10" />}
                onClick={() => navigate("/videos")}
              />
              
              <DashboardCard 
                title="الكتب والملفات"
                icon={<BookOpen className="h-10 w-10" />}
                onClick={() => navigate("/books")}
              />
            </>
          )}
          
          {currentUser.role === "parent" && (
            <>
              <DashboardCard 
                title="سجل حضور الطالب"
                icon={<UserCheck className="h-10 w-10" />}
                onClick={() => navigate("/attendance-record")}
              />
              
              <DashboardCard 
                title="سجل درجات الطالب"
                icon={<BookCopy className="h-10 w-10" />}
                onClick={() => navigate("/grades")}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DashboardCard = ({ title, icon, onClick }: DashboardCardProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-physics-dark hover:bg-physics-dark/80 rounded-xl p-6 flex flex-col items-center justify-center transition-transform transform hover:scale-105"
    >
      <div className="bg-physics-gold/20 p-4 rounded-full mb-4 text-physics-gold">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </button>
  );
};

export default Dashboard;
