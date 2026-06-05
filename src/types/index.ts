// src/types/index.ts
// Shared TypeScript types across all 5 phases

// ─── Phase 1: Core Database & Finance ────────────────────────────────────────

export interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  class_id: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  photo_url?: string;
  enrolled_at: string;
  is_active: boolean;
}

export interface PaymentRecord {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_type: 'school_fees' | 'exam_fees' | 'pta' | 'uniform' | 'other';
  term: 1 | 2 | 3;
  academic_year: string;
  collected_by: string;
  receipt_number: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string;       // e.g. "Form 1A"
  level: string;      // e.g. "Form 1"
  teacher_id: string;
  capacity: number;
}

// ─── Phase 2: Academic & Grade Intelligence ───────────────────────────────────

export interface GradeEntry {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  term: 1 | 2 | 3;
  academic_year: string;
  score: number;
  max_score: number;
  grade_letter?: string;
  entry_method: 'manual' | 'ocr';
  entered_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  class_ids: string[];
}

export interface ClassDemographic {
  class_id: string;
  total_students: number;
  average_score: number;
  pass_rate: number;
  top_student_id: string;
}

// ─── Phase 3: Scheduling ─────────────────────────────────────────────────────

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subjects: string[];
  photo_url?: string;
  availability: AvailabilityMatrix;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface AvailabilityMatrix {
  [day: string]: Period[];
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day: DayOfWeek;
  period: Period;
  room?: string;
  academic_year: string;
  term: 1 | 2 | 3;
}

export interface ReportCard {
  student: Student;
  grades: GradeEntry[];
  class_info: ClassRoom;
  teacher: Teacher;
  term: 1 | 2 | 3;
  academic_year: string;
}

// ─── Phase 4: Sync & Offline ─────────────────────────────────────────────────

export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  created_at: number; // timestamp
  retries: number;
}

export interface TranscriptYear {
  academic_year: string;
  terms: {
    term: 1 | 2 | 3;
    grades: GradeEntry[];
  }[];
}

// ─── Phase 5: Mobile / Android ───────────────────────────────────────────────

export interface ParentPortalUser {
  id: string;
  student_id: string;
  name: string;
  phone: string;
  pin_hash: string;
}

export interface PortalNotification {
  id: string;
  student_id: string;
  type: 'payment_due' | 'grade_published' | 'report_ready' | 'announcement';
  message: string;
  sent_at: string;
  read: boolean;
}

// ─── Supabase DB type stub (expand after schema generation) ──────────────────
export interface Database {
  public: {
    Tables: {
      students: { Row: Student; Insert: Omit<Student, 'id'>; Update: Partial<Student> };
      payments: { Row: PaymentRecord; Insert: Omit<PaymentRecord, 'id'>; Update: Partial<PaymentRecord> };
      grades: { Row: GradeEntry; Insert: Omit<GradeEntry, 'id'>; Update: Partial<GradeEntry> };
      teachers: { Row: Teacher; Insert: Omit<Teacher, 'id'>; Update: Partial<Teacher> };
      timetable_slots: { Row: TimetableSlot; Insert: Omit<TimetableSlot, 'id'>; Update: Partial<TimetableSlot> };
      classes: { Row: ClassRoom; Insert: Omit<ClassRoom, 'id'>; Update: Partial<ClassRoom> };
    };
  };
}
