
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, UserPlus, Search, Trash2 } from "lucide-react";
import { Parent, Student } from "@/types";
import { toast } from "@/hooks/use-toast";
import { sanitizeSearchText } from "@/lib/utils";

const ParentsManagement = () => {
  const navigate = useNavigate();
  const { getAllParents, createParent, getStudentByCode, getAllStudents } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"all" | "name" | "phone" | "code" | "group">("all");
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newParentInfo, setNewParentInfo] = useState<{
    name: string;
    phone: string;
    studentName: string;
    password: string;
  } | null>(null);
  
  // Form state
  const [phone, setPhone] = useState("");
  const [studentCode, setStudentCode] = useState("");
  
  useEffect(() => {
    // Load parents and students when component mounts
    setParents(getAllParents());
    setStudents(getAllStudents());
  }, [getAllParents, getAllStudents]);
  
  const getStudentGroupByCode = (code: string): string => {
    const student = students.find(s => s.code === code);
    return student?.group || "";
  };
  
  const filteredParents = parents.filter(parent => {
    const query = sanitizeSearchText(searchQuery);
    if (!query) return true;
    
    const studentGroup = getStudentGroupByCode(parent.studentCode);
    
    switch (searchField) {
      case "name":
        return sanitizeSearchText(parent.studentName).includes(query);
      case "phone":
        return sanitizeSearchText(parent.phone).includes(query);
      case "code":
        return sanitizeSearchText(parent.studentCode).includes(query);
      case "group":
        return sanitizeSearchText(studentGroup).includes(query);
      case "all":
      default:
        return (
          sanitizeSearchText(parent.studentName).includes(query) ||
          sanitizeSearchText(parent.phone).includes(query) ||
          sanitizeSearchText(parent.studentCode).includes(query) ||
          sanitizeSearchText(studentGroup).includes(query)
        );
    }
  });
  
  const handleAddParent = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate student code exists
      const student = getStudentByCode(studentCode);
      if (!student) {
        toast({
          title: "❌ كود غير صالح",
          description: "لم يتم العثور على طالب بهذا الكود",
          variant: "destructive",
        });
        return;
      }
      
      // Create parent
      const newParent = createParent(phone, studentCode);
      
      // Show info about the newly created parent
      setNewParentInfo({
        name: `ولي أمر ${student.name}`,
        phone: phone,
        studentName: student.name,
        password: newParent.password
      });
      
      // Update list
      setParents(getAllParents());
      
      // Reset form
      setPhone("");
      setStudentCode("");
      setShowAddForm(false);
      
      toast({
        title: "✅ تم إنشاء حساب ولي الأمر",
        description: `تم إنشاء حساب ولي أمر للطالب ${student.name} بنجاح`,
      });
      
    } catch (error) {
      console.error("Error creating parent:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إنشاء حساب ولي الأمر",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteParent = (parentId: string) => {
    // Note: This requires implementing deleteParent in AuthContext
    // But for now we'll just show a toast that this functionality is coming soon
    toast({
      title: "⚠️ قادم قريبًا",
      description: "سيتم إضافة وظيفة حذف ولي الأمر قريبًا",
    });
  };
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-physics-gold hover:opacity-80"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">إدارة أولياء الأمور</h1>
            <button 
              onClick={() => setShowAddForm(true)}
              className="goldBtn flex items-center gap-2"
            >
              <UserPlus size={18} />
              <span>إضافة ولي أمر</span>
            </button>
          </div>
          
          {/* Search with filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/4">
              <select
                className="inputField w-full"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
              >
                <option value="all">بحث في كل الحقول</option>
                <option value="name">بحث باسم الطالب</option>
                <option value="phone">بحث برقم الهاتف</option>
                <option value="code">بحث بكود الطالب</option>
                <option value="group">بحث بالمجموعة</option>
              </select>
            </div>
            
            <div className="relative md:w-3/4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input
                type="text"
                className="inputField pr-12 w-full"
                placeholder="ابحث عن ولي أمر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Parents List */}
          <div className="bg-physics-dark/80 rounded-lg overflow-hidden">
            {filteredParents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد أولياء أمور مسجلين</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">رقم الهاتف</th>
                      <th className="text-right py-3 px-4">كود الطالب</th>
                      <th className="text-right py-3 px-4">اسم الطالب</th>
                      <th className="text-right py-3 px-4">المجموعة</th>
                      <th className="text-right py-3 px-4">كلمة المرور</th>
                      <th className="text-center py-3 px-4">خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.map((parent) => (
                      <tr key={parent.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <td className="py-3 px-4 text-white">ولي أمر {parent.studentName}</td>
                        <td className="py-3 px-4 text-white">{parent.phone}</td>
                        <td className="py-3 px-4 text-white">{parent.studentCode}</td>
                        <td className="py-3 px-4 text-white">{parent.studentName}</td>
                        <td className="py-3 px-4 text-white">{getStudentGroupByCode(parent.studentCode) || "—"}</td>
                        <td className="py-3 px-4 text-white font-bold text-physics-gold">{parent.password}</td>
                        <td className="py-3 px-4 text-white text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              className="p-1 text-red-400 hover:text-red-500"
                              onClick={() => handleDeleteParent(parent.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Show New Parent Info Modal */}
          {newParentInfo && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-physics-gold mb-4">تم إنشاء حساب ولي الأمر بنجاح</h2>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-gray-300">اسم المستخدم:</p>
                    <p className="text-white font-bold">{newParentInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">رقم الهاتف:</p>
                    <p className="text-white font-bold">{newParentInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">اسم الطالب:</p>
                    <p className="text-white font-bold">{newParentInfo.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">كلمة المرور:</p>
                    <p className="text-physics-gold text-xl font-bold">{newParentInfo.password}</p>
                  </div>
                </div>
                
                <button 
                  className="goldBtn w-full"
                  onClick={() => setNewParentInfo(null)}
                >
                  موافق
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Add Parent Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة ولي أمر جديد</h2>
            
            <form onSubmit={handleAddParent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  className="inputField"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">كود الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  required
                />
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  type="submit" 
                  className="goldBtn flex-1"
                >
                  إضافة ولي الأمر
                </button>
                <button 
                  type="button" 
                  className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentsManagement;
