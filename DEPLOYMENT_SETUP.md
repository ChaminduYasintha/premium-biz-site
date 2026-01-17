# Deployment Setup Guide

## Environment Variables Required

For the site to work properly in deployment, you need to set these environment variables in your deployment platform:

### Required Variables

1. **PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Get it from: Supabase Dashboard → Settings → API → Project URL

2. **PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Get it from: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### Optional Variables

3. **PUBLIC_WHATSAPP_NUMBER**
   - Default: `+94771234567`
   - Your WhatsApp business number

4. **PUBLIC_WHATSAPP_MESSAGE**
   - Default: `Hello! I'm interested in your properties.`
   - Custom message for WhatsApp links

5. **PUBLIC_BUSINESS_NAME**
   - Default: `Premium Sri Lankan Business`
   - Your business name

## Platform-Specific Instructions

### Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Variable name: `PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production (and Preview if needed)
4. Repeat for all variables
5. Redeploy your site

### Vercel

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Key: `PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production, Preview, Development
4. Repeat for all variables
5. Redeploy your site

### Netlify

1. Go to your Netlify site
2. Navigate to **Site settings** → **Environment variables**
3. Add each variable:
   - Key: `PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Scopes: All scopes (or specific ones)
4. Repeat for all variables
5. Trigger a new deploy

### GitHub Pages / Static Hosting

For static hosting without environment variable support:
1. You'll need to hardcode the values in the code (not recommended for production)
2. Or use a build script that injects them at build time

## Troubleshooting

### Properties Not Showing in Deployment

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages starting with "🏠 Homepage:" or "❌"
   - Check if `window.ENV` is defined

2. **Verify Environment Variables**
   - Check that variables are set in your deployment platform
   - Ensure variable names start with `PUBLIC_` (required for Astro)
   - Verify the values are correct (no extra spaces)

3. **Check Supabase Client Library**
   - Verify `/admin/supabase.min.js` is accessible
   - Check Network tab for 404 errors

4. **Database Connection**
   - Verify your Supabase project is active
   - Check Row Level Security (RLS) policies allow public read access
   - Ensure you have properties marked as `featured = true` in the database

### Debugging Steps

1. Open browser console on deployed site
2. Check for these logs:
   - `🏠 Homepage: Loading featured properties...`
   - `🏠 ENV check: {...}`
   - `🏠 Homepage: ✅ Loaded X featured properties`

3. If you see errors:
   - `❌ Supabase not configured` → Environment variables not set
   - `❌ Supabase client library not loaded` → supabase.min.js not accessible
   - `❌ Supabase error: ...` → Database/RLS issue

## Common Issues

### Issue: "Supabase not configured"
**Solution:** Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in deployment platform

### Issue: "Supabase client library not loaded"
**Solution:** Ensure `/admin/supabase.min.js` exists in the `public` folder and is deployed

### Issue: "No properties found"
**Solution:** 
- Check database has properties with `featured = true`
- Verify RLS policies allow SELECT operations
- Check Supabase project is not paused

### Issue: Different data in local vs deployment
**Solution:**
- Verify you're using the same Supabase project
- Check environment variables point to the same database
- Clear browser cache and hard refresh (Ctrl+Shift+R)

