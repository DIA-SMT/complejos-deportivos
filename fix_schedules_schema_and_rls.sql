-- =====================================================
-- SCRIPT PARA CORREGIR RLS EN professor_schedules y professors
-- Ejecutar este script completo en Supabase SQL Editor
-- =====================================================

-- Add description column to professor_schedules if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professor_schedules' AND column_name = 'description') THEN
        ALTER TABLE professor_schedules ADD COLUMN description TEXT;
    END IF;
END $$;

-- =====================================================
-- PROFESSOR_SCHEDULES TABLE
-- =====================================================

-- Enable RLS on professor_schedules
ALTER TABLE professor_schedules ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON professor_schedules;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON professor_schedules;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON professor_schedules;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON professor_schedules;
DROP POLICY IF EXISTS "Allow public read access" ON professor_schedules;
DROP POLICY IF EXISTS "Allow authenticated insert" ON professor_schedules;
DROP POLICY IF EXISTS "Allow authenticated update" ON professor_schedules;
DROP POLICY IF EXISTS "Allow authenticated delete" ON professor_schedules;
DROP POLICY IF EXISTS "professor_schedules_select_policy" ON professor_schedules;
DROP POLICY IF EXISTS "professor_schedules_insert_policy" ON professor_schedules;
DROP POLICY IF EXISTS "professor_schedules_update_policy" ON professor_schedules;
DROP POLICY IF EXISTS "professor_schedules_delete_policy" ON professor_schedules;

-- Create new policies with correct auth check (auth.uid() IS NOT NULL)
CREATE POLICY "professor_schedules_select_policy"
ON professor_schedules
FOR SELECT
USING (true);

CREATE POLICY "professor_schedules_insert_policy"
ON professor_schedules
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "professor_schedules_update_policy"
ON professor_schedules
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "professor_schedules_delete_policy"
ON professor_schedules
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PROFESSORS TABLE
-- =====================================================

-- Enable RLS on professors
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on professors
DROP POLICY IF EXISTS "Enable read access for all users" ON professors;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON professors;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON professors;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON professors;
DROP POLICY IF EXISTS "Allow public read access" ON professors;
DROP POLICY IF EXISTS "Allow authenticated insert" ON professors;
DROP POLICY IF EXISTS "Allow authenticated update" ON professors;
DROP POLICY IF EXISTS "Allow authenticated delete" ON professors;
DROP POLICY IF EXISTS "professors_select_policy" ON professors;
DROP POLICY IF EXISTS "professors_insert_policy" ON professors;
DROP POLICY IF EXISTS "professors_update_policy" ON professors;
DROP POLICY IF EXISTS "professors_delete_policy" ON professors;

-- Create policies for professors table
CREATE POLICY "professors_select_policy"
ON professors
FOR SELECT
USING (true);

CREATE POLICY "professors_insert_policy"
ON professors
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "professors_update_policy"
ON professors
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "professors_delete_policy"
ON professors
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- VERIFICATION: Check that policies were created
-- =====================================================
-- Run this separately to verify:
-- SELECT tablename, policyname, cmd FROM pg_policies 
-- WHERE tablename IN ('professors', 'professor_schedules');
