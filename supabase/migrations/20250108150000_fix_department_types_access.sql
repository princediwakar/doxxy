-- Fix department_types access - add missing RLS policy
-- Migration: 20250108150000_fix_department_types_access.sql

-- Enable RLS on department_types if not already enabled
ALTER TABLE department_types ENABLE ROW LEVEL SECURITY;

-- Add policy to allow all authenticated users to read department_types
-- This is safe as department types are public reference data
CREATE POLICY "department_types_read_all" ON department_types
    FOR SELECT TO authenticated
    USING (true);

-- Also allow public read access for unauthenticated users during clinic creation
CREATE POLICY "department_types_read_public" ON department_types
    FOR SELECT TO anon
    USING (true); 