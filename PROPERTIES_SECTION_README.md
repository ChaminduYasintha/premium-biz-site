# 🏠 Properties Section - Supabase Integration

## ✅ What Was Added

A beautiful **Properties Section** has been added to your website homepage that displays real estate listings from your Supabase database!

---

## 🎨 Features

### Visual Design
- ✨ **Premium Glassmorphism** - Frosted glass effect badges for location and price
- 🎯 **Gradient Backgrounds** - Soft amber-to-orange gradients
- 🌊 **Smooth Animations** - Hover effects, scale transforms, and slide-up cards
- 📱 **Fully Responsive** - Looks great on desktop, tablet, and mobile
- 💎 **Modern UI** - Rounded corners, shadows, and blur effects

### Functionality
- 📍 **Location Badges** - Shows the city for each property
- 💰 **Price Display** - Formatted LKR prices with commas
- 📸 **Image Gallery** - High-quality property images with zoom on hover
- 💬 **WhatsApp Integration** - Direct inquiry button with pre-filled message
- ❤️ **Save Button** - Wishlist/favorite functionality placeholder
- 🔄 **Real-time Data** - Fetches properties from Supabase on page load

---

## 📂 Files Modified/Created

### New Files
1. **`src/utils/supabase.ts`** - Supabase utilities for fetching properties
   - `fetchProperties()` - Gets all properties from database
   - `fetchPropertyById()` - Gets a single property
   - `formatPrice()` - Formats numbers with commas

### Modified Files
1. **`src/pages/index.astro`** - Added Properties section
   - Import Supabase utilities
   - Fetch properties data
   - Display properties grid
   
2. **`.env`** - Added Supabase credentials
   ```env
   PUBLIC_SUPABASE_URL=https://eajauzeclxsyqdxutilb.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

3. **`.env.example`** - Updated with Supabase config template

4. **`package.json`** - Added @supabase/supabase-js dependency

---

## 🗄️ Database Structure

The properties section reads from your Supabase `properties` table with this structure:

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    price BIGINT NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL
);
```

---

## 🚀 How to Add Properties

### Option 1: Admin Panel (Recommended)
1. Go to: `http://localhost:4321/admin/` (or your deployed URL + `/admin/`)
2. Fill in the form:
   - **Title**: Property name
   - **Price**: Price in LKR (numbers only)
   - **City**: Location
   - **Description**: Property details
   - **Image**: Upload property photo
3. Click "Save Property" ✅

### Option 2: Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor** → **properties**
4. Click **Insert row**
5. Fill in the details
6. Click **Save**

---

## 🎯 How It Works

1. **Page Load**: When someone visits your homepage (`index.astro`)
2. **Fetch Data**: The page calls `fetchProperties()` from `supabase.ts`
3. **Query Supabase**: The function queries your Supabase database
4. **Return Results**: Properties are returned in descending order (newest first)
5. **Render Section**: If properties exist, the section displays with:
   - Property cards with images
   - Location and price badges
   - WhatsApp inquiry buttons
   - Smooth animations

---

## 📱 WhatsApp Integration

Each property has an "Inquire" button that:
- Opens WhatsApp with your number
- Pre-fills message: `"I'm interested in: [Property Title] - LKR [Price]"`
- Makes it easy for customers to contact you

The WhatsApp number is read from `.env`:
```env
PUBLIC_WHATSAPP_NUMBER=+94771234567
```

---

## 🎨 Customization

### Change Section Colors
Edit `src/pages/index.astro`, find the Properties section:
```astro
<section class="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50">
```

Change `amber` and `orange` to your preferred colors (e.g., `blue`, `purple`, `green`)

### Change Section Title
```astro
<h2>Featured <span>Properties</span></h2>
```

### Hide/Show Section
The section only appears if you have properties. To always show it (with "No properties" message), remove the conditional:
```astro
{properties.length > 0 && (
  <!-- Remove this line -->
```

---

## 🔒 Security Notes

- ✅ The `anon key` in `.env` is **safe to expose** in client-side code
- ✅ Row Level Security (RLS) policies protect your database
- ✅ Public can read properties (expected behavior)
- ✅ Uploads require policies (set via SQL scripts)
- ❌ **Never** expose your `service_role` or `secret` key in client code!

---

## 🐛 Troubleshooting

### Properties not showing?
1. Check browser console for errors
2. Verify `.env` has correct `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
3. Ensure you have at least one property in Supabase
4. Restart dev server: Stop (`Ctrl+C`) and run `npm run dev`

### Images not loading?
1. Check that `image_url` in database is a valid URL
2. Ensure the Supabase bucket is public
3. Verify upload worked in the admin panel

### Can't add properties via admin?
1. Run the SQL setup from `reset-all-policies.sql`
2. Make sure bucket `property-images` exists and is public
3. Check browser console for errors

---

## 📝 Next Steps

Suggested enhancements:
- [ ] Create a dedicated `/properties` page with all listings
- [ ] Add filter by city/price range
- [ ] Add individual property detail pages
- [ ] Add property comparison feature
- [ ] Add image galleries (multiple images per property)
- [ ] Add property type/category (House, Land, Apartment, etc.)
- [ ] Add bedrooms, bathrooms, sqft metadata

---

## 🎉 You're All Set!

Your website now has a beautiful properties section powered by Supabase! 

- **Add properties**: Use the admin panel at `/admin/`
- **View properties**: They appear automatically on the homepage
- **Customers inquire**: Via WhatsApp with one click

Enjoy! 🚀
