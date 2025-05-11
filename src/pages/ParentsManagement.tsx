
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, UserPlus, Search, Trash2 } from "lucide-react";
import { Parent } from "@/types";
import { toast } from "@/hooks/use-toast";

const ParentsManagement = () => {
  const navigate = useNavigate();
  const { getAllParents, createParent, getStudentByCode } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [parents, setParents] = useState<Parent[]>([]);
  
  // Form state
  const [phone, setPhone] = useState("");
  const [studentCode, setStudentCode] = useState("");
  
  useEffect(() => {
    // Load parents when component mounts
    setParents(getAllParents());
  }, [getAllParents]);
  
  const filteredParents = parents.filter(parent => 
    parent.phone.includes(searchQuery) || 
    parent.studentCode.includes(searchQuery) ||
    parent.studentName.includes(searchQuery)
  );
  
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
      
      // Update list
      setParents(getAllParents());
      
      // Reset form
      setPhone("");
      setStudentCode("");
      setShowAddForm(false);
      
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
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
            <input
              type="text"
              className="inputField pr-12"
              placeholder="ابحث عن ولي أمر بالاسم أو رقم الهاتف أو كود الطالب"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                        <td className="py-3 px-4 text-white">{parent.password}</td>
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
