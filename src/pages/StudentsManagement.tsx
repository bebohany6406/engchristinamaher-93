
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, UserPlus, Search, UserX, Edit, Trash2 } from "lucide-react";
import { Student } from "@/types";
import { getGradeDisplay } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const StudentsManagement = () => {
  const { getAllStudents, createStudent, deleteStudent, updateStudent } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [group, setGroup] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");
  
  useEffect(() => {
    // Load students when component mounts
    setStudents(getAllStudents());
  }, [getAllStudents]);
  
  const filteredStudents = students.filter(student => 
    student.name.includes(searchQuery) || 
    student.phone.includes(searchQuery) ||
    student.code.includes(searchQuery)
  );
  
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    createStudent(name, phone, password, parentPhone, group, grade);
    setStudents(getAllStudents()); // Refresh list
    setName("");
    setPhone("");
    setPassword("");
    setParentPhone("");
    setGroup("");
    setGrade("first");
    setShowAddForm(false);
  };
  
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setPhone(student.phone);
    setPassword(student.password);
    setParentPhone(student.parentPhone);
    setGroup(student.group);
    setGrade(student.grade);
    setShowEditForm(true);
  };
  
  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    updateStudent(
      editingStudent.id,
      name,
      phone,
      password,
      parentPhone,
      group,
      grade
    );
    
    setStudents(getAllStudents()); // Refresh list
    setShowEditForm(false);
    setEditingStudent(null);
    
    toast({
      title: "تم تحديث بيانات الطالب",
      description: `تم تحديث بيانات الطالب ${name} بنجاح`,
    });
  };
  
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب ${studentName}؟`)) {
      deleteStudent(studentId);
      setStudents(getAllStudents()); // Refresh list
      
      toast({
        title: "تم حذف الطالب",
        description: `تم حذف الطالب ${studentName} بنجاح`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
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
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">إدارة الطلاب</h1>
            <button 
              onClick={() => setShowAddForm(true)}
              className="goldBtn flex items-center gap-2"
            >
              <UserPlus size={18} />
              <span>إضافة طالب</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
            <input
              type="text"
              className="inputField pr-12"
              placeholder="ابحث عن طالب بالاسم أو رقم الهاتف أو الكود"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Students List */}
          <div className="bg-physics-dark rounded-lg overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد طلاب مسجلين</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">الهاتف</th>
                      <th className="text-right py-3 px-4">الكود</th>
                      <th className="text-right py-3 px-4">المجموعة</th>
                      <th className="text-right py-3 px-4">الصف</th>
                      <th className="text-right py-3 px-4">هاتف ولي الأمر</th>
                      <th className="text-center py-3 px-4">خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <td className="py-3 px-4 text-white">{student.name}</td>
                        <td className="py-3 px-4 text-white">{student.phone}</td>
                        <td className="py-3 px-4 text-white">{student.code}</td>
                        <td className="py-3 px-4 text-white">{student.group}</td>
                        <td className="py-3 px-4 text-white">{getGradeDisplay(student.grade)}</td>
                        <td className="py-3 px-4 text-white">{student.parentPhone}</td>
                        <td className="py-3 px-4 text-white text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              className="p-1 text-physics-gold hover:text-physics-lightgold"
                              onClick={() => handleEditClick(student)}
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-1 text-red-400 hover:text-red-500"
                              onClick={() => handleDeleteStudent(student.id, student.name)}
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
      
      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة طالب جديد</h2>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">اسم الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
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
                <label className="block text-white mb-1">كلمة المرور</label>
                <input
                  type="password"
                  className="inputField"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم هاتف ولي الأمر</label>
                <input
                  type="text"
                  className="inputField"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">المجموعة</label>
                <input
                  type="text"
                  className="inputField"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select
                  className="inputField"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  required
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
                  إضافة الطالب
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
      
      {/* Edit Student Modal */}
      {showEditForm && editingStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">تعديل بيانات الطالب</h2>
            
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-white mb-1">اسم الطالب</label>
                <input
                  type="text"
                  className="inputField"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
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
                <label className="block text-white mb-1">كلمة المرور</label>
                <input
                  type="password"
                  className="inputField"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رقم هاتف ولي الأمر</label>
                <input
                  type="text"
                  className="inputField"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">المجموعة</label>
                <input
                  type="text"
                  className="inputField"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select
                  className="inputField"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  required
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
                  حفظ التغييرات
                </button>
                <button 
                  type="button" 
                  className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
                  onClick={() => setShowEditForm(false)}
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

export default StudentsManagement;
