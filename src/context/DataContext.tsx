
import React, { createContext, useContext, useState, useEffect } from "react";
import { Grade, Attendance } from "@/types";
import { supabase } from "@/lib/supabase";
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
  deleteVideo: (id: string) => Promise<void>;
  getBooks: () => {title: string, url: string}[];
  getAllBooks: () => {id: string, title: string, url: string, grade: string, uploadDate: string}[];
  getBooksByGrade: (grade: string) => {id: string, title: string, url: string, grade: string, uploadDate: string}[];
  addBook: (title: string, url: string, grade: string) => Promise<void>;
  updateBook: (id: string, title: string, url: string, grade: string) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [videos, setVideos] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[]>([]);
  const [books, setBooks] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load data from Supabase and localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load grades from Supabase
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*');
          
        if (gradesError) {
          console.error("Error loading grades from Supabase:", gradesError);
          
          // Try loading from localStorage as fallback
          const storedGrades = localStorage.getItem("grades");
          if (storedGrades) {
            try {
              const parsedGrades = JSON.parse(storedGrades);
              setGrades(parsedGrades);
              console.log("Loaded grades from localStorage (fallback)");
              
              // Try migrating localStorage data to Supabase
              parsedGrades.forEach(async (grade: Grade) => {
                try {
                  await supabase.from('grades').upsert({
                    id: grade.id,
                    studentId: grade.studentId,
                    studentName: grade.studentName,
                    examName: grade.examName,
                    score: grade.score,
                    totalScore: grade.totalScore,
                    lessonNumber: grade.lessonNumber,
                    group: grade.group,
                    date: grade.date,
                    performanceIndicator: grade.performanceIndicator
                  });
                } catch (syncError) {
                  console.error("Failed to sync grade to Supabase:", syncError);
                }
              });
            } catch (parseError) {
              console.error("Failed to parse grades from localStorage:", parseError);
            }
          }
        } else {
          setGrades(gradesData);
          console.log("Loaded grades from Supabase:", gradesData);
        }
        
        // Load attendance from Supabase
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*');
          
        if (attendanceError) {
          console.error("Error loading attendance from Supabase:", attendanceError);
          
          // Try loading from localStorage as fallback
          const storedAttendance = localStorage.getItem("attendance");
          if (storedAttendance) {
            try {
              const parsedAttendance = JSON.parse(storedAttendance);
              setAttendance(parsedAttendance);
              console.log("Loaded attendance from localStorage (fallback)");
              
              // Try migrating localStorage data to Supabase
              parsedAttendance.forEach(async (record: Attendance) => {
                try {
                  await supabase.from('attendance').upsert({
                    id: record.id,
                    studentId: record.studentId,
                    studentName: record.studentName,
                    status: record.status,
                    lessonNumber: record.lessonNumber || 1,
                    time: record.time,
                    date: record.date
                  });
                } catch (syncError) {
                  console.error("Failed to sync attendance to Supabase:", syncError);
                }
              });
            } catch (parseError) {
              console.error("Failed to parse attendance from localStorage:", parseError);
            }
          }
        } else {
          setAttendance(attendanceData);
          console.log("Loaded attendance from Supabase:", attendanceData);
        }
        
        // Load videos from Supabase
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*');
          
        if (videosError) {
          console.error("Error loading videos from Supabase:", videosError);
          
          // Try loading from localStorage as fallback
          const storedVideos = localStorage.getItem("videos");
          if (storedVideos) {
            try {
              const parsedVideos = JSON.parse(storedVideos);
              setVideos(parsedVideos);
              console.log("Loaded videos from localStorage (fallback)");
              
              // Try migrating localStorage data to Supabase
              parsedVideos.forEach(async (video: any) => {
                try {
                  await supabase.from('videos').upsert({
                    id: video.id,
                    title: video.title,
                    url: video.url,
                    grade: video.grade,
                    uploadDate: video.uploadDate,
                    isYouTube: video.isYouTube || video.url.includes('youtube.com') || video.url.includes('youtu.be')
                  });
                } catch (syncError) {
                  console.error("Failed to sync video to Supabase:", syncError);
                }
              });
            } catch (parseError) {
              console.error("Failed to parse videos from localStorage:", parseError);
            }
          }
        } else {
          setVideos(videosData);
          console.log("Loaded videos from Supabase:", videosData);
        }
        
        // Load books from Supabase
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select('*');
          
        if (booksError) {
          console.error("Error loading books from Supabase:", booksError);
          
          // Try loading from localStorage as fallback
          const storedBooks = localStorage.getItem("books");
          if (storedBooks) {
            try {
              const parsedBooks = JSON.parse(storedBooks);
              setBooks(parsedBooks);
              console.log("Loaded books from localStorage (fallback)");
              
              // Try migrating localStorage data to Supabase
              parsedBooks.forEach(async (book: any) => {
                try {
                  await supabase.from('books').upsert({
                    id: book.id,
                    title: book.title,
                    url: book.url,
                    grade: book.grade,
                    uploadDate: book.uploadDate
                  });
                } catch (syncError) {
                  console.error("Failed to sync book to Supabase:", syncError);
                }
              });
            } catch (parseError) {
              console.error("Failed to parse books from localStorage:", parseError);
            }
          }
        } else {
          setBooks(booksData);
          console.log("Loaded books from Supabase:", booksData);
        }
        
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    loadData();
  }, []);
  
  // Function to calculate performance indicator
  const calculatePerformance = (score: number, total: number): "excellent" | "very-good" | "good" | "fair" | "needs-improvement" => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'very-good';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'fair';
    return 'needs-improvement';
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
    try {
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
        performanceIndicator: calculatePerformance(score, totalScore)
      };
      
      const { error } = await supabase.from('grades').insert(newGrade);
      
      if (error) throw error;
      
      setGrades(prevGrades => [...prevGrades, newGrade]);
    } catch (error) {
      console.error("Error adding grade:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إضافة الدرجة",
        variant: "destructive"
      });
      throw error;
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
    try {
      const performanceIndicator = calculatePerformance(score, totalScore);
      const date = new Date().toISOString();
      
      const { error } = await supabase
        .from('grades')
        .update({ 
          examName, 
          score, 
          totalScore, 
          lessonNumber,
          group,
          date,
          performanceIndicator
        })
        .eq('id', id);
        
      if (error) throw error;
      
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
                date,
                performanceIndicator
              } as Grade
            : grade
        )
      );
    } catch (error) {
      console.error("Error updating grade:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث الدرجة",
        variant: "destructive"
      });
      throw error;
    }
  };

  // حذف درجة
  const deleteGrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء حذف الدرجة",
        variant: "destructive"
      });
      throw error;
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
    try {
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
      
      const { error } = await supabase.from('attendance').insert(newAttendance);
      
      if (error) throw error;
      
      setAttendance(prevAttendance => [...prevAttendance, newAttendance]);
    } catch (error) {
      console.error("Error adding attendance:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تسجيل الحضور",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // حذف سجل حضور
  const deleteAttendanceRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setAttendance(prevAttendance => prevAttendance.filter(record => record.id !== id));
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء حذف سجل الحضور",
        variant: "destructive"
      });
      throw error;
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
    try {
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
      
      const { error } = await supabase.from('videos').insert(newVideo);
      
      if (error) throw error;
      
      setVideos(prevVideos => [...prevVideos, newVideo]);
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إضافة الفيديو",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const updateVideo = async (id: string, title: string, url: string, grade: string) => {
    try {
      // Check if URL is a YouTube URL
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      const { error } = await supabase
        .from('videos')
        .update({ title, url, grade, isYouTube })
        .eq('id', id);
        
      if (error) throw error;
      
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id 
            ? { ...video, title, url, grade, isYouTube }
            : video
        )
      );
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث الفيديو",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء حذف الفيديو",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // إدارة الكتب
  const getBooks = () => books;
  
  const getAllBooks = () => books;
  
  const getBooksByGrade = (grade: string) => {
    return books.filter(book => book.grade === grade);
  };
  
  const addBook = async (title: string, url: string, grade: string) => {
    try {
      const newBook = { 
        id: `book-${Date.now()}`,
        title, 
        url,
        grade,
        uploadDate: new Date().toISOString()
      };
      
      const { error } = await supabase.from('books').insert(newBook);
      
      if (error) throw error;
      
      setBooks(prevBooks => [...prevBooks, newBook]);
    } catch (error) {
      console.error("Error adding book:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إضافة الكتاب",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const updateBook = async (id: string, title: string, url: string, grade: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ title, url, grade })
        .eq('id', id);
        
      if (error) throw error;
      
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === id 
            ? { ...book, title, url, grade }
            : book
        )
      );
    } catch (error) {
      console.error("Error updating book:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث الكتاب",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ أثناء حذف الكتاب",
        variant: "destructive"
      });
      throw error;
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
    isLoading,
    error
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
