
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
  getVideos: () => {title: string, url: string}[];
  addVideo: (title: string, url: string) => void;
  deleteVideo: (url: string) => void;
  getBooks: () => {title: string, url: string}[];
  addBook: (title: string, url: string) => void;
  deleteBook: (url: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [videos, setVideos] = useState<{title: string, url: string}[]>([]);
  const [books, setBooks] = useState<{title: string, url: string}[]>([]);
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
      date: new Date().toISOString()
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
              date: new Date().toISOString() // تحديث التاريخ عند التعديل
            }
          : grade
      )
    );
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
  
  // الحصول على سجل حضور لطالب محدد
  const getStudentAttendance = (studentId: string): Attendance[] => {
    return attendance.filter(record => record.studentId === studentId);
  };
  
  // إدارة الفيديوهات
  const getVideos = () => videos;
  
  const addVideo = (title: string, url: string) => {
    const newVideo = { title, url };
    setVideos(prevVideos => [...prevVideos, newVideo]);
  };
  
  const deleteVideo = (url: string) => {
    setVideos(prevVideos => prevVideos.filter(video => video.url !== url));
  };
  
  // إدارة الكتب
  const getBooks = () => books;
  
  const addBook = (title: string, url: string) => {
    const newBook = { title, url };
    setBooks(prevBooks => [...prevBooks, newBook]);
  };
  
  const deleteBook = (url: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.url !== url));
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
    getVideos,
    addVideo,
    deleteVideo,
    getBooks,
    addBook,
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
