
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, FilePlus, Calendar, Search, BookOpen, FileText, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

const Books = () => {
  const navigate = useNavigate();
  const { getAllBooks, addBook } = useData();
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  
  const books = getAllBooks();
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    addBook(title, url);
    setTitle("");
    setUrl("");
    setShowAddForm(false);
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">الكتب</h1>
            {currentUser?.role === "admin" && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="goldBtn flex items-center gap-2"
              >
                <FilePlus size={18} />
                <span>إضافة كتاب</span>
              </button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
            <input
              type="text"
              className="inputField pr-12"
              placeholder="ابحث عن كتاب"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Books List */}
          <div className="bg-physics-dark rounded-lg overflow-hidden">
            {filteredBooks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا توجد كتب متاحة</p>
              </div>
            ) : (
              <div className="divide-y divide-physics-navy">
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id} 
                    className="p-4 hover:bg-physics-navy/30"
                  >
                    <div className="flex items-center">
                      <div className="mr-4 bg-physics-navy p-3 rounded-full">
                        <FileText size={24} className="text-physics-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">{book.title}</h3>
                        <div className="flex items-center text-sm text-gray-300 mt-1">
                          <Calendar size={14} className="ml-1" />
                          <span>{formatDate(book.uploadDate)}</span>
                        </div>
                      </div>
                      <a 
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-physics-gold hover:text-physics-lightgold"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Add Book Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة كتاب جديد</h2>
            
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-white mb-1">عنوان الكتاب</label>
                <input
                  type="text"
                  className="inputField"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">رابط الكتاب</label>
                <input
                  type="text"
                  className="inputField"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="https://..."
                />
                <p className="text-sm text-gray-300 mt-1">أدخل رابط مباشر للكتاب (pdf)</p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
                  إضافة الكتاب
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

export default Books;
