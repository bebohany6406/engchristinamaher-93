
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { 
  Users, UserPlus, QrCode, Video, Book, LogOut, 
  CheckSquare, Award, DollarSign, UserCheck, RefreshCcw 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PhysicsBackground from "@/components/PhysicsBackground";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const DashboardItem = ({
  to,
  icon,
  title,
  description,
  stats = null
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  stats?: { present?: number; absent?: number; total?: number } | null;
}) => {
  return (
    <Link 
      to={to} 
      className="bg-physics-dark rounded-xl p-6 hover:bg-physics-dark/70 transition-all flex flex-col items-center border border-physics-gold/10 hover:border-physics-gold/30 hover:shadow-lg hover:shadow-physics-gold/5 group"
    >
      <AspectRatio ratio={1/1} className="w-16 h-16 mb-4">
        <div className="h-16 w-16 rounded-full bg-physics-navy flex items-center justify-center text-physics-gold mb-4 transition-all group-hover:scale-110 group-hover:bg-physics-gold/20">
          {icon}
        </div>
      </AspectRatio>
      <h3 className="text-xl font-bold text-physics-gold mb-2 group-hover:scale-105 transition-transform">{title}</h3>
      <p className="text-sm text-white/70 text-center mb-3">{description}</p>
      {stats && (
        <div className="mt-2 w-full">
          <div className="flex justify-between text-sm text-white">
            <div className="text-green-400">حضور: {stats.present || 0}</div>
            <div className="text-red-400">غياب: {stats.absent || 0}</div>
          </div>
          <div className="w-full bg-physics-navy h-3 rounded-full mt-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500 ease-out"
              style={{ width: `${stats.total ? (stats.present || 0) / stats.total * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getStudentAttendance, getStudentLessonCount } = useData();

  // إحصائيات الحضور للطالب
  const attendanceStats = currentUser?.role === "student" ? {
    present: getStudentAttendance(currentUser.id).filter(r => r.status === "present").length,
    absent: getStudentAttendance(currentUser.id).filter(r => r.status === "absent").length,
    total: getStudentLessonCount(currentUser.id)
  } : null;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header with User Info */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10 shadow-md">
        <div className="flex items-center">
          <div className="text-physics-gold font-bold text-lg ml-2">
            {currentUser.name}
          </div>
          <div className="bg-physics-gold/20 rounded-full px-3 py-1 text-sm text-physics-gold">
            {currentUser.role === "admin" ? "مسؤول النظام" : currentUser.role === "student" ? "طالب" : "ولي أمر"}
          </div>
        </div>
        
        <Logo />
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-physics-gold hover:opacity-80 bg-physics-navy/50 hover:bg-physics-navy py-2 px-4 rounded-lg transition-all"
          >
            <span>تسجيل الخروج</span>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content - Dashboard */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-physics-gold mb-8 relative">
            <span className="relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-physics-gold/30 after:rounded-full">
              لوحة التحكم
            </span>
          </h1>
          
          {/* Admin Dashboard Items */}
          {currentUser.role === "admin" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <DashboardItem 
                  to="/students" 
                  icon={<Users size={32} className="transition-all group-hover:text-white" />} 
                  title="إدارة الطلاب" 
                  description="إضافة وتعديل وحذف بيانات الطلاب" 
                />
                <DashboardItem 
                  to="/parents" 
                  icon={<UserPlus size={32} className="transition-all group-hover:text-white" />} 
                  title="إدارة أولياء الأمور" 
                  description="إضافة حسابات لأولياء الأمور" 
                />
                <DashboardItem 
                  to="/scan-code" 
                  icon={<QrCode size={32} className="transition-all group-hover:text-white" />} 
                  title="تسجيل الحضور" 
                  description="مسح كود الطلاب وتسجيل الحضور" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <DashboardItem 
                  to="/attendance-list" 
                  icon={<UserCheck size={32} className="transition-all group-hover:text-white" />} 
                  title="سجل الحضور" 
                  description="عرض وإدارة سجل حضور الطلاب" 
                />
                <DashboardItem 
                  to="/grades-management" 
                  icon={<Award size={32} className="transition-all group-hover:text-white" />} 
                  title="سجل الدرجات" 
                  description="إدخال وعرض درجات الطلاب" 
                />
                <DashboardItem 
                  to="/payments" 
                  icon={<DollarSign size={32} className="transition-all group-hover:text-white" />} 
                  title="إدارة المدفوعات" 
                  description="تسجيل ومتابعة مدفوعات الطلاب" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <DashboardItem 
                  to="/videos" 
                  icon={<Video size={32} className="transition-all group-hover:text-white" />} 
                  title="الفيديوهات" 
                  description="إدارة وعرض الدروس المرئية" 
                />
                <DashboardItem 
                  to="/books" 
                  icon={<Book size={32} className="transition-all group-hover:text-white" />} 
                  title="الكتب والملفات" 
                  description="رفع وإدارة الملفات التعليمية" 
                />
                <DashboardItem 
                  to="/system-reset" 
                  icon={<RefreshCcw size={32} className="transition-all group-hover:text-white" />} 
                  title="إعادة تعيين النظام" 
                  description="إعادة ضبط بيانات النظام حسب الصف" 
                />
              </div>
            </>
          )}
          
          {/* Student Dashboard Items */}
          {currentUser.role === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardItem 
                to="/student-code" 
                icon={<QrCode size={32} className="transition-all group-hover:text-white" />} 
                title="كود الطالب" 
                description="عرض الكود الخاص بك لتسجيل الحضور" 
              />
              <DashboardItem 
                to="/student-grades" 
                icon={<Award size={32} className="transition-all group-hover:text-white" />} 
                title="الدرجات" 
                description="عرض الدرجات والتقييمات" 
              />
              <DashboardItem 
                to="/attendance-record" 
                icon={<CheckSquare size={32} className="transition-all group-hover:text-white" />} 
                title="سجل الحضور" 
                description="عرض سجل الحضور الخاص بك" 
                stats={attendanceStats}
              />
              <DashboardItem 
                to="/videos" 
                icon={<Video size={32} className="transition-all group-hover:text-white" />} 
                title="الفيديوهات" 
                description="مشاهدة الفيديوهات التعليمية" 
              />
              <DashboardItem 
                to="/student-books" 
                icon={<Book size={32} className="transition-all group-hover:text-white" />} 
                title="الكتب والملفات" 
                description="تحميل المذكرات والملفات التعليمية" 
              />
              <DashboardItem 
                to="/student-payments" 
                icon={<DollarSign size={32} className="transition-all group-hover:text-white" />} 
                title="المدفوعات" 
                description="عرض سجل المدفوعات الخاص بك" 
              />
            </div>
          )}
          
          {/* Parent Dashboard Items */}
          {currentUser.role === "parent" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardItem 
                to="/grades" 
                icon={<Award size={32} className="transition-all group-hover:text-white" />} 
                title="الدرجات" 
                description="عرض درجات الطالب" 
              />
              <DashboardItem 
                to="/attendance-record" 
                icon={<CheckSquare size={32} className="transition-all group-hover:text-white" />} 
                title="سجل الحضور" 
                description="عرض سجل حضور الطالب" 
              />
              <DashboardItem 
                to="/parent-payments" 
                icon={<DollarSign size={32} className="transition-all group-hover:text-white" />} 
                title="المدفوعات" 
                description="عرض سجل مدفوعات الطالب" 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
