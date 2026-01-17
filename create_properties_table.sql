-- =====================================================
-- Property Management System - Complete Database Setup
-- Version: 1.0
-- Date: January 2026
-- =====================================================
-- 
-- This script creates the properties table from scratch
-- with all columns including multimedia support
-- and inserts sample data for testing
--
-- =====================================================

-- Drop table if exists (for fresh start)
DROP TABLE IF EXISTS properties CASCADE;

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    city TEXT NOT NULL,
    image_url TEXT NOT NULL,
    
    -- Property classification
    property_type TEXT NOT NULL CHECK (property_type IN ('land', 'apartment', 'house')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale')),
    featured BOOLEAN DEFAULT false,
    
    -- Property details
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqft INTEGER, -- Area in square feet
    features TEXT, -- Comma-separated or JSON array of features (e.g., "Pool, Garden, Parking, Security")
    
    -- Multimedia fields
    youtube_url TEXT,
    facebook_url TEXT,
    view_360_url TEXT,
    plan_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_featured ON properties(featured) WHERE featured = true;
CREATE INDEX idx_properties_youtube ON properties(youtube_url) WHERE youtube_url IS NOT NULL;
CREATE INDEX idx_properties_360 ON properties(view_360_url) WHERE view_360_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE properties IS 'Property listings with multimedia support';
COMMENT ON COLUMN properties.id IS 'Unique identifier for each property';
COMMENT ON COLUMN properties.title IS 'Property title/name';
COMMENT ON COLUMN properties.description IS 'Detailed property description';
COMMENT ON COLUMN properties.price IS 'Property price in LKR';
COMMENT ON COLUMN properties.city IS 'City/location of the property';
COMMENT ON COLUMN properties.image_url IS 'Main property image URL';
COMMENT ON COLUMN properties.property_type IS 'Type of property: land, apartment, or house';
COMMENT ON COLUMN properties.listing_type IS 'Listing type: rent or sale';
COMMENT ON COLUMN properties.featured IS 'Whether property is featured on homepage';
COMMENT ON COLUMN properties.youtube_url IS 'YouTube video URL for property tour';
COMMENT ON COLUMN properties.facebook_url IS 'Facebook post or page URL';
COMMENT ON COLUMN properties.view_360_url IS '360-degree virtual tour URL (Matterport, Kuula, etc.)';
COMMENT ON COLUMN properties.plan_url IS 'Floor plan image or PDF URL';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Data Insertion
-- =====================================================

-- Sample Property 1: Luxury Villa in Colombo 7
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, bedrooms, bathrooms, area_sqft, features, image_url, youtube_url, view_360_url, plan_url, facebook_url)
VALUES (
    'Luxury 4-Bedroom Villa in Colombo 7',
    'Stunning modern villa with ocean views, private pool, and premium finishes. Located in the heart of Colombo 7, this property features 4 spacious bedrooms, 3 bathrooms, a fully equipped kitchen, and a beautiful garden. Perfect for families seeking luxury living.',
    45000000,
    'Colombo',
    'house',
    'sale',
    true,
    4,
    3,
    3500,
    'Private Pool, Ocean Views, Premium Finishes, Fully Equipped Kitchen, Beautiful Garden, Security System',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://my.matterport.com/show/?m=example123',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    'https://www.facebook.com/premiumestates/posts/123456'
);

-- Sample Property 2: Beachfront Apartment in Galle
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, bedrooms, bathrooms, area_sqft, features, image_url, youtube_url, view_360_url)
VALUES (
    'Beachfront 3-Bedroom Apartment in Galle',
    'Beautiful beachfront apartment with direct access to the beach. Features 3 bedrooms, 2 bathrooms, modern kitchen, and a large balcony with stunning ocean views. Ideal for vacation rental or permanent residence.',
    28000000,
    'Galle',
    'apartment',
    'sale',
    true,
    3,
    2,
    2200,
    'Beachfront Access, Ocean Views, Large Balcony, Modern Kitchen, Parking',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    'https://kuula.co/share/example456'
);

-- Sample Property 3: Modern House in Kandy
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, bedrooms, bathrooms, area_sqft, features, image_url, plan_url, facebook_url)
VALUES (
    'Modern 5-Bedroom House in Kandy',
    'Spacious modern house with mountain views. Features 5 bedrooms, 4 bathrooms, large living areas, and a beautiful garden. Perfect for large families. Located in a quiet residential area.',
    35000000,
    'Kandy',
    'house',
    'sale',
    false,
    5,
    4,
    4200,
    'Mountain Views, Large Living Areas, Beautiful Garden, Parking, Security',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    'https://www.facebook.com/premiumestates/posts/789012'
);

-- Sample Property 4: Condo in Negombo (For Rent)
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, bedrooms, bathrooms, area_sqft, features, image_url, youtube_url)
VALUES (
    '2-Bedroom Condo in Negombo',
    'Modern 2-bedroom condo with city views. Features 2 bedrooms, 2 bathrooms, fully furnished, and access to swimming pool and gym. Great investment opportunity or starter home.',
    85000,
    'Negombo',
    'apartment',
    'rent',
    true,
    2,
    2,
    1200,
    'City Views, Fully Furnished, Swimming Pool, Gym Access, Parking',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    'https://www.youtube.com/watch?v=example789'
);

