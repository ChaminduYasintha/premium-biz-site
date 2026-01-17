# Supabase Storage Bucket Setup Guide

This guide will help you create storage buckets for your property management system.

## Required Buckets

You need to create **two** storage buckets:

1. **`property-images`** - For main property images
2. **`property-plans`** - For floor plan images/PDFs

---

## Step-by-Step Instructions

### 1. Access Supabase Storage

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **"Storage"** in the left sidebar

### 2. Create the `property-images` Bucket

1. Click **"New bucket"** button
2. **Bucket name**: `property-images`
3. **Public bucket**: Toggle **ON** ⚠️ (This is important!)
4. **File size limit**: 5 MB (or your preferred limit)
5. **Allowed MIME types**: 
   - `image/jpeg`
   - `image/png`
   - `image/webp`
   - Or leave empty to allow all image types
6. Click **"Create bucket"**

### 3. Create the `property-plans` Bucket

1. Click **"New bucket"** button again
2. **Bucket name**: `property-plans`
3. **Public bucket**: Toggle **ON** ⚠️ (This is important!)
4. **File size limit**: 10 MB (floor plans can be larger)
5. **Allowed MIME types**:
   - `image/jpeg`
   - `image/png`
   - `image/webp`
   - `application/pdf`
   - Or leave empty to allow all types
6. Click **"Create bucket"**

---

## Configure Row Level Security (RLS) Policies

After creating the buckets, you need to set up RLS policies to control access.

### For `property-images` Bucket

1. Click on the `property-images` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Public Read Access
- **Policy name**: `Public Read Access`
- **Allowed operation**: SELECT
- **Policy definition**:
  ```sql
  (bucket_id = 'property-images'::text)
  ```
- **With check expression**: Same as above
- Click **"Review"** and **"Save policy"**

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated Upload`
- **Allowed operation**: INSERT
- **Policy definition**:
  ```sql
  (bucket_id = 'property-images'::text)
  ```
- **With check expression**: Same as above
- Click **"Review"** and **"Save policy"**

#### Policy 3: Authenticated Update
- **Policy name**: `Authenticated Update`
- **Allowed operation**: UPDATE
- **Policy definition**:
  ```sql
  (bucket_id = 'property-images'::text)
  ```
- **With check expression**: Same as above
- Click **"Review"** and **"Save policy"**

#### Policy 4: Authenticated Delete
- **Policy name**: `Authenticated Delete`
- **Allowed operation**: DELETE
- **Policy definition**:
  ```sql
  (bucket_id = 'property-images'::text)
  ```
- **With check expression**: Same as above
- Click **"Review"** and **"Save policy"**

### For `property-plans` Bucket

Repeat the same 4 policies for the `property-plans` bucket:

1. **Public Read Access** (SELECT)
2. **Authenticated Upload** (INSERT)
3. **Authenticated Update** (UPDATE)
4. **Authenticated Delete** (DELETE)

For each policy, use:
```sql
(bucket_id = 'property-plans'::text)
```

---

## Quick Setup (Using SQL)

Alternatively, you can use SQL to create the buckets and policies:

### Create Buckets via SQL

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL:

```sql
-- Create property-images bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create property-plans bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-plans',
  'property-plans',
  true,
  10485760, -- 10 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;
```

### Create RLS Policies via SQL

```sql
-- Policies for property-images bucket
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Policies for property-plans bucket
CREATE POLICY "Public Read Access Plans" ON storage.objects
FOR SELECT
USING (bucket_id = 'property-plans');

CREATE POLICY "Authenticated Upload Plans" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'property-plans' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update Plans" ON storage.objects
FOR UPDATE
USING (bucket_id = 'property-plans' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete Plans" ON storage.objects
FOR DELETE
USING (bucket_id = 'property-plans' AND auth.role() = 'authenticated');
```

---

## Verify Setup

### Check Buckets Exist

1. Go to **Storage** → **Buckets**
2. You should see both:
   - ✅ `property-images`
   - ✅ `property-plans`

### Test Upload

1. Go to your admin panel: `/admin`
2. Try uploading a property image
3. Try uploading a floor plan
4. Check if files appear in the respective buckets

### Check Public Access

1. Upload a test image to `property-images`
2. Copy the public URL
3. Open it in an incognito/private browser window
4. The image should load (confirming public access works)

---

## Troubleshooting

### Issue: "Bucket not found" error

**Solution**: 
- Verify the bucket name is exactly `property-images` or `property-plans` (case-sensitive)
- Check that the bucket exists in Storage → Buckets

### Issue: "Permission denied" when uploading

**Solution**:
- Ensure you're logged in to the admin panel
- Check that RLS policies are created correctly
- Verify the bucket is set to public

### Issue: Images not displaying

**Solution**:
- Check that the bucket is set to **Public**
- Verify the file URL is correct
- Check browser console for CORS errors

### Issue: File size too large

**Solution**:
- Increase the file size limit in bucket settings
- Or compress images before uploading

---

## Bucket Configuration Summary

| Bucket Name | Purpose | Public | Max Size | File Types |
|------------|---------|--------|----------|------------|
| `property-images` | Main property photos | ✅ Yes | 5 MB | Images (JPEG, PNG, WebP) |
| `property-plans` | Floor plans | ✅ Yes | 10 MB | Images + PDF |

---

## Next Steps

After creating the buckets:

1. ✅ Test uploading a property image
2. ✅ Test uploading a floor plan
3. ✅ Verify images display on property detail pages
4. ✅ Check that floor plans appear correctly

Your storage setup is complete! 🎉

