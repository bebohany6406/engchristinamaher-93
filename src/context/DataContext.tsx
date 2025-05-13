
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

// Define types
type AttendanceStatus = 'present' | 'absent' | 'late';

interface Student {
  id: string;
  name: string;
  code: string;
}

interface Attendance {
  id?: string;
  student_id: string;
  student_name: string;
  status: string;
  lesson_number: number;
  date?: string;
  time?: string;
}

interface DataContextType {
  students: Student[];
  attendance: Attendance[];
  addAttendance: (studentId: string, studentName: string, status: AttendanceStatus, lessonNumber: number) => Promise<boolean>;
  getStudentLessonCount: (studentId: string) => number;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  
  // Fetch students and attendance records from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
        
        // Fetch attendance
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*');
        
        if (attendanceError) throw attendanceError;
        setAttendance(attendanceData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Add attendance record to Supabase
  const addAttendance = async (studentId: string, studentName: string, status: AttendanceStatus, lessonNumber: number): Promise<boolean> => {
    try {
      const newAttendance: Attendance = {
        student_id: studentId,
        student_name: studentName,
        status,
        lesson_number: lessonNumber,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0]
      };
      
      const { error } = await supabase
        .from('attendance')
        .insert(newAttendance);
      
      if (error) throw error;
      
      // Update local state
      setAttendance(prev => [...prev, { ...newAttendance }]);
      return true;
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast({
        variant: "destructive",
        title: "❌ خطأ في تسجيل الحضور",
        description: "حدث خطأ أثناء محاولة تسجيل الحضور"
      });
      return false;
    }
  };
  
  // Get the current lesson count for a student
  const getStudentLessonCount = (studentId: string): number => {
    const studentAttendance = attendance.filter(record => record.student_id === studentId);
    return studentAttendance.length;
  };
  
  const value = {
    students,
    attendance,
    addAttendance,
    getStudentLessonCount
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
