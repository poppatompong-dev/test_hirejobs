-- 🛡️ Supabase RLS Setup Script for Uthai Job Application System (Frontend Admin Auth)

-- 1. Enable RLS on all tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Applications Table Policies
DROP POLICY IF EXISTS "Enable insert for public" ON applications;
DROP POLICY IF EXISTS "Enable read by ID only" ON applications;
DROP POLICY IF EXISTS "Enable all for admin" ON applications;
DROP POLICY IF EXISTS "Enable all for public" ON applications;

-- Allow all operations for public (since admin auth is on frontend)
CREATE POLICY "Enable all for public" ON applications FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Documents Table Policies
DROP POLICY IF EXISTS "Enable insert for public" ON documents;
DROP POLICY IF EXISTS "Enable read for public" ON documents;
DROP POLICY IF EXISTS "Enable all for admin" ON documents;
DROP POLICY IF EXISTS "Enable all for public" ON documents;

CREATE POLICY "Enable all for public" ON documents FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Positions Table Policies
DROP POLICY IF EXISTS "Enable read active for public" ON positions;
DROP POLICY IF EXISTS "Enable all for admin" ON positions;
DROP POLICY IF EXISTS "Enable all for public" ON positions;

CREATE POLICY "Enable all for public" ON positions FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Audit Logs Table Policies
DROP POLICY IF EXISTS "Enable all for admin" ON audit_logs;
DROP POLICY IF EXISTS "Enable all for public" ON audit_logs;

CREATE POLICY "Enable all for public" ON audit_logs FOR ALL TO public USING (true) WITH CHECK (true);

-- ==============================================
-- �️ INSTRUCTIONS FOR USE �️
-- 1. Log in to your Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire script
-- 4. Click "Run"
-- ==============================================
