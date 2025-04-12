
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ArrowRight, FilePlus, Calendar, Search, Play } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

const Videos = () => {
  const navigate = useNavigate();
  const { getAllVideos, addVideo } = useData();
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");
  
  const videos = getAllVideos();
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    addVideo(title, url, grade);
    setTitle("");
    setUrl("");
    setGrade("first");
    setShowAddForm(false);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <h1 className="text-2xl font-bold text-physics-gold">الفيديوهات التعليمية</h1>
            {currentUser?.role === "admin" && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="goldBtn flex items-center gap-2"
              >
                <FilePlus size={18} />
                <span>إضافة فيديو</span>
              </button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
            <input
              type="text"
              className="inputField pr-12"
              placeholder="ابحث عن فيديو"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Selected Video */}
          {selectedVideo && (
            <div className="bg-physics-dark rounded-lg overflow-hidden mb-6">
              <VideoPlayer 
                src={selectedVideo} 
                title={videos.find(v => v.url === selectedVideo)?.title || ""} 
              />
              <div className="p-4">
                <h2 className="text-xl font-bold text-white">
                  {videos.find(v => v.url === selectedVideo)?.title || ""}
                </h2>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="text-physics-gold hover:underline mt-2"
                >
                  العودة للقائمة
                </button>
              </div>
            </div>
          )}
          
          {/* Videos List */}
          {!selectedVideo && (
            <div className="bg-physics-dark rounded-lg overflow-hidden">
              {filteredVideos.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white text-lg">لا توجد فيديوهات متاحة</p>
                </div>
              ) : (
                <div className="divide-y divide-physics-navy">
                  {filteredVideos.map((video) => (
                    <div 
                      key={video.id} 
                      className="p-4 hover:bg-physics-navy/30 cursor-pointer"
                      onClick={() => setSelectedVideo(video.url)}
                    >
                      <div className="flex items-center">
                        <div className="mr-4 bg-physics-navy p-3 rounded-full">
                          <Play size={24} className="text-physics-gold" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white">{video.title}</h3>
                          <div className="flex items-center text-sm text-gray-300 mt-1">
                            <Calendar size={14} className="ml-1" />
                            <span>{formatDate(video.uploadDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Add Video Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
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
                <label className="block text-white mb-1">رابط الفيديو</label>
                <input
                  type="text"
                  className="inputField"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="https://..."
                />
                <p className="text-sm text-gray-300 mt-1">أدخل رابط مباشر للفيديو (mp4, webm)</p>
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select
                  className="inputField"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as "first" | "second" | "third")}
                  required
                >
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
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
