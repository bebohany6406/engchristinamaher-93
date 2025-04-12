
export interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: "admin" | "student" | "parent";
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  password: string;
  code: string;
  parentPhone: string;
  group: string;
  grade: "first" | "second" | "third";
}

export interface Parent {
  id: string;
  phone: string;
  studentCode: string;
  studentName: string;
  password: string;
}

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
