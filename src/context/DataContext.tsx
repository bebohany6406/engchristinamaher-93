
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

// Interface for data coming from Supabase
interface SupabaseGrade {
  id: string;
  student_id: string;
  student_name: string;
  exam_name: string;
  score: number;
  total_score: number;
  lesson_number: number;
  group_name: string | null;
  date: string | null;
  performance_indicator: string;
}

// Interface for data coming from Supabase
interface SupabaseAttendance {
  id: string;
  student_id: string;
  student_name: string;
  date: string | null;
  time: string | null;
  status: string;
  lesson_number: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [videos, setVideos] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[]>([]);
  const [books, setBooks] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string}[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Load data from Supabase on startup
  useEffect(() => {
    fetchDataFromSupabase();
  }, []);
  
  // Map Supabase format to our app format
  const mapSupabaseGradeToGrade = (supabaseGrade: SupabaseGrade): Grade => {
    return {
      id: supabaseGrade.id,
      studentId: supabaseGrade.student_id,
      studentName: supabaseGrade.student_name,
      examName: supabaseGrade.exam_name,
      score: supabaseGrade.score,
      totalScore: supabaseGrade.total_score,
      lessonNumber: supabaseGrade.lesson_number,
      group: supabaseGrade.group_name || "",
      date: supabaseGrade.date || new Date().toISOString(),
      performanceIndicator: supabaseGrade.performance_indicator as any
    };
  };

  // Map app grade to Supabase format
  const mapGradeToSupabaseGrade = (grade: Grade): SupabaseGrade => {
    return {
      id: grade.id,
      student_id: grade.studentId,
      student_name: grade.studentName,
      exam_name: grade.examName,
      score: grade.score,
      total_score: grade.totalScore,
      lesson_number: grade.lessonNumber,
      group_name: grade.group,
      date: grade.date,
      performance_indicator: grade.performanceIndicator
    };
  };

  // Map Supabase format to our app format
  const mapSupabaseAttendanceToAttendance = (supabaseAttendance: SupabaseAttendance): Attendance => {
    return {
      id: supabaseAttendance.id,
      studentId: supabaseAttendance.student_id,
      studentName: supabaseAttendance.student_name,
      date: supabaseAttendance.date || new Date().toISOString(),
      time: supabaseAttendance.time || "",
      status: supabaseAttendance.status as "present" | "absent",
      lessonNumber: supabaseAttendance.lesson_number
    };
  };

  // Map app attendance to Supabase format
  const mapAttendanceToSupabaseAttendance = (attendance: Attendance): SupabaseAttendance => {
    return {
      id: attendance.id,
      student_id: attendance.studentId,
      student_name: attendance.studentName,
      date: attendance.date,
      time: attendance.time,
      status: attendance.status,
      lesson_number: attendance.lessonNumber
    };
  };
  
  // Loading data from Supabase
  const fetchDataFromSupabase = async () => {
    try {
      // Load grades
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .order('date', { ascending: false });
      
      if (gradesError) throw gradesError;
      if (gradesData) {
        const mappedGrades = gradesData.map(grade => mapSupabaseGradeToGrade(grade as SupabaseGrade));
        setGrades(mappedGrades);
      }
      
      // Load attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });
      
      if (attendanceError) throw attendanceError;
      if (attendanceData) {
        const mappedAttendance = attendanceData.map(record => 
          mapSupabaseAttendanceToAttendance(record as SupabaseAttendance)
        );
        setAttendance(mappedAttendance);
      }
      
      // Load videos
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
      
      // Load books
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
      
      // Use local version if no data in Supabase
      if (!gradesData?.length && !attendanceData?.length && !videosData?.length && !booksData?.length) {
        loadFromLocalStorage();
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading data from Supabase:", error);
      toast({
        title: "حدث خطأ في الاتصال بقاعدة البيانات",
        description: "جاري تحميل البيانات المحلية كنسخة احتياطية",
        variant: "destructive"
      });
      
      // Use local version in case of connection failure
      loadFromLocalStorage();
      setIsInitialized(true);
    }
  };
  
  // Load from local storage as backup
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
      console.error("Error loading data from local storage:", error);
    }
  };
  
  // Save to local storage as backup
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem("grades", JSON.stringify(grades));
    localStorage.setItem("attendance", JSON.stringify(attendance));
    localStorage.setItem("videos", JSON.stringify(videos));
    localStorage.setItem("books", JSON.stringify(books));
  }, [grades, attendance, videos, books, isInitialized]);
  
  // Sync local data with Supabase
  const syncWithSupabase = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      toast({
        title: "جاري المزامنة مع قاعدة البيانات",
        description: "يرجى الانتظار..."
      });
      
      // Sync grades
      for (const grade of grades) {
        const { data: existingGrade, error: checkError } = await supabase
          .from('grades')
          .select('id')
          .eq('id', grade.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Error checking for grade existence:", checkError);
          continue;
        }
        
        if (!existingGrade) {
          // ننشئ معرف UUID جديد لكل سجل
          const { data: newGrade, error: insertError } = await supabase
            .from('grades')
            .insert({
              student_id: grade.studentId,
              student_name: grade.studentName,
              exam_name: grade.examName,
              score: grade.score,
              total_score: grade.totalScore,
              lesson_number: grade.lessonNumber,
              group_name: grade.group,
              date: grade.date,
              performance_indicator: grade.performanceIndicator
            })
            .select()
            .single();
          
          if (insertError) {
            console.error("Error inserting grade:", insertError);
          }
        }
      }
      
      // Sync attendance records
      for (const record of attendance) {
        const { data: existingRecord, error: checkError } = await supabase
          .from('attendance')
          .select('id')
          .eq('id', record.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Error checking for attendance record existence:", checkError);
          continue;
        }
        
        if (!existingRecord) {
          // ننشئ معرف UUID جديد لكل سجل
          const { data: newAttendance, error: insertError } = await supabase
            .from('attendance')
            .insert({
              student_id: record.studentId,
              student_name: record.studentName,
              status: record.status,
              lesson_number: record.lessonNumber,
              time: record.time,
              date: record.date
            })
            .select()
            .single();
          
          if (insertError) {
            console.error("Error inserting attendance record:", insertError);
          }
        }
      }
      
      // Sync videos
      for (const video of videos) {
        const { data: existingVideo, error: checkError } = await supabase
          .from('videos')
          .select('id')
          .eq('id', video.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Error checking for video existence:", checkError);
          continue;
        }
        
        if (!existingVideo) {
          // ننشئ معرف UUID جديد لكل سجل
          const { data: newVideo, error: insertError } = await supabase
            .from('videos')
            .insert({
              title: video.title,
              url: video.url,
              grade: video.grade,
              upload_date: video.uploadDate,
              is_youtube: video.isYouTube
            })
            .select()
            .single();
          
          if (insertError) {
            console.error("Error inserting video:", insertError);
          }
        }
      }
      
      // Sync books
      for (const book of books) {
        const { data: existingBook, error: checkError } = await supabase
          .from('books')
          .select('id')
          .eq('id', book.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Error checking for book existence:", checkError);
          continue;
        }
        
        if (!existingBook) {
          // ننشئ معرف UUID جديد لكل سجل
          const { data: newBook, error: insertError } = await supabase
            .from('books')
            .insert({
              title: book.title,
              url: book.url,
              grade: book.grade,
              upload_date: book.uploadDate
            })
            .select()
            .single();
          
          if (insertError) {
            console.error("Error inserting book:", insertError);
          }
        }
      }
      
      toast({
        title: "تمت المزامنة بنجاح",
        description: "تم تحديث قاعدة البيانات بأحدث البيانات"
      });
      
      // Update local data after sync
      await fetchDataFromSupabase();
    } catch (error) {
      console.error("Error syncing data with Supabase:", error);
      toast({
        title: "فشلت عملية المزامنة",
        description: "يرجى المحاولة مرة أخرى لاحقًا",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Add new grade
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
    const now = new Date().toISOString();
    
    try {
      // إضافة إلى Supabase مباشرة مع ترك Supabase يُنشئ معرف UUID
      const { data: newGradeData, error } = await supabase
        .from('grades')
        .insert({
          student_id: studentId,
          student_name: studentName,
          exam_name: examName,
          score,
          total_score: totalScore,
          lesson_number: lessonNumber,
          group_name: group,
          date: now,
          performance_indicator: performanceIndicator
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (newGradeData) {
        // إضافة السجل المُرجع بمعرفه UUID إلى القائمة المحلية
        const newGrade = mapSupabaseGradeToGrade(newGradeData as unknown as SupabaseGrade);
        setGrades(prevGrades => [...prevGrades, newGrade]);
        
        toast({
          title: "تم إضافة الدرجة بنجاح",
          description: `تم تسجيل درجة ${score} للطالب ${studentName}`
        });
      }
    } catch (error) {
      console.error("Error adding grade:", error);
      
      // في حالة الفشل، نضيف السجل محليًا لضمان عدم فقدان البيانات
      const localGrade: Grade = {
        id: crypto.randomUUID(),
        studentId,
        studentName,
        examName,
        score,
        totalScore,
        lessonNumber,
        group,
        date: now,
        performanceIndicator
      };
      
      setGrades(prevGrades => [...prevGrades, localGrade]);
      
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الدرجة",
        description: "تم حفظ الدرجة محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };

  // Update existing grade
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
      // Find existing grade to update
      const gradeToUpdate = grades.find(g => g.id === id);
      if (!gradeToUpdate) {
        throw new Error("Grade not found");
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('grades')
        .update({
          exam_name: examName,
          score,
          total_score: totalScore,
          lesson_number: lessonNumber,
          group_name: group,
          date: new Date().toISOString(),
          performance_indicator: performanceIndicator
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local list
      setGrades(prevGrades => 
        prevGrades.map(grade => 
          grade.id === id ? { 
            ...grade, 
            examName, 
            score, 
            totalScore, 
            lessonNumber,
            group,
            date: new Date().toISOString(),
            performanceIndicator
          } : grade
        )
      );
    } catch (error) {
      console.error("Error updating grade:", error);
      
      // Update locally even in case of failure
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

  // Delete grade
  const deleteGrade = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete from local list
      setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
    } catch (error) {
      console.error("Error deleting grade:", error);
      
      // Delete locally even in case of failure
      setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
      
      toast({
        variant: "destructive",
        title: "خطأ في حذف الدرجة",
        description: "تم حذف الدرجة محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  // Get grades for specific student
  const getStudentGrades = (studentId: string): Grade[] => {
    return grades.filter(grade => grade.studentId === studentId);
  };
  
  // Add attendance record
  const addAttendance = async (
    studentId: string,
    studentName: string,
    status: "present" | "absent",
    lessonNumber: number = 1,
    time?: string
  ) => {
    const now = new Date();
    const currentTime = time || `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDate = now.toISOString();
    
    try {
      // إضافة إلى Supabase مباشرة مع ترك Supabase يُنشئ معرف UUID
      const { data: newAttendanceData, error } = await supabase
        .from('attendance')
        .insert({
          student_id: studentId,
          student_name: studentName,
          status,
          lesson_number: lessonNumber,
          time: currentTime,
          date: currentDate
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (newAttendanceData) {
        // إضافة السجل المُرجع بمعرفه UUID إلى القائمة المحلية
        const newAttendance = mapSupabaseAttendanceToAttendance(newAttendanceData as unknown as SupabaseAttendance);
        setAttendance(prevAttendance => [...prevAttendance, newAttendance]);
        
        toast({
          title: status === 'present' ? "تم تسجيل الحضور" : "تم تسجيل الغياب",
          description: `تم تسجيل ${status === 'present' ? 'حضور' : 'غياب'} الطالب ${studentName}`
        });
      }
    } catch (error) {
      console.error("Error adding attendance record:", error);
      
      // في حالة الفشل، نضيف السجل محليًا لضمان عدم فقدان البيانات
      const localAttendance: Attendance = {
        id: crypto.randomUUID(),
        studentId,
        studentName,
        status,
        lessonNumber,
        time: currentTime,
        date: currentDate
      };
      
      setAttendance(prevAttendance => [...prevAttendance, localAttendance]);
      
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الحضور",
        description: "تم تسجيل الحضور محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  // Delete attendance record
  const deleteAttendanceRecord = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete from local list
      setAttendance(prevAttendance => prevAttendance.filter(record => record.id !== id));
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      
      // Delete locally even in case of failure
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
  
  // Get attendance record for a specific student
  const getStudentAttendance = (studentId: string): Attendance[] => {
    return attendance.filter(record => record.studentId === studentId);
  };
  
  // Video management
  const getVideos = () => videos;
  
  const getAllVideos = () => videos;
  
  const getVideosByGrade = (grade: string) => {
    return videos.filter(video => video.grade === grade);
  };
  
  const addVideo = async (title: string, url: string, grade: string) => {
    // Check if URL is a YouTube URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const uploadDate = new Date().toISOString();
    
    try {
      // إضافة إلى Supabase مباشرة مع ترك Supabase يُنشئ معرف UUID
      const { data: newVideoData, error } = await supabase
        .from('videos')
        .insert({
          title,
          url,
          grade,
          upload_date: uploadDate,
          is_youtube: isYouTube
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (newVideoData) {
        // إضافة الفيديو المُرجع بمعرفه UUID إلى القائمة المحلية
        setVideos(prevVideos => [
          ...prevVideos, 
          {
            id: newVideoData.id,
            title: newVideoData.title,
            url: newVideoData.url,
            grade: newVideoData.grade,
            uploadDate: newVideoData.upload_date,
            isYouTube: newVideoData.is_youtube
          }
        ]);
        
        toast({
          title: "تم إضافة الفيديو بنجاح",
          description: `تم إضافة فيديو: ${title}`
        });
      }
    } catch (error) {
      console.error("Error adding video:", error);
      
      // في حالة الفشل، نضيف السجل محليًا لضمان عدم فقدان البيانات
      const localVideo = { 
        id: crypto.randomUUID(),
        title, 
        url,
        grade,
        uploadDate,
        isYouTube
      };
      
      setVideos(prevVideos => [...prevVideos, localVideo]);
      
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
      // Update in Supabase
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
      
      // Update local list
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id 
            ? { ...video, title, url, grade, isYouTube }
            : video
        )
      );
    } catch (error) {
      console.error("Error updating video:", error);
      
      // Update locally even in case of failure
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
      // Delete from Supabase
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete from local list
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
      
      // Delete locally even in case of failure
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
      
      toast({
        variant: "destructive",
        title: "خطأ في حذف الفيديو",
        description: "تم حذف الفيديو محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  // Book management
  const getBooks = () => books;
  
  const getAllBooks = () => books;
  
  const getBooksByGrade = (grade: string) => {
    return books.filter(book => book.grade === grade);
  };
  
  const addBook = async (title: string, url: string, grade: string) => {
    const uploadDate = new Date().toISOString();
    
    try {
      // إضافة إلى Supabase مباشرة مع ترك Supabase يُنشئ معرف UUID
      const { data: newBookData, error } = await supabase
        .from('books')
        .insert({
          title,
          url,
          grade,
          upload_date: uploadDate
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (newBookData) {
        // إضافة الكتاب المُرجع بمعرفه UUID إلى القائمة المحلية
        setBooks(prevBooks => [
          ...prevBooks, 
          {
            id: newBookData.id,
            title: newBookData.title,
            url: newBookData.url,
            grade: newBookData.grade,
            uploadDate: newBookData.upload_date
          }
        ]);
        
        toast({
          title: "تم إضافة الكتاب بنجاح",
          description: `تم إضافة كتاب: ${title}`
        });
      }
    } catch (error) {
      console.error("Error adding book:", error);
      
      // في حالة الفشل، نضيف السجل محليًا لضمان عدم فقدان البيانات
      const localBook = { 
        id: crypto.randomUUID(),
        title, 
        url,
        grade,
        uploadDate
      };
      
      setBooks(prevBooks => [...prevBooks, localBook]);
      
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الكتاب",
        description: "تم إضافة الكتاب محليًا فقط. يرجى مزامنة البيانات لاحقًا."
      });
    }
  };
  
  const updateBook = async (id: string, title: string, url: string, grade: string) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('books')
        .update({
          title,
          url,
          grade
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local list
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === id 
            ? { ...book, title, url, grade }
            : book
        )
      );
    } catch (error) {
      console.error("Error updating book:", error);
      
      // Update locally even in case of failure
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
      // Delete from Supabase
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete from local list
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
    } catch (error) {
      console.error("Error deleting book:", error);
      
      // Delete locally even in case of failure
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
