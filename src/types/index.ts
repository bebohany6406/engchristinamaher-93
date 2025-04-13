export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: "present" | "absent";
  lessonNumber: number;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  examName: string;
  score: number;
  totalScore: number;
  date: string;
  lessonNumber: number;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  uploadDate: string;
  grade: "first" | "second" | "third";
}

export interface Book {
  id: string;
  title: string;
  url: string;
  uploadDate: string;
  grade: "first" | "second" | "third";
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  role: "student";
  grade: "first" | "second" | "third";
  password: string;
  qrCode?: string;
  group?: string; // Added student group
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "parent" | "student";
  password?: string;
  grade?: "first" | "second" | "third";
}
