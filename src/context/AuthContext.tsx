
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Student, Parent } from "@/types";
import { generateRandomCode, generateUniquePassword } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  currentUser: User | null;
  students: Student[];
  parents: Parent[];
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  createStudent: (
    name: string,
    phone: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ) => Promise<Student>;
  updateStudent: (
    id: string,
    name: string,
    phone: string,
    password: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  createParent: (phone: string, studentCode: string) => Promise<Parent>;
  updateParent: (id: string, phone: string, studentCode: string, password: string) => Promise<void>;
  deleteParent: (id: string) => Promise<void>;
  getStudentByCode: (code: string) => Student | undefined;
  getAllStudents: () => Student[];
  getAllParents: () => Parent[];
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from Supabase and/or localStorage on initial mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        
        const storedUser = localStorage.getItem("currentUser");
        const userLoggedIn = localStorage.getItem("userLoggedIn");
        
        // Load user from localStorage if available
        if (storedUser && userLoggedIn === "true") {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            localStorage.removeItem("currentUser");
            localStorage.removeItem("userLoggedIn");
          }
        }
        
        // Load students from Supabase
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) {
          console.error("Error loading students from Supabase:", studentsError);
          
          // Try loading from localStorage as fallback
          const storedStudents = localStorage.getItem("students");
          if (storedStudents) {
            try {
              const parsedStudents = JSON.parse(storedStudents);
              setStudents(parsedStudents);
              console.log("Loaded students from localStorage (fallback)");
              
              // Try migrating localStorage data to Supabase
              parsedStudents.forEach(async (student: Student) => {
                try {
                  await supabase.from('students').upsert({
                    id: student.id,
                    name: student.name,
                    phone: student.phone,
                    password: student.password,
                    code: student.code,
                    parentPhone: student.parentPhone,
                    group: student.group,
                    grade: student.grade,
                    created_at: new Date().toISOString()
                  });
                } catch (syncError) {
                  console.error("Failed to sync student to Supabase:", syncError);
                }
              });
            } catch (parseError) {
              console.error("Failed to parse students from localStorage:", parseError);
            }
          }
        } else {
          setStudents(studentsData);
          console.log("Loaded students from Supabase:", studentsData);
        }
        
        // Load parents from Supabase
        const { data: parentsData, error: parentsError } = await supabase
          .from('parents')
          .select('*');
        
        if (parentsError) {
          console.error("Error loading parents from Supabase:", parentsError);
          
          // Try loading from localStorage as fallback
          const storedParents = localStorage.getItem("parents");
          if (storedParents) {
            try {
              const parsedParents = JSON.parse(storedParents);
              setParents(parsedParents);
              console.log("Loaded parents from localStorage (fallback)");
              
              // Try migrating localStorage data to Supabase
              parsedParents.forEach(async (parent: Parent) => {
                try {
                  await supabase.from('parents').upsert({
                    id: parent.id,
                    phone: parent.phone,
                    studentCode: parent.studentCode,
                    studentName: parent.studentName,
                    password: parent.password,
                    created_at: new Date().toISOString()
                  });
                } catch (syncError) {
                  console.error("Failed to sync parent to Supabase:", syncError);
                }
              });
            } catch (parseError) {
              console.error("Failed to parse parents from localStorage:", parseError);
            }
          }
        } else {
          setParents(parentsData);
          console.log("Loaded parents from Supabase:", parentsData);
        }
        
      } catch (error) {
        console.error("Error initializing auth provider:", error);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    loadData();
  }, []);

  // Login function
  const login = async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with:", { phoneNumber, password });
      console.log("Available students:", students);
      
      // Check if admin
      if (phoneNumber === adminUser.phone && password === adminUser.password) {
        setCurrentUser(adminUser);
        localStorage.setItem("currentUser", JSON.stringify(adminUser));
        localStorage.setItem("userLoggedIn", "true");
        
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
        const userObject = {
          id: student.id,
          name: student.name,
          phone: student.phone,
          password: student.password,
          role: "student",
          code: student.code,
          group: student.group,
          grade: student.grade
        } as User;
        
        setCurrentUser(userObject);
        localStorage.setItem("currentUser", JSON.stringify(userObject));
        localStorage.setItem("userLoggedIn", "true");
        
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
        
        const userObject = {
          id: parent.id,
          name: `ولي أمر ${parent.studentName}`,
          phone: parent.phone,
          password: parent.password,
          role: "parent",
          childrenIds: student ? [student.id] : []
        } as User;
        
        setCurrentUser(userObject);
        localStorage.setItem("currentUser", JSON.stringify(userObject));
        localStorage.setItem("userLoggedIn", "true");
        
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
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
      });
      return false;
    }
  };

  // Logout function
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

  // Create student
  const createStudent = async (
    name: string,
    phone: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ): Promise<Student> => {
    try {
      const code = generateRandomCode();
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

      // Insert into Supabase
      const { error } = await supabase.from('students').insert({
        ...newStudent,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      // Update local state
      setStudents(prev => [...prev, newStudent]);
      
      toast({
        title: "✅ تم إنشاء حساب الطالب بنجاح",
        description: `كود الطالب هو: ${code} | كلمة المرور: ${password}`,
      });
      
      return newStudent;
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إنشاء حساب الطالب",
      });
      throw error;
    }
  };

  // Update student
  const updateStudent = async (
    id: string,
    name: string,
    phone: string,
    password: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          name,
          phone,
          password,
          parentPhone,
          group,
          grade
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
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
        
        // Update currentUser if this is the logged-in student
        if (currentUser && currentUser.id === id && currentUser.role === "student") {
          const updatedUser = {
            ...currentUser,
            name,
            phone,
            password,
            group,
            grade
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الطالب",
      });
      throw error;
    }
  };

  // Delete student
  const deleteStudent = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setStudents(prev => prev.filter(student => student.id !== id));
      
      // If this student is logged in, log them out
      if (currentUser && currentUser.id === id && currentUser.role === "student") {
        logout();
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء حذف الطالب",
      });
      throw error;
    }
  };

  // Create parent
  const createParent = async (phone: string, studentCode: string): Promise<Parent> => {
    try {
      const student = students.find(s => s.code === studentCode);
      
      if (!student) {
        toast({
          variant: "destructive",
          title: "❌ خطأ",
          description: "كود الطالب غير صحيح",
        });
        throw new Error("Student code invalid");
      }

      const password = generateUniquePassword(students, parents);
      const newParent: Parent = {
        id: `parent-${Date.now()}`,
        phone,
        studentCode,
        studentName: student.name,
        password,
      };

      // Insert into Supabase
      const { error } = await supabase.from('parents').insert({
        ...newParent,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      // Update local state
      setParents(prev => [...prev, newParent]);
      
      toast({
        title: "✅ تم إنشاء حساب ولي الأمر بنجاح",
        description: `مرتبط بالطالب: ${student.name} | كلمة المرور: ${password}`,
      });
      
      return newParent;
    } catch (error) {
      console.error("Error creating parent:", error);
      if (error instanceof Error && error.message === "Student code invalid") {
        throw error;
      }
      
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء إنشاء حساب ولي الأمر",
      });
      throw error;
    }
  };

  // Update parent
  const updateParent = async (id: string, phone: string, studentCode: string, password: string): Promise<void> => {
    try {
      const student = students.find(s => s.code === studentCode);
      
      if (!student) {
        toast({
          variant: "destructive",
          title: "❌ خطأ",
          description: "كود الطالب غير صحيح",
        });
        throw new Error("Student code invalid");
      }

      const { error } = await supabase
        .from('parents')
        .update({
          phone,
          studentCode,
          studentName: student.name,
          password
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
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
          const updatedUser = {
            ...currentUser,
            name: `ولي أمر ${student.name}`,
            phone,
            password,
            childrenIds: [student.id]
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error updating parent:", error);
      if (error instanceof Error && error.message === "Student code invalid") {
        throw error;
      }
      
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء تحديث بيانات ولي الأمر",
      });
      throw error;
    }
  };

  // Delete parent
  const deleteParent = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('parents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setParents(prev => prev.filter(parent => parent.id !== id));
      
      // Log out if this parent is currently logged in
      if (currentUser && currentUser.id === id && currentUser.role === "parent") {
        logout();
      }
    } catch (error) {
      console.error("Error deleting parent:", error);
      toast({
        variant: "destructive",
        title: "❌ خطأ",
        description: "حدث خطأ أثناء حذف حساب ولي الأمر",
      });
      throw error;
    }
  };

  // Get student by code
  const getStudentByCode = (code: string): Student | undefined => {
    return students.find(student => student.code === code);
  };

  // Get all students
  const getAllStudents = (): Student[] => {
    return students;
  };

  // Get all parents
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
    isLoading,
    error
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
