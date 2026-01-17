-- =====================================================
-- Supabase Storage Buckets Setup Script
-- =====================================================
-- This script creates the required storage buckets and RLS policies
-- for the property management system
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create property-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Create property-plans bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-plans',
  'property-plans',
  true,
  10485760, -- 10 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- =====================================================
-- RLS Policies for property-images bucket
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Read Access Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Images" ON storage.objects;

-- Public Read Access
CREATE POLICY "Public Read Access Images" ON storage.objects
FOR SELECT
USING (bucket_id = 'property-images');

-- Authenticated Upload
CREATE POLICY "Authenticated Upload Images" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Authenticated Update
CREATE POLICY "Authenticated Update Images" ON storage.objects
FOR UPDATE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Authenticated Delete
CREATE POLICY "Authenticated Delete Images" ON storage.objects
FOR DELETE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- =====================================================
-- RLS Policies for property-plans bucket
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Read Access Plans" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Plans" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Plans" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Plans" ON storage.objects;

-- Public Read Access
CREATE POLICY "Public Read Access Plans" ON storage.objects
FOR SELECT
USING (bucket_id = 'property-plans');

-- Authenticated Upload
CREATE POLICY "Authenticated Upload Plans" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'property-plans' AND auth.role() = 'authenticated');

-- Authenticated Update
CREATE POLICY "Authenticated Update Plans" ON storage.objects
FOR UPDATE
USING (bucket_id = 'property-plans' AND auth.role() = 'authenticated');

-- Authenticated Delete
CREATE POLICY "Authenticated Delete Plans" ON storage.objects
FOR DELETE
USING (bucket_id = 'property-plans' AND auth.role() = 'authenticated');

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify buckets were created:
-- SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('property-images', 'property-plans');

