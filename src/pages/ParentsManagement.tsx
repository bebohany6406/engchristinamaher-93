import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, UserPlus, Search, UserX } from "lucide-react";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
const ParentsManagement = () => {
  const {
    getAllParents,
    createParent
  } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const parents = getAllParents();

  // Form state
  const [phone, setPhone] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const filteredParents = parents.filter(parent => parent.phone.includes(searchQuery) || parent.studentName.includes(searchQuery) || parent.studentCode.includes(searchQuery));
  const handleAddParent = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createParent(phone, studentCode, password);
      setPhone("");
      setStudentCode("");
      setPassword("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create parent:", error);
    }
  };
  return <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
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
            <button onClick={() => setShowAddForm(true)} className="goldBtn flex items-center gap-2">
              <UserPlus size={18} />
              <span>إضافة ولي أمر</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
            <input type="text" className="inputField pr-12" placeholder="ابحث عن ولي أمر بالرقم أو اسم الطالب" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          
          {/* Parents List */}
          <div className="bg-physics-dark rounded-lg overflow-hidden">
            {filteredParents.length === 0 ? <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد أولياء أمور مسجلين</p>
              </div> : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">رقم الهاتف</th>
                      <th className="text-right py-3 px-4">اسم الطالب</th>
                      <th className="text-right py-3 px-4">كود الطالب</th>
                      <th className="text-center py-3 px-4">خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.map(parent => <tr key={parent.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <td className="py-3 px-4 text-white">{parent.phone}</td>
                        <td className="py-3 px-4 text-white">{parent.studentName}</td>
                        <td className="py-3 px-4 text-white">{parent.studentCode}</td>
                        <td className="py-3 px-4 text-white text-center">
                          <button className="p-1 text-red-400 hover:text-red-500">
                            <UserX size={18} />
                          </button>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </div>
        </div>
      </main>
      
      {/* Add Parent Modal */}
      {showAddForm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة ولي أمر جديد</h2>
            
            <form onSubmit={handleAddParent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">رقم هاتف ولي الأمر</label>
                <input type="text" className="inputField" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              
              <div>
                <label className="block text-white mb-1">كود الطالب</label>
                <input type="text" className="inputField" value={studentCode} onChange={e => setStudentCode(e.target.value)} required />
              </div>
              
              <div>
                
                
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
                  إضافة ولي الأمر
                </button>
                <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export default ParentsManagement;