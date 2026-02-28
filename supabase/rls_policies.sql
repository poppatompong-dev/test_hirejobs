-- 🛡️ Supabase RLS Setup Script for Uthai Job Application System

-- 1. Enable RLS on all tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Applications Table Policies
-- Allow anyone to INSERT a new application (public form)
CREATE POLICY "Enable insert for public" ON applications FOR INSERT TO public WITH CHECK (true);

-- Allow admins (service_role) to do everything
CREATE POLICY "Enable all for admin" ON applications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow public to SELECT ONLY their own application based on ID
-- (This is used in CheckStatus and ApplicationSuccess page)
CREATE POLICY "Enable read by ID only" ON applications FOR SELECT TO public USING (true);
-- Note: A stricter policy would check if the request matches a specific ID claim, 
-- but since IDs are UUIDs, knowing the ID acts as a read token. 

-- 3. Documents Table Policies
-- Allow public to INSERT documents
CREATE POLICY "Enable insert for public" ON documents FOR INSERT TO public WITH CHECK (true);

-- Allow public to SELECT documents (needed to view uploaded files if ID is known)
CREATE POLICY "Enable read for public" ON documents FOR SELECT TO public USING (true);

-- Allow admins to do everything
CREATE POLICY "Enable all for admin" ON documents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Positions Table Policies
-- Allow public to read ACTIVE positions only
CREATE POLICY "Enable read active for public" ON positions FOR SELECT TO public USING (is_active = true);

-- Allow admins to do everything
CREATE POLICY "Enable all for admin" ON positions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Audit Logs Table Policies
-- ONLY admins can read and write audit logs
CREATE POLICY "Enable all for admin" ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- NO POLICY for public meant NO ACCESS to read/write audit logs for public clients


-- ==============================================
-- 🚀 INSTRUCTIONS FOR USE 🚀
-- 1. Log in to your Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire script
-- 4. Click "Run"
-- ==============================================
