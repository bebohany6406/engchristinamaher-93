
import React, { useState, useEffect } from "react";

interface YouTubeEmbedProps {
  videoUrl: string;
  title: string;
}

export function YouTubeEmbed({ videoUrl, title }: YouTubeEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // استخراج معرف الفيديو من رابط يوتيوب
      let videoId = "";

      // Pattern for youtube.com/watch?v=VIDEO_ID
      const watchUrlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/i;
      const watchMatch = videoUrl.match(watchUrlPattern);
      
      // Pattern for youtube.com/embed/VIDEO_ID
      const embedUrlPattern = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i;
      const embedMatch = videoUrl.match(embedUrlPattern);
      
      // Pattern for youtube.com/v/VIDEO_ID
      const shortUrlPattern = /youtube\.com\/v\/([a-zA-Z0-9_-]+)/i;
      const shortMatch = videoUrl.match(shortUrlPattern);
      
      // Pattern for youtu.be/VIDEO_ID
      const youtubeShortPattern = /youtu\.be\/([a-zA-Z0-9_-]+)/i;
      const youtubeShortMatch = videoUrl.match(youtubeShortPattern);

      if (watchMatch && watchMatch[1]) {
        videoId = watchMatch[1];
      } else if (embedMatch && embedMatch[1]) {
        videoId = embedMatch[1];
      } else if (shortMatch && shortMatch[1]) {
        videoId = shortMatch[1];
      } else if (youtubeShortMatch && youtubeShortMatch[1]) {
        videoId = youtubeShortMatch[1];
      }

      if (videoId) {
        // تحسين إعدادات تضمين الفيديو لإزالة جميع خيارات التفاعل
        // rel=0: يعطل الفيديوهات ذات الصلة
        // modestbranding=1: يقلل من علامة YouTube التجارية
        // controls=1: يعرض عناصر تحكم الفيديو (نحتاج هذا للتحكم في التشغيل)
        // disablekb=1: يعطل عناصر تحكم لوحة المفاتيح
        // iv_load_policy=3: يعطل التعليقات التوضيحية للفيديو
        // fs=0: يعطل زر ملء الشاشة
        // showinfo=0: يخفي معلومات الفيديو
        // origin: يعين الأصل لتحسين الأمان
        // playsinline=1: يتم تشغيله مضمنًا على iOS
        // mute=0: لا يكتم الصوت
        // loop=0: لا يكرر الفيديو
        // cc_load_policy=0: لا يعرض التسميات التوضيحية بشكل افتراضي
        // enablejsapi=0: يعطل API JS
        // color=white: شريط تقدم أبيض
        // annotations=0: إيقاف التعليقات
        // autohide=1: إخفاء عناصر التحكم عند عدم النشاط
        
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0&modestbranding=1&fs=0&disablekb=1&controls=1&iv_load_policy=3&start=0&origin=${window.location.origin}&playsinline=1&mute=0&loop=0&cc_load_policy=0&enablejsapi=0&color=white&annotations=0&autohide=1`);
        setIsLoading(false);
      } else {
        setError("الرابط غير صالح. يرجى استخدام رابط يوتيوب صحيح");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing YouTube URL:", error);
      setError("حدث خطأ أثناء معالجة رابط الفيديو");
      setIsLoading(false);
    }
  }, [videoUrl]);

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-physics-dark flex items-center justify-center rounded-lg">
        <div className="w-12 h-12 border-4 border-physics-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-physics-dark flex items-center justify-center rounded-lg">
        <div className="text-red-400 text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={false}
        loading="lazy"
        style={{
          pointerEvents: "auto"
        }}
      ></iframe>
      
      {/* غلاف شفاف لمنع التفاعل مع عناصر واجهة مستخدم YouTube خارج منطقة التشغيل */}
      <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
        <div className="absolute top-0 left-0 w-full h-12" style={{ pointerEvents: "none" }}></div>
        <div className="absolute bottom-0 left-0 w-full h-12" style={{ pointerEvents: "none" }}></div>
        <div className="absolute top-12 left-0 w-12 bottom-12" style={{ pointerEvents: "none" }}></div>
        <div className="absolute top-12 right-0 w-12 bottom-12" style={{ pointerEvents: "none" }}></div>
      </div>
    </div>
  );
}
