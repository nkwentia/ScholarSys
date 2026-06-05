-- supabase/migrations/001_core_schema.sql
-- Phase 1: Database & Admin — Core schema with financial tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Classes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,         -- "Form 1A"
  level       TEXT NOT NULL,         -- "Form 1"
  teacher_id  UUID,
  capacity    INT DEFAULT 40,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Students ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_number  TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  date_of_birth   DATE,
  class_id        UUID REFERENCES classes(id),
  parent_name     TEXT,
  parent_phone    TEXT,
  parent_email    TEXT,
  photo_url       TEXT,
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  is_active       BOOLEAN DEFAULT TRUE
);

-- ─── Teachers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT UNIQUE,
  phone        TEXT,
  subjects     TEXT[] DEFAULT '{}',
  photo_url    TEXT,
  availability JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Add teacher FK to classes
ALTER TABLE classes ADD CONSTRAINT fk_class_teacher
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- ─── Payments (Phase 1 Financial Tracking) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL,
  payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_type    TEXT NOT NULL CHECK (payment_type IN ('school_fees','exam_fees','pta','uniform','other')),
  term            INT NOT NULL CHECK (term IN (1, 2, 3)),
  academic_year   TEXT NOT NULL,        -- e.g. "2024/2025"
  collected_by    TEXT NOT NULL,
  receipt_number  TEXT UNIQUE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Subjects ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name     TEXT NOT NULL,
  code     TEXT UNIQUE NOT NULL,
  class_ids UUID[] DEFAULT '{}'
);

-- ─── Grades (Phase 2 Academic Intelligence) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id     UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id       UUID NOT NULL REFERENCES classes(id),
  term           INT NOT NULL CHECK (term IN (1, 2, 3)),
  academic_year  TEXT NOT NULL,
  score          NUMERIC(5, 2) NOT NULL,
  max_score      NUMERIC(5, 2) NOT NULL DEFAULT 100,
  grade_letter   TEXT,
  entry_method   TEXT DEFAULT 'manual' CHECK (entry_method IN ('manual', 'ocr')),
  entered_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Timetable Slots (Phase 3 Scheduling) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable_slots (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id       UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id     UUID NOT NULL REFERENCES subjects(id),
  teacher_id     UUID NOT NULL REFERENCES teachers(id),
  day            TEXT NOT NULL CHECK (day IN ('Monday','Tuesday','Wednesday','Thursday','Friday')),
  period         INT NOT NULL CHECK (period BETWEEN 1 AND 8),
  room           TEXT,
  academic_year  TEXT NOT NULL,
  term           INT NOT NULL CHECK (term IN (1, 2, 3)),
  UNIQUE (class_id, day, period, academic_year, term),
  UNIQUE (teacher_id, day, period, academic_year, term)
);

-- ─── Sync Queue (Phase 4 Offline Support) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_queue (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name  TEXT NOT NULL,
  operation   TEXT NOT NULL CHECK (operation IN ('insert','update','delete')),
  payload     JSONB NOT NULL,
  created_at  BIGINT NOT NULL,   -- JS timestamp for ordering
  retries     INT DEFAULT 0,
  synced      BOOLEAN DEFAULT FALSE
);

-- ─── Parent Portal Users (Phase 5 Mobile) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS parent_portal_users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT UNIQUE NOT NULL,
  pin_hash    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_year_term ON payments(academic_year, term);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_year_term ON grades(academic_year, term);
CREATE INDEX idx_timetable_class ON timetable_slots(class_id, academic_year, term);

-- ─── Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust per role in production)
CREATE POLICY "authenticated_full_access" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON grades FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON teachers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_full_access" ON timetable_slots FOR ALL USING (auth.role() = 'authenticated');
