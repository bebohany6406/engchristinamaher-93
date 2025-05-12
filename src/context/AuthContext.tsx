import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Student } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { syncData, getDataWithExpiration } from "@/lib/utils";

interface AuthContextType {
  currentUser: User | null;
  login: (phone: string, password?: string) => boolean;
  logout: () => void;
  getAllStudents: () => Student[];
  createStudent: (name: string, phone: string, parentPhone: string, group: string, grade: "first" | "second" | "third") => Student;
  deleteStudent: (studentId: string) => void;
  updateStudent: (studentId: string, name: string, phone: string, password?: string, parentPhone: string, group: string, grade: "first" | "second" | "third") => void;
  getParentChildren: (parentId: string) => Student[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = getDataWithExpiration("users");
    if (storedUsers) {
      try {
        setUsers(storedUsers);
      } catch (error) {
        console.error("Failed to parse users from localStorage:", error);
      }
    }

    const storedStudents = getDataWithExpiration("students");
    if (storedStudents) {
      try {
        setStudents(storedStudents);
      } catch (error) {
        console.error("Failed to parse students from localStorage:", error);
      }
    }

    const storedCurrentUser = getDataWithExpiration("currentUser");
    if (storedCurrentUser) {
      setCurrentUser(storedCurrentUser);
    }
  }, []);

  useEffect(() => {
    syncData("users", users);
  }, [users]);

  useEffect(() => {
    syncData("students", students);
  }, [students]);

  useEffect(() => {
    syncData("currentUser", currentUser);
  }, [currentUser]);

  const login = (phone: string, password?: string): boolean => {
    const user = users.find(u => u.phone === phone);

    if (user && (password === undefined || user.password === password)) {
      setCurrentUser(user);
      navigate("/dashboard");
      return true;
    }

    const student = students.find(s => s.phone === phone);

    if (student && (password === undefined || student.password === password)) {
      setCurrentUser({
        id: student.id,
        name: student.name,
        phone: student.phone,
        role: "student",
        code: student.code,
        group: student.group,
        grade: student.grade
      });
      navigate("/dashboard");
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  const getAllStudents = (): Student[] => {
    return students;
  };

  const createStudent = (name: string, phone: string, parentPhone: string, group: string, grade: "first" | "second" | "third"): Student => {
    const newStudent: Student = {
      id: uuidv4(),
      name,
      phone,
      parentPhone,
      group,
      grade,
      code: Math.floor(100000 + Math.random() * 900000).toString(), // Generate a 6-digit code
      password: Math.random().toString(36).slice(-8), // Generate a random password
    };
    setStudents([...students, newStudent]);
    setUsers(prevUsers => [...prevUsers, {
      id: newStudent.id,
      name: newStudent.name,
      phone: newStudent.phone,
      role: "student",
      code: newStudent.code,
      group: newStudent.group,
      grade: newStudent.grade
    }]);
    return newStudent;
  };

  const deleteStudent = (studentId: string) => {
    setStudents(students.filter(student => student.id !== studentId));
    setUsers(users.filter(user => user.id !== studentId));
  };

  const updateStudent = (
    studentId: string,
    name: string,
    phone: string,
    password?: string,
    parentPhone: string,
    group: string,
    grade: "first" | "second" | "third"
  ) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          name,
          phone,
          password: password || student.password,
          parentPhone,
          group,
          grade
        };
      }
      return student;
    }));
    setUsers(users.map(user => {
      if (user.id === studentId) {
        return {
          ...user,
          name,
          phone,
          group,
          code: students.find(s => s.id === studentId)?.code,
          grade
        };
      }
      return user;
    }));
  };
  
  const getParentChildren = (parentId: string): Student[] => {
    // Find the parent
    const parent = users.find(u => u.id === parentId && u.role === 'parent');
    if (!parent) return [];
    
    // Get children linked to this parent by parentPhone
    return students.filter(student => student.parentPhone === parent.phone);
  };

  const contextValue = {
    currentUser,
    login,
    logout,
    getAllStudents,
    createStudent,
    deleteStudent,
    updateStudent,
    getParentChildren,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
