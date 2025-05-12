import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Student, Parent } from "@/types";
import { generateRandomCode, generateUniquePassword } from "@/lib/utils";
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
  updateParent: (id: string, phone: string, studentCode: string, password: string) => void;
  deleteParent: (id: string) => void;
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
    console.log("Attempting login with:", { phoneNumber, password });
    console.log("Available students:", students);
    
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
      console.log("Student found:", student);
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
      console.log("Parent found:", parent);
      const student = students.find(s => s.code === parent.studentCode);
      setCurrentUser({
        id: parent.id,
        name: `ولي أمر ${parent.studentName}`,
        phone: parent.phone,
        password: parent.password,
        role: "parent",
        childrenIds: student ? [student.id] : []
      });
      toast({
        title: "✅ تم تسجيل الدخول بنجاح",
        description: `مرحباً بك`,
      });
      return true;
    }

    console.log("Login failed. No matching user found.");
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
      title: "تم تسجيل الخروج",
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
    // استخدام الدالة الجديدة لتوليد كلمة مرور فريدة من 5 أرقام مختلفة
    const password = generateUniquePassword(students, parents);
    const newStudent: Student = {
      id: `student-${Date.now()}`,
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

    // استخدام الدالة الجديدة لتوليد كلمة مرور فريدة من 5 أرقام مختلفة
    const password = generateUniquePassword(students, parents);
    const newParent: Parent = {
      id: `parent-${Date.now()}`,
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

  const updateParent = (id: string, phone: string, studentCode: string, password: string): void => {
    const student = students.find(s => s.code === studentCode);
    
    if (!student) {
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "كود الطالب غير صحيح",
      });
      throw new Error("Student code invalid");
    }

    const parentIndex = parents.findIndex(p => p.id === id);
    if (parentIndex !== -1) {
      const updatedParent = {
        ...parents[parentIndex],
        phone,
        studentCode,
        studentName: student.name,
        password
      };

      const newParents = [...parents];
      newParents[parentIndex] = updatedParent;
      setParents(newParents);
      
      // إذا كان هذا ولي الأمر هو المستخدم الحالي، تحديث بيانات المستخدم أيضًا
      if (currentUser && currentUser.id === id && currentUser.role === "parent") {
        setCurrentUser({
          ...currentUser,
          name: `ولي أمر ${student.name}`,
          phone,
          password,
          childrenIds: [student.id]
        });
      }
    }
  };

  const deleteParent = (id: string): void => {
    // إذا كان هذا ولي الأمر هو المستخدم الحالي، تسجيل الخروج أولاً
    if (currentUser && currentUser.id === id && currentUser.role === "parent") {
      logout();
    }
    
    setParents(prev => prev.filter(parent => parent.id !== id));
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
    updateParent,
    deleteParent,
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
