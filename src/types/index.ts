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
  performanceIndicator: "excellent" | "good" | "average" | "poor";
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student" | "parent";
  code?: string;
  group?: string;
  grade?: "first" | "second" | "third";
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
