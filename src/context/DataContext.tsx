
import React, { createContext, useContext, useState, useEffect } from "react";
import { Attendance, Grade, Video, Book, Student } from "@/types";
import { toast } from "@/hooks/use-toast";

interface DataContextType {
  attendance: Attendance[];
  grades: Grade[];
  videos: Video[];
  books: Book[];
  
  // Attendance methods
  addAttendance: (studentId: string, studentName: string, status: "present" | "absent") => void;
  getStudentAttendance: (studentId: string) => Attendance[];
  
  // Grades methods
  addGrade: (studentId: string, studentName: string, examName: string, score: number, totalScore: number) => void;
  getStudentGrades: (studentId: string) => Grade[];
  
  // Videos methods
  addVideo: (title: string, url: string, thumbnailUrl?: string) => void;
  getAllVideos: () => Video[];
  
  // Books methods
  addBook: (title: string, url: string) => void;
  getAllBooks: () => Book[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedAttendance = localStorage.getItem("attendance");
    if (storedAttendance) {
      try {
        setAttendance(JSON.parse(storedAttendance));
      } catch (error) {
        console.error("Failed to parse attendance from localStorage:", error);
      }
    }

    const storedGrades = localStorage.getItem("grades");
    if (storedGrades) {
      try {
        setGrades(JSON.parse(storedGrades));
      } catch (error) {
        console.error("Failed to parse grades from localStorage:", error);
      }
    }

    const storedVideos = localStorage.getItem("videos");
    if (storedVideos) {
      try {
        setVideos(JSON.parse(storedVideos));
      } catch (error) {
        console.error("Failed to parse videos from localStorage:", error);
      }
    }

    const storedBooks = localStorage.getItem("books");
    if (storedBooks) {
      try {
        setBooks(JSON.parse(storedBooks));
      } catch (error) {
        console.error("Failed to parse books from localStorage:", error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
    localStorage.setItem("grades", JSON.stringify(grades));
    localStorage.setItem("videos", JSON.stringify(videos));
    localStorage.setItem("books", JSON.stringify(books));
  }, [attendance, grades, videos, books]);

  // Attendance methods
  const addAttendance = (studentId: string, studentName: string, status: "present" | "absent") => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance for this student already exists for today
    const existingRecord = attendance.find(
      a => a.studentId === studentId && a.date === today
    );

    if (existingRecord) {
      setAttendance(prev => 
        prev.map(record => 
          record.id === existingRecord.id 
            ? { ...record, status } 
            : record
        )
      );
      toast({
        title: "تم تحديث الحضور",
        description: `تم تحديث حالة الطالب ${studentName} إلى ${status === 'present' ? 'حاضر' : 'غائب'}`,
      });
    } else {
      const newAttendance: Attendance = {
        id: `attendance-${Date.now()}`,
        studentId,
        studentName,
        date: today,
        status
      };
      
      setAttendance(prev => [...prev, newAttendance]);
      toast({
        title: "تم تسجيل الحضور",
        description: `تم تسجيل ${status === 'present' ? 'حضور' : 'غياب'} الطالب ${studentName}`,
      });
    }
  };

  const getStudentAttendance = (studentId: string): Attendance[] => {
    return attendance.filter(record => record.studentId === studentId);
  };

  // Grades methods
  const addGrade = (
    studentId: string, 
    studentName: string, 
    examName: string, 
    score: number, 
    totalScore: number
  ) => {
    const newGrade: Grade = {
      id: `grade-${Date.now()}`,
      studentId,
      studentName,
      examName,
      score,
      totalScore,
      date: new Date().toISOString()
    };

    setGrades(prev => [...prev, newGrade]);
    toast({
      title: "تم إضافة الدرجة",
      description: `تم إضافة درجة ${examName} للطالب ${studentName}`,
    });
  };

  const getStudentGrades = (studentId: string): Grade[] => {
    return grades.filter(grade => grade.studentId === studentId);
  };

  // Videos methods
  const addVideo = (title: string, url: string, thumbnailUrl?: string) => {
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      title,
      url,
      thumbnailUrl,
      uploadDate: new Date().toISOString()
    };

    setVideos(prev => [...prev, newVideo]);
    toast({
      title: "تم إضافة الفيديو",
      description: `تم إضافة فيديو ${title} بنجاح`,
    });
  };

  const getAllVideos = (): Video[] => {
    return videos;
  };

  // Books methods
  const addBook = (title: string, url: string) => {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title,
      url,
      uploadDate: new Date().toISOString()
    };

    setBooks(prev => [...prev, newBook]);
    toast({
      title: "تم إضافة الكتاب",
      description: `تم إضافة كتاب ${title} بنجاح`,
    });
  };

  const getAllBooks = (): Book[] => {
    return books;
  };

  const value = {
    attendance,
    grades,
    videos,
    books,
    addAttendance,
    getStudentAttendance,
    addGrade,
    getStudentGrades,
    addVideo,
    getAllVideos,
    addBook,
    getAllBooks,
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
