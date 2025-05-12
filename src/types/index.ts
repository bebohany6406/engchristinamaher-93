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
  group: string;
  performanceIndicator: "excellent" | "very-good" | "good" | "fair" | "needs-improvement";
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  uploadDate: string;
  grade: "first" | "second" | "third";
  isYouTube?: boolean;
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
  code: string;
  group: string;
  grade: "first" | "second" | "third";
  password?: string;
  phone?: string;
  parentPhone?: string;
  role?: string;
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "student" | "parent";
  email?: string;
  code?: string;
  group?: string;
  grade?: "first" | "second" | "third";
  phone?: string;
  password?: string;
  childrenIds?: string[];
}

export interface Parent {
  id: string;
  phone: string;
  studentCode: string;
  studentName: string;
  password: string;
}

export interface PaidMonth {
  month: string;
  date: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  group: string;
  month: string;
  date: string;
  paidMonths: PaidMonth[];
}
