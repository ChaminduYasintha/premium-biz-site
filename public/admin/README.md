# 🏠 Property Admin Panel - Supabase CMS

A beautiful, client-side admin panel for managing property listings with **Supabase** as the backend. Built with vanilla HTML, CSS, and JavaScript—no frameworks required!

## ✨ Features

- ✅ Add new properties with text and image uploads
- 📸 Image storage in Supabase Storage
- 💾 Property data stored in Supabase Database
- 🎨 Modern, premium UI with animations
- 📱 Fully responsive design
- 🔍 View all properties in a beautiful grid
- ⚡ Fast client-side rendering
- 🆓 100% Free to use

---

## 🚀 Quick Start Guide

### Step 1: Set Up Supabase

#### A. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - Name: `property-cms` (or any name)
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
5. Click **"Create new project"** (takes ~2 minutes)

#### B. Create the Database Table
1. Go to **Table Editor** in the left sidebar
2. Click **"New Table"**
3. Set table name: `properties`
4. Add these columns:

| Column Name | Type | Default Value | Settings |
|------------|------|---------------|----------|
| id | uuid | `gen_random_uuid()` | Primary Key ✓ |
| created_at | timestamptz | `now()` | - |
| title | text | - | - |
| price | int8 | - | - |
| city | text | - | - |
| description | text | - | - |
| image_url | text | - | - |

5. Click **"Save"**

#### C. Create the Storage Bucket
1. Go to **Storage** in the left sidebar
2. Click **"New Bucket"**
3. Name: `property-images`
4. **Toggle "Public bucket" to ON** ⚠️ (Important!)
5. Click **"Create bucket"**

#### D. Set Storage Policies (Allow Uploads)
1. Click on the `property-images` bucket
2. Go to **Configuration** → **Policies**
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Policy name: `Allow all access`
6. Check all operations: SELECT, INSERT, UPDATE, DELETE
7. In the **"Policy definition"** section, use:
   ```sql
   true
   ```
   (This allows all access - fine for a private admin panel)
8. Click **"Review"** → **"Save policy"**

#### E. Get Your API Credentials
1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

---

### Step 2: Configure the Admin Panel

1. Open `admin/config.js` in a text editor
2. Replace the placeholders:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',  // Paste your Project URL
    anonKey: 'eyJhbGc...'                      // Paste your anon key
}
```

3. Save the file

---

### Step 3: Run the Admin Panel

#### Option A: Live Server (Recommended)
1. Install [Live Server VS Code extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `admin/index.html`
3. Select **"Open with Live Server"**

#### Option B: Python Server
```bash
cd admin
python -m http.server 8000
```
Then open: http://localhost:8000

#### Option C: Node.js Server
```bash
npx serve admin
```

---

### Step 4: Use the Admin Panel

1. **Add a Property:**
   - Fill in the form (Title, Price, City, Description)
   - Upload an image
   - Click **"Save Property"**
   - Success! 🎉

2. **View Properties:**
   - Click **"View All Properties"** button
   - See all your listings in a beautiful grid

---

## 🔒 Security Notes

### Current Setup (Development)
- The admin panel is **not password protected**
- Anyone with the URL can add properties
- The `anon` key is safe for client-side use

### For Production (Recommended)
1. **Add Password Protection:**
   - Use simple HTTP Basic Auth
   - Or add a login page with Supabase Auth
   
2. **Enable Row Level Security (RLS):**
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
   
   -- Allow authenticated users to insert
   CREATE POLICY "Allow authenticated insert" 
   ON properties FOR INSERT 
   TO authenticated 
   WITH CHECK (true);
   
   -- Allow everyone to read (for public website)
   CREATE POLICY "Allow public read" 
   ON properties FOR SELECT 
   TO anon 
   USING (true);
   ```

3. **Restrict Storage Access:**
   - Update storage policies to require authentication for uploads

---

## 📁 File Structure

```
admin/
├── index.html          # Main HTML structure
├── styles.css          # Premium CSS styling
├── config.js           # Supabase configuration
├── app.js              # Main application logic
└── README.md           # This file
```

---

## 🎨 Customization

### Change Cities
Edit `admin/index.html`, find the city dropdown:
```html
<select id="city" name="city" class="form-select">
    <option value="Colombo">Colombo</option>
    <!-- Add more cities here -->
</select>
```

### Change Colors
Edit `admin/styles.css`, update CSS variables:
```css
:root {
    --primary: #3b82f6;      /* Change primary color */
    --primary-hover: #2563eb;
    /* ... */
}
```

### Add More Fields
1. Add input field in `index.html`
2. Update form handling in `app.js`
3. Add column in Supabase table

---

## 🌐 Integrate with Your Website

### Fetch Properties in Your Website

```javascript
// Initialize Supabase in your website
const supabase = window.supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_ANON_KEY'
)

// Fetch all properties
async function getProperties() {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
    
    return data
}

// Use it
const properties = await getProperties()
console.log(properties)
```

### Example HTML Display

```html
<div id="properties"></div>

<script>
async function displayProperties() {
    const properties = await getProperties()
    const container = document.getElementById('properties')
    
    container.innerHTML = properties.map(p => `
        <div class="property">
            <img src="${p.image_url}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p>LKR ${p.price.toLocaleString()}</p>
            <p>${p.city}</p>
        </div>
    `).join('')
}

displayProperties()
</script>
```

---

## 🐛 Troubleshooting

### Images Not Uploading
- ✅ Check bucket is set to **Public**
- ✅ Verify storage policies allow INSERT
- ✅ Check browser console for errors

### "Row Level Security" Errors
- Go to Supabase → Authentication → Policies
- Disable RLS for testing: `ALTER TABLE properties DISABLE ROW LEVEL SECURITY;`

### CORS Errors
- Should not happen with Supabase
- If it does, check your Project URL is correct

### Nothing Saves
- Open browser DevTools (F12)
- Check Console tab for errors
- Verify `config.js` has correct credentials

---

## 💰 Pricing

**100% FREE** with Supabase's free tier:
- 500 MB database space
- 1 GB file storage
- 50,000 monthly active users
- Unlimited API requests

Perfect for small to medium property websites!

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🎉 You're All Set!

Your admin panel is ready to use. Start adding properties and build your dream real estate website!

**Questions?** Check the browser console (F12) for detailed logs and error messages.

---

Made with ❤️ using Supabase
