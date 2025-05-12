
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { ArrowRight, Plus, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  grade: string;
  group: string;
  date: string;
}

const Videos = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [group, setGroup] = useState("");
  const [grade, setGrade] = useState<string>("first");
  
  useEffect(() => {
    // Load videos from localStorage
    const storedVideos = localStorage.getItem("videos");
    if (storedVideos) {
      try {
        setVideos(JSON.parse(storedVideos));
      } catch (error) {
        console.error("Failed to parse videos from localStorage:", error);
      }
    }
  }, []);
  
  // حفظ الفيديوهات عند تحديثها
  useEffect(() => {
    localStorage.setItem("videos", JSON.stringify(videos));
  }, [videos]);
  
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الرابط
    if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
      toast({
        title: "❌ خطأ",
        description: "الرجاء إدخال رابط يوتيوب صحيح",
        variant: "destructive",
      });
      return;
    }
    
    // إضافة الفيديو الجديد
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      title,
      description,
      youtubeUrl,
      group,
      grade,
      date: new Date().toISOString(),
    };
    
    setVideos([...videos, newVideo]);
    
    // إعادة تعيين النموذج
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setShowAddForm(false);
    
    toast({
      title: "✅ تم إضافة الفيديو بنجاح",
      description: "",
    });
  };
  
  const handleDeleteVideo = (id: string) => {
    setVideos(videos.filter(video => video.id !== id));
    toast({
      title: "✅ تم حذف الفيديو بنجاح",
      description: "",
    });
  };
  
  const filteredVideos = videos.filter(video => 
    (video.title.includes(searchQuery) || 
     video.description.includes(searchQuery)) &&
    (filterGroup === "" || video.group.includes(filterGroup))
  );
  
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
            <h1 className="text-2xl font-bold text-physics-gold">الفيديوهات التعليمية</h1>
            {currentUser?.role === "admin" && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="goldBtn flex items-center gap-2"
              >
                <Plus size={18} />
                <span>إضافة فيديو</span>
              </button>
            )}
          </div>
          
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                className="inputField pr-10 w-full"
                placeholder="بحث عن فيديو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <input
                type="text"
                className="inputField w-full"
                placeholder="فلتر المجموعة..."
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
              />
            </div>
          </div>
          
          {/* Videos Grid */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white text-lg">لا توجد فيديوهات متاحة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="bg-physics-dark rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  {/* Video Embed */}
                  <div className="aspect-video">
                    <YouTubeEmbed url={video.youtubeUrl} />
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-white">{video.title}</h3>
                      {currentUser?.role === "admin" && (
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center mt-3 text-xs text-gray-400 space-x-3 rtl:space-x-reverse">
                      <span>المجموعة: {video.group}</span>
                      <span>|</span>
                      <span>
                        {video.grade === "first"
                          ? "الصف الأول"
                          : video.grade === "second"
                          ? "الصف الثاني"
                          : "الصف الثالث"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Add Video Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة فيديو جديد</h2>
            
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-white mb-1">عنوان الفيديو</label>
                <input
                  type="text"
                  className="inputField"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">وصف الفيديو</label>
                <textarea
                  className="inputField min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-white mb-1">رابط اليوتيوب</label>
                <input
                  type="text"
                  className="inputField"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
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
                <label className="block text-white mb-1">الصف</label>
                <select 
                  className="inputField bg-physics-navy"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  type="submit" 
                  className="goldBtn flex-1"
                >
                  إضافة الفيديو
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

export default Videos;
