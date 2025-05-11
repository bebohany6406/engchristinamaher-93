import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, FilePlus, Calendar, Search, Play, Edit, Trash, X, Check } from "lucide-react";
import { VideoPlayerFixed } from "@/components/VideoPlayerFixed";
import { VideoUploader } from "@/components/VideoUploader";
const Videos = () => {
  const navigate = useNavigate();
  const {
    getAllVideos,
    getVideosByGrade,
    addVideo,
    deleteVideo,
    updateVideo
  } = useData();
  const {
    currentUser
  } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<"all" | "first" | "second" | "third">("all");

  // حالة النموذج
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");
  const [showUploader, setShowUploader] = useState(false);

  // حالة التعديل
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editGrade, setEditGrade] = useState<"first" | "second" | "third">("first");
  const videos = selectedGrade === "all" ? getAllVideos() : getVideosByGrade(selectedGrade);
  const filteredVideos = videos.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      const audio = new Audio("/error-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      return;
    }
    addVideo(title, url, grade);
    setTitle("");
    setUrl("");
    setGrade("first");
    setShowAddForm(false);
    setShowUploader(false);
  };
  const handleVideoURLGenerated = (generatedUrl: string) => {
    setUrl(generatedUrl);
  };
  const handleEditVideo = (e: React.FormEvent) => {
    e.preventDefault();
    updateVideo(editId, editTitle, editUrl, editGrade);
    setShowEditForm(false);
  };
  const handleDeleteVideo = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الفيديو؟")) {
      deleteVideo(id);
      if (selectedVideo) {
        setSelectedVideo(null);
      }
    }
  };
  const openEditForm = (video: any) => {
    setEditId(video.id);
    setEditTitle(video.title);
    setEditUrl(video.url);
    setEditGrade(video.grade);
    setShowEditForm(true);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
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
            <h1 className="text-2xl font-bold text-physics-gold">الفيديوهات التعليمية</h1>
            {currentUser?.role === "admin" && <button onClick={() => setShowAddForm(true)} className="goldBtn flex items-center gap-2">
                <FilePlus size={18} />
                <span>إضافة فيديو</span>
              </button>}
          </div>
          
          {/* التصفية والبحث */}
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
              <input type="text" className="inputField pr-12" placeholder="ابحث عن فيديو" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          {/* الفيديو المحدد */}
          {selectedVideo && <div className="bg-physics-dark rounded-lg overflow-hidden mb-6">
              <VideoPlayerFixed src={selectedVideo} title={videos.find(v => v.url === selectedVideo)?.title || ""} />
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    {videos.find(v => v.url === selectedVideo)?.title || ""}
                  </h2>
                  
                  {currentUser?.role === "admin" && <div className="flex gap-2">
                      <button onClick={() => {
                  const video = videos.find(v => v.url === selectedVideo);
                  if (video) openEditForm(video);
                }} className="p-2 text-physics-gold hover:text-white">
                        <Edit size={18} />
                      </button>
                      
                      <button onClick={() => {
                  const video = videos.find(v => v.url === selectedVideo);
                  if (video) handleDeleteVideo(video.id);
                }} className="p-2 text-red-500 hover:text-white">
                        <Trash size={18} />
                      </button>
                    </div>}
                </div>
                <button onClick={() => setSelectedVideo(null)} className="text-physics-gold hover:underline mt-2">
                  العودة للقائمة
                </button>
              </div>
            </div>}
          
          {/* قائمة الفيديوهات */}
          {!selectedVideo && <div className="bg-physics-dark rounded-lg overflow-hidden">
              {filteredVideos.length === 0 ? <div className="p-8 text-center">
                  <p className="text-white text-lg">لا توجد فيديوهات متاحة</p>
                </div> : <div className="divide-y divide-physics-navy">
                  {filteredVideos.map(video => <div key={video.id} className="p-4 hover:bg-physics-navy/30">
                      <div className="flex items-center">
                        <div className="mr-4 bg-physics-navy p-3 rounded-full cursor-pointer" onClick={() => setSelectedVideo(video.url)}>
                          <Play size={24} className="text-physics-gold" />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedVideo(video.url)}>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-white">{video.title}</h3>
                            <div className="mr-2 text-green-500">
                              <Check size={16} />
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-300 mt-1">
                            <Calendar size={14} className="ml-1" />
                            <span>{formatDate(video.uploadDate)}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {video.grade === "first" && "الصف الأول الثانوي"}
                              {video.grade === "second" && "الصف الثاني الثانوي"}
                              {video.grade === "third" && "الصف الثالث الثانوي"}
                            </span>
                          </div>
                        </div>
                        
                        {currentUser?.role === "admin" && <div className="flex">
                            <button onClick={() => openEditForm(video)} className="p-2 text-physics-gold hover:text-white">
                              <Edit size={18} />
                            </button>
                            
                            <button onClick={() => handleDeleteVideo(video.id)} className="p-2 text-red-500 hover:text-white">
                              <Trash size={18} />
                            </button>
                          </div>}
                      </div>
                    </div>)}
                </div>}
            </div>}
        </div>
      </main>
      
      {/* نموذج إضافة فيديو */}
      {showAddForm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-physics-gold">إضافة فيديو جديد</h2>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setShowAddForm(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="flex justify-between mb-4">
              
              
            </div>
            
            {showUploader ? <VideoUploader onVideoURLGenerated={handleVideoURLGenerated} /> : <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <label className="block text-white mb-1">عنوان الفيديو</label>
                  <input type="text" className="inputField" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                
                <div>
                  
                  
                  
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
                  <button type="submit" className="goldBtn flex-1" disabled={!url || !title}>
                    إضافة الفيديو
                  </button>
                  <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1" onClick={() => setShowAddForm(false)}>
                    إلغاء
                  </button>
                </div>
              </form>}
            {showUploader && url && <form onSubmit={handleAddVideo} className="space-y-4 mt-4 border-t border-physics-navy pt-4">
                <div>
                  <label className="block text-white mb-1">عنوان الفيديو</label>
                  <input type="text" className="inputField" value={title} onChange={e => setTitle(e.target.value)} required />
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
                  <button type="submit" className="goldBtn flex-1" disabled={!url || !title}>
                    إضافة الفيديو
                  </button>
                </div>
              </form>}
          </div>
        </div>}
      
      {/* نموذج تعديل الفيديو */}
      {showEditForm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">تعديل الفيديو</h2>
            
            <form onSubmit={handleEditVideo} className="space-y-4">
              <div>
                <label className="block text-white mb-1">عنوان الفيديو</label>
                <input type="text" className="inputField" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
              </div>
              
              <div>
                <label className="block text-white mb-1">رابط الفيديو</label>
                <input type="text" className="inputField" value={editUrl} onChange={e => setEditUrl(e.target.value)} required placeholder="https://..." />
                <p className="text-sm text-gray-300 mt-1">أدخل رابط مباشر للفيديو (mp4, webm, mov, avi, 3gp)</p>
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
export default Videos;