
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { QrScanner } from "@/components/QrScanner";
import { toast } from "@/hooks/use-toast";
import PhysicsBackground from "@/components/PhysicsBackground";
import { School, User, Users, Calendar, BookOpen, Youtube, Trash, Search } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isMobile } = useMobile();
  const [showQrScanner, setShowQrScanner] = useState(false);
  const { addAttendance } = useData();

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const getUserInfo = () => {
    if (!currentUser) return null;
    
    let info = {
      name: "",
      code: "",
      group: "",
      grade: "",
      role: "",
    };
    
    if ((currentUser as any).role === "student") {
      info.name = (currentUser as any).name;
      info.code = (currentUser as any).code;
      info.group = (currentUser as any).group;
      info.grade = (currentUser as any).grade;
      info.role = "طالب";
    } else if ((currentUser as any).role === "parent") {
      info.name = (currentUser as any).studentName;
      info.code = (currentUser as any).studentCode;
      info.role = "ولي أمر";
    } else if ((currentUser as any).role === "admin") {
      info.name = "المدير";
      info.role = "مدير";
    }
    
    return info;
  };

  const userInfo = getUserInfo();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleQrResult = (result: string) => {
    setShowQrScanner(false);
    
    if (!result) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم التعرف على كود QR"
      });
      return;
    }
    
    try {
      const resultData = JSON.parse(result);
      if (resultData.type === "attendance" && resultData.id && resultData.name) {
        // Mark attendance
        addAttendance(resultData.id, resultData.name, "present");
        
        // Play sound effect
        const audio = new Audio("/attendance-success.mp3");
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "✅ تم تسجيل الحضور",
          description: `تم تسجيل حضور الطالب ${resultData.name}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "كود QR غير صالح أو غير معروف"
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء معالجة كود QR"
      });
      console.error("QR Code error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header with Logout */}
      <header className="bg-physics-dark p-4 flex justify-between items-center relative z-10">
        <Logo className="h-8 md:h-10" />
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-physics-gold text-sm px-3 py-1 border border-physics-gold rounded-lg hover:bg-physics-gold hover:text-physics-dark transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Message and User Info */}
          <div className="bg-physics-dark rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-physics-gold mb-2">
              مرحباً، {userInfo?.name}
            </h1>
            <div className="flex flex-wrap gap-y-4 gap-x-8 mt-4 text-white text-sm md:text-base">
              {userInfo?.role === "طالب" && (
                <>
                  <div>
                    <span className="text-physics-gold">الصف:</span> {
                      userInfo.grade === "first" ? "الأول الثانوي" :
                      userInfo.grade === "second" ? "الثاني الثانوي" :
                      userInfo.grade === "third" ? "الثالث الثانوي" : ""
                    }
                  </div>
                  <div>
                    <span className="text-physics-gold">المجموعة:</span> {userInfo.group}
                  </div>
                  <div>
                    <span className="text-physics-gold">الكود:</span> {userInfo.code}
                  </div>
                </>
              )}
              {userInfo?.role === "ولي أمر" && (
                <div>
                  <span className="text-physics-gold">كود الطالب:</span> {userInfo.code}
                </div>
              )}
              <div>
                <span className="text-physics-gold">نوع الحساب:</span> {userInfo?.role}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-bold text-physics-gold mb-4">الخدمات المتاحة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Admin actions */}
            {(currentUser as any)?.role === "admin" && (
              <>
                <Link to="/students" className="actionCard">
                  <Users size={24} className="text-physics-gold" />
                  <span>إدارة الطلاب</span>
                </Link>
                
                <Link to="/parents" className="actionCard">
                  <User size={24} className="text-physics-gold" />
                  <span>إدارة أولياء الأمور</span>
                </Link>
                
                <Link to="/scan-code" className="actionCard">
                  <Search size={24} className="text-physics-gold" />
                  <span>مسح الحضور</span>
                </Link>
                
                <Link to="/attendance-records" className="actionCard">
                  <Calendar size={24} className="text-physics-gold" />
                  <span>سجلات الحضور</span>
                </Link>
                
                <Link to="/grades-management" className="actionCard">
                  <School size={24} className="text-physics-gold" />
                  <span>إدارة الدرجات</span>
                </Link>
                
                <Link to="/payments" className="actionCard">
                  <BookOpen size={24} className="text-physics-gold" />
                  <span>إدارة المدفوعات</span>
                </Link>

                <Link to="/system-reset" className="actionCard bg-red-600/20 hover:bg-red-600/30">
                  <Trash size={24} className="text-red-400" />
                  <span>إعادة تعيين النظام</span>
                </Link>
              </>
            )}
            
            {/* Student actions */}
            {(currentUser as any)?.role === "student" && (
              <>
                <Link to="/student-code" className="actionCard">
                  <Search size={24} className="text-physics-gold" />
                  <span>عرض الكود الخاص بي</span>
                </Link>
                
                <Link to="/attendance-record" className="actionCard">
                  <Calendar size={24} className="text-physics-gold" />
                  <span>سجل الحضور</span>
                </Link>
                
                <Link to="/student-grades" className="actionCard">
                  <School size={24} className="text-physics-gold" />
                  <span>درجات الامتحانات</span>
                </Link>
                
                <Link to="/books" className="actionCard">
                  <BookOpen size={24} className="text-physics-gold" />
                  <span>المذكرات والكتب</span>
                </Link>
                
                <Link to="/videos" className="actionCard">
                  <Youtube size={24} className="text-physics-gold" />
                  <span>فيديوهات الشرح</span>
                </Link>
                
                <Link to="/payments" className="actionCard">
                  <BookOpen size={24} className="text-physics-gold" />
                  <span>سجل المدفوعات</span>
                </Link>
              </>
            )}
            
            {/* Parent actions */}
            {(currentUser as any)?.role === "parent" && (
              <>
                <Link to="/attendance-record" className="actionCard">
                  <Calendar size={24} className="text-physics-gold" />
                  <span>سجل حضور الطالب</span>
                </Link>
                
                <Link to="/student-grades" className="actionCard">
                  <School size={24} className="text-physics-gold" />
                  <span>درجات الامتحانات</span>
                </Link>
                
                <Link to="/books" className="actionCard">
                  <BookOpen size={24} className="text-physics-gold" />
                  <span>المذكرات والكتب</span>
                </Link>
                
                <Link to="/videos" className="actionCard">
                  <Youtube size={24} className="text-physics-gold" />
                  <span>فيديوهات الشرح</span>
                </Link>
                
                <Link to="/payments" className="actionCard">
                  <BookOpen size={24} className="text-physics-gold" />
                  <span>سجل المدفوعات</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      
      {/* QR Scanner */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg overflow-hidden w-full max-w-md">
            <div className="p-4 border-b border-physics-navy">
              <h3 className="text-white font-bold">مسح كود QR</h3>
            </div>
            <div className="p-4">
              <QrScanner
                onResult={(result) => handleQrResult(result)}
                onClose={() => setShowQrScanner(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
