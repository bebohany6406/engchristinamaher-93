
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Student, Parent } from "@/types";
import { toast } from "@/hooks/use-toast";
import { generateRandomCode, generateUniquePassword } from "@/lib/utils";

interface AuthContextType {
  currentUser: Student | Parent | null;
  allStudents: Student[];
  allParents: Parent[];
  
  login: (code: string, password?: string) => Promise<boolean>;
  logout: () => void;
  
  createStudent: (name: string, grade: "first" | "second" | "third", parentPhone?: string, group?: string) => Student;
  getAllStudents: () => Student[];
  getStudentByCode: (code: string) => Student | undefined;
  
  createParent: (phone: string, studentCode: string) => Parent;
  getAllParents: () => Parent[];
  
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Student | Parent | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allParents, setAllParents] = useState<Parent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load students and parents from localStorage on initial mount
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      try {
        setAllStudents(JSON.parse(storedStudents));
      } catch (error) {
        console.error("Failed to parse students from localStorage:", error);
      }
    }
    
    const storedParents = localStorage.getItem("parents");
    if (storedParents) {
      try {
        setAllParents(JSON.parse(storedParents));
      } catch (error) {
        console.error("Failed to parse parents from localStorage:", error);
      }
    }
    
    // Load current user from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse currentUser from localStorage:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    // Save students and parents to localStorage whenever they change
    localStorage.setItem("students", JSON.stringify(allStudents));
    localStorage.setItem("parents", JSON.stringify(allParents));
  }, [allStudents, allParents]);
  
  useEffect(() => {
    // Save current user to localStorage whenever it changes
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  const login = async (code: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Check if the code exists in students
    const student = allStudents.find(student => student.code === code);
    if (student && student.password === password) {
      setCurrentUser(student);
      setIsLoading(false);
      navigate("/dashboard");
      return true;
    }
    
    // Check if the code exists in parents
    const parent = allParents.find(parent => parent.studentCode === code);
    if (parent && parent.password === password) {
      setCurrentUser(parent);
      setIsLoading(false);
      navigate("/dashboard");
      return true;
    }
    
    setIsLoading(false);
    toast({
      title: "❌ خطأ في تسجيل الدخول",
      description: "كود الطالب أو كلمة المرور غير صحيحة",
      variant: "destructive",
    });
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    navigate("/");
  };
  
  const createStudent = (name: string, grade: "first" | "second" | "third", parentPhone: string = "", group: string = "") => {
    const newCode = generateRandomCode();
    const newPassword = generateUniquePassword(allStudents, allParents);
    
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name,
      code: newCode,
      password: newPassword,
      grade,
      parentPhone,
      group,
      role: "student"
    };
    
    setAllStudents(prevStudents => [...prevStudents, newStudent]);
    
    toast({
      title: "✅ تم إنشاء حساب الطالب",
      description: `تم إنشاء حساب الطالب ${name} بنجاح. كلمة المرور: ${newPassword}`,
    });
    
    return newStudent;
  };

  const getAllStudents = (): Student[] => {
    return allStudents;
  };
  
  const getStudentByCode = (code: string): Student | undefined => {
    return allStudents.find(student => student.code === code);
  };
  
  const createParent = (phone: string, studentCode: string) => {
    const student = allStudents.find(student => student.code === studentCode);
    
    if (!student) {
      throw new Error("Student not found with the provided code.");
    }
    
    const newPassword = generateUniquePassword(allStudents, allParents);
    
    const newParent: Parent = {
      id: `parent-${Date.now()}`,
      phone,
      studentCode,
      studentName: student.name,
      password: newPassword,
      role: "parent"
    };
    
    setAllParents(prevParents => [...prevParents, newParent]);
    
    toast({
      title: "✅ تم إنشاء حساب ولي الأمر",
      description: `تم إنشاء حساب ولي الأمر بنجاح. كلمة المرور: ${newPassword}`,
    });
    
    return newParent;
  };

  const getAllParents = (): Parent[] => {
    return allParents;
  };

  const value = {
    currentUser,
    allStudents,
    allParents,
    login,
    logout,
    createStudent,
    getAllStudents,
    getStudentByCode,
    createParent,
    getAllParents,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
