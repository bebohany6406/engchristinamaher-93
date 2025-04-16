
import { useState, useRef } from "react";
import { Upload, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  onVideoURLGenerated: (url: string) => void;
}

export function VideoUploader({ onVideoURLGenerated }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف فيديو صالح",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 500MB to prevent memory issues)
    const MAX_FILE_SIZE = 500 * 1024 * 1024; 
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "الحد الأقصى لحجم الملف هو 500 ميجابايت",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setVideoPreview(null);
    
    // Simulate upload with progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);
    
    try {
      // Create a temporary local URL for the video with revoke on unmount
      const url = URL.createObjectURL(file);
      
      // Generate a video preview
      const videoPreviewUrl = URL.createObjectURL(file);
      setVideoPreview(videoPreviewUrl);
      
      // In a production app, we'd upload to a server here
      // For demo purposes, we'll use the local URL
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setVideoURL(url);
        onVideoURLGenerated(url);
        
        // Play sound effect
        const audio = new Audio("/upload-complete.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        toast({
          title: "تم رفع الفيديو بنجاح",
          description: "يمكنك الآن نسخ الرابط أو إضافة المعلومات الإضافية"
        });
        
        setTimeout(() => {
          setIsUploading(false);
        }, 500);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setIsUploading(false);
      
      toast({
        title: "فشل في رفع الفيديو",
        description: "حدث خطأ أثناء رفع الفيديو، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };
  
  const handleCopyLink = () => {
    if (!videoURL) return;
    
    navigator.clipboard.writeText(videoURL).then(() => {
      setIsCopied(true);
      
      // Play sound effect
      const audio = new Audio("/copy-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الفيديو إلى الحافظة"
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <div className="bg-physics-dark p-6 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-physics-gold">رفع فيديو جديد</h3>
        <p className="text-sm text-gray-300">اختر ملف فيديو لرفعه والحصول على رابط مباشر</p>
      </div>
      
      {!videoPreview ? (
        <div 
          className="border-2 border-dashed border-physics-gold/50 rounded-lg p-8 text-center cursor-pointer hover:border-physics-gold transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="video/*"
            onChange={handleFileChange}
            capture="environment"
          />
          
          <Upload className="mx-auto text-physics-gold mb-2" size={36} />
          <p className="text-white">اضغط هنا لاختيار فيديو للرفع</p>
          <p className="text-sm text-gray-400 mt-2">بحد أقصى 500 ميجابايت</p>
        </div>
      ) : (
        <div className="border-2 border-physics-gold/50 rounded-lg overflow-hidden mb-4 bg-black">
          <video 
            src={videoPreview} 
            className="w-full h-48 object-contain"
            controls
            playsInline
            autoPlay
            muted
          />
          <div className="p-2 bg-physics-navy">
            <p className="text-sm text-white mb-1">معاينة الفيديو</p>
            <button
              onClick={() => {
                // Clean up the preview URLs
                if (videoPreview) URL.revokeObjectURL(videoPreview);
                if (videoURL) URL.revokeObjectURL(videoURL);
                setVideoPreview(null);
                setVideoURL(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-sm text-red-400 hover:text-red-300"
            >
              إزالة الفيديو واختيار آخر
            </button>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white mb-1">
            <span>جاري الرفع...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-physics-navy rounded-full h-2">
            <div 
              className="bg-physics-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {videoURL && !isUploading && (
        <div className="mt-4">
          <div className="flex items-center">
            <input 
              type="text" 
              value={videoURL} 
              readOnly 
              className="inputField flex-1 ml-2 text-xs"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopyLink}
              className="goldBtn p-2 flex items-center justify-center"
              title={isCopied ? "تم النسخ" : "نسخ الرابط"}
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
