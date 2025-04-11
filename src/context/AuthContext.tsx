
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Student, Parent } from "@/types";
import { generateRandomCode } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  students: Student[];
  parents: Parent[];
  login: (phoneNumber: string, password: string) => boolean;
  logout: () => void;
  createStudent: (
    name: string,
    phone: string,
    password: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ) => Student;
  createParent: (phone: string, studentCode: string, password: string) => Parent;
  getStudentByCode: (code: string) => Student | undefined;
  getAllStudents: () => Student[];
  getAllParents: () => Parent[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial admin user
const adminUser: User = {
  id: "admin-1",
  name: "مسؤول النظام",
  phone: "admin",
  password: "admin123",
  role: "admin",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }

    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      try {
        setStudents(JSON.parse(storedStudents));
      } catch (error) {
        console.error("Failed to parse students from localStorage:", error);
      }
    }

    const storedParents = localStorage.getItem("parents");
    if (storedParents) {
      try {
        setParents(JSON.parse(storedParents));
      } catch (error) {
        console.error("Failed to parse parents from localStorage:", error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("parents", JSON.stringify(parents));
  }, [currentUser, students, parents]);

  const login = (phoneNumber: string, password: string): boolean => {
    // Check if admin
    if (phoneNumber === adminUser.phone && password === adminUser.password) {
      setCurrentUser(adminUser);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة التحكم",
      });
      return true;
    }

    // Check if student
    const student = students.find(s => s.phone === phoneNumber && s.password === password);
    if (student) {
      setCurrentUser({
        id: student.id,
        name: student.name,
        phone: student.phone,
        password: student.password,
        role: "student"
      });
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${student.name}`,
      });
      return true;
    }

    // Check if parent
    const parent = parents.find(p => p.phone === phoneNumber && p.password === password);
    if (parent) {
      setCurrentUser({
        id: parent.id,
        name: `ولي أمر ${parent.studentName}`,
        phone: parent.phone,
        password: parent.password,
        role: "parent"
      });
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك`,
      });
      return true;
    }

    toast({
      variant: "destructive",
      title: "فشل تسجيل الدخول",
      description: "رقم الهاتف أو كلمة المرور غير صحيحة",
    });
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast({
      title: "تم تسجيل الخروج",
      description: "نراك قريباً!",
    });
  };

  const createStudent = (
    name: string,
    phone: string,
    password: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ): Student => {
    const code = generateRandomCode();
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name,
      phone,
      password,
      code,
      parentPhone,
      group,
      grade
    };

    setStudents(prev => [...prev, newStudent]);
    toast({
      title: "تم إنشاء حساب الطالب بنجاح",
      description: `كود الطالب هو: ${code}`,
    });
    return newStudent;
  };

  const createParent = (phone: string, studentCode: string, password: string): Parent => {
    const student = students.find(s => s.code === studentCode);
    
    if (!student) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كود الطالب غير صحيح",
      });
      throw new Error("Student code invalid");
    }

    const newParent: Parent = {
      id: `parent-${Date.now()}`,
      phone,
      studentCode,
      studentName: student.name,
      password,
    };

    setParents(prev => [...prev, newParent]);
    toast({
      title: "تم إنشاء حساب ولي الأمر بنجاح",
      description: `مرتبط بالطالب: ${student.name}`,
    });
    return newParent;
  };

  const getStudentByCode = (code: string): Student | undefined => {
    return students.find(student => student.code === code);
  };

  const getAllStudents = (): Student[] => {
    return students;
  };

  const getAllParents = (): Parent[] => {
    return parents;
  };

  const value = {
    currentUser,
    students,
    parents,
    login,
    logout,
    createStudent,
    createParent,
    getStudentByCode,
    getAllStudents,
    getAllParents,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
