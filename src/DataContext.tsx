
import React, { createContext, useContext, useState, useEffect } from "react";
import { Grade, Attendance } from "@/types";

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
  ) => void;
  updateGrade: (
    id: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number,
    group: string
  ) => void;
  deleteGrade: (id: string) => void;
  getStudentGrades: (studentId: string) => Grade[];
  addAttendance: (
    studentId: string,
    studentName: string,
    status: "present" | "absent",
    lessonNumber?: number,
    time?: string
  ) => void;
  deleteAttendanceRecord: (id: string) => void;
  getStudentAttendance: (studentId: string) => Attendance[];
  getStudentLessonCount: (studentId: string) => number;
  getVideos: () => {title: string, url: string}[];
  getAllVideos: () => {id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[];
  getVideosByGrade: (grade: string) => {id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[];
  addVideo: (title: string, url: string, grade: string) => void;
  updateVideo: (id: string, title: string, url: string, grade: string) => void;
  deleteVideo: (url: string) => void;
  getBooks: () => {title: string, url: string}[];
  getAllBooks: () => {id: string, title: string, url: string, grade: string, uploadDate: string}[];
  getBooksByGrade: (grade: string) => {id: string, title: string, url: string, grade: string, uploadDate: string}[];
  addBook: (title: string, url: string) => void;
  updateBook: (id: string, title: string, url: string, grade: string) => void;
  deleteBook: (url: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [videos, setVideos] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string, isYouTube?: boolean}[]>([]);
  const [books, setBooks] = useState<{id: string, title: string, url: string, grade: string, uploadDate: string}[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
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
      console.error("Error loading data from localStorage:", error);
    }
    
    setIsInitialized(true);
  }, []);
  
  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem("grades", JSON.stringify(grades));
    localStorage.setItem("attendance", JSON.stringify(attendance));
    localStorage.setItem("videos", JSON.stringify(videos));
    localStorage.setItem("books", JSON.stringify(books));
  }, [grades, attendance, videos, books, isInitialized]);
  
  // إضافة درجة جديدة
  const addGrade = (
    studentId: string,
    studentName: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number,
    group: string
  ) => {
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
    
    setGrades(prevGrades => [...prevGrades, newGrade]);
  };

  // تحديث درجة موجودة
  const updateGrade = (
    id: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number,
    group: string
  ) => {
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
              date: new Date().toISOString(), // تحديث التاريخ عند التعديل
              performanceIndicator: calculatePerformance(score, totalScore)
            }
          : grade
      )
    );
  };

  // Function to calculate performance indicator
  const calculatePerformance = (score: number, total: number): string => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'very-good';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'fair';
    return 'needs-improvement';
  };

  // حذف درجة
  const deleteGrade = (id: string) => {
    setGrades(prevGrades => prevGrades.filter(grade => grade.id !== id));
  };
  
  // الحصول على درجات طالب محدد
  const getStudentGrades = (studentId: string): Grade[] => {
    return grades.filter(grade => grade.studentId === studentId);
  };
  
  // إضافة سجل حضور
  const addAttendance = (
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
    
    setAttendance(prevAttendance => [...prevAttendance, newAttendance]);
  };
  
  // حذف سجل حضور
  const deleteAttendanceRecord = (id: string) => {
    setAttendance(prevAttendance => prevAttendance.filter(record => record.id !== id));
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
  
  const addVideo = (title: string, url: string, grade: string) => {
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
    setVideos(prevVideos => [...prevVideos, newVideo]);
  };
  
  const updateVideo = (id: string, title: string, url: string, grade: string) => {
    // Check if URL is a YouTube URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    
    setVideos(prevVideos => 
      prevVideos.map(video => 
        video.id === id 
          ? { ...video, title, url, grade, isYouTube }
          : video
      )
    );
  };
  
  const deleteVideo = (id: string) => {
    setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
  };
  
  // إدارة الكتب
  const getBooks = () => books;
  
  const getAllBooks = () => books;
  
  const getBooksByGrade = (grade: string) => {
    return books.filter(book => book.grade === grade);
  };
  
  const addBook = (title: string, url: string, grade: string) => {
    const newBook = { 
      id: `book-${Date.now()}`,
      title, 
      url,
      grade,
      uploadDate: new Date().toISOString()
    };
    setBooks(prevBooks => [...prevBooks, newBook]);
  };
  
  const updateBook = (id: string, title: string, url: string, grade: string) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === id 
          ? { ...book, title, url, grade }
          : book
      )
    );
  };
  
  const deleteBook = (id: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
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
    deleteBook
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
