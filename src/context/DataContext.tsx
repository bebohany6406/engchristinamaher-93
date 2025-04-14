
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
  getAttendanceByGrade: (grade: "first" | "second" | "third") => Attendance[];
  getStudentLessonCount: (studentId: string) => number;
  
  // Grades methods
  addGrade: (studentId: string, studentName: string, examName: string, score: number, totalScore: number, lessonNumber: number) => void;
  getStudentGrades: (studentId: string) => Grade[];
  getGradesByGradeLevel: (grade: "first" | "second" | "third") => Grade[];
  
  // Videos methods
  addVideo: (title: string, url: string, grade: "first" | "second" | "third", thumbnailUrl?: string) => void;
  updateVideo: (id: string, title: string, url: string, grade: "first" | "second" | "third", thumbnailUrl?: string) => void;
  deleteVideo: (id: string) => void;
  getVideosByGrade: (grade: "first" | "second" | "third") => Video[];
  getAllVideos: () => Video[];
  
  // Books methods
  addBook: (title: string, url: string, grade: "first" | "second" | "third") => void;
  updateBook: (id: string, title: string, url: string, grade: "first" | "second" | "third") => void;
  deleteBook: (id: string) => void;
  getBooksByGrade: (grade: "first" | "second" | "third") => Book[];
  getAllBooks: () => Book[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

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

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
    localStorage.setItem("grades", JSON.stringify(grades));
    localStorage.setItem("videos", JSON.stringify(videos));
    localStorage.setItem("books", JSON.stringify(books));
  }, [attendance, grades, videos, books]);

  // Function to show notifications on the device
  const showNotification = (title: string, body: string) => {
    // Check if the browser supports notifications
    if ('Notification' in window) {
      // Check if we have permission
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } 
      // If permission is not granted, request it
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }
  };

  const addAttendance = (studentId: string, studentName: string, status: "present" | "absent") => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();
    
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    const lessonNumber = studentAttendance.length + 1;
    
    const existingRecord = attendance.find(
      a => a.studentId === studentId && a.date === today
    );

    if (existingRecord) {
      setAttendance(prev => 
        prev.map(record => 
          record.id === existingRecord.id 
            ? { ...record, status, time } 
            : record
        )
      );
      
      // Play sound effect
      const audio = status === 'present' 
        ? new Audio("/attendance-present.mp3") 
        : new Audio("/attendance-absent.mp3");
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: "تم تحديث الحضور",
        description: `تم تحديث حالة الطالب ${studentName} إلى ${status === 'present' ? 'حاضر' : 'غائب'}`,
      });
      
      // Show notification for absence
      if (status === 'absent') {
        showNotification(
          "تسجيل غياب", 
          `تم تسجيل غياب الطالب ${studentName}`
        );
      }
    } else {
      const newAttendance: Attendance = {
        id: `attendance-${Date.now()}`,
        studentId,
        studentName,
        date: today,
        time,
        status,
        lessonNumber: lessonNumber > 8 ? 8 : lessonNumber
      };
      
      setAttendance(prev => [...prev, newAttendance]);
      
      // Play sound effect
      const audio = status === 'present' 
        ? new Audio("/attendance-present.mp3") 
        : new Audio("/attendance-absent.mp3");
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      toast({
        title: "تم تسجيل الحضور",
        description: `تم تسجيل ${status === 'present' ? 'حضور' : 'غياب'} الطالب ${studentName} للحصة ${newAttendance.lessonNumber}`,
      });
      
      // Show notification for absence
      if (status === 'absent') {
        showNotification(
          "تسجيل غياب", 
          `تم تسجيل غياب الطالب ${studentName} للحصة ${newAttendance.lessonNumber}`
        );
      }
    }
  };

  const getStudentAttendance = (studentId: string): Attendance[] => {
    return attendance.filter(record => record.studentId === studentId);
  };

  const getAttendanceByGrade = (grade: "first" | "second" | "third"): Attendance[] => {
    return attendance;
  };

  const getStudentLessonCount = (studentId: string): number => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    return studentAttendance.length > 8 ? 8 : studentAttendance.length;
  };

  const addGrade = (
    studentId: string, 
    studentName: string, 
    examName: string, 
    score: number, 
    totalScore: number,
    lessonNumber: number
  ) => {
    const newGrade: Grade = {
      id: `grade-${Date.now()}`,
      studentId,
      studentName,
      examName,
      score,
      totalScore,
      date: new Date().toISOString(),
      lessonNumber
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

  const getGradesByGradeLevel = (grade: "first" | "second" | "third"): Grade[] => {
    return grades;
  };

  const addVideo = (title: string, url: string, grade: "first" | "second" | "third" = "first", thumbnailUrl?: string) => {
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      title,
      url,
      thumbnailUrl,
      uploadDate: new Date().toISOString(),
      grade
    };

    setVideos(prev => [...prev, newVideo]);
    toast({
      title: "تم إضافة الفيديو",
      description: `تم إضافة فيديو ${title} بنجاح`,
    });
  };
  
  const updateVideo = (id: string, title: string, url: string, grade: "first" | "second" | "third" = "first", thumbnailUrl?: string) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === id 
          ? { ...video, title, url, grade, thumbnailUrl } 
          : video
      )
    );
    
    toast({
      title: "تم تحديث الفيديو",
      description: `تم تحديث فيديو ${title} بنجاح`,
    });
  };
  
  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
    
    toast({
      title: "تم حذف الفيديو",
      description: "تم حذف الفيديو بنجاح",
    });
  };

  const getVideosByGrade = (grade: "first" | "second" | "third"): Video[] => {
    return videos.filter(video => video.grade === grade);
  };
  
  const getAllVideos = (): Video[] => {
    return videos;
  };

  const addBook = (title: string, url: string, grade: "first" | "second" | "third" = "first") => {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title,
      url,
      uploadDate: new Date().toISOString(),
      grade
    };

    setBooks(prev => [...prev, newBook]);
    toast({
      title: "تم إضافة الكتاب",
      description: `تم إضافة كتاب ${title} بنجاح`,
    });
  };
  
  const updateBook = (id: string, title: string, url: string, grade: "first" | "second" | "third") => {
    setBooks(prev => 
      prev.map(book => 
        book.id === id 
          ? { ...book, title, url, grade } 
          : book
      )
    );
    
    toast({
      title: "تم تحديث الكتاب",
      description: `تم تحديث كتاب ${title} بنجاح`,
    });
  };
  
  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    
    toast({
      title: "تم حذف الكتاب",
      description: "تم حذف الكتاب بنجاح",
    });
  };

  const getBooksByGrade = (grade: "first" | "second" | "third"): Book[] => {
    return books.filter(book => book.grade === grade);
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
    getAttendanceByGrade,
    getStudentLessonCount,
    addGrade,
    getStudentGrades,
    getGradesByGradeLevel,
    addVideo,
    updateVideo,
    deleteVideo,
    getVideosByGrade,
    getAllVideos,
    addBook,
    updateBook,
    deleteBook,
    getBooksByGrade,
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