-- Sample Property 5: Traditional House in Nuwara Eliya
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, bedrooms, bathrooms, area_sqft, features, image_url, view_360_url, plan_url)
VALUES (
    'Traditional 3-Bedroom House in Nuwara Eliya',
    'Charming traditional house with cool climate. Features 3 bedrooms, 2 bathrooms, fireplace, and beautiful garden. Perfect for those who love the hill country lifestyle.',
    18000000,
    'Nuwara Eliya',
    'house',
    'sale',
    false,
    3,
    2,
    2800,
    'Fireplace, Beautiful Garden, Cool Climate, Parking',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80',
    'https://my.matterport.com/show/?m=example789',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80'
);

-- Sample Property 6: Luxury Apartment in Colombo 5
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, bedrooms, bathrooms, area_sqft, features, image_url, youtube_url, view_360_url, plan_url, facebook_url)
VALUES (
    'Luxury 3-Bedroom Apartment in Colombo 5',
    'Premium apartment in prime location. Features 3 bedrooms, 3 bathrooms, modern kitchen, high-end finishes, and access to rooftop pool. Perfect for professionals and families.',
    32000000,
    'Colombo',
    'apartment',
    'sale',
    true,
    3,
    3,
    2500,
    'Rooftop Pool, Modern Kitchen, High-End Finishes, Security, Parking, Gym Access',
    'https://images.unsplash.com/photo-1600585154084-4e810fe6c7fe?w=800&q=80',
    'https://www.youtube.com/watch?v=example321',
    'https://kuula.co/share/example321',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    'https://www.facebook.com/premiumestates/posts/345678'
);

-- Sample Property 7: Land for Sale in Colombo
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, area_sqft, features, image_url)
VALUES (
    'Prime Land Plot in Colombo 3',
    'Excellent investment opportunity! Prime land plot in Colombo 3, perfect for building your dream home or commercial development. 20 perches with road access and all utilities available.',
    25000000,
    'Colombo',
    'land',
    'sale',
    false,
    54450,
    'Road Access, All Utilities Available, Prime Location, Clear Title',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
);

-- Sample Property 8: House for Rent in Kandy
INSERT INTO properties (title, description, price, city, property_type, listing_type, featured, bedrooms, bathrooms, area_sqft, features, image_url, youtube_url)
VALUES (
    '3-Bedroom House for Rent in Kandy',
    'Spacious 3-bedroom house available for rent. Features modern amenities, garden, and parking. Located in a quiet residential area close to schools and shopping. Perfect for families.',
    75000,
    'Kandy',
    'house',
    'rent',
    false,
    3,
    2,
    2400,
    'Modern Amenities, Garden, Parking, Quiet Location, Close to Schools',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
    'https://www.youtube.com/watch?v=example456'
);

-- =====================================================
-- Row Level Security (RLS) Setup
-- =====================================================
-- 
-- Enable RLS on the table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access"
    ON properties
    FOR SELECT
    TO public
    USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert"
    ON properties
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update"
    ON properties
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete"
    ON properties
    FOR DELETE
    TO authenticated
    USING (true);

-- =====================================================
-- Optional: Create a view for properties with media
-- =====================================================

CREATE OR REPLACE VIEW properties_with_media AS
SELECT 
    id,
    title,
    price,
    city,
    property_type,
    listing_type,
    featured,
    bedrooms,
    bathrooms,
    area_sqft,
    features,
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
GRANT SELECT ON properties_with_media TO public, authenticated;

-- =====================================================
-- Verification Queries
-- =====================================================
--
-- Run these to verify everything was created correctly:
--
-- 1. Check table structure:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'properties'
-- ORDER BY ordinal_position;
--
-- 2. Check sample data:
-- SELECT id, title, city, price, property_type, listing_type, featured,
--        youtube_url IS NOT NULL as has_video,
--        view_360_url IS NOT NULL as has_360,
--        plan_url IS NOT NULL as has_plan
-- FROM properties;
--
-- 3. Count properties by city:
-- SELECT city, COUNT(*) as property_count
-- FROM properties
-- GROUP BY city
-- ORDER BY property_count DESC;
--
-- 4. Count properties by type:
-- SELECT property_type, listing_type, COUNT(*) as count
-- FROM properties
-- GROUP BY property_type, listing_type
-- ORDER BY property_type, listing_type;
--
-- 5. Get featured properties:
-- SELECT * FROM properties WHERE featured = true;
--
-- =====================================================
-- Setup Complete!
-- =====================================================
-- 
-- The properties table has been created with:
-- ✅ All required columns
-- ✅ Multimedia support (YouTube, 360°, Floor Plans, Facebook)
-- ✅ Indexes for performance
-- ✅ Auto-updating timestamps
-- ✅ Row Level Security policies
-- ✅ Sample data (8 properties with various types)
-- ✅ Helper view for media queries
--
-- Next steps:
-- 1. Update image URLs with your actual property images
-- 2. Add real YouTube video URLs
-- 3. Add real 360° tour URLs (Matterport, Kuula, etc.)
-- 4. Upload floor plans to Supabase Storage and update plan_url
-- 5. Add Facebook post URLs if needed
--
-- =====================================================

