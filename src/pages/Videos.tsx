import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Videos = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]); // Replace with actual video type
  const [editingVideoId, setEditingVideoId] = useState(null);

  // Dummy data for demonstration
  useEffect(() => {
    // Replace with actual data fetching logic
    setVideos([
      { id: "1", title: "مقدمة في الفيزياء", url: "https://example.com/video1" },
      { id: "2", title: "قوانين الحركة", url: "https://example.com/video2" },
    ]);
  }, []);

  const filteredVideos = videos.filter(video =>
    video.title.includes(searchQuery)
  );

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement add video logic here
    toast({
      title: "⚠️ قادم قريبًا",
      description: "سيتم إضافة وظيفة إضافة فيديو قريبًا",
    });
    setShowAddForm(false);
  };

  const handleEditVideo = (videoId: string) => {
    // Implement edit video logic here
    setEditingVideoId(videoId);
    toast({
      title: "⚠️ قادم قريبًا",
      description: "سيتم إضافة وظيفة تعديل الفيديو قريبًا",
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    // Implement delete video logic here
    toast({
      title: "⚠️ قادم قريبًا",
      description: "سيتم إضافة وظيفة حذف الفيديو قريبًا",
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
            <h1 className="text-2xl font-bold text-physics-gold">إدارة الفيديوهات</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="goldBtn flex items-center gap-2"
            >
              <Plus size={18} />
              <span>إضافة فيديو</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
            <input
              type="text"
              className="inputField pr-12"
              placeholder="ابحث عن فيديو بالعنوان"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Videos List */}
          <div className="bg-physics-dark/80 rounded-lg overflow-hidden">
            {filteredVideos.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white text-lg">لا يوجد فيديوهات مسجلة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-physics-navy/50 text-physics-gold">
                      <th className="text-right py-3 px-4">العنوان</th>
                      <th className="text-right py-3 px-4">الرابط</th>
                      <th className="text-center py-3 px-4">خيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.map((video) => (
                      <tr key={video.id} className="border-t border-physics-navy hover:bg-physics-navy/30">
                        <td className="py-3 px-4 text-white">{video.title}</td>
                        <td className="py-3 px-4 text-white">{video.url}</td>
                        <td className="py-3 px-4 text-white text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              className="p-1 text-blue-400 hover:text-blue-500"
                              onClick={() => handleEditVideo(video.id)}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="p-1 text-red-400 hover:text-red-500"
                              onClick={() => handleDeleteVideo(video.id)}
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

      {/* Add Video Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">إضافة فيديو جديد</h2>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-white mb-1">العنوان</label>
                <input
                  type="text"
                  className="inputField"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-1">الرابط</label>
                <input
                  type="url"
                  className="inputField"
                  required
                />
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

      {/* Edit Video Modal (Conditionally Rendered) */}
      {editingVideoId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">تعديل الفيديو</h2>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-white mb-1">العنوان</label>
                <input
                  type="text"
                  className="inputField"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-1">الرابط</label>
                <input
                  type="url"
                  className="inputField"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="goldBtn flex-1"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1"
                  onClick={() => setEditingVideoId(null)}
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
