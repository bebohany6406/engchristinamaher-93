
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          phone: string
          password: string
          code: string
          parentPhone: string
          group: string
          grade: "first" | "second" | "third"
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          password: string
          code: string
          parentPhone: string
          group: string
          grade: "first" | "second" | "third"
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          password?: string
          code?: string
          parentPhone?: string
          group?: string
          grade?: "first" | "second" | "third"
          created_at?: string
        }
      }
      parents: {
        Row: {
          id: string
          phone: string
          studentCode: string
          studentName: string
          password: string
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          studentCode: string
          studentName: string
          password: string
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          studentCode?: string
          studentName?: string
          password?: string
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          studentId: string
          studentName: string
          examName: string
          score: number
          totalScore: number
          lessonNumber: number
          group: string
          date: string
          performanceIndicator: "excellent" | "very-good" | "good" | "fair" | "needs-improvement"
        }
        Insert: {
          id?: string
          studentId: string
          studentName: string
          examName: string
          score: number
          totalScore: number
          lessonNumber: number
          group: string
          date: string
          performanceIndicator: "excellent" | "very-good" | "good" | "fair" | "needs-improvement"
        }
        Update: {
          id?: string
          studentId?: string
          studentName?: string
          examName?: string
          score?: number
          totalScore?: number
          lessonNumber?: number
          group?: string
          date?: string
          performanceIndicator?: "excellent" | "very-good" | "good" | "fair" | "needs-improvement"
        }
      }
      attendance: {
        Row: {
          id: string
          studentId: string
          studentName: string
          status: "present" | "absent"
          lessonNumber: number
          time: string
          date: string
        }
        Insert: {
          id?: string
          studentId: string
          studentName: string
          status: "present" | "absent"
          lessonNumber: number
          time: string
          date: string
        }
        Update: {
          id?: string
          studentId?: string
          studentName?: string
          status?: "present" | "absent"
          lessonNumber?: number
          time?: string
          date?: string
        }
      }
      payments: {
        Row: {
          id: string
          studentId: string
          studentName: string
          studentCode: string
          group: string
          month: string
          date: string
          paidMonths: Json
        }
        Insert: {
          id?: string
          studentId: string
          studentName: string
          studentCode: string
          group: string
          month: string
          date: string
          paidMonths: Json
        }
        Update: {
          id?: string
          studentId?: string
          studentName?: string
          studentCode?: string
          group?: string
          month?: string
          date?: string
          paidMonths?: Json
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          url: string
          grade: string
          uploadDate: string
          isYouTube: boolean
        }
        Insert: {
          id?: string
          title: string
          url: string
          grade: string
          uploadDate: string
          isYouTube: boolean
        }
        Update: {
          id?: string
          title?: string
          url?: string
          grade?: string
          uploadDate?: string
          isYouTube?: boolean
        }
      }
      books: {
        Row: {
          id: string
          title: string
          url: string
          grade: string
          uploadDate: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          grade: string
          uploadDate: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          grade?: string
          uploadDate?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
