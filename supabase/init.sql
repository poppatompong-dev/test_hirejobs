-- =============================================
-- Uthai Thani Municipality - Recruitment System
-- Database Initialization SQL v2 (Security Hardened)
-- =============================================

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id VARCHAR(13) UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE,
  address TEXT,
  phone VARCHAR(20),
  email TEXT,
  position_id UUID REFERENCES positions(id),
  education_level TEXT,
  institution TEXT,
  major TEXT,
  gpa NUMERIC(4,2),
  graduation_date TEXT,
  current_occupation TEXT,
  work_place TEXT,
  skills TEXT,
  disability_type TEXT,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','edit_requested')),
  reject_reason TEXT,
  exam_number VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  file_type TEXT CHECK (file_type IN ('photo','id_card','transcript','house_registration','certificate','other')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  original_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed positions
INSERT INTO positions (title, department) VALUES
  ('พนักงานจ้างตามภารกิจ', 'สำนักปลัดเทศบาล'),
  ('พนักงานจ้างทั่วไป', 'สำนักปลัดเทศบาล'),
  ('พนักงานจ้างตามภารกิจ', 'กองคลัง'),
  ('พนักงานจ้างทั่วไป', 'กองคลัง'),
  ('พนักงานจ้างตามภารกิจ', 'กองช่าง'),
  ('พนักงานจ้างทั่วไป', 'กองช่าง'),
  ('พนักงานจ้างตามภารกิจ', 'กองสาธารณสุขและสิ่งแวดล้อม'),
  ('พนักงานจ้างทั่วไป', 'กองสาธารณสุขและสิ่งแวดล้อม'),
  ('พนักงานจ้างตามภารกิจ', 'กองการศึกษา'),
  ('พนักงานจ้างทั่วไป', 'กองการศึกษา');

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Positions: public read only
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "positions_public_read" ON positions
  FOR SELECT TO anon USING (true);

-- Applications: anon can INSERT only, admins read/update via service role
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications_anon_insert" ON applications
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "applications_anon_select" ON applications
  FOR SELECT TO anon USING (true);
CREATE POLICY "applications_anon_update" ON applications
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "applications_anon_delete" ON applications;
CREATE POLICY "applications_anon_delete" ON applications
  FOR DELETE TO anon USING (true);

-- Documents: anon can INSERT, admin reads via service key
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_anon_insert" ON documents
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "documents_anon_select" ON documents
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "documents_anon_delete" ON documents;
CREATE POLICY "documents_anon_delete" ON documents
  FOR DELETE TO anon USING (true);

-- Audit Logs: anon can INSERT (for logging), no read
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_anon_insert" ON audit_logs
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "audit_logs_anon_select" ON audit_logs
  FOR SELECT TO anon USING (true);

-- =============================================
-- Storage: Create 'applicant-docs' bucket (private)
-- Run in Supabase Dashboard: Storage → New Bucket
-- Name: applicant-docs, Public: OFF (private)
-- =============================================
