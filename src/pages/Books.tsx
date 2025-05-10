import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { FileUploader } from "@/components/FileUploader";
import { ArrowRight, FilePlus, Calendar, Search, FileText, Edit, Trash } from "lucide-react";
import PhysicsBackground from "@/components/PhysicsBackground";
const Books = () => {
  const navigate = useNavigate();
  const {
    getAllBooks,
    getBooksByGrade,
    addBook,
    deleteBook,
    updateBook
  } = useData();
  const {
    currentUser
  } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<"all" | "first" | "second" | "third">("all");

  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");

  // Edit state
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editGrade, setEditGrade] = useState<"first" | "second" | "third">("first");
  const books = selectedGrade === "all" ? getAllBooks() : getBooksByGrade(selectedGrade);
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    addBook(title, url, grade);
    setTitle("");
    setUrl("");
    setGrade("first");
    setShowAddForm(false);
  };
  const handleEditBook = (e: React.FormEvent) => {
    e.preventDefault();
    updateBook(editId, editTitle, editUrl, editGrade);
    setShowEditForm(false);
  };
  const handleDeleteBook = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الكتاب/الملف؟")) {
      deleteBook(id);
    }
  };
  const openEditForm = (book: any) => {
    setEditId(book.id);
    setEditTitle(book.title);
    setEditUrl(book.url);
    setEditGrade(book.grade);
    setShowEditForm(true);
  };
  const handleFileURLGenerated = (fileURL: string) => {
    setUrl(fileURL);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const openBook = (url: string) => {
    window.open(url, '_blank');
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
            <h1 className="text-2xl font-bold text-physics-gold">الكتب والملفات</h1>
            {currentUser?.role === "admin" && <div className="flex gap-2">
                
                
              </div>}
          </div>
          
          {/* Filter and search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <select className="inputField" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as "all" | "first" | "second" | "third")}>
                <option value="all">جميع الصفوف</option>
                <option value="first">الصف الأول الثانوي</option>
                <option value="second">الصف الثاني الثانوي</option>
                <option value="third">الصف الثالث الثانوي</option>
              </select>
            </div>
            
            <div className="relative w-full md:w-2/3">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
              <input type="text" className="inputField pr-12" placeholder="ابحث عن كتاب أو ملف" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          {/* Books List */}
          <div className="bg-physics-dark rounded-lg overflow-hidden">
            {filteredBooks.length === 0 ? <div className="p-8 text-center">
                <p className="text-white text-lg">لا توجد كتب أو ملفات متاحة</p>
              </div> : <div className="divide-y divide-physics-navy">
                {filteredBooks.map(book => <div key={book.id} className="p-4 hover:bg-physics-navy/30">
                    <div className="flex items-center">
                      <div className="mr-4 bg-physics-navy p-3 rounded-full cursor-pointer" onClick={() => openBook(book.url)}>
                        <FileText size={24} className="text-physics-gold" />
                      </div>
                      <div className="flex-1 cursor-pointer" onClick={() => openBook(book.url)}>
                        <h3 className="text-lg font-medium text-white">{book.title}</h3>
                        <div className="flex items-center text-sm text-gray-300 mt-1">
                          <Calendar size={14} className="ml-1" />
                          <span>{formatDate(book.uploadDate)}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {book.grade === "first" && "الصف الأول الثانوي"}
                            {book.grade === "second" && "الصف الثاني الثانوي"}
                            {book.grade === "third" && "الصف الثالث الثانوي"}
                          </span>
                        </div>
                      </div>
                      
                      {currentUser?.role === "admin" && <div className="flex">
                          <button onClick={() => openEditForm(book)} className="p-2 text-physics-gold hover:text-white">
                            <Edit size={18} />
                          </button>
                          
                          <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-red-500 hover:text-white">
                            <Trash size={18} />
                          </button>
                        </div>}
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>
      </main>
      
      {/* File Uploader Modal */}
      {showUploader && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">رفع ملف جديد</h2>
            
            <FileUploader onFileURLGenerated={handleFileURLGenerated} />
            
            <div className="flex gap-4 mt-6">
              <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1" onClick={() => setShowUploader(false)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>}
      
      {/* Add Book Modal */}
      {showAddForm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة كتاب/ملف جديد</h2>
            
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-white mb-1">عنوان الكتاب/الملف</label>
                <input type="text" className="inputField" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              
              <div>
                <label className="block text-white mb-1">رابط الكتاب/الملف</label>
                <input type="text" className="inputField" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://..." />
                <p className="text-sm text-gray-300 mt-1">أدخل رابط مباشر للكتاب أو الملف (PDF, DOCX, etc.)</p>
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select className="inputField" value={grade} onChange={e => setGrade(e.target.value as "first" | "second" | "third")} required>
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
                  إضافة الكتاب/الملف
                </button>
                <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>}
      
      {/* Edit Book Modal */}
      {showEditForm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">تعديل الكتاب/الملف</h2>
            
            <form onSubmit={handleEditBook} className="space-y-4">
              <div>
                <label className="block text-white mb-1">عنوان الكتاب/الملف</label>
                <input type="text" className="inputField" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
              </div>
              
              <div>
                <label className="block text-white mb-1">رابط الكتاب/الملف</label>
                <input type="text" className="inputField" value={editUrl} onChange={e => setEditUrl(e.target.value)} required placeholder="https://..." />
                <p className="text-sm text-gray-300 mt-1">أدخل رابط مباشر للكتاب أو الملف (PDF, DOCX, etc.)</p>
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select className="inputField" value={editGrade} onChange={e => setEditGrade(e.target.value as "first" | "second" | "third")} required>
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
                  حفظ التغييرات
                </button>
                <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1" onClick={() => setShowEditForm(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export default Books;