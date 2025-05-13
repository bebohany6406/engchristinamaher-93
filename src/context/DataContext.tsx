import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Grade,
  Video,
  Book,
  Attendance,
} from "@/types";

interface DataContextType {
  grades: Grade[];
  videos: Video[];
  books: Book[];
  attendance: Attendance[];
  fetchGrades: () => Promise<void>;
  fetchVideos: () => Promise<void>;
  fetchBooks: () => Promise<void>;
  fetchAttendance: () => Promise<void>;
  getStudentGrades: (studentId: string) => Grade[];
  getVideosByGrade: (grade: "first" | "second" | "third") => Video[];
  getStudentAttendance: (studentId: string) => Attendance[];
  getStudentLessonCount: (studentId: string) => number;
  deleteAttendanceRecord: (recordId: string) => Promise<void>;
  deleteGrade: (gradeId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  addGrade: (
    studentId: string,
    studentName: string,
    examName: string,
    score: number,
    totalScore?: number,
    lessonNumber?: number,
    group?: string
  ) => Promise<Grade | null>;
  updateGrade: (
    gradeId: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber?: number,
    group?: string
  ) => Promise<boolean>;
  addVideo: (
    title: string,
    url: string,
    grade: "first" | "second" | "third",
    isYouTube?: boolean
  ) => Promise<Video | null>;
  updateVideo: (
    videoId: string,
    title: string,
    url: string,
    grade: "first" | "second" | "third",
    isYouTube?: boolean
  ) => Promise<boolean>;
  addAttendance: (
    studentId: string,
    studentName: string,
    status?: "present" | "absent",
    lessonNumber?: number
  ) => Promise<Attendance | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function calculatePerformanceIndicator(score: number, totalScore: number): "excellent" | "very-good" | "good" | "fair" | "needs-improvement" {
  const percentage = (score / totalScore) * 100;

  if (percentage >= 90) {
    return "excellent";
  } else if (percentage >= 80) {
    return "very-good";
  } else if (percentage >= 70) {
    return "good";
  } else if (percentage >= 60) {
    return "fair";
  } else {
    return "needs-improvement";
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    fetchGrades();
    fetchVideos();
    fetchBooks();
    fetchAttendance();
  }, []);

  const getStudentGrades = useCallback(
    (studentId: string): Grade[] => {
      return grades.filter((grade) => grade.studentId === studentId);
    },
    [grades]
  );

  const getVideosByGrade = useCallback(
    (grade: "first" | "second" | "third"): Video[] => {
      return videos.filter((video) => video.grade === grade);
    },
    [videos]
  );

  const getStudentAttendance = useCallback(
    (studentId: string): Attendance[] => {
      return attendance.filter((record) => record.studentId === studentId);
    },
    [attendance]
  );

  const getStudentLessonCount = useCallback(
    (studentId: string): number => {
      return attendance.filter((record) => record.studentId === studentId).length;
    },
    [attendance]
  );

  const deleteAttendanceRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", recordId);
      if (error) throw error;

      setAttendance((prevAttendance) =>
        prevAttendance.filter((record) => record.id !== recordId)
      );
    } catch (error) {
      console.error("Error deleting attendance record:", error);
    }
  };

  const deleteGrade = async (gradeId: string) => {
    try {
      const { error } = await supabase.from("grades").delete().eq("id", gradeId);
      if (error) throw error;

      setGrades((prevGrades) => prevGrades.filter((grade) => grade.id !== gradeId));
    } catch (error) {
      console.error("Error deleting grade:", error);
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase.from("videos").delete().eq("id", videoId);
      if (error) throw error;

      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Function to convert snake_case to camelCase for grades
  const formatGradeData = (data: any[]): Grade[] => {
    return data.map(item => ({
      id: item.id,
      studentId: item.student_id,
      studentName: item.student_name,
      examName: item.exam_name,
      score: Number(item.score),
      totalScore: Number(item.total_score),
      date: item.date,
      lessonNumber: item.lesson_number || 1,
      group: item.group_name || "",
      performanceIndicator: item.performance_indicator || "good",
    }));
  };

  // Function to convert snake_case to camelCase for attendance
  const formatAttendanceData = (data: any[]): Attendance[] => {
    return data.map(item => ({
      id: item.id,
      studentId: item.student_id,
      studentName: item.student_name,
      date: item.date,
      time: item.time || "",
      status: item.status,
      lessonNumber: item.lesson_number || 1,
    }));
  };

  // Function to convert snake_case to camelCase for videos
  const formatVideoData = (data: any[]): Video[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      uploadDate: item.upload_date,
      grade: item.grade,
      isYouTube: item.is_youtube || false,
    }));
  };

  // Function to convert snake_case to camelCase for books
  const formatBookData = (data: any[]): Book[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      uploadDate: item.upload_date,
      grade: item.grade,
    }));
  };

  // Fetch grades from Supabase
  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase.from('grades').select('*');
      if (error) throw error;
      setGrades(formatGradeData(data));
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  // Fetch attendance from Supabase
  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase.from('attendance').select('*');
      if (error) throw error;
      setAttendance(formatAttendanceData(data));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // Fetch videos from Supabase
  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase.from('videos').select('*');
      if (error) throw error;
      setVideos(formatVideoData(data));
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Fetch books from Supabase
  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase.from('books').select('*');
      if (error) throw error;
      setBooks(formatBookData(data));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Add grade function
  const addGrade = async (
    studentId: string,
    studentName: string,
    examName: string,
    score: number,
    totalScore: number = 100,
    lessonNumber: number = 1,
    group: string = ""
  ) => {
    try {
      const { data, error } = await supabase.from('grades').insert({
        student_id: studentId,
        student_name: studentName,
        exam_name: examName,
        score,
        total_score: totalScore,
        lesson_number: lessonNumber,
        group_name: group,
        performance_indicator: calculatePerformanceIndicator(score, totalScore),
        date: new Date().toISOString()
      }).select();

      if (error) throw error;
      
      // Format the returned data
      const formattedData = formatGradeData(data);
      setGrades(prevGrades => [...prevGrades, ...formattedData]);
      
      return formattedData[0];
    } catch (error) {
      console.error('Error adding grade:', error);
      return null;
    }
  };

  // Update grade function
  const updateGrade = async (
    gradeId: string,
    examName: string,
    score: number,
    totalScore: number,
    lessonNumber: number = 1,
    group: string = ""
  ) => {
    try {
      const performanceIndicator = calculatePerformanceIndicator(score, totalScore);
      
      const { error } = await supabase.from('grades').update({
        exam_name: examName,
        score,
        total_score: totalScore,
        lesson_number: lessonNumber, 
        group_name: group,
        performance_indicator: performanceIndicator
      }).eq('id', gradeId);

      if (error) throw error;
      
      setGrades(prevGrades => prevGrades.map(grade => 
        grade.id === gradeId ? {
          ...grade,
          examName,
          score,
          totalScore,
          lessonNumber,
          group,
          performanceIndicator
        } : grade
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating grade:', error);
      return false;
    }
  };

  // Add video function
  const addVideo = async (title: string, url: string, grade: "first" | "second" | "third", isYouTube: boolean = false) => {
    try {
      const { data, error } = await supabase.from('videos').insert({
        title,
        url,
        grade,
        is_youtube: isYouTube,
        upload_date: new Date().toISOString()
      }).select();

      if (error) throw error;
      
      const formattedData = formatVideoData(data);
      setVideos(prevVideos => [...prevVideos, ...formattedData]);
      
      return formattedData[0];
    } catch (error) {
      console.error('Error adding video:', error);
      return null;
    }
  };

  // Update video function
  const updateVideo = async (
    videoId: string, 
    title: string, 
    url: string, 
    grade: "first" | "second" | "third", 
    isYouTube: boolean = false
  ) => {
    try {
      const { error } = await supabase.from('videos').update({
        title,
        url,
        grade,
        is_youtube: isYouTube
      }).eq('id', videoId);

      if (error) throw error;
      
      setVideos(prevVideos => prevVideos.map(video => 
        video.id === videoId ? {
          ...video,
          title,
          url,
          grade,
          isYouTube
        } : video
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating video:', error);
      return false;
    }
  };

  // Add attendance function
  const addAttendance = async (
    studentId: string,
    studentName: string,
    status: "present" | "absent" = "present",
    lessonNumber: number = 1
  ) => {
    try {
      const currentTime = new Date();
      const time = currentTime.toLocaleTimeString();
      
      const { data, error } = await supabase.from('attendance').insert({
        student_id: studentId,
        student_name: studentName,
        status,
        lesson_number: lessonNumber,
        time,
        date: currentTime.toISOString()
      }).select();

      if (error) throw error;
      
      const formattedData = formatAttendanceData(data);
      setAttendance(prevAttendance => [...prevAttendance, ...formattedData]);
      
      return formattedData[0];
    } catch (error) {
      console.error('Error adding attendance:', error);
      return null;
    }
  };

  return (
    <DataContext.Provider value={{
      grades,
      videos,
      books,
      attendance,
      fetchGrades,
      fetchVideos,
      fetchBooks,
      fetchAttendance,
      getStudentGrades,
      getVideosByGrade,
      getStudentAttendance,
      getStudentLessonCount,
      deleteAttendanceRecord,
      deleteGrade,
      deleteVideo,
      addGrade,
      updateGrade,
      addVideo,
      updateVideo,
      addAttendance,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
