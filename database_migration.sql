-- =====================================================
-- Property Management System - Database Migration
-- Version: 2.0
-- Date: January 2026
-- =====================================================
--
-- This migration adds support for:
-- 1. YouTube video tours
-- 2. Facebook post/page links
-- 3. 360-degree virtual tours
-- 4. Property floor plans
--
-- =====================================================

-- Add new columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS view_360_url TEXT,
ADD COLUMN IF NOT EXISTS plan_url TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN properties.youtube_url IS 'YouTube video URL for property tour';
COMMENT ON COLUMN properties.facebook_url IS 'Facebook post or page URL for property';
COMMENT ON COLUMN properties.view_360_url IS 'Virtual 360-degree tour URL (Matterport, Kuula, etc.)';
COMMENT ON COLUMN properties.plan_url IS 'URL to uploaded floor plan image or PDF';

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_properties_youtube ON properties(youtube_url) WHERE youtube_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_360 ON properties(view_360_url) WHERE view_360_url IS NOT NULL;

-- =====================================================
-- Storage Bucket for Floor Plans (if not exists)
-- =====================================================
--
-- Note: This should be done via Supabase Dashboard > Storage
-- Create a new bucket called 'property-plans' with these settings:
--   - Public: Yes (or configure RLS)
--   - Allowed file types: image/*, application/pdf
--   - Max file size: 10MB
--
-- RLS Policy Example:
--   INSERT: authenticated users only
--   SELECT: public
--   UPDATE: authenticated users only
--   DELETE: authenticated users only
--
-- =====================================================

-- Optional: Create a view for properties with multimedia content
CREATE OR REPLACE VIEW properties_with_media AS
SELECT 
    id,
    title,
    price,
    city,
    description,
    image_url,
    youtube_url,
    facebook_url,
    view_360_url,
    plan_url,
    created_at,
    updated_at,
    CASE 
        WHEN youtube_url IS NOT NULL THEN true 
        ELSE false 
    END AS has_video,
    CASE 
        WHEN view_360_url IS NOT NULL THEN true 
        ELSE false 
    END AS has_360_tour,
    CASE 
        WHEN plan_url IS NOT NULL THEN true 
        ELSE false 
    END AS has_floor_plan,
    CASE 
        WHEN facebook_url IS NOT NULL THEN true 
        ELSE false 
    END AS has_facebook
FROM properties;

-- Grant access to the view
GRANT SELECT ON properties_with_media TO anon, authenticated;

-- =====================================================
-- Verification Queries
-- =====================================================
--
-- Run these to verify the migration was successful:
--
-- 1. Check if columns were added:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'properties'
-- AND column_name IN ('youtube_url', 'facebook_url', 'view_360_url', 'plan_url');
--
-- 2. Check the view:
-- SELECT * FROM properties_with_media LIMIT 5;
--
-- 3. Test insert (replace with actual values):
-- UPDATE properties 
-- SET 
--     youtube_url = 'https://www.youtube.com/watch?v=example',
--     facebook_url = 'https://www.facebook.com/example',
--     view_360_url = 'https://example.matterport.com/show/?m=example',
--     plan_url = 'https://your-bucket.supabase.co/storage/v1/object/public/property-plans/example.pdf'
-- WHERE id = 1;
--
-- =====================================================

-- Migration completed successfully!
-- Remember to update your Row Level Security (RLS) policies if needed.
