
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoUploader } from "@/components/VideoUploader";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight } from "lucide-react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

// Fix the isYouTube URL validation function
const isYouTubeURL = (url: string): boolean => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

// Create the Videos component
const Videos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showUpload, setShowUpload] = useState(location.pathname === "/add-video");
  
  // Handle new video URL generation
  const handleVideoURLGenerated = (url: string) => {
    console.log("New video URL:", url);
    // Here you would typically save the video URL to your database
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
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
          <h1 className="text-2xl font-bold text-physics-gold mb-6">
            {showUpload ? "إضافة فيديو جديد" : "مكتبة الفيديوهات"}
          </h1>
          
          {currentUser?.role === "admin" && (
            <div className="mb-6">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="bg-physics-gold text-physics-navy px-4 py-2 rounded-md hover:bg-physics-gold/80 transition-colors"
              >
                {showUpload ? "عرض الفيديوهات" : "إضافة فيديو جديد"}
              </button>
            </div>
          )}
          
          {showUpload && currentUser?.role === "admin" ? (
            <VideoUploader onVideoURLGenerated={handleVideoURLGenerated} />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {/* Just some example videos as placeholders */}
              <div className="bg-physics-dark rounded-lg overflow-hidden">
                <h3 className="text-white text-lg p-4">شرح درس الحركة المستقيمة</h3>
                <YouTubeEmbed videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="شرح درس الحركة المستقيمة" />
              </div>
              
              <div className="bg-physics-dark rounded-lg overflow-hidden">
                <h3 className="text-white text-lg p-4">قوانين نيوتن للحركة</h3>
                <YouTubeEmbed videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="قوانين نيوتن للحركة" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Videos;
