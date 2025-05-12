
import React, { createContext, useContext, useState, useEffect } from "react";
import { Grade, Attendance } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DataContextType {
  grades: Grade[];
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
  attendance: Attendance[];
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  addGrade: (
    studentId: string,
    studentName: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number,
    group: string
  ) => Promise<void>;
  updateGrade: (
    id: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number,
    group: string
  ) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  getStudentGrades: (studentId: string) => Grade[];
  addAttendance: (
    studentId: string,
    studentName: string,
    status: "present" | "absent",
    lessonNumber?: number,
    time?: string
  ) => Promise<void>;
  deleteAttendanceRecord: (id: string) => Promise<void>;
  getStudentAttendance: (studentId: string) => Attendance[];
  getStudentLessonCount: (studentId: string) => number;
  getVideos: () => {title: string, url: string}[];
  getAllVideos: () => {id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[];
  getVideosByGrade: (grade: string) => {id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[];
  addVideo: (title: string, url: string, grade: string) => Promise<void>;
  updateVideo: (id: string, title: string, url: string, grade: string) => Promise<void>;
  deleteVideo: (url: string) => Promise<void>;
  getBooks: () => {title: string, url: string}[];
  getAllBooks: () => {id: string, title: string, url: string, grade: string, uploadDate: string}[];
  getBooksByGrade: (grade: string) => {id: string, title: string, url: string, grade: string, uploadDate: string}[];
  addBook: (title: string, url: string, grade: string) => Promise<void>;
  updateBook: (id: string, title: string, url: string, grade: string) => Promise<void>;
  deleteBook: (url: string) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [videos, setVideos] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[]>([]);
  const [books, setBooks] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string}[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // تحميل البيانات من Supabase عند بدء التشغيل
  useEffect(() => {
    fetchDataFromSupabase();
  }, []);
  
  // تحميل البيانات من Supabase
  const fetchDataFromSupabase = async () => {
    try {
      // تحميل الدرجات
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .order('date', { ascending: false });
      
      if (gradesError) throw gradesError;
      if (gradesData) setGrades(gradesData as Grade[]);
      
      // تحميل سجلات الحضور
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });
      
      if (attendanceError) throw attendanceError;
      if (attendanceData) setAttendance(attendanceData as Attendance[]);
      
      // تحميل الفيديوهات
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('upload_date', { ascending: false });
      
      if (videosError) throw videosError;
      if (videosData) {
        setVideos(videosData.map(video => ({
          id: video.id,
          title: video.title,
          url: video.url,
          grade: video.grade,
          uploadDate: video.upload_date,
          isYouTube: video.is_youtube
        })));
      }
      
      // تحميل الكتب
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .order('upload_date', { ascending: false });
      
      if (booksError) throw booksError;
      if (booksData) {
        setBooks(booksData.map(book => ({
          id: book.id,
          title: book.title,
          url: book.url,
          grade: book.grade,
          uploadDate: book.upload_date
        })));
      }
      
      // استخدم النسخة المحلية إذا لم تكن هناك بيانات في Supabase
      if (!gradesData?.length && !attendanceData?.length && !videosData?.length && !booksData?.length) {
        loadFromLocalStorage();
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error("خطأ في تحميل البيانات من Supabase:", error);
      toast({
        title: "حدث خطأ في الاتصال بقاعدة البيانات",
        description: "جاري تحميل البيانات المحلية كنسخة احتياطية",
        variant: "destructive"
      });
      
      // استخدام النسخة المحلية في حال فشل الاتصال
      loadFromLocalStorage();
      setIsInitialized(true);
    }
  };
  
  // تحميل من المخزن المحلي كنسخة احتياطية
  const loadFromLocalStorage = () => {
    try {
      const storedGrades = localStorage.getItem("grades");
      if (storedGrades) {
        setGrades(JSON.parse(storedGrades));
      }
      
      const storedAttendance = localStorage.getItem("attendance");
      if (storedAttendance) {
        setAttendance(JSON.parse(storedAttendance));
      }
      
      const storedVideos = localStorage.getItem("videos");
      if (storedVideos) {
        setVideos(JSON.parse(storedVideos));
      }
      
      const storedBooks = localStorage.getItem("books");
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.error("خطأ في تحميل البيانات من المخزن المحلي:", error);
    }
  };
  
  // حفظ إلى المخزن المحلي كنسخة احتياطية
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem("grades", JSON.stringify(grades));
    localStorage.setItem("attendance", JSON.stringify(attendance));
    localStorage.setItem("videos", JSON.stringify(videos));
    localStorage.setItem("books", JSON.stringify(books));
  }, [grades, attendance, videos, books, isInitialized]);
  
  // مزامنة البيانات المحلية مع Supabase
  const syncWithSupabase = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      toast({
        title: "جاري المزامنة مع قاعدة البيانات",
        description: "يرجى الانتظار..."
      });
      
      // مزامنة الدرجات
      for (const grade of grades) {
        const { data: existingGrade, error: checkError } = await supabase
          .from('grades')
          .select('id')
          .eq('id', grade.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("خطأ في التحقق من وجود الدرجة:", checkError);
          continue;
        }
        
        if (!existingGrade) {
          const { error: insertError } = await supabase
            .from('grades')
            .insert([grade]);
          
          if (insertError) {
            console.error("خطأ في إدراج الدرجة:", insertError);
          }
        }
      }
      
      // مزامنة سجلات الحضور
      for (const record of attendance) {
        const { data: existingRecord, error: checkError } = await supabase
          .from('attendance')
          .select('id')
          .eq('id', record.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("خطأ في التحقق من وجود سجل الحضور:", checkError);
          continue;
        }
        
        if (!existingRecord) {
          const { error: insertError } = await supabase
            .from('attendance')
            .insert([record]);
          
          if (insertError) {
            console.error("خطأ في إدراج سجل الحضور:", insertError);
          }
        }
      }
      
      // مزامنة الفيديوهات
      for (const video of videos) {
        const videoData = {
          id: video.id,
          title: video.title,
          url: video.url,
          grade: video.grade,
          upload_date: video.uploadDate,
          is_youtube: video.isYouTube
        };
        
        const { data: existingVideo, error: checkError } = await supabase
          .from('videos')
          .select('id')
          .eq('id', video.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("خطأ في التحقق من وجود الفيديو:", checkError);
          continue;
        }
        
        if (!existingVideo) {
          const { error: insertError } = await supabase
            .from('videos')
            .insert([videoData]);
          
          if (insertError) {
            console.error("خطأ في إدراج الفيديو:", insertError);
          }
        }
      }
      
      // مزامنة الكتب
      for (const book of books) {
        const bookData = {
          id: book.id,
          title: book.title,
          url: book.url,
          grade: book.grade,
          upload_date: book.uploadDate
        };
        
        const { data: existingBook, error: checkError } = await supabase
          .from('books')
          .select('id')
          .eq('id', book.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("خطأ في التحقق من وجود الكتاب:", checkError);
          continue;
        }
        
        if (!existingBook) {
          const { error: insertError } = await supabase
            .from('books')
            .insert([bookData]);
          
          if (insertError) {
            console.error("خطأ في إدراج الكتاب:", insertError);
          }
        }
      }
      
      toast({
        title: "تمت المزامنة بنجاح",
        description: "تم تحديث قاعدة البيانات بأحدث البيانات"
      });
      
      // تحديث البيانات المحلية بعد المزامنة
      await fetchDataFromSupabase();
    } catch (error) {
      console.error("خطأ في مزامنة البيانات مع Supabase:", error);
      toast({
        title: "فشلت عملية المزامنة",
        description: "يرجى المحاولة مرة أخرى لاحقًا",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // إضافة درجة جديدة
  const addGrade = async (
    studentId: string,
    studentName: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number,
    group: string
  ) => {
    const performanceIndicator = calculatePerformance(score, totalScore);
    
    const newGrade: Grade = {
      id: `grade-${Date.now()}`,
      studentId,
      studentName,
      examName,
      score,
      totalScore,
      lessonNumber,
      group,
      date: new Date().toISOString(),
      performanceIndicator
    };
    
    try {
      // إضافة إلى Supabase
      const { error } = await supabase
        .from('grades')
        .insert([newGrade]);
      
      if (error) throw error;
      
      // تحديث القائمة المحلية
      setGrades(prevGrades => [...prevGrades, newGrade]);
    } catch (error) {
      console.error("خطأ في إضافة درجة:", error);
      
      // إضافة محليًا حتى في حالة الفشل للتأكد من عدم فقدان البيانات
      setGrades(prevGrades => [...prevGrades, newGrade]);
      
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الدرجة",
        description: "تم حفظ الدرجة محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };

  // تحديث درجة موجودة
  const updateGrade = async (
    id: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number,
    group: string
  ) => {
    const performanceIndicator = calculatePerformance(score, totalScore);
    
    try {
      // تحديث في Supabase
      const { error } = await supabase
        .from('grades')
        .update({
          examName,
          score,
          totalScore,
          lessonNumber,
          group,
          date: new Date().toISOString(),
          performanceIndicator
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // تحديث القائمة المحلية
      setGrades(prevGrades => 
        prevGrades.map(grade => 
          grade.id === id 
            ? { 
                ...grade, 
                examName, 
                score, 
                totalScore, 
                lessonNumber,
                group,
                date: new Date().toISOString(),
                performanceIndicator
              }
            : grade
        )
      );
    } catch (error) {
      console.error("خطأ في تحديث درجة:", error);
      
      // تحديث محليًا حتى في حالة الفشل
      setGrades(prevGrades => 
        prevGrades.map(grade => 
          grade.id === id 
            ? { 
                ...grade, 
                examName, 
                score, 
                totalScore, 
                lessonNumber,
                group,
                date: new Date().toISOString(),
                performanceIndicator
              }
            : grade
        )
      );
      
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الدرجة",
        description: "تم تحديث الدرجة محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };

  // Function to calculate performance indicator
  const calculatePerformance = (score: number, total: number): "excellent" | "very-good" | "good" | "fair" | "needs-improvement" => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'very-good';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'fair';
    return 'needs-improvement';
  };

  // حذف درجة
  const deleteGrade = async (id: string) => {
    try {
      // حذف من Supabase
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // حذف من القائمة المحلية
      setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
    } catch (error) {
      console.error("خطأ في حذف درجة:", error);
      
      // حذف محليًا حتى في حالة الفشل
      setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
      
      toast({
        variant: "destructive",
        title: "خطأ في حذف الدرجة",
        description: "تم حذف الدرجة محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  // الحصول على درجات طالب محدد
  const getStudentGrades = (studentId: string): Grade[] => {
    return grades.filter(grade => grade.studentId === studentId);
  };
  
  // إضافة سجل حضور
  const addAttendance = async (
    studentId: string,
    studentName: string,
    status: "present" | "absent",
    lessonNumber: number = 1,
    time?: string
  ) => {
    const now = new Date();
    const newAttendance: Attendance = {
      id: `attendance-${Date.now()}`,
      studentId,
      studentName,
      status,
      lessonNumber,
      time: time || `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
      date: now.toISOString()
    };
    
    try {
      // إضافة إلى Supabase
      const { error } = await supabase
        .from('attendance')
        .insert([newAttendance]);
      
      if (error) throw error;
      
      // إضافة إلى القائمة المحلية
      setAttendance(prevAttendance => [...prevAttendance, newAttendance]);
    } catch (error) {
      console.error("خطأ في إضافة سجل حضور:", error);
      
      // إضافة محليًا حتى في حالة الفشل
      setAttendance(prevAttendance => [...prevAttendance, newAttendance]);
      
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الحضور",
        description: "تم تسجيل الحضور محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  // حذف سجل حضور
  const deleteAttendanceRecord = async (id: string) => {
    try {
      // حذف من Supabase
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // حذف من القائمة المحلية
      setAttendance(prevAttendance => prevAttendance.filter(record => record.id !== id));
    } catch (error) {
      console.error("خطأ في حذف سجل الحضور:", error);
      
      // حذف محليًا حتى في حالة الفشل
      setAttendance(prevAttendance => prevAttendance.filter(record => record.id !== id));
      
      toast({
        variant: "destructive",
        title: "خطأ في حذف سجل الحضور",
        description: "تم حذف السجل محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  // Get lesson count for a student
  const getStudentLessonCount = (studentId: string): number => {
    const studentAttendance = attendance.filter(record => record.studentId === studentId);
    if (studentAttendance.length === 0) return 0;
    
    // Find the highest lesson number
    return Math.max(...studentAttendance.map(record => record.lessonNumber || 0));
  };
  
  // الحصول على سجل حضور لطالب محدد
  const getStudentAttendance = (studentId: string): Attendance[] => {
    return attendance.filter(record => record.studentId === studentId);
  };
  
  // إدارة الفيديوهات
  const getVideos = () => videos;
  
  const getAllVideos = () => videos;
  
  const getVideosByGrade = (grade: string) => {
    return videos.filter(video => video.grade === grade);
  };
  
  const addVideo = async (title: string, url: string, grade: string) => {
    // Check if URL is a YouTube URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    
    const newVideo = { 
      id: `video-${Date.now()}`,
      title, 
      url,
      grade,
      uploadDate: new Date().toISOString(),
      isYouTube
    };
    
    try {
      // إضافة إلى Supabase
      const { error } = await supabase
        .from('videos')
        .insert([{
          id: newVideo.id,
          title: newVideo.title,
          url: newVideo.url,
          grade: newVideo.grade,
          upload_date: newVideo.uploadDate,
          is_youtube: newVideo.isYouTube
        }]);
      
      if (error) throw error;
      
      // إضافة إلى القائمة المحلية
      setVideos(prevVideos => [...prevVideos, newVideo]);
    } catch (error) {
      console.error("خطأ في إضافة فيديو:", error);
      
      // إضافة محليًا حتى في حالة الفشل
      setVideos(prevVideos => [...prevVideos, newVideo]);
      
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الفيديو",
        description: "تم إضافة الفيديو محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  const updateVideo = async (id: string, title: string, url: string, grade: string) => {
    // Check if URL is a YouTube URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    
    try {
      // تحديث في Supabase
      const { error } = await supabase
        .from('videos')
        .update({
          title,
          url,
          grade,
          is_youtube: isYouTube
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // تحديث القائمة المحلية
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id 
            ? { ...video, title, url, grade, isYouTube }
            : video
        )
      );
    } catch (error) {
      console.error("خطأ في تحديث الفيديو:", error);
      
      // تحديث محليًا حتى في حالة الفشل
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id 
            ? { ...video, title, url, grade, isYouTube }
            : video
        )
      );
      
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الفيديو",
        description: "تم تحديث الفيديو محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  const deleteVideo = async (id: string) => {
    try {
      // حذف من Supabase
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // حذف من القائمة المحلية
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
    } catch (error) {
      console.error("خطأ في حذف الفيديو:", error);
      
      // حذف محليًا حتى في حالة الفشل
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
      
      toast({
        variant: "destructive",
        title: "خطأ في حذف الفيديو",
        description: "تم حذف الفيديو محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  // إدارة الكتب
  const getBooks = () => books;
  
  const getAllBooks = () => books;
  
  const getBooksByGrade = (grade: string) => {
    return books.filter(book => book.grade === grade);
  };
  
  const addBook = async (title: string, url: string, grade: string) => {
    const newBook = { 
      id: `book-${Date.now()}`,
      title, 
      url,
      grade,
      uploadDate: new Date().toISOString()
    };
    
    try {
      // إضافة إلى Supabase
      const { error } = await supabase
        .from('books')
        .insert([{
          id: newBook.id,
          title: newBook.title,
          url: newBook.url,
          grade: newBook.grade,
          upload_date: newBook.uploadDate
        }]);
      
      if (error) throw error;
      
      // إضافة إلى القائمة المحلية
      setBooks(prevBooks => [...prevBooks, newBook]);
    } catch (error) {
      console.error("خطأ في إضافة كتاب:", error);
      
      // إضافة محليًا حتى في حالة الفشل
      setBooks(prevBooks => [...prevBooks, newBook]);
      
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الكتاب",
        description: "تم إضافة الكتاب محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  const updateBook = async (id: string, title: string, url: string, grade: string) => {
    try {
      // تحديث في Supabase
      const { error } = await supabase
        .from('books')
        .update({
          title,
          url,
          grade
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // تحديث القائمة المحلية
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === id 
            ? { ...book, title, url, grade }
            : book
        )
      );
    } catch (error) {
      console.error("خطأ في تحديث الكتاب:", error);
      
      // تحديث محليًا حتى في حالة الفشل
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === id 
            ? { ...book, title, url, grade }
            : book
        )
      );
      
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الكتاب",
        description: "تم تحديث الكتاب محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  const deleteBook = async (id: string) => {
    try {
      // حذف من Supabase
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // حذف من القائمة المحلية
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
    } catch (error) {
      console.error("خطأ في حذف الكتاب:", error);
      
      // حذف محليًا حتى في حالة الفشل
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
      
      toast({
        variant: "destructive",
        title: "خطأ في حذف الكتاب",
        description: "تم حذف الكتاب محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  const value = {
    grades,
    setGrades,
    attendance,
    setAttendance,
    addGrade,
    updateGrade,
    deleteGrade,
    getStudentGrades,
    addAttendance,
    deleteAttendanceRecord,
    getStudentAttendance,
    getStudentLessonCount,
    getVideos,
    getAllVideos,
    getVideosByGrade,
    addVideo,
    updateVideo,
    deleteVideo,
    getBooks,
    getAllBooks,
    getBooksByGrade,
    addBook,
    updateBook,
    deleteBook,
    syncWithSupabase
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
