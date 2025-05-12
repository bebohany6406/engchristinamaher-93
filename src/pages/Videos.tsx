import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, ArrowRight, Upload, Play, Trash2 } from "lucide-react";
import { VideoUploader } from "@/components/VideoUploader";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoPlayerFixed } from "@/components/VideoPlayerFixed";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "youtube" | "mp4";
  grade?: "first" | "second" | "third";
}

const Videos = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    const storedVideos = localStorage.getItem("videos");
    if (storedVideos) {
      try {
        setVideos(JSON.parse(storedVideos));
      } catch (error) {
        console.error("Failed to parse videos from localStorage:", error);
      }
    }
    
    // If coming from a link with a specific grade, set that grade
    const urlParams = new URLSearchParams(window.location.search);
    const gradeParam = urlParams.get('grade');
    if (gradeParam) {
      setSelectedGrade(gradeParam);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("videos", JSON.stringify(videos));
  }, [videos]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const addVideo = () => {
    if (activeTab === "upload") {
      if (!videoFile || !title || !description || !selectedGrade) {
        alert("الرجاء ملء جميع الحقول المطلوبة.");
        return;
      }

      const newVideo: Video = {
        id: `video-${Date.now()}`,
        title,
        description,
        url: videoUrl,
        type: "mp4",
        grade: selectedGrade as "first" | "second" | "third",
      };
      setVideos([...videos, newVideo]);
    } else if (activeTab === "youtube") {
      if (!youtubeUrl || !title || !description || !selectedGrade) {
        alert("الرجاء ملء جميع الحقول المطلوبة.");
        return;
      }

      const newVideo: Video = {
        id: `video-${Date.now()}`,
        title,
        description,
        url: youtubeUrl,
        type: "youtube",
        grade: selectedGrade as "first" | "second" | "third",
      };
      setVideos([...videos, newVideo]);
    }

    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setVideoFile(null);
    setVideoUrl("");
    setShowUploader(false);
  };

  const deleteVideo = (id: string) => {
    setVideos(videos.filter((video) => video.id !== id));
  };

  const filteredVideos = selectedGrade
    ? videos.filter((video) => video.grade === selectedGrade)
    : videos;

  return (
    <div className="min-h-screen bg-physics-navy flex flex-col">
      <PhoneContact />

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-physics-gold">
              إدارة الفيديوهات التعليمية
            </h1>
            <p className="text-gray-300 mt-2">
              يمكنك إضافة وتعديل الفيديوهات التعليمية هنا
            </p>
          </div>

          {/* Add Video Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-physics-gold">
                إضافة فيديو جديد
              </h2>
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="bg-physics-gold text-physics-navy py-2 px-4 rounded-lg hover:opacity-80"
              >
                {showUploader ? "إخفاء" : "إضافة فيديو"}
              </button>
            </div>

            {showUploader && (
              <div className="bg-physics-dark rounded-lg p-6">
                <div className="flex space-x-4 mb-4">
                  <button
                    className={`py-2 px-4 rounded-lg ${
                      activeTab === "upload"
                        ? "bg-physics-gold text-physics-navy"
                        : "text-white hover:bg-physics-navy/50"
                    }`}
                    onClick={() => setActiveTab("upload")}
                  >
                    رفع فيديو
                  </button>
                  <button
                    className={`py-2 px-4 rounded-lg ${
                      activeTab === "youtube"
                        ? "bg-physics-gold text-physics-navy"
                        : "text-white hover:bg-physics-navy/50"
                    }`}
                    onClick={() => setActiveTab("youtube")}
                  >
                    يوتيوب
                  </button>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="grade"
                    className="block text-white text-sm font-bold mb-2"
                  >
                    الصف الدراسي:
                  </label>
                  <select
                    id="grade"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedGrade}
                    onChange={handleGradeChange}
                  >
                    <option value="">اختر الصف</option>
                    <option value="first">الأول الثانوي</option>
                    <option value="second">الثاني الثانوي</option>
                    <option value="third">الثالث الثانوي</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="block text-white text-sm font-bold mb-2"
                  >
                    عنوان الفيديو:
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="أدخل عنوان الفيديو"
                    value={title}
                    onChange={handleTitleChange}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-white text-sm font-bold mb-2"
                  >
                    وصف الفيديو:
                  </label>
                  <textarea
                    id="description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="أدخل وصف الفيديو"
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </div>

                {activeTab === "upload" ? (
                  <>
                    <VideoUploader onVideoUpload={handleVideoUpload} />
                    {videoFile && (
                      <div className="mt-4">
                        <VideoPlayerFixed videoUrl={videoUrl} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mb-4">
                    <label
                      htmlFor="youtubeUrl"
                      className="block text-white text-sm font-bold mb-2"
                    >
                      رابط يوتيوب:
                    </label>
                    <input
                      type="text"
                      id="youtubeUrl"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="أدخل رابط يوتيوب"
                      value={youtubeUrl}
                      onChange={handleYoutubeUrlChange}
                    />
                    {youtubeUrl && (
                      <div className="mt-4">
                        <YouTubeEmbed videoId={youtubeUrl} />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={addVideo}
                  className="bg-physics-gold text-physics-navy py-2 px-4 rounded-lg hover:opacity-80"
                >
                  إضافة الفيديو
                </button>
              </div>
            )}
          </section>

          {/* Videos List Section */}
          <section>
            <h2 className="text-xl font-bold text-physics-gold mb-4">
              قائمة الفيديوهات
            </h2>

            <div className="mb-4">
              <label
                htmlFor="filterGrade"
                className="block text-white text-sm font-bold mb-2"
              >
                تصفية حسب الصف:
              </label>
              <select
                id="filterGrade"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedGrade}
                onChange={handleGradeChange}
              >
                <option value="">جميع الصفوف</option>
                <option value="first">الأول الثانوي</option>
                <option value="second">الثاني الثانوي</option>
                <option value="third">الثالث الثانوي</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-physics-dark rounded-lg overflow-hidden"
                >
                  {video.type === "mp4" ? (
                    <VideoPlayer videoUrl={video.url} />
                  ) : (
                    <YouTubeEmbed videoId={video.url} />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white">
                      {video.title}
                    </h3>
                    <p className="text-gray-300">{video.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-physics-gold">
                        الصف: {video.grade}
                      </span>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Videos;
