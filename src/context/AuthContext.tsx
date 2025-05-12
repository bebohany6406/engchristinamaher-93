
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Student, Parent } from "@/types";
import { generateRandomCode, generateRandomPassword } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface AuthContextType {
  currentUser: User | null;
  students: Student[];
  parents: Parent[];
  login: (phoneNumber: string, password: string) => boolean;
  logout: () => void;
  createStudent: (
    name: string,
    phone: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ) => Student;
  updateStudent: (
    id: string,
    name: string,
    phone: string,
    password: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ) => void;
  deleteStudent: (id: string) => void;
  createParent: (phone: string, studentCode: string) => Parent;
  getStudentByCode: (code: string) => Student | undefined;
  getAllStudents: () => Student[];
  getAllParents: () => Parent[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial admin user with updated credentials
const adminUser: User = {
  id: "admin-1",
  name: "admin",
  phone: "AdminAPPEng.Christina Maher",
  password: "Eng.Christina Maher0022",
  role: "admin"
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    
    if (storedUser && userLoggedIn === "true") {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userLoggedIn");
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
    
    setIsInitialized(true);
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("userLoggedIn", "true");
    }
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("parents", JSON.stringify(parents));
  }, [currentUser, students, parents, isInitialized]);

  const login = (phoneNumber: string, password: string): boolean => {
    // Check if admin
    if (phoneNumber === adminUser.phone && password === adminUser.password) {
      setCurrentUser(adminUser);
      toast({
        title: "✅ تم تسجيل الدخول بنجاح",
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
        role: "student",
        code: student.code,
        group: student.group,
        grade: student.grade
      });
      toast({
        title: "✅ تم تسجيل الدخول بنجاح",
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
        title: "✅ تم تسجيل الدخول بنجاح",
        description: `مرحباً بك`,
      });
      return true;
    }

    toast({
      variant: "destructive",
      title: "❌ فشل تسجيل الدخول",
      description: "رقم الهاتف أو كلمة المرور غير صحيحة",
    });
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userLoggedIn");
    toast({
      title: "👋 تم تسجيل الخروج",
      description: "نراك قريباً!",
    });
    
    // Play logout sound
    const audio = new Audio("/logout-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Sound play failed:", e));
  };

  const createStudent = (
    name: string,
    phone: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ): Student => {
    const code = generateRandomCode();
    const password = generateRandomPassword();
    const newStudent: Student = {
      id: `student-${uuidv4()}`,
      name,
      phone,
      password,
      code,
      parentPhone,
      group,
      grade,
      role: "student" 
    };

    setStudents(prev => [...prev, newStudent]);
    toast({
      title: "✅ تم إنشاء حساب الطالب بنجاح",
      description: `كود الطالب هو: ${code} | كلمة المرور: ${password}`,
    });
    return newStudent;
  };

  const updateStudent = (
    id: string,
    name: string,
    phone: string,
    password: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ): void => {
    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex !== -1) {
      const updatedStudent = {
        ...students[studentIndex],
        name,
        phone,
        password,
        parentPhone,
        group,
        grade
      };

      const newStudents = [...students];
      newStudents[studentIndex] = updatedStudent;
      setStudents(newStudents);
    }
  };

  const deleteStudent = (id: string): void => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  const createParent = (phone: string, studentCode: string): Parent => {
    const student = students.find(s => s.code === studentCode);
    
    if (!student) {
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "كود الطالب غير صحيح",
      });
      throw new Error("Student code invalid");
    }

    const password = generateRandomPassword();
    const newParent: Parent = {
      id: `parent-${uuidv4()}`,
      phone,
      studentCode,
      studentName: student.name,
      password,
    };

    setParents(prev => [...prev, newParent]);
    toast({
      title: "✅ تم إنشاء حساب ولي الأمر بنجاح",
      description: `مرتبط بالطالب: ${student.name} | كلمة المرور: ${password}`,
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
    updateStudent,
    deleteStudent,
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
