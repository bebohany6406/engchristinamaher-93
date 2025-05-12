
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Check, Clock, FileBadge, FileText, GraduationCap, MonitorSmartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [attendanceCount, setAttendanceCount] = useState({ present: 0, absent: 0, total: 0 });
  const [booksCount, setBooksCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;
    
    // جلب إحصائيات الحضور للطالب
    const fetchAttendanceStats = async () => {
      try {
        // إحصاء الحضور
        const { count: presentCount, error: presentError } = await supabase
          .from('attendance')
          .select('*', { count: 'exact' })
          .eq('student_id', currentUser.id)
          .eq('status', 'present');
          
        // إحصاء الغياب
        const { count: absentCount, error: absentError } = await supabase
          .from('attendance')
          .select('*', { count: 'exact' })
          .eq('student_id', currentUser.id)
          .eq('status', 'absent');
        
        if (presentError || absentError) {
          console.error("Error fetching attendance stats:", presentError || absentError);
          return;
        }
        
        setAttendanceCount({
          present: presentCount || 0,
          absent: absentCount || 0,
          total: (presentCount || 0) + (absentCount || 0)
        });
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    
    // جلب عدد الكتب المتاحة لصف الطالب
    const fetchBooksCount = async () => {
      if (!currentUser.grade) return;
      
      try {
        const { count, error } = await supabase
          .from('books')
          .select('*', { count: 'exact' })
          .eq('grade', currentUser.grade);
          
        if (error) {
          console.error("Error fetching books count:", error);
          return;
        }
        
        setBooksCount(count || 0);
      } catch (error) {
        console.error("Error fetching books data:", error);
      }
    };
    
    fetchAttendanceStats();
    fetchBooksCount();
  }, [currentUser]);

  const dashboardItems = [
    {
      title: "كود الطالب",
      description: "عرض الكود الخاص بك",
      icon: <FileBadge className="text-physics-gold" size={20} />,
      onClick: () => navigate("/student-code")
    },
    {
      title: "الكتب والملفات",
      description: `${booksCount} ملف متاح`,
      icon: <FileText className="text-physics-gold" size={20} />,
      onClick: () => navigate("/student-books")
    },
    {
      title: "سجل الدرجات",
      description: "عرض درجات الاختبارات",
      icon: <GraduationCap className="text-physics-gold" size={20} />,
      onClick: () => navigate("/student-grades")
    },
    {
      title: "سجل الحضور",
      description: `الحضور: ${attendanceCount.present} | الغياب: ${attendanceCount.absent}`,
      icon: <Clock className="text-physics-gold" size={20} />,
      onClick: () => navigate("/attendance")
    },
    {
      title: "سجل المدفوعات",
      description: "عرض سجل المدفوعات الخاص بك",
      icon: <Check className="text-physics-gold" size={20} />,
      onClick: () => navigate("/payments")
    }
  ];

  return (
    <>
      <h2 className="text-2xl font-bold text-physics-gold">مرحباً {currentUser?.name}</h2>
      <p className="text-white text-opacity-80">
        {currentUser?.grade === "first" && "الصف الأول الثانوي"}
        {currentUser?.grade === "second" && "الصف الثاني الثانوي"}
        {currentUser?.grade === "third" && "الصف الثالث الثانوي"}
        {currentUser?.group && ` - المجموعة: ${currentUser.group}`}
      </p>
      
      <Separator className="my-4 bg-physics-gold/20" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardItems.map((item, i) => (
          <div 
            key={i}
            onClick={item.onClick}
            className="bg-physics-dark hover:bg-physics-dark/80 p-4 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-physics-navy p-2 rounded-full">
                {item.icon}
              </div>
              <div>
                <h3 className="text-white font-medium">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
